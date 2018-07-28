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
    addButtons(handlerInput);

    // Was there a table already played?  If so, remind - otherwise
    // go directly into add player mode
    if (!game.players.length) {
      attributes.temp.addingPlayer = Date.now();
      launchSpeech += res.strings.LAUNCH_ADD_PLAYER;
      if (!attributes.prompts.useButton) {
        launchSpeech += res.strings.LAUNCH_ADD_PLAYER_BUTTON;
        attributes.prompts.useButton = true;
      }
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

function addButtons(handlerInput) {
  // Build idle breathing animation that will play immediately
  // and button down animation for when the button is pressed
  utils.startInputHandler(handlerInput);
  const breathAnimation = buildBreathAnimation('000000', 'FFFFFF', 30, 1200);
  const idleDirective = {
    'type': 'GadgetController.SetLight',
    'version': 1,
    'targetGadgets': [],
    'parameters': {
      'animations': [{
        'repeat': 100,
        'targetLights': ['1'],
        'sequence': breathAnimation,
      }],
      'triggerEvent': 'none',
      'triggerEventTimeMs': 0,
    },
  };

  const buttonDownDirective = {
    'type': 'GadgetController.SetLight',
    'version': 1,
    'targetGadgets': [],
    'parameters': {
      'animations': [{
        'repeat': 1,
        'targetLights': ['1'],
        'sequence': [{
          'durationMs': 500,
          'color': 'FFFF00',
          'intensity': 255,
          'blend': false,
        }],
      }],
      'triggerEvent': 'buttonDown',
      'triggerEventTimeMs': 0,
    },
  };

  handlerInput.responseBuilder
    .addDirective(idleDirective)
    .addDirective(buttonDownDirective);
}

function buildBreathAnimation(fromRgbHex, toRgbHex, steps, totalDuration) {
  const halfSteps = steps / 2;
  const halfTotalDuration = totalDuration / 2;
  return buildSeqentialAnimation(fromRgbHex, toRgbHex, halfSteps, halfTotalDuration)
    .concat(buildSeqentialAnimation(toRgbHex, fromRgbHex, halfSteps, halfTotalDuration));
};

function buildSeqentialAnimation(fromRgbHex, toRgbHex, steps, totalDuration) {
  const fromRgb = parseInt(fromRgbHex, 16);
  let fromRed = fromRgb >> 16;
  let fromGreen = (fromRgb & 0xff00) >> 8;
  let fromBlue = fromRgb & 0xff;

  const toRgb = parseInt(toRgbHex, 16);
  const toRed = toRgb >> 16;
  const toGreen = (toRgb & 0xff00) >> 8;
  const toBlue = toRgb & 0xff;

  const deltaRed = (toRed - fromRed) / steps;
  const deltaGreen = (toGreen - fromGreen) / steps;
  const deltaBlue = (toBlue - fromBlue) / steps;

  const oneStepDuration = Math.floor(totalDuration / steps);

  const result = [];

  for (let i = 0; i < steps; i++) {
    result.push({
      'durationMs': oneStepDuration,
      'color': '' + n2h(fromRed) + n2h(fromGreen) + n2h(fromBlue),
      'intensity': 255,
      'blend': true,
    });
    fromRed += deltaRed;
    fromGreen += deltaGreen;
    fromBlue += deltaBlue;
  }

  return result;
};

// number to hex with leading zeroes
function n2h(n) {
  return ('00' + (Math.floor(n)).toString(16)).substr(-2);
};
