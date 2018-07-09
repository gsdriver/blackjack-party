//
// Handles launching the skill
//

'use strict';

const ads = require('../ads');

module.exports = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    // Can always handle with Stop and Cancel
    if (request.type === 'IntentRequest') {
      if ((request.intent.name === 'AMAZON.CancelIntent')
        || (request.intent.name === 'AMAZON.StopIntent')) {
        return true;
      }

      // Can also handle No if said at end of hand
      if (request.intent.name === 'AMAZON.NoIntent') {
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        const game = attributes[attributes.currentGame];
        if (game && (game.possibleActions.indexOf('bet') >= 0)) {
          return true;
        }
      }
    }

    return false;
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../' + event.request.locale + '/resources');
    const game = attributes[attributes.currentGame];
    let exitSpeech = '';

    // Tell them how much money they are leaving with
    exitSpeech = res.strings.EXIT_BANKROLL.replace('{0}', game.bankroll) + ' ';
    if (attributes.bot) {
      handlerInput.responseBuilder.speak(exitSpeech);
    } else {
      return new Promise((resolve, reject) => {
        ads.getAd(attributes, 'blackjack-party', event.request.locale, (adText) => {
          exitSpeech += (adText + ' ' + res.strings.EXIT_GOODBYE);
          handlerInput.responseBuilder
            .speak(exitSpeech)
            .withShouldEndSession(true);
          resolve();
        });
      });
    }
  },
};
