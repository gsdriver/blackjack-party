//
// Handles launching the skill
//

'use strict';

const utils = require('../utils');
const speechUtils = require('alexa-speech-utils')();

module.exports = {
  canHandle: function(handlerInput) {
    return handlerInput.requestEnvelope.session.new ||
      (handlerInput.requestEnvelope.request.type === 'LaunchRequest');
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../resources')(event.request.locale);
    const game = attributes[attributes.currentGame];
    let launchSpeech;
    let reprompt;

    // Try to keep it simple
    const launchWelcome = JSON.parse(res.strings.LAUNCH_WELCOME);
    launchSpeech = '<audio src=\"https://s3-us-west-2.amazonaws.com/alexasoundclips/casinowelcome.mp3\"/> '
      + launchWelcome[attributes.currentGame];

    // Was there a table already played?  If so, remind - otherwise
    // go directly into add player mode
    if (!game.players.length) {
      attributes.temp.addingPlayer = Date.now();
      launchSpeech += res.strings.LAUNCH_ADD_PLAYER;
      reprompt = res.strings.LAUNCH_ADD_PLAYER;
    } else {
      // See if they want to continue with this table
      const names = [];

      game.players.forEach((player) => {
        if (attributes.playerList[player].name) {
          names.push(attributes.playerList[player].name);
        }
      });
      launchSpeech += res.strings.LAUNCH_TABLE_INPROGRESS;
      if (names.length) {
        launchSpeech += res.strings.LAUNCH_TABLE_NAMES
          .replace('{0}', game.players.length)
          .replace('{1}', speechUtils.and(names, {locale: event.request.locale}));
      } else {
        launchSpeech += res.strings.LAUNCH_TABLE_PLAYERS.replace('{0}', game.players.length);
      }

      // Figure out what the current game state is - give them option to reset
      const output = utils.readCurrentHand(attributes, event.request.locale);
      if (game.activePlayer === 'player') {
        // They are in the middle of a hand; remind them what they have
        launchSpeech += res.strings.LAUNCH_START_HAND_INPROGRESS;
        launchSpeech += output.speech;
      } else {
        launchSpeech += res.strings.LAUNCH_START_GAME;
      }
      reprompt = output.reprompt;
      attributes.temp.resetTable = true;
    }

    handlerInput.responseBuilder
      .speak(launchSpeech)
      .reprompt(reprompt);
  },
};
