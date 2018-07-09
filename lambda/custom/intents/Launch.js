//
// Handles launching the skill
//

'use strict';

const playgame = require('../PlayGame');

module.exports = {
  canHandle: function(handlerInput) {
    return handlerInput.requestEnvelope.session.new ||
      (handlerInput.requestEnvelope.request.type === 'LaunchRequest');
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../' + event.request.locale + '/resources');
    const game = attributes[attributes.currentGame];
    let launchSpeech;

    // Try to keep it simple
    const launchWelcome = JSON.parse(res.strings.LAUNCH_WELCOME);
    launchSpeech = launchWelcome[attributes.currentGame];

    // Figure out what the current game state is - give them option to reset
    const output = playgame.readCurrentHand(attributes, event.request.locale);
    if (game.activePlayer === 'player') {
      // They are in the middle of a hand; remind them what they have
      launchSpeech += output.speech;
    } else {
      launchSpeech += res.strings.LAUNCH_START_GAME;
    }

    handlerInput.responseBuilder
      .speak(launchSpeech)
      .reprompt(output.reprompt);
  },
};
