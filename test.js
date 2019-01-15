// require & generate the instance
const Snowflake = require( './generator' );
const snowflake = new Snowflake.generator({
  processBits: 0,
  workerBits: 8,
  incrementBits: 14,
  workerId: process.env.CLUSTER_ID || 31
});

// exports for global use
exports.makeSnowflake   = ( date ) => { return snowflake._generate( date ); };
exports.unmakeSnowflake = ( flake ) => { let decon = snowflake.deconstruct( flake ); return decon.timestamp.valueOf(); };

// example
const flake = this.makeSnowflake( Date.now() );
console.log( flake );
console.log( `Creation date: ${Snowflake.lookup( flake, 1420070400000 )}` );
console.log( this.unmakeSnowflake( flake ) );