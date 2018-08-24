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
      && (attributes.temp.addingPlayer ||
        (attributes.temp.firstplay && !attributes.temp.addingName && !attributes.temp.resetTable))
      && event.request.intent.slots
      && event.request.intent.slots.Name
      && event.request.intent.slots.Name.value);
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    const res = require('../resources')(event.request.locale);
    const name = handlerInput.requestEnvelope.request.intent.slots.Name.value;

    // Great, I heard a player name - let's confirm though
    if (attributes.temp.addingPlayer) {
      attributes.temp.addingName = name;
      return handlerInput.responseBuilder
        .speak(res.strings.PLAYER_GOTNAME.replace('{0}', name))
        .reprompt(res.strings.PLAYER_GOTNAME_REPROMPT.replace('{0}', name))
        .getResponse();
    } else {
      // We'll add a new player and prompt if this is the right name
      // First make sure the table isn't full
      if (game.players.length == 4) {
        return handlerInput.responseBuilder
          .speak(res.strings.ADD_PLAYER_TABLE_FULL)
          .reprompt(res.strings.ADD_PLAYER_TABLE_FULL_REPROMPT)
          .getResponse();
      } else {
        attributes.temp.addingPlayer = Date.now();
        attributes.temp.addingName = name;
        return handlerInput.responseBuilder
          .speak(res.strings.PLAYER_ADDPLAYER
            .replace('{0}', name)
            .replace('{1}', game.players.length + 1))
          .reprompt(res.strings.PLAYER_GOTNAME_REPROMPT.replace('{0}', name))
          .getResponse();
      }
    }
  },
};
