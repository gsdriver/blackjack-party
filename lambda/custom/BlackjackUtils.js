//
// Set of utility functions
//

'use strict';

const speechUtils = require('alexa-speech-utils')();

module.exports = {
  // Gets contextual help based on the current state of the game
  getContextualHelp: function(event, attributes, helpPrompt) {
    const resources = require('./' + event.request.locale + '/resources');
    const game = attributes[attributes.currentGame];
    const state = module.exports.getState(attributes);
    let result = '';

    // In some states, the choices are yes or no
    if ((state == 'CONFIRMRESET') || (state == 'INSURANCEOFFERED')) {
      result = resources.strings.HELP_YOU_CAN_SAY_YESNO;
    } else if (game.possibleActions) {
      // Special case - if there is insurance and noinsurance in the list, then pose as a yes/no
      if (game.possibleActions.indexOf('noinsurance') > -1) {
        // It's possible you can't take insurance because you don't have enough money
        if (game.possibleActions.indexOf('insurance') > -1) {
          result = ((game.playerHands[0].total === 21) && (game.rules.blackjackBonus == 0.5))
              ? resources.strings.HELP_TAKE_INSURANCE_BLACKJACK
              : resources.strings.HELP_TAKE_INSURANCE;
        } else {
          result = resources.strings.HELP_INSURANCE_INSUFFICIENT_BANKROLL;
        }
      } else {
        const actions = game.possibleActions.map((x) => resources.mapPlayOption(x));
        actions.push(resources.strings.HELP_YOU_CAN_SAY_LEADER);
        if (helpPrompt && !game.training) {
          actions.push(resources.strings.HELP_YOU_CAN_SAY_ENABLE_TRAINING);
        }
        result = resources.strings.HELP_YOU_CAN_SAY.replace('{0}',
            speechUtils.or(actions, {locale: event.request.locale}));
      }
    } else if (!helpPrompt) {
      result = resources.strings.TRAINING_REPROMPT;
    }

    if (helpPrompt) {
      result += resources.strings.HELP_MORE_OPTIONS;
    }

    return result;
  },
  // Figures out what state of the game we're in
  getState: function(attributes) {
    const game = attributes[attributes.currentGame];

    // New game - ready to start a new game
    if (game.possibleActions.indexOf('bet') >= 0) {
      if (attributes.newUser) {
        return 'FIRSTTIMEPLAYER';
      }
      return 'NEWGAME';
    } else if (game.suggestion) {
      return 'SUGGESTION';
    } else if (game.possibleActions.indexOf('noinsurance') >= 0) {
      return 'INSURANCEOFFERED';
    } else {
      return 'INGAME';
    }
  },
};
