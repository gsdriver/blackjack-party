//
// Handles the intent to read the rules of the game
//

'use strict';

const utils = require('../utils');

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return ((request.type === 'IntentRequest')
      && (request.intent.name === 'RulesIntent'));
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../resources')(event.request.locale);

    const output = utils.readRules(attributes, event.request.locale);
    handlerInput.responseBuilder
      .speak(output.speech)
      .reprompt(output.reprompt)
      .withSimpleCard(res.strings.RULES_CARD_TITLE, output.speech);
  },
};
