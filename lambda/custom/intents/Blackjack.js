'use strict';

const utils = require('../utils');

module.exports = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    if (request.type === 'IntentRequest') {
      const attributes = handlerInput.attributesManager.getSessionAttributes();
      const game = attributes[attributes.currentGame];

      if (request.intent.name === 'AMAZON.YesIntent') {
        // Valid if we are in game (no suggestion) AND there is
        // only one possible action we can take
        return (game && !game.suggestion && game.possibleActions &&
          (game.possibleActions.length == 1) &&
          (game.possibleActions[0] !== 'deal') &&
          (game.possibleActions[0] !== 'noinsurance'));
      } else if (game && (game.suggestion ||
        ((game.possibleActions.indexOf('deal') == -1) &&
        (game.possibleActions.indexOf('noinsurance') == -1)))) {
        // We are in a game
        if (request.intent.name === 'BlackjackIntent') {
          return true;
        } else if (request.intent.name === 'PlayerNameIntent') {
          const res = require('../resources')(request.locale);
          return res.getBlackjackAction(request.intent.slots.Name);
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
      const actionSlot = (handlerInput.requestEnvelope.request.intent.name === 'PlayerNameIntent')
        ? event.request.intent.slots.Name
        : event.request.intent.slots.Action;
      if (!actionSlot) {
        return handlerInput.responseBuilder
          .speak(res.strings.BLACKJACKINTENT_NO_ACTION)
          .reprompt(res.strings.ERROR_REPROMPT)
          .getResponse();
      } else if (!actionSlot.value) {
        return handlerInput.responseBuilder
          .speak(res.strings.BLACKJACKINTENT_UNKNOWN_ACTION.replace('{0}', actionSlot.value))
          .reprompt(res.strings.ERROR_REPROMPT)
          .getResponse();
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
      return new Promise((resolve, reject) => {
        utils.playBlackjackAction(handlerInput, event.request.locale,
            actionObj, (error, resp, speech, reprompt) => {
          let response;
          if (!error) {
            response = handlerInput.responseBuilder
              .speak(speech)
              .reprompt(reprompt)
              .getResponse();
          } else {
            attributes.temp.firstplay = undefined;
            response = handlerInput.responseBuilder
              .speak(error)
              .reprompt(res.strings.ERROR_REPROMPT)
              .getResponse();
          }
          resolve(response);
        });
      });
    }
  },
};
