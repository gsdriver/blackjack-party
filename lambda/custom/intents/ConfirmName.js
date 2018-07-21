//
// Handles collecting a player name
//

'use strict';

const utils = require('../utils');

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
    const res = require('../resources')(event.request.locale);

    if (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent') {
      // Great, add the player
      let speech;
      let newPlayer = true;
      const name = attributes.temp.addingName;

      // First, have we already added this player?
      if (attributes.playerList) {
        game.players.forEach((player) => {
          if (attributes.playerList[player] && (attributes.playerList[player].name === name)) {
            newPlayer = false;
          }
        });
      }

      if (!newPlayer) {
        // Sorry, this isn't a new player
        speech = res.strings.CONFIRM_DUPLICATE_PLAYER.replace('{0}', name);
        speech += res.strings.CONFIRM_DUPLICATE_REPROMPT;
        handlerInput.responseBuilder
          .speak(speech)
          .reprompt(res.strings.CONFIRM_DUPLICATE_REPROMPT);
      } else {
        speech = (game.players.length == 5)
          ? res.strings.CONFIRM_MAX_PLAYERS
          : res.strings.CONFIRM_ADD_PLAYER;
        if (!utils.addPlayer(attributes)) {
          speech = res.strings.CONFIRM_WELCOME_BACK.replace('{0}', name) + speech;
        }

        handlerInput.responseBuilder
          .speak(speech)
          .reprompt(res.strings.CONFIRM_ADD_PLAYER);
      }
    } else {
      // Nope, not the right name
      attributes.temp.addingName = undefined;
      handlerInput.responseBuilder
        .speak(res.strings.ADD_PLAYER.replace('{0}', (game.players.length + 1)))
        .reprompt(res.strings.ADD_PLAYER_REPROMPT);
    }
  },
};
