# Snowflakey - Discord snowflake lookup
This is just some simple code to look up any snowflake on discord.
## What is a snowflake?
Snowflakes are strings from 14 to 16 characters long that determine
Which user/message/guild is which. You can't get much data with
just a snowflake, but you can get the creation date of the snowflake.
## Getting a snowflake
To get a user/message/guild's snowflake, go to the following path:
Settings > Apperance > Developer Mode > Slider should be blurple.
After you've enabled developer mode, go to a user/message/guild
and right-click on it. You'll see an option called "Copy ID"
## Using snowflakey
It's very simple to use snowflakey, all you gotta do is run
"yarn start" or "npm start" to start the script.
#### Requirements
* A device
* NodeJS v8.0+
* Yarn (NPM alternative, works faster)
* Git (Not required, makes things easier)
#### Installation
Installing:
```bash
git clone https://www.github.com/PassTheWessel/snowflakey.git # Or clone from the site
yarn # or npm i
node index.js # Run snowflakey
```
Example:
```bash
? Snowflake >> 107130754189766660
>> Creation date of snowflake "107130754189766660": 2015-10-23 16:59:22
```
## Credits
N/A