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
          || (request.intent.name === 'BettingIntent'))) {
      // Bet is only allowed if it's in the list of possible actions
      const attributes = handlerInput.attributesManager.getSessionAttributes();
      const game = attributes[attributes.currentGame];
      if (game && (game.possibleActions.indexOf('bet') >= 0)) {
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
    let amount = 0;

    // Curious what language is betting...
    console.log('Bet invoked for ' + event.request.locale);

    if (event.request.intent.slots && event.request.intent.slots.Amount
      && event.request.intent.slots.Amount.value) {
      amount = event.request.intent.slots.Amount.value;
    }

    // If the bet is non-numeric, refuse it
    if (isNaN(amount)) {
      const betError = res.strings.BAD_BET_FORMAT.replace('{0}', amount);
      handlerInput.responseBuilder
        .speak(betError)
        .reprompt(res.strings.ERROR_REPROMPT);
    } else {
      // Take the bet
      const action = {action: 'bet', amount: amount, firsthand: attributes.temp.firsthand};

      playgame.playBlackjackAction(attributes, event.request.locale, action,
        (error, response, speech, reprompt) => {
        if (!error) {
          attributes.temp.firsthand = undefined;
          game.timestamp = Date.now();
          game.hands = (game.hands) ? (game.hands + 1) : 1;
          handlerInput.responseBuilder
            .speak(speech)
            .reprompt(reprompt);
        } else {
          handlerInput.responseBuilder
            .speak(error)
            .reprompt(res.strings.ERROR_REPROMPT);
        }
      });
    }
  },
};