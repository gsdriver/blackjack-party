//
// Handles collecting a player name
//

'use strict';

const playgame = require('../PlayGame');

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    return ((request.type === 'IntentRequest')
      && attributes.temp.addingName
      && ((request.intent.name === 'AMAZON.YesIntent') ||
          (request.intent.name === 'AMAZON.NoIntent')));
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    const res = require('../' + event.request.locale + '/resources');

    if (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent') {
      // Great, add the player
      playgame.addPlayer(attributes);
      handlerInput.responseBuilder
        .speak(res.strings.CONFIRM_ADD_PLAYER)
        .reprompt(res.strings.CONFIRM_ADD_PLAYER);
    } else {
      // Nope, not the right name
      attributes.temp.addingName = undefined;
      handlerInput.responseBuilder
        .speak(res.strings.ADD_PLAYER.replace('{0}', (game.players.length + 1)))
        .reprompt(res.strings.ADD_PLAYER_REPROMPT);
    }
  },
};
