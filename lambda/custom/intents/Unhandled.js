//
// Handles "unhandled" intents - often because the user is trying to
// do an action that isn't allowed at this point in the flow
//

'use strict';

const utils = require('../utils');

module.exports = {
  canHandle: function(handlerInput) {
    // This one is last in the list
    return true;
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../resources')(event.request.locale);

    // Echo back the action that we heard, why this isn't valid at this time,
    // and what the possible actions are for them to say
    if (event.request.type === 'GameEngine.InputHandlerEvent') {
      // Probably a timeout - fail silently
      console.log('Unhandled button event: ' + JSON.stringify(event.request.events));
    } else if (!event.request.intent) {
      // Something we really don't handle
      console.log('Error - Unhandled didn\'t get an intent');
      return handlerInput.responseBuilder
        .speak(res.strings.INTERNAL_ERROR)
        .reprompt(res.strings.ERROR_REPROMPT)
        .getResponse();
    } else {
      let speech = buildUnhandledResponse(handlerInput);
      const reprompt = utils.getContextualHelp(event, attributes);

      speech += reprompt;
      return handlerInput.responseBuilder
        .speak(speech)
        .reprompt(reprompt)
        .getResponse();
    }
  },
};

function buildUnhandledResponse(handlerInput) {
  const intent = handlerInput.requestEnvelope.request.intent;
  const attributes = handlerInput.attributesManager.getSessionAttributes();
  const res = require('../resources')(handlerInput.requestEnvelope.request.locale);

  const game = attributes[attributes.currentGame];
  let action;
  let state;

  // What are they trying to do?
  switch (intent.name) {
    case 'BlackjackIntent':
      // This one is a little more involved - need to get the ActionSlot
      if (intent.slots && intent.slots.Action && intent.slots.Action.value) {
        action += (intent.slots.Action.value + ' ');
      } else {
        // Really shouldn't happen
        console.log('Error - unhandled BlackjackIntent with no action in ' + state);
        action = res.strings.UNHANDLED_ACTION_GENERIC;
      }
      break;
    case 'SuggestIntent':
      action = res.strings.UNHANDLED_ACTION_SUGGESTION;
      break;
    case 'ChangeBetsIntent':
      action = res.strings.UNHANDLED_ACTION_CHANGEBET;
      break;
    case 'BetAmountIntent':
      // Let them know they have to say change bet first
      if (game && game.possibleActions && game.possibleActions.length
        && (game.possibleActions.indexOf('deal') >= 0)) {
        return res.strings.UNHANDLED_TO_CHANGE_BET;
      }
      action = res.strings.UNHANDLED_ACTION_CHANGEBET;
      break;
    case 'ResetIntent':
      action = res.strings.UNHANDLED_ACTION_RESET;
      break;
    case 'AMAZON.YesIntent':
      action = res.strings.UNHANDLED_ACTION_YES;
      break;
    case 'AMAZON.NoIntent':
      action = res.strings.UNHANDLED_ACTION_NO;
      break;
    case 'DealIntent':
      action = res.strings.UNHANDLED_ACTION_DEAL;
      break;
    case 'RulesIntent':
      action = res.strings.UNHANDLED_ACTION_READRULES;
      break;
    case 'HighScoreIntent':
      action = res.strings.UNHANDLED_ACTION_HIGHSCORE;
      break;
    case 'EnableTrainingIntent':
      action = res.strings.UNHANDLED_ACTION_ENABLETRAINING;
      break;
    case 'DisableTrainingIntent':
      action = res.strings.UNHANDLED_ACTION_DISABLETRAINING;
      break;
    case 'AddPlayerIntent':
      // This can only be done at the start of the game
      // and not while you are confirming a name
      return (attributes.temp.addingName)
        ? res.strings.UNHANDLED_ACTION_CONFIRMNAME
        : res.strings.UNHANDLED_ACTION_CHANGEPLAYERS;

    // These should be handled - so log an error
    case 'AMAZON.RepeatIntent':
    case 'AMAZON.HelpIntent':
    case 'AMAZON.StopIntent':
    case 'AMAZON.CancelIntent':
    case 'SessionEndedRequest':
    default:
      console.log('Error - unhandled ' + intent.name);
      action = res.strings.UNHANDLED_ACTION_GENERIC;
      break;
  }

  // New game - ready to start a new game
  if (attributes.temp.addingName) {
    state = res.strings.UNHANDLED_STATE_ADDINGPLAYER;
  } else if (attributes.temp.firsthand) {
    state = res.strings.UNHANLDED_STATE_FIRSTHAND;
  } else if (attributes.temp.changingBets !== undefined) {
    state = res.strings.UNHANDLED_STATE_CHANGINGBETS;
  } else if (game && game.possibleActions && game.possibleActions.length) {
    if (game.possibleActions.indexOf('deal') >= 0) {
      state = res.strings.UNHANDLED_STATE_NEWGAME;
    } else if (game.possibleActions.indexOf('noinsurance') >= 0) {
      state = res.strings.UNHANDLED_STATE_INSURANCEOFFERED;
    } else {
      state = res.strings.UNHANDLED_STATE_INGAME;
    }
  } else {
    state = res.strings.UNHANDLED_STATE_OTHER;
  }

  return res.strings.UNHANDLED_FORMAT.replace('{Action}', action).replace('{State}', state);
}
