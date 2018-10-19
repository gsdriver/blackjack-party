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
    const res = require('../resources')(event.request.locale);
    const game = attributes[attributes.currentGame];

    // First off, if they were in the midst of adding a player, add it
    if (attributes.temp.addingPlayer) {
      utils.addPlayer(handlerInput);
    }

    // Play for the default amount
    const action = {action: 'deal', amount: 0, firsthand: attributes.temp.firsthand};
    return new Promise((resolve, reject) => {
      let response;
      utils.playBlackjackAction(handlerInput, event.request.locale, action,
        (error, resp, speech, reprompt) => {
        if (!error) {
          attributes.temp.firsthand = undefined;
          attributes.temp.firstplay = undefined;

          // If there were no buttons pressed, turn off the input handler
          // otherwise call start input handler to restrict input to
          // only those buttons that are registered
          if (!attributes.temp.buttons) {
            buttons.stopInputHandler(handlerInput);
          } else {
            buttons.startInputHandler(handlerInput);
          }

          // Set each player's timestamp and hands played
          const now = Date.now();
          game.timestamp = now;
          attributes.temp.hands = (attributes.temp.hands + 1) || 1;
          game.players.forEach((player) => {
            attributes.playerList[player].timestamp = now;
            attributes.playerList[player].hands
              = (attributes.playerList[player].hands + 1) || 1;
          });

          response = handlerInput.responseBuilder
            .speak(speech)
            .reprompt(reprompt)
            .getResponse();
        } else {
          resonse = handlerInput.responseBuilder
            .speak(error)
            .reprompt(res.strings.ERROR_REPROMPT)
            .getResponse();
        }
        resolve(response);
      });
    });
  },
};
