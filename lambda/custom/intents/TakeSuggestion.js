//
// Handles the intent to take or ignore a suggestion in training mode
//

'use strict';

const utils = require('../utils');

module.exports = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    if ((request.type === 'IntentRequest') &&
        ((request.intent.name === 'AMAZON.YesIntent')
        || (request.intent.name === 'AMAZON.NoIntent'))) {
      // Of course, we need to have a suggestion to take it!
      const attributes = handlerInput.attributesManager.getSessionAttributes();
      const game = attributes[attributes.currentGame];
      if (game && game.suggestion) {
        return true;
      }
    }

    return false;
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    const actionObj = {};

    // Keep track of how often they took a suggestion or not
    if (!attributes.tookSuggestion) {
      attributes.tookSuggestion = {};
    }

    if (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent') {
      // OK, play what was suggested
      actionObj.action = game.suggestion.suggestion;
      attributes.tookSuggestion.yes = (attributes.tookSuggestion.yes + 1) || 1;
    } else {
      // Fine, ignore what I said
      actionObj.action = game.suggestion.player;
      attributes.tookSuggestion.no = (attributes.tookSuggestion.no + 1) || 1;
    }

    return new Promise((resolve, reject) => {
      utils.playBlackjackAction(handlerInput,
        event.request.locale,
        actionObj, (error, resp, speech, reprompt) => {
        let response;
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
