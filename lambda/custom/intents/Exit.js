//
// Handles launching the skill
//

'use strict';

const ads = require('../ads');
const speechUtils = require('alexa-speech-utils')();

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
        if (game && (game.possibleActions.indexOf('deal') >= 0)) {
          return true;
        }
      }
    }

    return false;
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../resources')(event.request.locale);
    const game = attributes[attributes.currentGame];
    let exitSpeech = '';
    let byeText;

    if (game.players && game.players.length) {
      const names = [];

      game.players.forEach((player) => {
        if (attributes.playerList[player].name) {
          names.push(attributes.playerList[player].name);
        }
      });
      if (names.length) {
        byeText = res.strings.EXIT_GOODBYE_NAMES
          .replace('{0}', speechUtils.and(names, {locale: event.request.locale}));
      }
    }
    if (!byeText) {
      byeText = res.strings.EXIT_GOODBYE;
    }

    if (attributes.bot) {
      handlerInput.responseBuilder.speak(byeText);
    } else {
      return new Promise((resolve, reject) => {
        ads.getAd(attributes, 'blackjack-party', event.request.locale, (adText) => {
          exitSpeech += (adText + ' ' + byeText);
          handlerInput.responseBuilder
            .speak(exitSpeech)
            .withShouldEndSession(true);
          resolve();
        });
      });
    }
  },
};
