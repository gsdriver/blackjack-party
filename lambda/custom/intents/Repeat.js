//
// Handles the intent to process repeating status
//

'use strict';

const playgame = require('../PlayGame');

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return ((request.type === 'IntentRequest')
      && ((request.intent.name === 'AMAZON.RepeatIntent')
        || (request.intent.name === 'AMAZON.FallbackIntent')));
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const output = playgame.readCurrentHand(attributes, event.request.locale, true);

    handlerInput.responseBuilder
      .speak(output.speech)
      .reprompt(output.reprompt);
  },
};
