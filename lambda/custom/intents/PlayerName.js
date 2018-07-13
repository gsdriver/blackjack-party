//
// Handles collecting a player name
//

'use strict';

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const event = handlerInput.requestEnvelope;

    return ((request.type === 'IntentRequest')
      && (request.intent.name === 'PlayerNameIntent')
      && attributes.temp.addingPlayer && event.request.intent.slots
      && event.request.intent.slots.Name
      && event.request.intent.slots.Name.value);
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../resources')(event.request.locale);
    const name = handlerInput.requestEnvelope.request.intent.slots.Name.value;

    // Great, I heard a player name - let's confirm though
    attributes.temp.addingPlayer = Date.now();
    attributes.temp.addingName = name;

    handlerInput.responseBuilder
      .speak(res.strings.PLAYER_GOTNAME.replace('{0}', name))
      .reprompt(res.strings.PLAYER_GOTNAME_REPROMPT.replace('{0}', name));
  },
};
