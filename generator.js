const big = require( './fake_node_modules/bigInt' );

const sleep   = ( time = 1 ) => { return new Promise( res => { setTimeout( res, time ); } ); };
const getBits = ( bits ) => { return ( 2 ** bits ) - 1; };

exports.lookup    = ( flake = 0, epoch = 1420070400000 ) => { return new Date( ( flake / 4194304 ) + epoch ).toLocaleString(); };
exports.generator = class Snowflake {
  constructor( options = {} ) {
    this.options = Object.assign({
      async	       : false,
      epoch        : 1420070400000,
      workerId     : 0,
      processId    : 0,
      stringify	   : true,
      workerBits   : 5,
      processBits  : 5,
      incrementBits: 12
    }, options);

    // an object containing mutable (unfrozen) properties
    this.mutable = {
      locks        : [],
      locked       : false,
      increment    : big.zero.subtract( 1 ),
      lastTimestamp: Date.now()
    };

    if ( this.options.incrementBits + this.options.processBits + this.options.workerBits !== 22) throw new Error( 'incrementBits, processBits, and workerBits must add up to 22.' );

    // ensure that ids conform to the number of bits
    this.options.workerId  = this.options.workerId % ( 2 ** this.options.workerBits );
    this.options.processId = this.options.processId % ( 2 ** this.options.processBits );

    // check if NaN
    if ( isNaN( this.options.workerId ) )  this.options.workerId = 0;
    if ( isNaN( this.options.processId ) ) this.options.processId = 0;
    
    // store the maximum increment bound
    this.maxIncrement = 2 ** this.options.incrementBits;

    // calculate the shifted worker/process ids for later reference
    this.workerId  = big( this.options.workerId ).shiftLeft( this.options.incrementBits + this.options.processBits );
    this.processId = big( this.options.processId ).shiftLeft( this.options.incrementBits );
    
    // freeze options and this object, to prevent tampering
    Object.freeze( this.options );
    Object.freeze( this );
  }

  get increment() { return this.mutable.increment = this.mutable.increment.next().mod( this.maxIncrement ); }

  generate() {
    if ( this.options.async ) return this._generateAsync();
    else return this._generate();
  }

  _generate( date, increment = null ) {
    // 0000000000000000000000000000000000000000000000000000000000000000
    // aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0000000000000000000000
    let flake = big( date || Date.now() ).minus( this.options.epoch ).shiftLeft( 22 )
    // aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbb00000000000000000
      .add( this.workerId )
    // aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbccccc000000000000
      .add( this.processId )
    // aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbcccccdddddddddddd
      .add( increment || this.increment );

    if ( this.options.stringify ) flake = flake.toString();

    return flake;
  }

  _lock() {
    if ( this.mutable.locked ) return new Promise( res => this.mutable.locks.push( res ) );
    else this.mutable.locked = true;
  }

  _unlock() {
    if ( this.mutable.locks.length > 0 ) this.mutable.locks.shift()();
    else this.mutable.locked = false;
  }

  async _generateAsync() {
    let lock = this._lock();
    if( lock ) await lock;
    let now = Date.now();
    // check if increment should be reset
    if ( this.mutable.lastTimestamp !== now ) {
      // last timestamp didnt match, reset increment
      this.mutable.increment     = big.zero;
      this.mutable.lastTimestamp = now;
    } else {
      // last timestamp matched, increase increment
      this.mutable.increment = this.mutable.increment.next();
      // check if increment exceeds max bounds
      if ( this.mutable.increment.greaterOrEquals( this.maxIncrement ) ) {
        // sleep for 2ms - 1ms has a risk of timestamp not incrementing for some reason?
        await sleep( 2 );
        // reset increment
        this.mutable.increment           = big.zero;
        now = this.mutable.lastTimestamp = Date.now();
      }
    }

    // generate a snowflake with the new increment
    let flake = this._generate( now, this.mutable.increment );
    this._unlock();
    return flake;
  }

  deconstruct( snowflake ) {
    // turn snowflake into a bigint
    let flake = big( snowflake );
    // shift right, and add epoch to obtain timestamp
    let timestamp = flake.shiftRight( 22 ).add( this.options.epoch );
    
    //obtain workerId
    let wBitShift = this.options.incrementBits + this.options.processBits;
    let workerId  = flake.and( big( getBits( this.options.workerBits ) ).shiftLeft( wBitShift ) ).shiftRight( wBitShift );

    // obtain processId
    let processId = flake.and( big( getBits( this.options.processBits ) ).shiftLeft( this.options.incrementBits ) ).shiftRight( this.options.incrementBits );

    // obtain increment
    let increment = flake.and(getBits(this.options.incrementBits));

    return { timestamp, workerId, processId, increment };
    }
};