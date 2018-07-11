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
    let reprompt;

    // Try to keep it simple
    const launchWelcome = JSON.parse(res.strings.LAUNCH_WELCOME);
    launchSpeech = launchWelcome[attributes.currentGame];

    // Was there a table already played?  If so, remind - otherwise
    // go directly into add player mode
    if (!game.players.length) {
      attributes.temp.addingPlayer = Date.now();
      launchSpeech += res.strings.LAUNCH_ADD_PLAYER;
      reprompt = res.strings.LAUNCH_ADD_PLAYER;
    } else {
      // Figure out what the current game state is - give them option to reset
      const output = playgame.readCurrentHand(attributes, event.request.locale);
      if (game.activePlayer === 'player') {
        // They are in the middle of a hand; remind them what they have
        launchSpeech += output.speech;
      } else {
        launchSpeech += res.strings.LAUNCH_START_GAME;
      }
      reprompt = output.reprompt;
    }

    handlerInput.responseBuilder
      .speak(launchSpeech)
      .reprompt(reprompt);
  },
};
