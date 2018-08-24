//
// Handles the intent to enable or disable training mode
//

'use strict';

const utils = require('../utils');

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
    const res = require('../resources')(event.request.locale);
    const enable = (handlerInput.requestEnvelope.request.intent.name === 'EnableTrainingIntent');
    const game = attributes[attributes.currentGame];

    const reprompt = utils.getContextualHelp(event, attributes);
    const speech = (enable ? res.strings.TRAINING_ON : res.strings.TRAINING_OFF) + reprompt;

    game.training = (enable ? true : undefined);
    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt(reprompt)
      .getResponse();
  },
};
