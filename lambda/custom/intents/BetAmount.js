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
        (request.intent.name === 'BetAmountIntent')) {
      // You can place a bet if you are actively changing bet amounts
      const attributes = handlerInput.attributesManager.getSessionAttributes();
      if (attributes.temp.changingBets !== undefined) {
        return true;
      }

      // If you're in the midst of adding a player, you can set a bet
      if (attributes.temp.addingPlayer) {
        return true;
      }

      // If it's the end of the hand and there is only one player,
      // you can also change the bet
      const game = attributes[attributes.currentGame];
      if (game && (game.players.length === 1) &&
        (game.possibleActions.indexOf('deal') >= 0)) {
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
    let amount = 100;

    if (event.request.intent.slots && event.request.intent.slots.Amount
      && event.request.intent.slots.Amount.value) {
      amount = event.request.intent.slots.Amount.value;
    }

    // If the bet is non-numeric, refuse it
    if (isNaN(amount)) {
      const betError = res.strings.BAD_BET_FORMAT.replace('{0}', amount);
      return handlerInput.responseBuilder
        .speak(betError)
        .reprompt(res.strings.ERROR_REPROMPT)
        .getResponse();
    } else {
      let speech;
      let reprompt;
      let bankroll;

      if (attributes.temp.addingPlayer) {
        bankroll = 5000;
      } else if (attributes.temp.changingBets !== undefined) {
        bankroll = attributes.playerList[game.players[attributes.temp.changingBets]].bankroll;
      } else {
        bankroll = attributes.playerList[game.players[0]].bankroll;
      }

      // Verify this bet against table min, max, and bankroll
      if (amount < game.rules.minBet) {
        speech = res.strings.BET_BELOW_MIN
          .replace('{0}', amount)
          .replace('{1}', game.rules.minBet);
      } else if (amount > bankroll) {
        speech = res.strings.BET_ABOVE_BANKROLL
          .replace('{0}', amount)
          .replace('{1}', bankroll);
      } else if (amount > game.rules.maxBet) {
        speech = res.strings.BET_ABOVE_MAX
          .replace('{0}', amount)
          .replace('{1}', game.rules.maxBet);
      }

      if (speech) {
        return handlerInput.responseBuilder
          .speak(speech)
          .reprompt(res.strings.BET_ERROR_REPROMPT)
          .getResponse();
      } else {
        // OK, change this player's bet
        if (attributes.temp.addingPlayer) {
          attributes.temp.addingBet = amount;
        } else if (attributes.temp.changingBets !== undefined) {
          attributes.playerList[game.players[attributes.temp.changingBets]].bet = amount;
        } else {
          attributes.playerList[game.players[0]].bet = amount;
        }
        speech = res.strings.BET_AMOUNT_SET.replace('{0}', amount);

        if ((attributes.temp.changingBets !== undefined)
          && (attributes.temp.changingBets < (game.players.length - 1))) {
          // On to the next player
          attributes.temp.changingBets++;
          reprompt = res.strings.CHANGEBETS_REPROMPT;
          speech += (utils.readPlayerName(event.request.locale, attributes, attributes.temp.changingBets) + reprompt);

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
        } else if (attributes.temp.addingPlayer) {
          return handlerInput.responseBuilder
            .speak(speech)
            .reprompt(res.strings.ERROR_REPROMPT)
            .getResponse();
        } else {
          // OK, all bets have been set
          return new Promise((resolve, reject) => {
            let response;
            const action = {action: 'deal', amount: 0};
            utils.playBlackjackAction(handlerInput, event.request.locale, action,
              (error, resp, dealSpeech, dealReprompt) => {
              if (!error) {
                attributes.temp.firsthand = undefined;
                attributes.temp.firstplay = undefined;

                // Set each player's timestamp and hands played
                game.players.forEach((player) => {
                  attributes.playerList[player].timestamp = Date.now();
                  attributes.playerList[player].hands
                    = (attributes.playerList[player].hands + 1) || 1;
                });

                response = handlerInput.responseBuilder
                  .speak(speech + dealSpeech)
                  .reprompt(dealReprompt)
                  .getResponse();
              } else {
                response = handlerInput.responseBuilder
                  .speak(error)
                  .reprompt(res.strings.ERROR_REPROMPT)
                  .getResponse();
              }
            });
            resolve(response);
          });
        }
      }
    }
  },
};
