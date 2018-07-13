'use strict';

const utils = require('../utils');

module.exports = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    if (request.type === 'IntentRequest') {
      const attributes = handlerInput.attributesManager.getSessionAttributes();
      const game = attributes[attributes.currentGame];
      if (request.intent.name === 'BlackjackIntent') {
        // Valid if we are in game
        if (game && (game.suggestion ||
          ((game.possibleActions.indexOf('deal') == -1) &&
           (game.possibleActions.indexOf('noinsurance') == -1)))) {
          return true;
        }
      } else if (request.intent.name === 'AMAZON.YesIntent') {
        // Valid if we are in game (no suggestion) AND there is
        // only one possible action we can take
        if (game && !game.suggestion && game.possibleActions &&
          (game.possibleActions.length == 1) &&
          (game.possibleActions[0] !== 'deal') &&
          (game.possibleActions[0] !== 'noinsurance')) {
          return true;
        }
      }
    }

    return false;
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../resources')(event.request.locale);
    const game = attributes[attributes.currentGame];
    const actionObj = {};

    if (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent') {
      actionObj.action = game.possibleActions[0];
    } else {
      // First make sure we have an action
      const actionSlot = event.request.intent.slots.Action;
      if (!actionSlot) {
        handlerInput.responseBuilder
          .speak(res.strings.BLACKJACKINTENT_NO_ACTION)
          .reprompt(res.strings.ERROR_REPROMPT);
      } else if (!actionSlot.value) {
        handlerInput.responseBuilder
          .speak(res.strings.BLACKJACKINTENT_UNKNOWN_ACTION.replace('{0}', actionSlot.value))
          .reprompt(res.strings.ERROR_REPROMPT);
      } else {
        // Let's play this action
        actionObj.action = res.getBlackjackAction(actionSlot);
        if (!actionObj.action) {
          // What did they specify?
          console.log('NULL ACTION: ' + JSON.stringify(event.request));
          actionObj.action = actionSlot.value;
        }
      }
    }

    if (actionObj.action) {
      utils.playBlackjackAction(attributes, event.request.locale,
          actionObj, (error, response, speech, reprompt) => {
        if (!error) {
          handlerInput.responseBuilder
            .speak(speech)
            .reprompt(reprompt);
        } else {
          handlerInput.responseBuilder
            .speak(error)
            .reprompt(res.strings.ERROR_REPROMPT);
        }
      });
    }
  },
};
