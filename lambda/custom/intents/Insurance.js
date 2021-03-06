//
// Handles the intent to process a 'Yes' response
//

'use strict';

const utils = require('../utils');

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
    const actionObj = {};

    if (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent') {
      actionObj.action = 'insurance';
    } else {
      actionObj.action = 'noinsurance';
    }

    return new Promise((resolve, reject) => {
      let response;
      utils.playBlackjackAction(handlerInput, event.request.locale, actionObj,
        (error, resp, speech, reprompt) => {
        if (!error) {
          response = handlerInput.responseBuilder
            .speak(speech)
            .reprompt(reprompt)
            .getResponse();
        } else {
          response = handlerInput.responseBuilder
            .speak(error)
            .reprompt(res.strings.ERROR_REPROMPT)
            .getResponse();
        }
        resolve(response);
      });
    });
  },
};
