//
// Checks whether we can fulfill this intent
// Note that this is processed outside of the normal Alexa SDK
// So we cannot use alexa-sdk functionality here
//

'use strict';

module.exports = {
  check: function(event) {
    const noSlotIntents = ['DealIntent', 'HighScoreIntent', 'RulesIntent', 'SuggestIntent',
      'AddPlayerIntent', 'EnableTrainingIntent', 'DisableTrainingIntent', 'AMAZON.FallbackIntent',
      'AMAZON.HelpIntent', 'AMAZON.StopIntent', 'AMAZON.CancelIntent',
      'AMAZON.RepeatIntent', 'AMAZON.YesIntent', 'AMAZON.NoIntent', 'AMAZON.MoreIntent',
      'AMAZON.NavigateHomeIntent', 'AMAZON.NavigateSettingsIntent', 'AMAZON.NextIntent',
      'AMAZON.PageUpIntent', 'AMAZON.PageDownIntent', 'AMAZON.PreviousIntent', 'AMAZON.ScrollRightIntent',
      'AMAZON.ScrollDownIntent', 'AMAZON.ScrollLeftIntent', 'AMAZON.ScrollUpIntent', 'ChangeBetsIntent'];

    // Default to a negative response
    const response = {
    'version': '1.0',
      'response': {
        'canFulfillIntent': {
          'canFulfill': 'NO',
          'slots': {},
        },
      },
    };

    // If this is one we understand regardless of attributes,
    // then we can just return immediately
    let valid;
    if (noSlotIntents.indexOf(event.request.intent.name) > -1) {
      valid = true;
    } else {
      if (event.request.intent.name == 'PlayerNameIntent') {
        // Need a name - any name
        if (event.request.intent.slots && event.request.intent.slots.Name
          && event.request.intent.slots.Name.value) {
          valid = true;
        }
      } else if (event.request.intent.name == 'BetAmountIntent') {
        let amount = 0;

        // Need to validate Amount
        if (event.request.intent.slots && event.request.intent.slots.Amount
          && event.request.intent.slots.Amount.value) {
          amount = parseInt(event.request.intent.slots.Amount.value);
        }

        if (!isNaN(amount)) {
          // Valid bet
          valid = true;
        }
      } else if (event.request.intent.name == 'BlackjackIntent') {
        if (event.request.intent.slots && event.request.intent.slots.Action
          && event.request.intent.slots.Action.value) {
          const res = require('../resources')(event.request.locale);
          valid = res.getBlackjackAction(event.request.intent.slots.Action);
        }
      }
    }

    if (valid) {
      // We can fulfill it - all slots are good
      let slot;

      response.response.canFulfillIntent.canFulfill = 'YES';
      for (slot in event.request.intent.slots) {
        if (slot) {
          response.response.canFulfillIntent.slots[slot] =
              {'canUnderstand': 'YES', 'canFulfill': 'YES'};
        }
      }
    }

    console.log('CanFulfill: ' + JSON.stringify(response));
    return response;
  },
};
