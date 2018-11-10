//
// Handles the betting intent
//

'use strict';

const utils = require('../utils');
const buttons = require('../buttons');

module.exports = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    if ((request.type === 'IntentRequest') &&
      (request.intent.name === 'ChangeBetsIntent')) {
      // You can only change bets before the hand has started
      const attributes = handlerInput.attributesManager.getSessionAttributes();
      const game = attributes[attributes.currentGame];
      if (game && (game.possibleActions.indexOf('deal') >= 0)) {
        return true;
      }
    }

    return false;
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../resources')(event.request.locale);
    const game = attributes[attributes.currentGame];

    // First off, if they were in the midst of adding a player, add it
    if (attributes.temp.addingPlayer) {
      utils.addPlayer(handlerInput);
    }

    // Now, we'll loop through each player and prompt for a new amount to bet
    attributes.temp.changingBets = 0;
    const reprompt = res.strings.CHANGEBETS_REPROMPT;
    const speech = utils.readPlayerName(event.request.locale, attributes,
      attributes.temp.changingBets) + reprompt;

    // Color this player if they have a button associated
    buttons.disableButtons(handlerInput);
    if (attributes.temp.buttons &&
      attributes.temp.buttons[game.players[attributes.temp.changingBets]]) {
      const button = attributes.temp.buttons[game.players[attributes.temp.changingBets]];
      buttons.colorButton(handlerInput, button.id, button.color);
    }
    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt(reprompt)
      .getResponse();
  },
};
