//
// Handles the intent to process a 'Yes' response
//

'use strict';

const playgame = require('../PlayGame');

module.exports = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];

    if (request.type === 'IntentRequest') {
      if (request.intent.name === 'AMAZON.YesIntent') {
        if (game && game.possibleActions &&
          (game.possibleActions.indexOf('insurance') >= 0)) {
          return true;
        }
      } else if (request.intent.name === 'AMAZON.NoIntent') {
        if (game && game.possibleActions &&
          (game.possibleActions.indexOf('noinsurance') >= 0)) {
          return true;
        }
      }
    }

    return false;
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const actionObj = {};

    if (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent') {
      actionObj.action = 'insurance';
    } else {
      actionObj.action = 'noinsurance';
    }

    playgame.playBlackjackAction(attributes, event.request.locale, actionObj,
      (error, response, speech, reprompt) => {
      if (!error) {
        handlerInput.responseBuilder
          .speak(speech)
          .reprompt(reprompt);
      } else {
        handlerInput.responseBuilder
          .speak(error)
          .reprompt(res.strings.ERROR_REPROMPT);
      }
    });
  },
};
