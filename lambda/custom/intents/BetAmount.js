//
// Handles the betting intent
//

'use strict';

const playgame = require('../PlayGame');

module.exports = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    if ((request.type === 'IntentRequest') &&
        (request.intent.name === 'BetAmountIntent')) {
      // You ned to be actively changing bet amounts
      const attributes = handlerInput.attributesManager.getSessionAttributes();
      if (attributes.temp.changingBets !== undefined) {
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
      let speech;
      let reprompt;

      // OK, change this player's bet
      attributes.playerList[game.players[attributes.temp.changingBets]].bet = amount;
      speech = res.strings.BET_AMOUNT_SET.replace('{0}', amount);

      if (attributes.temp.changingBets < (game.players.length - 1)) {
        // On to the next player
        attributes.temp.changingBets++;
        reprompt = res.strings.CHANGEBETS_REPROMPT;
        speech += (playgame.readPlayerName(attributes, attributes.temp.changingBets) + reprompt);
        handlerInput.responseBuilder.speak(speech).reprompt(reprompt);
      } else {
        // OK, all bets have been set - let's deal
        const action = {action: 'deal', amount: 0, firsthand: attributes.temp.firsthand};
        playgame.playBlackjackAction(attributes, event.request.locale, action,
          (error, response, dealSpeech, dealReprompt) => {
          if (!error) {
            attributes.temp.firsthand = undefined;

            // Set each player's timestamp and hands played
            game.players.forEach((player) => {
              attributes.playerList[player].timestamp = Date.now();
              attributes.playerList[player].hands
                = (attributes.playerList[player].hands + 1) || 1;
            });

            handlerInput.responseBuilder
              .speak(speech + dealSpeech)
              .reprompt(dealReprompt);
          } else {
            handlerInput.responseBuilder
              .speak(error)
              .reprompt(res.strings.ERROR_REPROMPT);
          }
        });
      }
    }
  },
};
