//
// Handles adding players to the game when the skill starts
//

'use strict';

const playgame = require('../PlayGame');

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    return ((request.type === 'IntentRequest')
      && (request.intent.name === 'AddPlayerIntent')
      && attributes.temp.firsthand);
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    const res = require('../' + event.request.locale + '/resources');

    // New player!  If there was a player already being added, add them
    if (attributes.temp.addingPlayer) {
      playgame.addPlayer(attributes);
    }

    // Start adding a new player
    attributes.temp.addingPlayer = Date.now();

    handlerInput.responseBuilder
      .speak(res.strings.ADD_PLAYER.replace('{0}', (game.players.length + 1)))
      .reprompt(res.strings.ADD_PLAYER_REPROMPT);
  },
};
