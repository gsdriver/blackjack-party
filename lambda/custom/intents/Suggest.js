//
// Handles the intent to provide a suggestion
//

'use strict';

const utils = require('../utils');

module.exports = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    if ((request.type === 'IntentRequest') &&
        (request.intent.name === 'SuggestIntent')) {
      // Suggest is only allowed if we aren't at the start of a hand
      const attributes = handlerInput.attributesManager.getSessionAttributes();
      const game = attributes[attributes.currentGame];
      if (game && (game.possibleActions.indexOf('deal') == -1)) {
        return true;
      }
    }

    return false;
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    attributes.suggestRequests = (attributes.suggestRequests + 1) || 1;
    utils.playBlackjackAction(attributes,
      event.request.locale, {action: 'suggest'},
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
