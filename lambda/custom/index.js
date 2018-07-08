'use strict';

const Alexa = require('ask-sdk');
const CanFulfill = require('./intents/CanFulfill');
const Launch = require('./intents/Launch');
const Blackjack = require('./intents/Blackjack');
const Betting = require('./intents/Betting');
const Suggest = require('./intents/Suggest');
const TakeSuggestion = require('./intents/TakeSuggestion');
const Rules = require('./intents/Rules');
const TakeInsurance = require('./intents/TakeInsurance');
const DeclineInsurance = require('./intents/DeclineInsurance');
const Repeat = require('./intents/Repeat');
const HighScore = require('./intents/HighScore');
const Help = require('./intents/Help');
const Exit = require('./intents/Exit');
const Training = require('./intents/Training');
const Unhandled = require('./intents/Unhandled');
const bjUtils = require('./BlackjackUtils');
const gameService = require('./GameService');
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

let responseBuilder;

function getHandler(handlerInput) {
  const functionByState = {
    'SUGGESTION': {
      'LaunchRequest': TakeSuggestion.handleNoIntent,
      'BlackjackIntent': Blackjack.handleIntent,
      'SuggestIntent': Suggest.handleIntent,
      'HighScoreIntent': HighScore.handleIntent,
      'EnableTrainingIntent': Training.handleEnableIntent,
      'DisableTrainingIntent': Training.handleDisableIntent,
      'RulesIntent': Rules.handleIntent,
      'AMAZON.RepeatIntent': Repeat.handleIntent,
      'AMAZON.FallbackIntent': Repeat.handleIntent,
      'AMAZON.YesIntent': TakeSuggestion.handleYesIntent,
      'AMAZON.NoIntent': TakeSuggestion.handleNoIntent,
      'AMAZON.StopIntent': Exit.handleIntent,
      'AMAZON.CancelIntent': Exit.handleIntent,
      'SessionEndedRequest': Exit.handleIntent,
    },
    'NEWGAME': {
      'LaunchRequest': Launch.handleIntent,
      'BettingIntent': Betting.handleIntent,
      'RulesIntent': Rules.handleIntent,
      'HighScoreIntent': HighScore.handleIntent,
      'EnableTrainingIntent': Training.handleEnableIntent,
      'DisableTrainingIntent': Training.handleDisableIntent,
      'AMAZON.YesIntent': Betting.handleIntent,
      'AMAZON.NoIntent': Exit.handleIntent,
      'AMAZON.FallbackIntent': Repeat.handleIntent,
      'AMAZON.RepeatIntent': Repeat.handleIntent,
      'AMAZON.HelpIntent': Help.handleIntent,
      'AMAZON.StopIntent': Exit.handleIntent,
      'AMAZON.CancelIntent': Exit.handleIntent,
      'SessionEndedRequest': Exit.handleIntent,
    },
    'FIRSTTIMEPLAYER': {
      'LaunchRequest': Launch.handleIntent,
      'BettingIntent': Betting.handleIntent,
      'RulesIntent': Rules.handleIntent,
      'HighScoreIntent': HighScore.handleIntent,
      'EnableTrainingIntent': Training.handleEnableIntent,
      'DisableTrainingIntent': Training.handleDisableIntent,
      'AMAZON.YesIntent': Betting.handleIntent,
      'AMAZON.NoIntent': Exit.handleIntent,
      'AMAZON.FallbackIntent': Repeat.handleIntent,
      'AMAZON.RepeatIntent': Repeat.handleIntent,
      'AMAZON.HelpIntent': Help.handleIntent,
      'AMAZON.StopIntent': Exit.handleIntent,
      'AMAZON.CancelIntent': Exit.handleIntent,
      'SessionEndedRequest': Exit.handleIntent,
    },
    'INSURANCEOFFERED': {
      'LaunchRequest': Launch.handleIntent,
      'SuggestIntent': Suggest.handleIntent,
      'RulesIntent': Rules.handleIntent,
      'HighScoreIntent': HighScore.handleIntent,
      'EnableTrainingIntent': Training.handleEnableIntent,
      'DisableTrainingIntent': Training.handleDisableIntent,
      'AMAZON.YesIntent': TakeInsurance.handleIntent,
      'AMAZON.NoIntent': DeclineInsurance.handleIntent,
      'AMAZON.FallbackIntent': Repeat.handleIntent,
      'AMAZON.RepeatIntent': Repeat.handleIntent,
      'AMAZON.HelpIntent': Help.handleIntent,
      'AMAZON.StopIntent': Exit.handleIntent,
      'AMAZON.CancelIntent': Exit.handleIntent,
      'SessionEndedRequest': Exit.handleIntent,
    },
    'INGAME': {
      'LaunchRequest': Launch.handleIntent,
      'BlackjackIntent': Blackjack.handleIntent,
      'SuggestIntent': Suggest.handleIntent,
      'RulesIntent': Rules.handleIntent,
      'HighScoreIntent': HighScore.handleIntent,
      'EnableTrainingIntent': Training.handleEnableIntent,
      'DisableTrainingIntent': Training.handleDisableIntent,
      'AMAZON.FallbackIntent': Repeat.handleIntent,
      'AMAZON.RepeatIntent': Repeat.handleIntent,
      'AMAZON.HelpIntent': Help.handleIntent,
      'AMAZON.StopIntent': Exit.handleIntent,
      'AMAZON.CancelIntent': Exit.handleIntent,
      'AMAZON.YesIntent': Blackjack.handleYesIntent,
      'SessionEndedRequest': Exit.handleIntent,
    },
  };

  const state = bjUtils.getState(handlerInput.attributesManager.getSessionAttributes());
  if (handlerInput.requestEnvelope.request.type === 'IntentRequest') {
    return functionByState[state][handlerInput.requestEnvelope.request.intent.name];
  } else {
    return functionByState[state]['LaunchRequest'];
  }
}

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
      handlerInput.attributesManager.savePersistentAttributes()
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
};

const LaunchRequest = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.session.new ||
      (handlerInput.requestEnvelope.request.type === 'LaunchRequest');
  },
  handle(handlerInput) {
    getHandler(handlerInput)
      .bind({
        event: handlerInput.requestEnvelope,
        responseBuilder: handlerInput.responseBuilder,
        attributes: handlerInput.attributesManager.getSessionAttributes(),
      })();
  },
};

const GameIntents = {
  canHandle(handlerInput) {
    return (getHandler(handlerInput) != undefined);
  },
  async handle(handlerInput) {
    await getHandler(handlerInput)
      .bind({
        event: handlerInput.requestEnvelope,
        responseBuilder: handlerInput.responseBuilder,
        attributes: handlerInput.attributesManager.getSessionAttributes(),
      })();
  },
};

const UnhandledIntent = {
  canHandle(handlerInput) {
    return true;
  },
  handle(handlerInput) {
    Unhandled.handleIntent
      .bind({
        event: handlerInput.requestEnvelope,
        responseBuilder: handlerInput.responseBuilder,
        attributes: handlerInput.attributesManager.getSessionAttributes(),
      })();
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

  const skillFunction = skillBuilder.addRequestHandlers(LaunchRequest, GameIntents, UnhandledIntent)
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
