# botbot-twitch-bot

A really useful bot to help the chat to engage more. The real reason this was coded is that I was really bored.

Check out my Twitch if you would like to see the bot in action: [https://www.twitch.tv/teukkaniikka](https://www.twitch.tv/teukkaniikka)

### Things you need to do:
* Get the oauth key and set a OAUTH environment variable to your key. It should look something like 'oauth:insertrandomstuffhere'.
* Install nodejs and npm
* Install tmi.js with npm `npm i tmi.js`
* If you'd like to have hot reloads you can use nodemon: `npm install -g nodemon`
* Because this is made to have a NodeMCU running as a TCP-server, you might want to remove that part from the code.

### Supported commands:
* !vote
* !startvote choice1 choice2 choiceN [*AUTH]
* !endvote [*AUTH]
* !votestatus
* !uptime
* !on
* !off
* !rgb(r,g,b)
* !help
* TheIlluminati [emoji]
