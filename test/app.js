var mainApp = require('../lambda/custom/index');

const attributeFile = 'attributes.txt';

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const USERID = 'not-amazon';
const DEVICEID = 'not-amazon';
const LOCALE = 'en-GB';

function BuildEvent(argv)
{
    // Templates that can fill in the intent
    var blackjackIntent = {"name": "BlackjackIntent", "slots": {"Action": {"name": "Action", "value": ""}}};
    var suggestIntent = {"name": "SuggestIntent", "slots": {}};
    var readRulesIntent = {"name": "RulesIntent", "slots": {}};
    var addPlayerIntent = {"name": "AddPlayerIntent", "slots": {}};
    var playerNameIntent = {"name": "PlayerNameIntent", "slots": {"Name": {"name": "Name", "value": ""}}};
    var betIntent = {"name": "BetAmountIntent", "slots": {"Amount": {"name": "Amount", "value": ""}}};
    var changeBetsIntent = {"name": "ChangeBetsIntent", "slots": {}};
    var dealIntent = {"name": "DealIntent", "slots": {}};
    var fallbackIntent = {"name": "AMAZON.FallbackIntent", "slots": {}};
    var yesIntent = {"name": "AMAZON.YesIntent", "slots": {}};
    var noIntent = {"name": "AMAZON.NoIntent", "slots": {}};
    var stopIntent = {"name": "AMAZON.StopIntent", "slots": {}};
    var cancelIntent = {"name": "AMAZON.CancelIntent", "slots": {}};
    var resetIntent = {"name": "ResetIntent", "slots": {}};
    var repeatIntent = {"name": "AMAZON.RepeatIntent", "slots": {}};
    var helpIntent = {"name": "AMAZON.HelpIntent", "slots": {}};
    var exitIntent = {"name": "SessionEndedRequest", "slots": {}};
    var highScore = {'name': 'HighScoreIntent', 'slots': {}};
    var enableTraining = {'name': 'EnableTrainingIntent', 'slots': {}};
    var disableTraining = {'name': 'DisableTrainingIntent', 'slots': {}};

    var lambda = {
       "session": {
         "sessionId": "SessionId.c88ec34d-28b0-46f6-a4c7-120d8fba8fa7",
         "application": {
           "applicationId": "amzn1.ask.skill.de5b4501-ea8b-4fd8-8f2c-307706576bcf"
         },
         "attributes": {},
        "user": {
          "userId": USERID,
         },
         "new": false
       },
       "request": {
         "type": "IntentRequest",
         "requestId": "EdwRequestId.26405959-e350-4dc0-8980-14cdc9a4e921",
         "locale": LOCALE,
         "timestamp": "2016-11-03T21:31:08Z",
         "intent": {}
       },
       "version": "1.0",
       "context": {
         "AudioPlayer": {
           "playerActivity": "IDLE"
         },
         "Display": {},
         "System": {
           "application": {
             "applicationId": "amzn1.ask.skill.de5b4501-ea8b-4fd8-8f2c-307706576bcf"
           },
           "user": {
             "userId": USERID,
           },
           "device": {
             "deviceId": DEVICEID,
             "supportedInterfaces": {
               "AudioPlayer": {},
               "Display": {
                 "templateVersion": "1.0",
                 "markupVersion": "1.0"
               }
             }
           },
           "apiEndpoint": "https://api.amazonalexa.com",
           "apiAccessToken": "",
         }
       },
   };

    var openEvent = {
       "session": {
         "sessionId": "SessionId.c88ec34d-28b0-46f6-a4c7-120d8fba8fa7",
         "application": {
           "applicationId": "amzn1.ask.skill.de5b4501-ea8b-4fd8-8f2c-307706576bcf"
         },
         "attributes": {},
         "user": {
            "userId": USERID,
         },
         "new": true
       },
       "request": {
         "type": "LaunchRequest",
         "requestId": "EdwRequestId.26405959-e350-4dc0-8980-14cdc9a4e921",
         "locale": LOCALE,
         "timestamp": "2016-11-03T21:31:08Z",
         "intent": {}
       },
       "version": "1.0",
       "context": {
         "AudioPlayer": {
           "playerActivity": "IDLE"
         },
         "Display": {},
         "System": {
           "application": {
             "applicationId": "amzn1.ask.skill.de5b4501-ea8b-4fd8-8f2c-307706576bcf"
           },
           "user": {
             "userId": USERID,
           },
           "device": {
             "deviceId": DEVICEID,
             "supportedInterfaces": {
               "AudioPlayer": {},
               "Display": {
                 "templateVersion": "1.0",
                 "markupVersion": "1.0"
               }
             }
           },
           "apiEndpoint": "https://api.amazonalexa.com",
           "apiAccessToken": "",
         }
       },
    };

    var buttonEvent = {
      "session": {
        "sessionId": "SessionId.c88ec34d-28b0-46f6-a4c7-120d8fba8fa7",
        "application": {
          "applicationId": "amzn1.ask.skill.de5b4501-ea8b-4fd8-8f2c-307706576bcf",
        },
        "attributes": {},
        "user": {
          "userId": USERID,
        },
        "new": false
      },
      "request": {
        "type": "GameEngine.InputHandlerEvent",
        "requestId": "amzn1.echo-api.request.f25e7902-62bc-4661-90d9-aaac30c1a937",
        "timestamp": "2018-08-02T01:05:33Z",
        "locale": LOCALE,
        "originatingRequestId": "amzn1.echo-api.request.0b7a4f65-115d-427c-9aa0-5c78c57c740f",
        "events": [
          {
            "name": "button_down_event",
            "inputEvents": [
              {
                "gadgetId": "1",
                "timestamp": "2018-08-02T01:05:29.371Z",
                "color": "000000",
                "feature": "press",
                "action": "down"
              }
            ]
          }
        ]
      },
      "version": "1.0",
       "context": {
         "AudioPlayer": {
           "playerActivity": "IDLE"
         },
         "Display": {},
         "System": {
           "application": {
             "applicationId": "amzn1.ask.skill.de5b4501-ea8b-4fd8-8f2c-307706576bcf",
           },
           "user": {
             "userId": USERID,
           },
           "device": {
             "deviceId": DEVICEID,
             "supportedInterfaces": {
               "AudioPlayer": {},
               "Display": {
                 "templateVersion": "1.0",
                 "markupVersion": "1.0"
               }
             }
           },
           "apiEndpoint": "https://api.amazonalexa.com",
           "apiAccessToken": "",
         }
       },
    };

    const canFulfill = {
     "session":{
       "new": true,
       "sessionId":"SessionId.12",
       "application":{
         "applicationId":"amzn1.ask.skill.de5b4501-ea8b-4fd8-8f2c-307706576bcf"
       },
       "attributes":{
         "key": "string value"
       },
       "user":{
         "userId": USERID,
       }
     },
     "request":{
       "type":"CanFulfillIntentRequest",
       "requestId":"EdwRequestId.12",
       "intent":{
         "name":"PlayerNameIntent",
         "slots":{
           "Name":{
             "name":"Name",
             "value":"John"
           },
           "ChangeOption":{
             "name":"ChangeOption",
             "value":"4"
           },
         }
       },
       "locale":"en-US",
       "timestamp":"2017-10-03T22:02:29Z"
     },
     "context":{
       "AudioPlayer":{
         "playerActivity":"IDLE"
       },
       "System":{
         "application":{
           "applicationId":"amzn1.ask.skill.de5b4501-ea8b-4fd8-8f2c-307706576bcf"
         },
         "user":{
           "userId":USERID,
         },
         "device":{
           "supportedInterfaces":{

           }
         }
       }
     },
     "version":"1.0"
    };

    // If there is an attributes.txt file, read the attributes from there
    const fs = require('fs');
    if (fs.existsSync(attributeFile)) {
      data = fs.readFileSync(attributeFile, 'utf8');
      if (data) {
        lambda.session.attributes = JSON.parse(data);
        buttonEvent.session.attributes = JSON.parse(data);
      }
    }

    // If there is no argument, then we'll just ask for the rules
    if ((argv.length <= 2) || (argv[2] == "rules"))
    {
        lambda.request.intent = readRulesIntent;
    }
    else if (argv[2] == "seed") {
      if (fs.existsSync("seed.txt")) {
        data = fs.readFileSync("seed.txt", 'utf8');
        if (data) {
          return JSON.parse(data);
        }
      }
    }
    else if (argv[2] == "canfulfill")
    {
        return canFulfill;
    }
    else if (argv[2] == "deal")
    {
        lambda.request.intent = dealIntent;
    }
    else if (argv[2] == "changebets")
    {
        lambda.request.intent = changeBetsIntent;
    }
    else if (argv[2] == "suggest")
    {
        lambda.request.intent = suggestIntent;
    }
    else if (argv[2] == "help")
    {
        lambda.request.intent = helpIntent;;
    }
    else if (argv[2] == "stop")
    {
        lambda.request.intent = stopIntent;;
    }
    else if (argv[2] == "cancel")
    {
        lambda.request.intent = cancelIntent;;
    }
    else if (argv[2] == "addplayer")
    {
        lambda.request.intent = addPlayerIntent;;
    }
    else if (argv[2] == "playername")
    {
        if (argv.length > 3)
        {
            playerNameIntent.slots.Name.value = argv[3];
        }
        lambda.request.intent = playerNameIntent;
    }
    else if (argv[2] == "bet")
    {
        if (argv.length > 3)
        {
            betIntent.slots.Amount.value = argv[3];
        }
        lambda.request.intent = betIntent;
    }
    else if (argv[2] == "launch")
    {
        // Return the launch request
        return openEvent;
    }
    else if (argv[2] == 'button')
    {
        if (argv.length > 3)
        {
            buttonEvent.request.events[0].inputEvents[0].gadgetId = argv[3];
        }
        return buttonEvent;
    }
    else if (argv[2] == "reset")
    {
        lambda.request.intent = resetIntent;
    }
    else if (argv[2] == "fallback")
    {
        lambda.request.intent = fallbackIntent;
    }
    else if (argv[2] == "yes")
    {
        lambda.request.intent = yesIntent;
    }
    else if (argv[2] == "no")
    {
        lambda.request.intent = noIntent;
    }
    else if (argv[2] == "repeat")
    {
        lambda.request.intent = repeatIntent;
    }
    else if (argv[2] == "highscore")
    {
        lambda.request.intent = highScore;
    }
    else if (argv[2] == "enabletraining")
    {
        lambda.request.intent = enableTraining;
    }
    else if (argv[2] == "disabletraining")
    {
        lambda.request.intent = disableTraining;
    }
    else if (argv[2] == "exit")
    {
        lambda.request.intent = exitIntent;
    }
    else
    {
        blackjackIntent.slots.Action.value = argv[2];
        lambda.request.intent = blackjackIntent;
    }

    // Write the last action
    fs.writeFile('lastaction.txt', JSON.stringify(lambda), (err) => {
      if (err) {
        console.log(err);
      }
    });

    return lambda;
}


// Simple response - just print out what I'm given
function myResponse(appId) {
  this._appId = appId;
}

function myResponse(err, result) {
  if (err) {
    console.log('ERROR; ' + err.stack);
  } else if (!result.response || !result.response.outputSpeech) {
    console.log('GOT ' + JSON.stringify(result));
  } else {
    if (result.response.outputSpeech.ssml) {
      console.log('AS SSML: ' + result.response.outputSpeech.ssml);
    } else {
      console.log(result.response.outputSpeech.text);
    }
    if (result.response.card && result.response.card.content) {
      console.log('Card Content: ' + result.response.card.content);
    }
    console.log('The session ' + ((!result.response.shouldEndSession) ? 'stays open.' : 'closes.'));
    if (result.sessionAttributes && !process.env.NOLOG) {
      console.log('"attributes": ' + JSON.stringify(result.sessionAttributes));
    }
    if (result.sessionAttributes) {
      // Output the attributes too
      const fs = require('fs');
      fs.writeFile(attributeFile, JSON.stringify(result.sessionAttributes), (err) => {
        if (err) {
          console.log(err);
        }
      });
    }
  }
}

// Build the event object and call the app
if ((process.argv.length == 3) && (process.argv[2] == 'clear')) {
  const fs = require('fs');

  // Clear is a special case - delete this entry from the DB and delete the attributes.txt file
  dynamodb.deleteItem({TableName: 'BlackjackParty', Key: { id: {S: USERID}}}, function (error, data) {
    console.log("Deleted " + error);
    if (fs.existsSync(attributeFile)) {
      fs.unlinkSync(attributeFile);
    }
  });
} else {
  var event = BuildEvent(process.argv);
  if (event) {
      mainApp.handler(event, null, myResponse);
  }
}
