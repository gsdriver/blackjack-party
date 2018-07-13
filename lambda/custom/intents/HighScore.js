//
// Handles the intent to process a 'Yes' response
//

'use strict';

const speechUtils = require('alexa-speech-utils')();

module.exports = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    if ((request.type === 'IntentRequest') && (request.intent.name === 'HighScoreIntent')) {
      const attributes = handlerInput.attributesManager.getSessionAttributes();
      return (attributes.playerList && (Object.keys(attributes.playerList).length > 0));
    }

    return false;
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../' + event.request.locale + '/resources');

    // OK, read the top 5 highest bankrolls
    let leaders = [];
    let id;
    let name;

    for (id in attributes.playerList) {
      if (attributes.playerList[id].high) {
        if (attributes.playerList[id] && attributes.playerList[id].name) {
          name = attributes.playerList[id].name;
        } else {
          name = res.strings.HIGHSCORE_NONAME;
        }

        leaders.push({name: name,
          hands: attributes.playerList[id].hands,
          high: attributes.playerList[id].high});
      }
    }

    leaders.sort((a, b) => (a.high == b.high) ? (b.hands - a.hands) : (b.high - a.high));
    leaders = leaders.slice(0, 5);
    const leaderText = [];
    leaders.forEach((leader) => {
      leaderText.push(res.strings.HIGHSCORE_LEADER_FORMAT
        .replace('{0}', leader.name)
        .replace('{1}', leader.high));
    });

    handlerInput.responseBuilder
      .speak(res.strings.HIGHSCORE_LEADERS
        .replace('{0}', leaderText.length)
        .replace('{1}', speechUtils.and(leaderText, {locale: event.request.locale, pause: '200ms'})))
      .reprompt(res.strings.HIGHSCORE_LEADER_REPROMPT);
  },
};
