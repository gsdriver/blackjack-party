//
// Handles the intent to provide a suggestion
//

'use strict';

const utils = require('../utils');
const buttons = require('../buttons');

module.exports = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    // Suggest is only allowed if we aren't at the start of a hand
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    if (game && (game.possibleActions.indexOf('deal') !== -1)) {
      return false;
    }

    if (request.type === 'GameEngine.InputHandlerEvent') {
      // Only allowed if it is your turn
      const buttonState = buttons.getPressedButton(request, attributes);
      if ((buttonState === 'last') || (buttonState === 'existing')) {
        let playerButton;
        if ((game.currentPlayer !== undefined) && attributes.temp.buttons) {
          if (attributes.temp.buttons[game.players[game.currentPlayer]]) {
            playerButton = attributes.temp.buttons[game.players[game.currentPlayer]].id;
          }
        }
        return (playerButton && (playerButton === attributes.temp.buttonId));
      }
    }

    return ((request.type === 'IntentRequest') &&
        (request.intent.name === 'SuggestIntent'));
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    // If they pushed a button, re-open for input
    if (event.request.type === 'GameEngine.InputHandlerEvent') {
      buttons.startInputHandler(handlerInput);
    }

    return new Promise((resolve, reject) => {
      attributes.suggestRequests = (attributes.suggestRequests + 1) || 1;
      utils.playBlackjackAction(handlerInput,
        event.request.locale, {action: 'suggest'},
        (error, resp, speech, reprompt) => {
        let response;
        if (!error) {
          response = handlerInput.responseBuilder
            .speak(speech)
            .reprompt(reprompt)
            .getResponse();
        } else {
          response = handlerInput.responseBuilder
            .speak(error)
            .reprompt(res.strings.ERROR_REPROMPT)
            .getResponse();
        }
        resolve(response);
      });
    });
  },
};
