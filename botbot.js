// How to use:
// node botbot.js <Server IP-address>
// -> Use nodemon for debugging (hot reloads)

const tmi = require('tmi.js');
const net = require('net');
const SerialPort = require('serialport')
const serialport = new SerialPort('/dev/ttyUSB0', { baudRate: 115200 })

var oauth = process.env.OAUTH;

// SHOW HELP
var HELPMESSAGE = `
You can find the commands below the stream!
`;

// Define configuration options
const opts = {
  identity: {
    username: 'teukkaniikkabotbot',
    password: oauth
  },
  connection: { reconnect: true },
  channels: [
    'teukkaniikka'
  ]
};

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

var choiceList = ['this', 'that'];
var voteList = [];
var isVotingEnabled = false;

function vote(username, choice) {

    if(!isVotingEnabled) {
        console.log('Voting is not enabled!');
        client.say('teukkaniikka', 'Voting is not enabled!');
        return;
    }

    // Check if the choice was valid
    if(choiceList.includes(choice)) {
        console.log('Valid vote!');
        client.say('teukkaniikka', 'Valid vote!');
    }else{
        console.log('Invalid choice!');
        client.say('teukkaniikka', String('Invalid choice: ', choice));
        return;
    }

    // Check if the user has already voted
    for(var i=0; i<voteList.length; i++) {
        var item = voteList[i];

        if (item.name == username) {
            console.log('Error: You have already voted!');
            client.say('teukkaniikka', 'ERROR: You have already voted!');
            return
        }
    }

    // If everything was fine, put the vote into the array
    voteList.push({name: username, vote: choice})
}

function printVoteStatus() {
    var voteCountList = new Array(choiceList.length).fill(0);

    for(var i=0; i<voteList.length; i++) {
        var itemIndex = choiceList.indexOf(voteList[i].vote);
        voteCountList[itemIndex] += 1;
    }

    var percentageList = []
    
    for(var i=0; i<voteCountList.length; i++) {
        percentageList.push({value: (Math.round(voteCountList[i]/voteCountList.length*1000)/10), voteName: choiceList[i]});
    }

    console.log('==========================')
    for(var i=0; i<percentageList.length; i++) {
        var str = String(String(percentageList[i].value)+"% voted "+String(percentageList[i].voteName));
        console.log(str);
        client.say('teukkaniikka', str);
    }
    console.log('==========================')
}

function startVote(choiceArray) {
    choiceList = choiceArray;
    voteList = []
    console.log('Cleared old votes and new array is set to this: ')
    console.log(choiceList)

    client.say('teukkaniikka', '/me Voting has started! Choices are listed below!');
    for(var i=0; i<choiceList.length; i++) {
      client.say('teukkaniikka', String('['+i+'] '+choiceList[i]))
    }

    isVotingEnabled = true;
}

function endVote() {
  client.say('teukkaniikka', '/me Voting has ended! Results are below:');
    console.log('Voting has ended! Results are below: ')
    printVoteStatus()

    isVotingEnabled = false;
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

// Create a client with our options
const client = new tmi.client(opts);
const localClient = new net.Socket();

// Connect to the local server
localClient.connect({ port: 8421, host: process.argv[2] });

localClient.on(('connect'), function(onLocal) {
  console.log("Connected to the NodeMCU!")
})

localClient.on('error', function(err){
  console.log("Error: "+err.message);
})

localClient.on('close', function(e) {
  console.log('oh frick, trying again in 2s');
  localClient.setTimeout(2000, function() {
    localClient.connect({ port: 8421, host: process.argv[2] });
  })
});

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.on('raided' , onRaidedHandler);

// Connect to Twitch:
client.connect();

localClient.on('data', (data) => {
  msg = data.toString('utf-8');
  console.log(msg);
  client.say('teukkaniikka', msg);
});

// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot

  // If there's a new message, turn the relay on and off
  if(context["username"] != 'teukkaniikka') {
    serialport.write('asdasd;');
  }

  console.log(target);
  console.log(context["username"]);
  console.log(msg);

  var username = context["username"]

  if (msg.startsWith('!vote') && !msg.startsWith('!votestatus')) {
    var voteStr = msg.replace('!vote', '').trim();

    vote(username, voteStr);
  }

  if (msg.startsWith('!startvote') && username == 'teukkaniikka') {
    var splitStr = msg.replace('!startvote', '').trim().split(' ');
    startVote(splitStr);
  }

  if (msg == '!endvote' && username == 'teukkaniikka') {
    endVote();
  }

  if (msg == '!votestatus') {
    if(isVotingEnabled) {
      printVoteStatus()
    }else{
      client.say(target, 'Voting is disabled atm.');
    }
  }

  if (msg == '!uptime') {
    client.say(target, Math.round(process.uptime()/60)+" min? I'm not really sure about that one... :P");
  }

  if (msg == '!on' || msg == '!off') {
    client.say(target, 'Please give me better ideas...');
  }

  if(msg == '!help') {
    client.say(target, HELPMESSAGE);
  }

  if (msg == 'TheIlluminati') {
    client.say(target, 'TheIlluminati');
  }

  localClient.write(msg+";");
}

// Called every time the channel gets raided
function onRaidedHandler(channel, raider, viewers, userstate) {

}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}