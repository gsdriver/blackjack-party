//
// Handles adding players to the game when the skill starts
//

'use strict';

const utils = require('../utils');

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
    const res = require('../resources')(event.request.locale);

    // If reset table is true, nuke the current table and start over
    if (attributes.temp.resetTable) {
      game.players = [];
      game.playerHands = {};
      game.currentPlayer = undefined;
      attributes.temp.resetTable = undefined;
    }

    // New player!  If there was a player already being added, add them
    if (attributes.temp.addingPlayer) {
      utils.addPlayer(attributes);
    }

    // Start adding a new player
    attributes.temp.addingPlayer = Date.now();

    handlerInput.responseBuilder
      .speak(res.strings.ADD_PLAYER.replace('{0}', (game.players.length + 1)))
      .reprompt(res.strings.ADD_PLAYER_REPROMPT);
  },
};
