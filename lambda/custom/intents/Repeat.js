//
// Handles the intent to process repeating status
//

'use strict';

const utils = require('../utils');

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
    const output = utils.readCurrentHand(attributes, event.request.locale, true);

    handlerInput.responseBuilder
      .speak(attributes.temp.lastResponse ? attributes.temp.lastResponse : output.speech)
      .reprompt(attributes.temp.lastReprompt ? attributes.temp.lastReprompt : output.reprompt);
  },
};
