//
// Handles launching the skill
//

'use strict';

const utils = require('../utils');
const speechUtils = require('alexa-speech-utils')();
const buttons = require('../buttons');
const moment = require('moment-timezone');
const https = require('https');

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

    return new Promise((resolve, reject) => {
      launchSpeech = '<audio src=\"https://s3-us-west-2.amazonaws.com/alexasoundclips/casinowelcome.mp3\"/> ';
      getUserTimezone(event, (timezone) => {
        if (timezone) {
          const hour = moment.tz(Date.now(), timezone).format('H');
          if ((hour > 5) && (hour < 12)) {
            launchSpeech += res.strings.LAUNCH_GOOD_MORNING;
          } else if ((hour >= 12) && (hour < 18)) {
            launchSpeech += res.strings.LAUNCH_GOOD_AFTERNOON;
          } else {
            launchSpeech += res.strings.LAUNCH_GOOD_EVENING;
          }
        }

        // Try to keep it simple
        const launchWelcome = JSON.parse(res.strings.LAUNCH_WELCOME);
        launchSpeech += launchWelcome[attributes.currentGame];
        buttons.addButtons(handlerInput);

        // Was there a table already played?  If so, remind - otherwise
        // go directly into add player mode
        if (!game.players.length) {
          attributes.temp.addingPlayer = Date.now();
          launchSpeech += res.strings.LAUNCH_ADD_PLAYER;
          if (!attributes.prompts.useButton && buttons.supportButtons(handlerInput)) {
            launchSpeech += res.strings.LAUNCH_ADD_PLAYER_BUTTON;
            attributes.prompts.useButton = true;
          }
          reprompt = res.strings.LAUNCH_ADD_PLAYER;
        } else {
          // See if they want to continue with this table
          const names = [];
          let unnamed = 0;

          game.players.forEach((player) => {
            if (attributes.playerList[player].name) {
              names.push(attributes.playerList[player].name);
            } else {
              unnamed++;
            }
          });
          if (unnamed === 1) {
            names.push(res.strings.LAUNCH_ONE_UNNAMED);
          } else if (unnamed > 1) {
            names.push(res.strings.LAUNCH_MULTIPLE_UNNAMED.replace('{0}', unnamed));
          }

          launchSpeech += res.strings.LAUNCH_TABLE_INPROGRESS;
          launchSpeech += res.strings.LAUNCH_TABLE_NAMES
            .replace('{0}', speechUtils.and(names, {locale: event.request.locale}));

          // Figure out what the current game state is - give them option to reset
          const output = utils.readCurrentHand(attributes, event.request.locale);
          if (game.activePlayer === 'player') {
            // They are in the middle of a hand; remind them what they have
            launchSpeech += res.strings.LAUNCH_START_HAND_INPROGRESS;
            launchSpeech += output.speech;
          } else {
            launchSpeech += res.strings.LAUNCH_START_GAME;
          }
          if (!attributes.prompts.resetButton && buttons.supportButtons(handlerInput)) {
            launchSpeech += res.strings.LAUNCH_START_BUTTON;
            attributes.prompts.resetButton = true;
          }
          reprompt = output.reprompt;
          attributes.temp.resetTable = true;
        }

        resolve(handlerInput.responseBuilder
          .speak(launchSpeech)
          .reprompt(reprompt)
          .getResponse());
      });
    });
  },
};

function getUserTimezone(event, callback) {
  if (event.context.System.apiAccessToken) {
    // Invoke the entitlement API to load timezone
    const options = {
      host: 'api.amazonalexa.com',
      path: '/v2/devices/' + event.context.System.device.deviceId + '/settings/System.timeZone',
      method: 'GET',
      timeout: 1000,
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': event.request.locale,
        'Authorization': 'bearer ' + event.context.System.apiAccessToken,
      },
    };

    const req = https.get(options, (res) => {
      let returnData = '';
      res.setEncoding('utf8');
      if (res.statusCode != 200) {
        console.log('deviceTimezone returned status code ' + res.statusCode);
        callback();
      } else {
        res.on('data', (chunk) => {
          returnData += chunk;
        });

        res.on('end', () => {
          // Strip quotes
          const timezone = returnData.replace(/['"]+/g, '');
          callback(moment.tz.zone(timezone) ? timezone : undefined);
        });
      }
    });

    req.on('error', (err) => {
      console.log('Error calling user settings API: ' + err.message);
      callback();
    });
  } else {
    // No API token - no user timezone
    callback();
  }
}
