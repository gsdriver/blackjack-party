//
// Handles the intent to enable or disable training mode
//

'use strict';

const bjUtils = require('../BlackjackUtils');

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return ((request.type === 'IntentRequest')
      && ((request.intent.name === 'EnableTrainingIntent')
        || (request.intent.name === 'DisableTrainingIntent')));
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../' + event.request.locale + '/resources');
    const enable = (handlerInput.requestEnvelope.request.intent.name === 'EnableTrainingIntent');
    const game = attributes[attributes.currentGame];

    const reprompt = bjUtils.getContextualHelp(event, attributes);
    const speech = (enable ? res.strings.TRAINING_ON : res.strings.TRAINING_OFF) + reprompt;

    game.training = (enable ? true : undefined);
    handlerInput.responseBuilder
      .speak(speech)
      .reprompt(reprompt);
  },
};
