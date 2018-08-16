const inquirer = require('inquirer');
const { 
  red: red, gray: gray,
  cyan: cyan, green: green,
  yellow: yellow, magenta: magenta,
  rainbow: rainbow
} = require('./deps/colors');

const questions = [
  {
    name: 'snowflake',
    message: `Snowflake (${gray('type "exit" to exit')}) ${magenta('>>')}`,
    validate: input => !isNaN(input) || typeof input === 'string' && input.toLowerCase() === 'exit',
    default: 107130754189766656
  }
];

console.log([
    `[#]--------[ ${rainbow('Discord snowflake lookup')} ]--------[#]`,
    `[#  Input a snowflake (userID) below to check   #]`,
    `[#  the creation date of an account. To get a   #]`,
    `[#  userID, go to Settings > Apperance >        #]`,
    `[#  Developer mode; After that, right-click a   #]`,
    `[#  user/message/server and press "Copy ID"     #]`,
    `[#  ${red('! This tool only includes creation date !')}   #]`,
    `[#  ${red('Because that\'s the only thing you can get')}   #]`,
    `[#  ${gray('Created by Wessel Tip <discord@go2it.eu>')}    #]`,
    `[################################################]`
  ].join('\n'));
prompt(questions);

process.on('exit', (code) => {
  console.log([
    `${green('Thank you for using snowflakey!')}`,
    `If you have any feedback, feel free to`,
    `post it in ${cyan('https://discord.gg/SV7DAE9')}`
  ].join('\n'));
  if (code !== 0) {
    console.log([
      `${red('!!')} An error occured while exiting ${red('!!')}`,
      `Error code: ${red(code)}`
    ].join('\n'));
  }
});

function prompt(question) {
  inquirer.prompt(question).then((res) => {
    if (typeof res.snowflake === 'string' && res.snowflake.toLowerCase() === 'exit') process.exit(0);
    res.snowflake = new String(res.snowflake).trim();
    console.log(`${cyan('>>')} Creation date of snowflake "${yellow(res.snowflake)}": ${green(new Date((res.snowflake / 4194304) + 1420070400000).toLocaleString())}`);
    prompt(question);
  });
};