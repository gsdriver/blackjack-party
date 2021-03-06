//
// Handles collecting a player name
//

'use strict';

const utils = require('../utils');
const buttons = require('../buttons');

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    if (!attributes.temp.addingName) {
      return false;
    }

    if (request.type === 'GameEngine.InputHandlerEvent') {
      return ((buttons.getPressedButton(request, attributes) !== 'existing')
        && attributes.temp.firstplay);
    }

    return ((request.type === 'IntentRequest')
        && ((request.intent.name === 'AMAZON.YesIntent') ||
          (request.intent.name === 'AMAZON.NoIntent') ||
          (request.intent.name === 'AMAZON.CancelIntent')));
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    const res = require('../resources')(event.request.locale);

    buttons.startInputHandler(handlerInput);
    if ((handlerInput.requestEnvelope.request.type === 'GameEngine.InputHandlerEvent') ||
      (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent')) {
      // Great, add the player
      let speech;
      let newPlayer = true;
      const name = attributes.temp.addingName;

      // First, have we already added this player?
      if (attributes.playerList && name) {
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
        return handlerInput.responseBuilder
          .speak(speech)
          .reprompt(res.strings.CONFIRM_DUPLICATE_REPROMPT)
          .getResponse();
      } else {
        speech = (game.players.length == 3)
          ? res.strings.CONFIRM_MAX_PLAYERS
          : res.strings.CONFIRM_ADD_PLAYER;
        if (!utils.addPlayer(handlerInput)) {
          speech = res.strings.CONFIRM_WELCOME_BACK.replace('{0}', name) + speech;
        }

        return handlerInput.responseBuilder
          .speak(speech)
          .reprompt(res.strings.CONFIRM_ADD_PLAYER)
          .getResponse();
      }
    } else {
      // Nope, not the right name
      attributes.temp.addingName = undefined;
      return handlerInput.responseBuilder
        .speak(res.strings.ADD_PLAYER.replace('{0}', (game.players.length + 1)))
        .reprompt(res.strings.ADD_PLAYER_REPROMPT)
        .getResponse();
    }
  },
};
