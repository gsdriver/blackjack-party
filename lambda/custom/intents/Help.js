//
// Handles the intent to process help
//

'use strict';

const bjUtils = require('../BlackjackUtils');

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return ((request.type === 'IntentRequest')
      && (request.intent.name === 'AMAZON.HelpIntent'));
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../' + event.request.locale + '/resources');
    let speech = bjUtils.getContextualHelp(event, attributes, !attributes.bot);
    if (!speech) {
      speech = res.strings.HELP_GENERIC_HELP;
    }

    let cardContent = '';
    cardContent += res.strings.HELP_ACHIEVEMENT_CARD_TEXT;
    cardContent += res.strings.HELP_CARD_TEXT;
    handlerInput.responseBuilder
      .speak(speech)
      .reprompt(speech)
      .withSimpleCard(res.strings.HELP_CARD_TITLE, cardContent);
  },
};