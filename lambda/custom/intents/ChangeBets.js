//
// Handles the betting intent
//

'use strict';

const playgame = require('../PlayGame');

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
    const res = require('../' + event.request.locale + '/resources');

    // First off, if they were in the midst of adding a player, add it
    if (attributes.temp.addingPlayer) {
      playgame.addPlayer(attributes);
    }

    // Now, we'll loop through each player and prompt for a new amount to bet
    attributes.temp.changingBets = 0;
    const reprompt = res.strings.CHANGEBETS_REPROMPT;
    const speech = playgame.readPlayerName(attributes, attributes.temp.changingBets) + reprompt;

    handlerInput.responseBuilder
      .speak(speech)
      .reprompt(reprompt);
  },
};