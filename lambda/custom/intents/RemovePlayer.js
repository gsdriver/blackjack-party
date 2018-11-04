//
// Handles removing the last-added player
//

'use strict';

const utils = require('../utils');

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];

    return ((request.type === 'IntentRequest')
      && (request.intent.name === 'AMAZON.CancelIntent')
      && attributes.temp.firstplay
      && !attributes.temp.resetTable
      && (game.players.length > 0));
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    const res = require('../resources')(event.request.locale);
    let name;

    // OK, let's remove the last added player if they aren't in the
    // middle of adding a new player
    if (!attributes.temp.addingPlayer) {
      name = utils.readPlayerName(event.request.locale, attributes, game.players.length - 1);
      const id = game.players.pop();
      if (attributes.temp.buttons) {
        attributes.temp.buttons[id] = undefined;
      }
    } else {
      name = res.strings.CURRENT_PLAYER.replace('{0}', game.players.length + 1);
    }

    attributes.temp.addingName = undefined;
    attributes.temp.addingButton = undefined;
    attributes.temp.addingPlayer = undefined;

    if (game.players.length == 0) {
      // If there are now no registered players, we need to go back to
      // a state of adding an unnamed player (as it was when we launched
      // the skill) - in case they want to deal solo
      attributes.temp.addingPlayer = Date.now();
    }

    return handlerInput.responseBuilder
      .speak(res.strings.REMOVE_PLAYER_REMOVED.replace('{0}', name))
      .reprompt(res.strings.REMOVE_PLAYER_REPROMPT)
      .getResponse();
  },
};
