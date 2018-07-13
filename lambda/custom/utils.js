//
// Handles translation of core playing of the game into speech output
//

'use strict';

const gameService = require('./GameService');
const speechUtils = require('alexa-speech-utils')();

let resources;

module.exports = {
  // Plays a given action, returning either an error or a response string
  playBlackjackAction: function(attributes, locale, action, callback) {
    // Special case if this is suggest
    resources = require('./resources')(locale);
    const game = attributes[attributes.currentGame];

    if (action.action == 'suggest') {
      let speech;
      const suggestText = gameService.getRecommendedAction(game);

      if (suggestText === 'notplayerturn') {
        speech = resources.strings.SUGGEST_TURNOVER;
      } else if (resources.mapActionToSuggestion(suggestText)) {
        speech = resources.pickRandomOption('SUGGEST_OPTIONS').replace('{0}', resources.mapActionToSuggestion(suggestText));
      } else {
        speech = suggestText;
      }

      // If they aren't in training mode, and they haven't already heard
      // about training mode, then let them know about this feature
      if (!attributes.prompts.training) {
        attributes.prompts.training = true;
        if (!game.training) {
          speech += ('. ' + resources.strings.PROMPT_TRAINING);
        }
      }

      const reprompt = listValidActions(game, locale, 'full');
      speech += ('. ' + reprompt);
      callback(null, null, speech, reprompt, null);
    } else {
      // Get the game state so we can take action (the latest should be stored tied to this user ID)
      let speechError = null;
      let speechQuestion = '';
      let repromptQuestion = null;

      // Is this a valid option?
      if (!game.possibleActions
            || (game.possibleActions.indexOf(action.action) < 0)) {
        // Probably need a way to read out the game state better
        speechError = resources.strings.INVALID_ACTION.replace('{0}', resources.mapPlayOption(action.action));
        speechError += readHand(attributes, game, locale);
        speechError += ' ' + listValidActions(game, locale, 'full');
        sendUserCallback(attributes, speechError, null, null, null, callback);
      } else {
        // OK, let's post this action and get a new game state
        const oldGame = JSON.parse(JSON.stringify(game));

        // If they are in training mode, first check if this is the right action
        // and we didn't already make a suggestion that they are ignoring
        if (game.training && !game.suggestion) {
          const suggestion = gameService.getRecommendedAction(game);

          if ((suggestion !== 'notplayerturn') && (suggestion !== action.action)) {
            // Let them know what the recommended action was
            // and give them a chance to use this action instead
            game.suggestion = {suggestion: suggestion, player: action.action};

            let suggestText;
            if (resources.mapActionToSuggestion(suggestion)) {
              suggestText = resources.mapActionToSuggestion(suggestion);
            } else {
              suggestText = suggestion;
            }
            let speech = resources.pickRandomOption('SUGGESTED_PLAY').replace('{0}', suggestText);
            const reprompt = resources.strings.SUGGESTED_PLAY_REPROMPT.replace('{0}', suggestText);

            speech += reprompt;
            callback(null, null, speech, reprompt, null);
            return;
          }
        }

        // If there was a suggestion, remove it as we have taken a play
        game.suggestion = undefined;
        gameService.userAction(attributes, action.action, (speechError) => {
          let error;

          if (speechError) {
            error = resources.mapServerError(speechError);
          } else {
            // Player took an action - the board will need to be redrawn
            if (!attributes.temp) {
              attributes.temp = {};
            }
            attributes.temp.drawBoard = true;

            // Special case - give a full read-out if this is a natural blackjack
            const playerBlackjack = (game.activePlayer == 'player') && gameService.isPlayerBlackjack(game);

            // If this was the first hand, tell them how much they bet
            if ((action.action === 'deal') && action.firsthand) {
              // Let's see who bet what
              const betsForPlayers = {};
              let bet;
              let samebet = null;
              let i;

              for (i = 0; i < game.players.length; i++) {
                const player = game.players[i];
                bet = attributes.playerList[player].bet;
                if (!betsForPlayers[bet]) {
                  betsForPlayers[bet] = [];
                  if (samebet === null) {
                    samebet = bet;
                  } else {
                    samebet = undefined;
                  }
                }
                betsForPlayers[bet].push(module.exports.readPlayerName(attributes, i));
              }

              if (samebet) {
                speechQuestion += resources.strings.EVERYONE_BET_TEXT.replace('{0}', samebet);
              } else {
                const betSpeech = [];
                for (bet in betsForPlayers) {
                  if (bet) {
                    betSpeech.push(resources.strings.PLAYER_BET_TEXT
                      .replace('{0}', speechUtils.and(betsForPlayers[bet], {locale: locale}))
                      .replace('{1}', bet));
                  }
                }

                speechQuestion += speechUtils.and(betSpeech, {locale: locale, pause: '200ms'});
              }
            }

            // Pose this as a question whether it's the player or dealer's turn
            repromptQuestion = listValidActions(game, locale, 'full');
            speechQuestion += (tellResult(attributes, locale, action.action, oldGame) + ' '
              + listValidActions(game, locale, (playerBlackjack) ? 'full' : 'summary'));
          }

          sendUserCallback(attributes, error, null, speechQuestion, repromptQuestion, callback);
        });
      }
    }
  },
  // Reads back the rules in play
  readRules: function(attributes, locale) {
    resources = require('./resources')(locale);
    const game = attributes[attributes.currentGame];

    const reprompt = listValidActions(game, locale, 'full');
    const speech = rulesToText(locale, game.rules) + reprompt;

    return {speech: speech, reprompt: reprompt};
  },
  // Reads back the current hand and game state
  readCurrentHand: function(attributes, locale, readBankroll) {
    resources = require('./resources')(locale);
    const game = attributes[attributes.currentGame];
    const reprompt = listValidActions(game, locale, 'full');

    let speech = module.exports.readPlayerName(attributes);
    if (readBankroll) {
      speech += resources.strings.YOUR_BANKROLL_TEXT.replace('{0}', gameService.getBankroll(attributes));
    }
    speech += readHand(attributes, game, locale) + ' ' + reprompt;
    return {speech: speech, reprompt: reprompt};
  },
  // Gets contextual help based on the current state of the game
  getContextualHelp: function(event, attributes, helpPrompt) {
    resources = require('./resources')(locale);
    const game = attributes[attributes.currentGame];
    const state = module.exports.getState(attributes);
    let result = '';

    // In some states, the choices are yes or no
    if ((state == 'CONFIRMNAME') || (state == 'INSURANCEOFFERED')) {
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
    if (attributes.temp.addingName) {
      return 'CONFIRMNAME';
    } else if (attributes.temp.firsthand) {
      return 'ADDINGPLAYERS';
    } else if (attributes.temp.changingBets !== undefined) {
      return 'CHANGINGBETS';
    } else if (game.possibleActions.indexOf('deal') >= 0) {
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
  addPlayer: function(attributes) {
    const game = attributes[attributes.currentGame];
    let id = attributes.temp.addingPlayer;
    let newPlayer = false;

    // If there is a name, let's see if they are already on the list
    if (!attributes.playerList) {
      attributes.playerList = {};
    }
    if (attributes.temp.addingName) {
      let playerId;
      for (playerId in attributes.playerList) {
        if (attributes.playerList[playerId].name == attributes.temp.addingName) {
          // They are already in the master list, so don't re-add
          id = playerId;
        }
      };
    }

    // Add to the table
    game.players.push(id);
    game.playerHands[id] = {};
    if (!attributes.playerList[id]) {
      attributes.playerList[id] = {};
      attributes.playerList[id].bankroll = gameService.getStartingBankroll();
      attributes.playerList[id].high = gameService.getStartingBankroll();
      attributes.playerList[id].name = attributes.temp.addingName;
      newPlayer = true;
    }

    attributes.temp.addingPlayer = undefined;
    attributes.temp.addingName = undefined;
    return newPlayer;
  },
  readPlayerName: function(attributes, playerPos) {
    const game = attributes[attributes.currentGame];
    const currentPlayer = (playerPos === undefined) ? game.currentPlayer : playerPos;
    const id = game.players[currentPlayer];
    let name;

    if (attributes.playerList[id] && attributes.playerList[id].name) {
      name = attributes.playerList[id].name + ' <break time=\'200ms\'/> ';
    } else {
      name = resources.strings.CURRENT_PLAYER.replace('{0}', currentPlayer + 1);
    }

    return name;
  },
};

//
// It's possible the game gets to a state where you have to reset the bankroll
// and/or shuffle the deck.  Let's do that automatically for the user
//
function sendUserCallback(attributes, error, response, speech, reprompt, callback) {
  const game = attributes[attributes.currentGame];

  // If this is shuffle, we'll do the shuffle for them
  if (game && game.possibleActions) {
    if (game.possibleActions.indexOf('shuffle') > -1) {
      // Simplify things and just shuffle for them
      gameService.userAction(attributes, 'shuffle', 0, (err) => {
        testReset();
      });
    } else {
      testReset();
    }

    function testReset() {
      if (game.possibleActions.indexOf('resetbankroll') > -1) {
        // Simplify things and just shuffle for them if this is resetbankroll
        gameService.userAction(attributes, 'resetbankroll', 0, (err) => {
          sendCallback();
        });
      } else {
        sendCallback();
      }
    }
  } else {
    sendCallback();
  }

  function sendCallback() {
    // We're done and ready to callback
    callback(error, response, speech, reprompt);
  }
}

/*
 * Internal functions
 */

//
// Lists what the user can do next - provided in the form of a question
// You can ask for either "full" or "summary" depending on the state
//
function listValidActions(game, locale, type) {
  let result = '';

  if (game.possibleActions) {
    // Special case - if there is insurance and noinsurance in the list, then ask a yes/no question
    if (game.possibleActions.indexOf('noinsurance') > -1) {
      // It's possible you can't take insurance because you don't have enough money
      if (game.possibleActions.indexOf('insurance') > -1) {
        // Do you have blackjack?
        result = (gameService.isPlayerBlackjack(game) && (game.rules.blackjackBonus == 0.5))
            ? resources.strings.ASK_TAKE_INSURANCE_BLACKJACK
            : resources.strings.ASK_TAKE_INSURANCE;
      } else {
        result = resources.strings.HELP_INSURANCE_INSUFFICIENT_BANKROLL;
      }
    } else if (type === 'full') {
      result = resources.strings.ASK_POSSIBLE_ACTIONS.replace('{0}',
        speechUtils.or(game.possibleActions.map((x) => resources.mapPlayOption(x)),
        {locale: locale}));
    } else {
      // Provide a summary
      if (game.activePlayer == 'player') {
        result = resources.strings.ASK_WHAT_TO_DO;
      } else {
        result = resources.strings.ASK_PLAY_AGAIN;
      }
    }
  }

  return result;
}

function tellResult(attributes, locale, action, oldGame) {
  let result = '';
  const game = attributes[attributes.currentGame];

  // If all players are done with insurance decisions, first say
  // whether the dealer had a blackjack or not
  if ((action == 'insurance') || (action == 'noinsurance')) {
    result += readInsurance(attributes, locale, true);
  }
  // If you surrendered, acknowledge before we move to the next player
  if (action == 'surrender') {
    result += readSurrender(attributes, locale, true);
  }

  if (oldGame.activePlayer == 'player') {
    // It's possible they did something other than stand on the previous hand if this is a split
    // If so, read that off first (but try to avoid it if they just stood on the prior hand)
    const newCurrentHand = game.playerHands[game.players[game.currentPlayer]]
      .currentPlayerHand;
    const oldCurrentHand = oldGame.playerHands[oldGame.players[oldGame.currentPlayer]]
      .currentPlayerHand;

    if ((game.currentPlayer != oldGame.currentPlayer) || (newCurrentHand != oldCurrentHand)) {
      const oldHand = game.playerHands[oldGame.players[oldGame.currentPlayer]]
        .hands[oldCurrentHand];

      // I don't want to re-read this hand if they just stood, so let's make sure they busted
      // or split Aces (which only draws one card) or did a double before we read this hand.
      if ((oldHand.total >= 21) ||
        (oldHand.bet > gameService.getCurrentHand(game).bet)) {
        if (oldHand.total > 21) {
          result += resources.strings.RESULT_AFTER_HIT_BUST
            .replace('{0}', resources.readCard(oldHand.cards[oldHand.cards.length - 1], 'article', game.readSuit));
        } else {
          result += resources.strings.RESULT_AFTER_HIT_NOBUST
            .replace('{0}', resources.readCard(oldHand.cards[oldHand.cards.length - 1], 'article', game.readSuit))
            .replace('{1}', oldHand.total);
        }

        // And now preface with the next hand before we tell them what happened
        result += readHandNumber(game,
            game.playerHands[game.players[game.currentPlayer]].currentPlayerHand);
      }
    }
  }
  // Always say new player and read their hand if current player shifted
  if ((game.currentPlayer != oldGame.currentPlayer) && (game.players.length > 1)) {
    result += module.exports.readPlayerName(attributes);
    result += readHand(attributes, game, attributes.playerLocale);
  } else {
    // So what happened?
    switch (action) {
      case 'resetbankroll':
        result += resources.strings.RESULT_BANKROLL_RESET;
        break;
      case 'shuffle':
        result += resources.strings.RESULT_DECK_SHUFFLED;
        break;
      case 'deal':
        // A new hand was dealt
        result += readHand(attributes, game, locale);
        // If it is not the player's turn (could happen on dealer blackjack)
        // then read the game result here too
        if (game.activePlayer != 'player') {
          result += ' ' + readGameResult(attributes);
        }
        break;
      case 'hit':
      case 'double':
        // Tell them the new card, the total, and the dealer up card (or what they did)
        result += readHit(attributes, locale);
        break;
      case 'stand':
        // OK, let's read what the dealer had, what they drew, and what happened
        result += readStand(attributes, locale);
        break;
      case 'insurance':
      case 'noinsurance':
        // Say whether the dealer had blackjack, and what the next thing is to do
        result += readInsurance(attributes, locale);
        break;
      case 'split':
        // OK, now you have multiple hands - makes reading the game state more interesting
        result += readSplit(attributes, locale);
        break;
      case 'surrender':
        result += readSurrender(attributes, locale);
        break;
    }
  }

  if ((oldGame.activePlayer == 'player') && (game.activePlayer != 'player')) {
    // OK, game over - is this a new high bankroll?
    const bankroll = gameService.getBankroll(attributes);
    if (bankroll > attributes.playerList[game.players[game.currentPlayer]].high) {
      attributes.playerList[game.players[game.currentPlayer]].high = bankroll;
    }
  }

  return result;
}

//
// Recaps what the dealer has done now that he played his turn
//
function readDealerAction(game, locale) {
  let result;

  result = resources.strings.DEALER_HOLE_CARD.replace('{0}', resources.readCard(game.dealerHand.cards[0], 'article', game.readSuit));
  if (game.dealerHand.cards.length > 2) {
    result += resources.strings.DEALER_DRAW;
    result += speechUtils.and(game.dealerHand.cards.slice(2).map((x) => resources.readCard(x, 'article', game.readSuit)), {locale: locale});
  }

  if (game.dealerHand.total > 21) {
    result += resources.strings.DEALER_BUSTED;
  } else if ((game.dealerHand.total == 21) && (game.dealerHand.cards.length == 2)) {
    result += resources.strings.DEALER_BLACKJACK;
  } else {
    result += resources.strings.DEALER_TOTAL.replace('{0}', game.dealerHand.total);
  }

  return result;
}

//
// Read the result of the game
//
function readGameResult(attributes) {
  // Read the result for each player
  let outcome = '';
  const game = attributes[attributes.currentGame];
  let i;
  for (i = 0; i < game.players.length; i++) {
    outcome += readPlayerResult(attributes, i);
  }

  // They are no longer a new user
  if (attributes.newUser) {
    attributes.newUser = undefined;
  }

  return outcome;
}

//
// Read the result of the game
//
function readPlayerResult(attributes, playerPos) {
  let i;
  let outcome = '';
  const game = attributes[attributes.currentGame];
  const currentPlayer = game.playerHands[game.players[playerPos]];

  outcome = module.exports.readPlayerName(attributes, playerPos);
  if (currentPlayer.hands.length > 1) {
    // If more than one hand and the outcome is the same, say all hands
    let allSame = true;
    currentPlayer.hands.map((x) => {
      if (x.outcome != currentPlayer.hands[0].outcome) {
        allSame = false;
      }
    });

    if (allSame) {
      // This means you have multiple hands that all had the same outcome
      outcome += resources.mapMultipleOutcomes(currentPlayer.hands[0].outcome,
          currentPlayer.hands.length);
      outcome += ' ';
    } else {
      // Read each hand
      for (i = 0; i < currentPlayer.hands.length; i++) {
        outcome += readHandNumber(game, i);
        outcome += resources.mapOutcome(currentPlayer.hands[i].outcome);
      }
    }
  } else {
    outcome += resources.mapOutcome(currentPlayer.hands[0].outcome);
  }

  outcome += resources.strings.YOUR_BANKROLL_TEXT
    .replace('{0}', attributes.playerList[game.players[playerPos]].bankroll);

  // What was the outcome?
  return outcome;
}

/*
 * We will read the new card, the total, and the dealer up card
 */
function readHit(attributes, locale) {
  const game = attributes[attributes.currentGame];
  const currentHand = gameService.getCurrentHand(game);
  const cardText = resources.readCard(currentHand.cards[currentHand.cards.length - 1], 'article', game.readSuit);
  const cardRank = currentHand.cards[currentHand.cards.length - 1].rank;
  let result;

  if (currentHand.total > 21) {
    result = resources.pickRandomOption('PLAYER_HIT_BUSTED').replace('{0}', cardText);
  } else {
    let formatChoices;

    // May say something different if it's a good hit
    if (currentHand.soft) {
      // Only say something if you hit to 21
      if (currentHand.total == 21) {
        formatChoices = 'GREAT_HIT_OPTIONS';
      } else {
        formatChoices = 'PLAYER_HIT_NOTBUSTED_SOFT';
      }
    } else {
      // Good if they hit up to 20 with a card 6 or under,
      // great if they got to 21 with a card 6 or under
      if ((currentHand.total == 20) && (cardRank <= 6)) {
        formatChoices = 'GOOD_HIT_OPTIONS';
      } else if ((currentHand.total == 21) && (cardRank <= 6)) {
        formatChoices = 'GREAT_HIT_OPTIONS';
      } else {
        formatChoices = 'PLAYER_HIT_NOTBUSTED';
      }
    }

    result = resources.pickRandomOption(formatChoices).replace('{0}', cardText).replace('{1}', currentHand.total);
    if (game.activePlayer === 'player') {
      result += resources.strings.DEALER_SHOWING.replace('{0}', resources.readCard(game.dealerHand.cards[1], 'article', game.readSuit));
    }
  }

  if (game.activePlayer != 'player') {
    result += readDealerAction(game, locale);
    result += ' ' + readGameResult(attributes);
  }

  return result;
}

//
// We will read the dealer's hand, action, and what the final outcome was
//
function readStand(attributes, locale) {
  const game = attributes[attributes.currentGame];
  let result;

  // If they are still playing, then read the next hand, otherwise read
  // the dealer action
  if (game.activePlayer == 'player') {
    result = readHand(attributes, game, locale);
  } else {
    result = readDealerAction(game, locale);
    result += ' ' + readGameResult(attributes);
  }
  return result;
}

//
// You split, so now let's read the result
//
function readSplit(attributes, locale) {
  const game = attributes[attributes.currentGame];
  let result;
  const pairCard = gameService.getCurrentHand(game).cards[0];

  if (pairCard.rank >= 10) {
    result = resources.strings.SPLIT_TENS;
  } else {
    result = resources.strings.SPLIT_PAIR.replace('{0}', resources.pluralCardRanks(pairCard));
  }

  // Now read the current hand
  result += readHand(attributes, game, locale);

  return result;
}

/*
 * You surrendered, so the game is over
 */
function readSurrender(attributes, locale, surrenderResult) {
  const game = attributes[attributes.currentGame];
  let result;

  // If they surrendered then acknowledge before we move on
  if (surrenderResult && (game.players.length > 1)) {
    result = resources.strings.SURRENDER_RESULT;
  } else if (game.activePlayer != 'player') {
    // Rub it in by saying what the dealer had
    result = readDealerAction(game, locale);
    result += ' ' + readGameResult(attributes);
  } else {
    // Next player - read their hand
    result = readHand(attributes, game, locale);
  }

  return result;
}

/*
 * Say whether the dealer had blackjack - if not, reiterate the current hand,
 * if so then we're done and let them know to bet
 */
function readInsurance(attributes, locale, readDealer) {
  const game = attributes[attributes.currentGame];
  let result = '';

  if (readDealer) {
    if (game.dealerHand.outcome == 'dealerblackjack') {
      // Game over
      result = resources.strings.DEALER_HAD_BLACKJACK;
    } else if (game.dealerHand.outcome == 'nodealerblackjack') {
      // No blackjack - so what do you want to do now?
      result = resources.strings.DEALER_NO_BLACKJACK;
    }
  } else {
    if (game.dealerHand.outcome == 'dealerblackjack') {
      // Game over
      result = readGameResult(attributes);
    } else {
      // Game is still active - what do you want to do?
      result = readHand(attributes, game, locale);
    }
  }

  return result;
}

/*
 * Reads the state of the hand - your cards and total, and the dealer up card
 */
function readHand(attributes, game, locale) {
  let result = '';
  let resultFormat;
  const currentPlayer = gameService.getCurrentPlayer(game);

  // It's possible there is no hand
  if (!currentPlayer || (currentPlayer.hands.length == 0)) {
    return '';
  }
  const currentHand = gameService.getCurrentHand(game);
  if (!currentHand) {
    // We're about to blow up - log for diagnosis
    console.log('currentHand is undefined: ' + JSON.stringify(game));
  }

  // If they have more than one hand, then say the hand number
  result += readHandNumber(game, currentPlayer.currentPlayerHand);
  const readCards = speechUtils.and(currentHand.cards.map((x) => {
    return resources.readCard(x, false, game.readSuit);
  }), {locale: locale});

  // Read the full hand
  if (currentHand.total > 21) {
    resultFormat = (currentHand.soft) ? resources.strings.READHAND_PLAYER_BUSTED_SOFT
            : resources.strings.READHAND_PLAYER_BUSTED;
    result += resultFormat.replace('{0}', readCards).replace('{1}', currentHand.total);
  } else if (game.activePlayer == 'none') {
    // If no active player, use past tense
    if ((currentPlayer.hands.length == 1) && (currentHand.cards.length == 2)
      && (currentHand.total == 21)) {
      result += resources.strings.READHAND_PLAYER_TOTAL_END_BLACKJACK.replace('{0}', readCards);
    } else {
      resultFormat = (currentHand.soft) ? resources.strings.READHAND_PLAYER_TOTAL_END_SOFT
                  : resources.strings.READHAND_PLAYER_TOTAL_END;
      result += resultFormat.replace('{0}', readCards).replace('{1}', currentHand.total);
    }
  } else {
    if ((currentPlayer.hands.length == 1) && (currentHand.cards.length == 2)
      && (currentHand.total == 21)) {
      result += resources.strings.READHAND_PLAYER_TOTAL_ACTIVE_BLACKJACK.replace('{0}', readCards);
    } else {
      resultFormat = (currentHand.soft) ? resources.strings.READHAND_PLAYER_TOTAL_ACTIVE_SOFT
                  : resources.strings.READHAND_PLAYER_TOTAL_ACTIVE;
      result += resultFormat.replace('{0}', readCards).replace('{1}', currentHand.total);
    }
  }

  const dealerCardText = resources.readCard(game.dealerHand.cards[1], 'article', game.readSuit);

  if (game.activePlayer == 'none') {
    // Game over, so read the whole dealer hand
    result += resources.strings.READHAND_DEALER_DONE.replace('{0}', dealerCardText);
    result += readDealerAction(game, locale);
  } else {
    result += resources.strings.READHAND_DEALER_ACTIVE.replace('{0}', dealerCardText);
  }

  return result;
}

//
// Returns a string if you have more than one hand in play
//
function readHandNumber(game, handNumber) {
  let result = '';
  const currentPlayer = gameService.getCurrentPlayer(game);

  if (currentPlayer.hands.length > 1) {
    result = resources.mapHandNumber(handNumber);
  }

  return result;
}

function rulesToText(locale, rules, changeRules) {
  let text = '';

  // If old rules were passed in, only state what's set in changeRules
  // As that would be the elements that changed
  // Say the decks and betting range
  if (!changeRules || changeRules.hasOwnProperty('numberOfDecks')) {
    text += resources.strings.RULES_DECKS.replace('{0}', rules.numberOfDecks);
  }
  if (!changeRules || changeRules.hasOwnProperty('minBet') || changeRules.hasOwnProperty('maxBet')) {
    text += resources.strings.RULES_BET_RANGE.replace('{0}', rules.minBet).replace('{1}', rules.maxBet);
  }

  // Hit or stand on soft 17
  if (!changeRules || changeRules.hasOwnProperty('hitSoft17')) {
    text += (rules.hitSoft17 ? resources.strings.RULES_HIT_SOFT17
                : resources.strings.RULES_STAND_SOFT17);
  }

  // Double rules
  if (!changeRules || changeRules.hasOwnProperty('double') || changeRules.hasOwnProperty('doubleaftersplit')) {
    const doubleRule = resources.mapDouble(rules.double);
    if (doubleRule) {
      text += resources.strings.RULES_DOUBLE.replace('{0}', doubleRule);
      if (rules.double != 'none') {
        text += (rules.doubleaftersplit) ? resources.strings.RULES_DAS_ALLOWED
                : resources.strings.RULES_DAS_NOT_ALLOWED;
      }
    }
  }

  // Splitting (only metion if you can resplit aces 'cuz that's uncommon)
  if (!changeRules || changeRules.hasOwnProperty('resplitAces')) {
    if (rules.resplitAces && (rules.maxSplitHands > 1)) {
      text += resources.strings.RULES_RESPLIT_ACES;
    }
  }

  // Number of split hands allowed
  if (!changeRules || changeRules.hasOwnProperty('maxSplitHands')) {
    if (rules.maxSplitHands > 1) {
      text += resources.strings.RULES_NUMBER_OF_SPLITS.replace('{0}', rules.maxSplitHands);
    } else {
      text += resources.strings.RULES_SPLIT_NOT_ALLOWED;
    }
  }

  // Surrender rules
  if (!changeRules || changeRules.hasOwnProperty('surrender')) {
    text += ((rules.surrender == 'none') ? resources.strings.RULES_NO_SURRENDER : resources.strings.RULES_SURRENDER_OFFERED);
  }

  if (!changeRules || changeRules.hasOwnProperty('blackjackBonus')) {
    // Blackjack payout
    const payoutText = resources.mapBlackjackPayout(rules.blackjackBonus.toString());
    if (payoutText) {
      text += resources.strings.RULES_BLACKJACK.replace('{0}', payoutText);
    }
  }

  return text;
}