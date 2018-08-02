//
// Handles adding players to the game when the skill starts
//

'use strict';

const utils = require('../utils');
const gameService = require('../GameService');
const buttons = require('../buttons');

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    if (request.type === 'GameEngine.InputHandlerEvent') {
      return (buttons.getPressedButton(request, attributes)
        && attributes.temp.firstplay);
    }

    if ((request.type === 'IntentRequest')
      && ((request.intent.name === 'AddPlayerIntent') ||
        (request.intent.name === 'AMAZON.NextIntent') ||
        (request.intent.name === 'AMAZON.FallbackIntent'))
      && attributes.temp.firstplay
      && !attributes.temp.addingName) {
      attributes.temp.buttonId = undefined;
      return true;
    }

    return false;
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../resources')(event.request.locale);

    // If this is fallback, let them know we didn't hear the name
    if (handlerInput.requestEnvelope.request.intent
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent')) {
      handlerInput.responseBuilder
        .speak(res.strings.ADD_PLAYER_UKNOWN)
        .reprompt(res.strings.ADD_PLAYER_REPROMPT);
      return;
    }

    // If reset table is true, nuke the current table and start over
    if (attributes.temp.resetTable) {
      gameService.initializeGame('standard', attributes, event.session.user.userId);
      attributes.temp.resetTable = undefined;
    }
    const game = attributes[attributes.currentGame];

    // New player!  If there was a player already being added, add them
    // UNLESS this is the first player and they pressed the button
    // because that means they want to tie this player to this button
    if (attributes.temp.addingPlayer &&
      !(!game.players.length && !attributes.temp.addingButton && attributes.temp.buttonId)) {
      utils.addPlayer(handlerInput);
    }

    // If we have four players, you cannot add another player
    if (game.players.length == 4) {
      handlerInput.responseBuilder
        .speak(res.strings.ADD_PLAYER_TABLE_FULL)
        .reprompt(res.strings.ADD_PLAYER_TABLE_FULL_REPROMPT);
    } else {
      // Start adding a new player
      attributes.temp.addingPlayer = Date.now();
      attributes.temp.addingButton = attributes.temp.buttonId;
      if (attributes.temp.buttonId) {
        buttons.colorButton(handlerInput, attributes.temp.buttonId,
            buttons.getPlayerColor(game.players.length));
      }
      let format;
      if (game.players.length === 3) {
        format = res.strings.ADD_LAST_PLAYER;
      } else if (attributes.temp.buttonId) {
        format = res.strings.ADD_PLAYER_BUTTON;
      } else {
        format = res.strings.ADD_PLAYER;
      }
      handlerInput.responseBuilder
        .speak(format.replace('{0}', (game.players.length + 1)))
        .reprompt(res.strings.ADD_PLAYER_REPROMPT);

      if (event.request.type === 'GameEngine.InputHandlerEvent') {
        buttons.startInputHandler(handlerInput);
      }
    }
  },
};
