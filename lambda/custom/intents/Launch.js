//
// Handles launching the skill
//

'use strict';

const playgame = require('../PlayGame');
const bjUtils = require('../BlackjackUtils');

module.exports = {
  handleIntent: function() {
    const res = require('../' + this.event.request.locale + '/resources');
    const game = this.attributes[this.attributes.currentGame];
    let launchSpeech;

    // Try to keep it simple
    const launchWelcome = JSON.parse(res.strings.LAUNCH_WELCOME);
    launchSpeech = launchWelcome[this.attributes.currentGame];

    // Figure out what the current game state is - give them option to reset
    const output = playgame.readCurrentHand(this.attributes, this.event.request.locale);
    if (game.activePlayer === 'player') {
      // They are in the middle of a hand; remind them what they have
      launchSpeech += output.speech;
    } else {
      launchSpeech += res.strings.LAUNCH_START_GAME;
    }

    bjUtils.emitResponse(this, null, null, launchSpeech, output.reprompt);
  },
};
