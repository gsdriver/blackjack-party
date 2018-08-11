'use strict';

const Alexa = require('ask-sdk');
const CanFulfill = require('./intents/CanFulfill');
const Launch = require('./intents/Launch');
const Blackjack = require('./intents/Blackjack');
const Deal = require('./intents/Deal');
const ChangeBets = require('./intents/ChangeBets');
const BetAmount = require('./intents/BetAmount');
const Suggest = require('./intents/Suggest');
const TakeSuggestion = require('./intents/TakeSuggestion');
const Insurance = require('./intents/Insurance');
const HighScore = require('./intents/HighScore');
const Rules = require('./intents/Rules');
const Repeat = require('./intents/Repeat');
const Help = require('./intents/Help');
const Exit = require('./intents/Exit');
const SessionEnd = require('./intents/SessionEnd');
const Training = require('./intents/Training');
const AddPlayer = require('./intents/AddPlayer');
const RemovePlayer = require('./intents/RemovePlayer');
const PlayerName = require('./intents/PlayerName');
const ConfirmName = require('./intents/ConfirmName');
const Unhandled = require('./intents/Unhandled');
const gameService = require('./GameService');
const utils = require('./utils');
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

let responseBuilder;

const requestInterceptor = {
  process(handlerInput) {
    return new Promise((resolve, reject) => {
      const attributesManager = handlerInput.attributesManager;
      const sessionAttributes = attributesManager.getSessionAttributes();
      const event = handlerInput.requestEnvelope;

      if (Object.keys(sessionAttributes).length === 0) {
        // No session attributes - so get the persistent ones
        attributesManager.getPersistentAttributes()
          .then((attributes) => {
            // If no persistent attributes, it's a new player
            if (!attributes.currentGame) {
              gameService.initializeGame('standard', attributes, event.session.user.userId);
              attributes.newUser = true;
              attributes.playerLocale = event.request.locale;
              attributes.prompts = {};
            }

            // Since there were no session attributes, this is the first
            // round of the session - set the temp attributes
            attributes.temp = {};
            attributes.temp.firsthand = true;
            attributes.temp.firstplay = true;
            attributes.sessions = (attributes.sessions + 1) || 1;
            attributesManager.setSessionAttributes(attributes);
            responseBuilder = handlerInput.responseBuilder;
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        responseBuilder = handlerInput.responseBuilder;
        resolve();
      }
    });
  },
};

const saveResponseInterceptor = {
  process(handlerInput) {
    return new Promise((resolve, reject) => {
      const response = handlerInput.responseBuilder.getResponse();

      if (response) {
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        utils.drawTable(handlerInput, () => {
          if (response.shouldEndSession) {
            // We are meant to end the session
            SessionEnd.handle(handlerInput)
            .then(() => {
              resolve();
            })
            .catch((error) => {
              reject(error);
            });
          } else {
            // Save the response and reprompt for repeat
            if (response.outputSpeech && response.outputSpeech.ssml) {
              attributes.temp.lastResponse = response.outputSpeech.ssml;
            }
            if (response.reprompt && response.reprompt.outputSpeech
              && response.reprompt.outputSpeech.ssml) {
              attributes.temp.lastReprompt = response.reprompt.outputSpeech.ssml;
            }
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  },
};

const ErrorHandler = {
  canHandle(handlerInput, error) {
    return error.name.startsWith('AskSdk');
  },
  handle(handlerInput, error) {
    return handlerInput.responseBuilder
      .speak('An error was encountered while handling your request. Try again later')
      .getResponse();
  },
};

if (process.env.DASHBOTKEY) {
  const dashbot = require('dashbot')(process.env.DASHBOTKEY).alexa;
  exports.handler = dashbot.handler(runGame);
} else {
  exports.handler = runGame;
}

function runGame(event, context, callback) {
  const skillBuilder = Alexa.SkillBuilders.standard();

  if (!process.env.NOLOG) {
    console.log(JSON.stringify(event));
  }

  // If this is a CanFulfill, handle this separately
  if (event.request && (event.request.type == 'CanFulfillIntentRequest')) {
    callback(null, CanFulfill.check(event));
    return;
  }

  const skillFunction = skillBuilder.addRequestHandlers(
      Launch,
      AddPlayer,
      ConfirmName,
      RemovePlayer,
      Exit,
      Help,
      Rules,
      Training,
      HighScore,
      Deal,
      ChangeBets,
      PlayerName,
      Blackjack,
      Suggest,
      TakeSuggestion,
      Insurance,
      BetAmount,
      SessionEnd,
      Repeat,
      Unhandled
    )
    .addErrorHandlers(ErrorHandler)
    .addRequestInterceptors(requestInterceptor)
    .addResponseInterceptors(saveResponseInterceptor)
    .withTableName('BlackjackParty')
    .withAutoCreateTable(true)
    .withSkillId('amzn1.ask.skill.de5b4501-ea8b-4fd8-8f2c-307706576bcf')
    .lambda();
  skillFunction(event, context, (err, response) => {
    if (response) {
      response.response = responseBuilder.getResponse();
    }
    callback(err, response);
  });
}
