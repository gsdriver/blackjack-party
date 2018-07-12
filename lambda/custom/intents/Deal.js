//
// Handles the betting intent
//

'use strict';

const playgame = require('../PlayGame');

module.exports = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    if ((request.type === 'IntentRequest') &&
        ((request.intent.name === 'AMAZON.YesIntent')
          || (request.intent.name === 'DealIntent'))) {
      // Deal is only allowed if it's in the list of possible actions
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
    const game = attributes[attributes.currentGame];

    // First off, if they were in the midst of adding a player, add it
    if (attributes.temp.addingPlayer) {
      playgame.addPlayer(attributes);
    }

    // Play for the default amount
    const action = {action: 'deal', amount: 0, firsthand: attributes.temp.firsthand};
    playgame.playBlackjackAction(attributes, event.request.locale, action,
      (error, response, speech, reprompt) => {
      if (!error) {
        attributes.temp.firsthand = undefined;

        // Set each player's timestamp and hands played
        game.players.forEach((player) => {
          attributes.playerList[player].timestamp = Date.now();
          attributes.playerList[player].hands
            = (attributes.playerList[player].hands + 1) || 1;
        });

        handlerInput.responseBuilder
          .speak(speech)
          .reprompt(reprompt);
      } else {
        handlerInput.responseBuilder
          .speak(error)
          .reprompt(res.strings.ERROR_REPROMPT);
      }
    });
  },
};
