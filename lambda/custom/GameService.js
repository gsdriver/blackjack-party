//
// This is the Game Service module - this controls the playing of the
// game and does not include spoken output
//

const suggest = require('blackjack-strategy');
const seedrandom = require('seedrandom');

const STARTING_BANKROLL = 5000;

availableGames = {
  'standard': {version: '1.0.0',
     deck: {cards: []},
     dealerHand: {cards: []},
     rules: {
       hitSoft17: false,         // Does dealer hit soft 17
       surrender: 'late',        // Surrender offered - none, late, or early
       double: 'any',            // Double rules - none, 10or11, 9or10or11, any
       doubleaftersplit: true,   // Can double after split - none, 10or11, 9or10or11, any
       resplitAces: false,       // Can you resplit aces
       blackjackBonus: 0.5,      // Bonus for player blackjack, usually 0.5 or 0.2
       numberOfDecks: 4,         // Number of decks in play
       minBet: 5,                // The minimum bet - not configurable
       maxBet: 1000,             // The maximum bet - not configurable
       maxSplitHands: 4,         // Maximum number of hands you can have due to splits
     },
     activePlayer: 'none',
     startingBet: 100,
     possibleActions: [],
     canReset: true,
  },
};

module.exports = {
  initializeGame: function(game, attributes, userId) {
    let newGame;

    if (availableGames[game]) {
      newGame = JSON.parse(JSON.stringify(availableGames[game]));

      // If they had an existing table - preserve the timestamp
      if (attributes.currentGame && attributes[attributes.currentGame]) {
        newGame.timestamp = attributes[attributes.currentGame].timestamp;
      }

      // Start by shuffling the deck
      // For now, stick with one player
      shuffleDeck(newGame, userId);
      newGame.dealerHand.cards = [];
      newGame.playerHands = {};
      newGame.players = [];

      // Get the next possible actions
      attributes[game] = newGame;
      attributes.currentGame = game;
      setNextActions(attributes);
    }

    return newGame;
  },
  getRecommendedAction: function(game) {
    // Only make a suggestion if the game is still in play (the player's turn)
    if (game.activePlayer == 'player') {
      // If there is only one possible action, return that
      if (game.possibleActions.length == 1) {
        return game.possibleActions[0];
      }

      const playerCards = module.exports.getCurrentHand(game).cards.map(
            (card) => ((card.rank) > 10 ? 10 : card.rank));

      game.rules.strategyComplexity = 'advanced';
      return suggest.GetRecommendedPlayerAction(playerCards,
            ((game.dealerHand.cards[1].rank > 10) ? 10 : game.dealerHand.cards[1].rank),
            module.exports.getCurrentPlayer(game).hands.length,
            game.possibleActions.indexOf('insurance') < 0, game.rules);
    } else {
      return 'notplayerturn';
    }
  },
  userAction: function(attributes, action, callback) {
    const game = attributes[attributes.currentGame];
    const currentPlayer = module.exports.getCurrentPlayer(game);
    const currentHand = module.exports.getCurrentHand(game);
    let error;

    // Is this a valid action?
    if ((action != 'setrules') && (game.possibleActions.indexOf[action] < 0)) {
      // I'm sorry Dave, I can't do that
      error = 'Invalid action';
      return;
    }

    // OK, take action
    switch (action) {
      case 'resetbankroll':
        // Reset the bankroll for this player
        attributes.playerList[game.players[game.currentPlayer]].bankroll = STARTING_BANKROLL;
        break;

      case 'shuffle':
        // In this case shuffle, then the player can bet
        shuffleDeck(game, attributes.userId);
        break;

      case 'deal':
        // Validate the bet and deal the next hand
        // Make sure each player's bet meets the requirements
        game.players.forEach((player) => {
          if (!attributes.playerList[player].bet) {
            attributes.playerList[player].bet = game.startingBet;
          }

          const value = attributes.playerList[player].bet;
          if (value < game.rules.minBet) {
            error = 'bettoosmall';
          } else if (value > getMinBankroll(attributes)) {
            error = 'betoverbankroll';
          } else if (value > game.rules.maxBet) {
            error = 'bettoolarge';
          }
        });

        if (!error) {
          deal(attributes);
        }
        break;

      case 'hit':
        // Pop the top card off the deck for the player
        currentHand.cards.push(game.deck.cards.shift());

        // If they busted, it is the dealer's turn
        const total = handTotal(currentHand.cards).total;
        if (total > 21) {
          // Sorry, you lose - it's the dealer's turn now
          currentHand.busted = true;
          nextHand(game);
        } else if (total == 21) {
          // You have 21 - go to the next hand
          nextHand(game);
        }
        break;

      case 'stand':
        // Move to the next player
        nextHand(game);
        break;

      case 'insurance':
        // If they are taking insurance, deduct the amount from the bankroll
        attributes.playerList[game.players[game.currentPlayer]].bankroll -= (currentHand.bet / 2);
        // FALL THROUGH!
      case 'noinsurance':
        currentPlayer.specialState = action;
        // Go to the next player for their decision
        if (game.currentPlayer < (game.players.length - 1)) {
          game.currentPlayer++;
        } else {
          // OK, check if the dealer has 21 - if so, game is over
          if (handTotal(game.dealerHand.cards).total == 21) {
            // Game over (go to the dealer)
            game.dealerHand.outcome = 'dealerblackjack';
            nextHand(game);
          } else {
            // Let the players know there was no blackjack
            game.currentPlayer = 0;
            game.dealerHand.outcome = 'nodealerblackjack';
          }
        }
        break;

      case 'surrender':
        // Well, that's that
        attributes.playerList[game.players[game.currentPlayer]].bankroll -=
            (module.exports.getCurrentHand(game).bet / 2);
        currentPlayer.specialState = action;
        nextHand(game);
        break;

      case 'double':
        // For this, we mimick a hit and a stand, and set the special state to doubled
        attributes.playerList[game.players[game.currentPlayer]].bankroll -= currentHand.bet;
        currentHand.bet *= 2;
        currentHand.cards.push(game.deck.cards.shift());
        nextHand(game);
        break;

      case 'split':
        // OK, split these cards into another hand
        const newHand = {
          bet: currentHand.bet,
          busted: false,
          cards: [],
        };

        attributes.playerList[game.players[game.currentPlayer]].bankroll -= newHand.bet;
        newHand.cards.push(currentHand.cards.shift());

        // Pop the top card off the deck back into the current hand
        currentHand.cards.push(game.deck.cards.shift());

        // And add this to the player's hand.  Whew
        currentPlayer.hands.push(newHand);
        break;

      default:
        // Hmm .. how did this not get caught above?
        error = 'Unknown Action';
    }

    if (!error) {
      // If it's the dealer's turn, then we'll play the dealer hand,
      // unless the player already busted
      if (game.activePlayer == 'dealer') {
        playDealerHand(game);

        game.players.forEach((player) => {
          for (let i = 0; i < game.playerHands[player].hands.length; i++) {
            determineWinner(attributes, player, i);
          }
        });

        setNextActions(attributes);
        updateGame(game);
        callback(error);
        return;
      }

      setNextActions(attributes);
      updateGame(game);
    }

    callback(error);
  },
  isPlayerBlackjack: function(game, player) {
    const check = (player ? player : game.players[0]);
    return ((game.playerHands[check].hands.length == 1) &&
      (handTotal(game.playerHands[check].hands[0].cards) == 21) &&
      (game.playerHands[check].hands[0].length == 2));
  },
  getCurrentHand: function(game) {
    const player = module.exports.getCurrentPlayer(game);
    return (player ? player.hands[player.currentPlayerHand] : undefined);
  },
  getCurrentPlayer: function(game) {
    if ((game.currentPlayer !== undefined) && game.playerHands) {
      return game.playerHands[game.players[game.currentPlayer]];
    }
    return undefined;
  },
  getBankroll: function(attributes) {
    const game = attributes[attributes.currentGame];
    let bankroll;
    if (game.players && (game.currentPlayer !== undefined)) {
      bankroll = attributes.playerList[game.players[game.currentPlayer]].bankroll;
    }
    return bankroll;
  },
  getStartingBankroll: function() {
    return STARTING_BANKROLL;
  },
};

/*
 * Internal functions
 */

function updateGame(game) {
  let dealerCards = game.dealerHand.cards;

  if ((game.activePlayer == 'player') && game.dealerHand.cards.length) {
    // Don't total the hole card
    dealerCards = dealerCards.slice(1);
  }

  // Also, set the total for the dealer and player hands
  const dealerTotal = handTotal(dealerCards);
  game.dealerHand.total = dealerTotal.total;
  game.dealerHand.soft = dealerTotal.soft;

  game.players.forEach((player) => {
    for (i = 0; i < game.playerHands[player].hands.length; i++) {
      const playerTotal = handTotal(game.playerHands[player].hands[i].cards);

      game.playerHands[player].hands[i].total = playerTotal.total;
      game.playerHands[player].hands[i].soft = playerTotal.soft;
    }
  });
}

function deal(attributes) {
  const game = attributes[attributes.currentGame];
  const newHand = {bet: 0, busted: false, cards: []};
  let hand;

  newHand.outcome = 'playing';

  // Clear out the hands
  game.dealerHand.cards = [];

  // Now deal the cards - first two to each player
  game.players.forEach((player) => {
    hand = JSON.parse(JSON.stringify(newHand));
    hand.cards.push(game.deck.cards.shift());
    hand.cards.push(game.deck.cards.shift());
    game.playerHands[player] = {hands: [], currentPlayerHand: 0};
    game.playerHands[player].hands.push(hand);
    game.playerHands[player].specialState = null;
    hand.bet = Number(attributes.playerList[player].bet);
    attributes.playerList[player].bankroll -= hand.bet;
  });

  // And finally the dealer
  game.dealerHand.cards.push(game.deck.cards.shift());
  game.dealerHand.cards.push(game.deck.cards.shift());

  // Reset state variables
  game.dealerHand.outcome = 'playing';

  // And set the next hand (to the player)
  game.activePlayer = 'none';
  game.currentPlayer = 0;
  nextHand(game);
}

function shuffleDeck(game, userId) {
  // Start by initializing the deck
  let i;
  let rank;
  const start = Date.now();

  game.deck.cards = [];
  const suits = ['C', 'D', 'H', 'S'];
  for (i = 0; i < game.rules.numberOfDecks; i++) {
    for (rank = 1; rank <= 13; rank++) {
      if (!game.removeCards || (game.removeCards.indexOf(rank) == -1)) {
        suits.map((item) => {
          game.deck.cards.push({'rank': rank, 'suit': item});
        });
      }
    }
  }

  // Shuffle using the Fisher-Yates algorithm
  for (i = 0; i < game.deck.cards.length - 1; i++) {
    const randomValue = seedrandom(i + userId + (game.timestamp ? game.timestamp : ''))();
    let j = Math.floor(randomValue * (game.deck.cards.length - i));
    if (j == (game.deck.cards.length - i)) {
      j--;
    }
    j += i;
    const tempCard = game.deck.cards[i];
    game.deck.cards[i] = game.deck.cards[j];
    game.deck.cards[j] = tempCard;
  }

  // Clear out all hands
  console.log('Shuffle took ' + (Date.now() - start) + ' ms');
  game.activePlayer = 'none';
}

function setNextActions(attributes) {
  // Lots of special rules if you split Aces
  const game = attributes[attributes.currentGame];
  const currentPlayer = module.exports.getCurrentPlayer(game);
  const currentHand = module.exports.getCurrentHand(game);
  const splitAces = (game.activePlayer == 'player') &&
      ((currentPlayer.hands.length > 1) &&
      (currentHand.cards[0].rank == 1));
  const bankroll = module.exports.getBankroll(attributes);
  game.possibleActions = [];

  // Special situations if we just dealt
  if ((game.activePlayer == 'player') && (currentPlayer.hands.length == 1) && (currentHand.cards.length == 2)) {
    // Insurance if the dealer has an ace showing
    // and they haven't already taken action on insurance
    if ((game.dealerHand.cards[1].rank == 1) && (currentPlayer.specialState == null)) {
      // To take insurance, they have to have enough in the bankroll
      if ((currentHand.bet / 2) <= bankroll) {
        game.possibleActions.push('insurance');
      }

      game.possibleActions.push('noinsurance');

      // Do we offer early surrender?
      if (game.rules.surrender == 'early') {
        game.possibleActions.push('surrender');
      }
      return;
    }

    // Surrender
    if (game.rules.surrender != 'none') {
        game.possibleActions.push('surrender');
    }
  }

  // If you can double any cards (Spanish 21), then set that as long as it's still their turn
  if ((game.activePlayer == 'player') && (game.rules.double == 'anyCards')
      && (currentHand.bet <= bankroll)) {
    game.possibleActions.push('double');
  }

  // Other actions are only available for the first two cards of a hand
  if ((game.activePlayer == 'player') && (currentHand.cards.length == 2)) {
    // Double down - not allowed if you split Aces
    if (!splitAces && (currentHand.bet <= bankroll)) {
      // Whether you can double is dictated by either
      // the rules.double or rules.doubleaftersplit variable
      const doubleRules = (currentPlayer.hands.length == 1) ? game.rules.double : (game.rules.doubleaftersplit ? game.rules.double : 'none');
      const playerTotal = handTotal(currentHand.cards).total;

      switch (doubleRules) {
        case 'any':
          // You can double
          game.possibleActions.push('double');
          break;

        case '10or11':
          if ((playerTotal == 10) || (playerTotal == 11)) {
            game.possibleActions.push('double');
          }
          break;

        case '9or10or11':
          if ((playerTotal >= 9) && (playerTotal <= 11)) {
            game.possibleActions.push('double');
          }
          break;

        default:
          break;
      }
    }

    // Split
    if (((currentHand.cards[0].rank == currentHand.cards[1].rank)
        || ((currentHand.cards[0].rank > 9) && (currentHand.cards[1].rank > 9)))
        && (currentHand.bet <= bankroll)) {
      // OK, they can split if they haven't reached the maximum number of allowable hands
      if (currentPlayer.hands.length < game.rules.maxSplitHands) {
        // Oh - one more case; if they had Aces we have to check the resplit Aces rule
        if (!splitAces || game.rules.resplitAces) {
          game.possibleActions.push('split');
        }
      }
    }
  }

  if (game.activePlayer == 'player') {
    // We want hit/stand to be the first actions
    // If it's your turn, you can stand
    game.possibleActions.unshift('stand');

    // You can hit as long as you don't have 21
    if (handTotal(currentHand.cards).total < 21) {
      // One more case - if you split Aces you only get one card (so you can't hit)
      if (!splitAces) {
        game.possibleActions.unshift('hit');
      }
    }
  }

  if (game.activePlayer == 'none') {
    // At this point you can either bet (next hand) or shuffle if there
    // aren't enough cards.  If you are out of money (and can't cover the minimum bet),
    // we make you first reset the bankroll
    if (bankroll < game.rules.minBet) {
      game.possibleActions.push('resetbankroll');
    } else if (game.deck.cards.length > 10 * (game.players.length + 1)) {
      game.possibleActions.push('deal');
    }

    // Shuffle if there aren't enough cards to play
    if (game.deck.cards.length <= 10 * (game.players.length + 1)) {
      game.possibleActions.push('shuffle');
    }
  }
}

function nextHand(game) {
  const currentPlayer = module.exports.getCurrentPlayer(game);

  // If it's none, it goes to player 0
  if (game.activePlayer == 'none') {
    // It's the player's turn unless ALL PLAYERS have a blackjack (and the dealer doesn't
    // have an ace showing), or if the dealer has a blackjack with a 10 up
    game.currentPlayer = 0;
    let allPlayerBlackjack = true;
    game.players.forEach((player) => {
      if (!module.exports.isPlayerBlackjack(game, player)) {
        allPlayerBlackjack = false;
      }
    });

    if (allPlayerBlackjack) {
      game.activePlayer = (game.dealerHand.cards[1].rank == 1) ? 'player' : 'dealer';
    } else if ((handTotal(game.dealerHand.cards).total == 21)
        && (game.dealerHand.cards[1].rank != 1)) {
      // OK, mark it as the dealer's turn to cause the card to flip and end the game
      game.activePlayer = 'dealer';
    } else {
      game.activePlayer = 'player';
    }
  } else if (game.activePlayer == 'player') {
      if (currentPlayer.currentPlayerHand < currentPlayer.hands.length - 1) {
        // Still the player's turn - move to the next hand
        // Note that we'll probably need to give them a second card
        currentPlayer.currentPlayerHand++;
        const currentHand = module.exports.getCurrentHand(game);
        if (currentHand.cards.length < 2) {
          currentHand.cards.push(game.deck.cards.shift());
        }
      } else if (game.currentPlayer < game.players.length - 1) {
        game.currentPlayer++;
      } else {
        // Now it's the dealer's turn
        game.activePlayer = 'dealer';
      }
  } else {
    // It was the dealer's turn - back to none
    game.activePlayer = 'none';
  }
}

function playDealerHand(game) {
  let handValue = handTotal(game.dealerHand.cards);
  let allPlayerHandsBusted = true; // Assume everyone busted until proven otherwise
  let allPlayerBlackjack = true;
  let allPlayerSurrender = true;

  // If all players have busted, we won't play thru
  game.players.forEach((player) => {
    for (let i = 0; i < game.playerHands[player].hands.length; i++) {
      if (!game.playerHands[player].hands[i].busted) {
        // Someone didn't bust
        allPlayerHandsBusted = false;
        break;
      }
    }

    if (game.playerHands[player].specialState != 'surrender') {
      allPlayerSurrender = false;
    }

    if (!module.exports.isPlayerBlackjack(game, player)) {
      allPlayerBlackjack = false;
    }
  });

  // If all hands busted, or all players have blackjack, or all players surrendered we don't play
  if (!allPlayerHandsBusted && !allPlayerBlackjack && !allPlayerSurrender) {
    while ((handValue.total < 17) ||
        ((handValue.total == 17) && game.rules.hitSoft17 && handValue.soft)) {
      game.dealerHand.cards.push(game.deck.cards.shift());
      handValue = handTotal(game.dealerHand.cards);
    }
  }

  // We're done with the dealer hand
  nextHand(game);
}

function determineWinner(attributes, playerId, hand) {
  const game = attributes[attributes.currentGame];
  const player = game.playerHands[playerId];
  const playerHand = game.playerHands[playerId].hands[hand];
  const dealerTotal = handTotal(game.dealerHand.cards).total;
  const playerTotal = handTotal(playerHand.cards).total;
  const dealerBlackjack = ((dealerTotal == 21) && (game.dealerHand.cards.length == 2));
  const playerBlackjack = ((player.hands.length == 1)
        && (playerTotal == 21) && (playerHand.cards.length == 2));
  let specialPayout;

  // Did they surrender?  If so, that's that
  if (player.specialState == 'surrender') {
    playerHand.outcome = 'surrender';
  } else {
    // Did they take insurance?  If they did and the dealer has a blackjack, they win
    if (player.specialState == 'insurance') {
      // Note that insurance bets are off the initial bet (not the doubled amount)
      if (dealerBlackjack) {
        // Well what do you know
        attributes.playerList[playerId].bankroll += (3 * playerHand.bet / 2);
      }
    }

    // Start with blackjack
    if (playerBlackjack) {
      playerHand.outcome = (dealerBlackjack) ? 'push' : 'blackjack';
    } else if (dealerBlackjack) {
      game.dealerHand.outcome = 'dealerblackjack';
      playerHand.outcome = 'loss';
    } else if (playerTotal > 21) {
      playerHand.outcome = 'loss';
    } else {
      if (dealerTotal > 21) {
        playerHand.outcome = 'win';
      } else if (playerTotal > dealerTotal) {
        playerHand.outcome = 'win';
      } else if (playerTotal < dealerTotal) {
        playerHand.outcome = 'loss';
      } else {
        playerHand.outcome = 'push';
      }
    }
  }

  switch (playerHand.outcome) {
    case 'blackjack':
      attributes.playerList[playerId].bankroll +=
        Math.floor(playerHand.bet * game.rules.blackjackBonus);
      // FALL THROUGH
    case 'win':
      if (specialPayout) {
        console.log('Special payout ratio ' + specialPayout);
        attributes.playerList[playerId].bankroll +=
          Math.floor((1 + specialPayout) * playerHand.bet);
      } else {
        attributes.playerList[playerId].bankroll += (playerHand.bet * 2);
      }
      break;
    case 'push':
    case 'surrender':
      attributes.playerList[playerId].bankroll += playerHand.bet;
      break;
    default:
      // I already took the money off the bankroll, you don't get any back
      break;
  }
}

function handTotal(cards) {
  const retval = {total: 0, soft: false};
  let hasAces = false;

  for (let i = 0; i < cards.length; i++) {
    if (cards[i].rank > 10) {
      retval.total += 10;
    } else {
      retval.total += cards[i].rank;
    }

    // Note if there's an ace
    if (cards[i].rank == 1) {
      hasAces = true;
    }
  }

  // If there are aces, add 10 to the total (unless it would go over 21)
  // Note that in this case the hand is soft
  if ((retval.total <= 11) && hasAces) {
    retval.total += 10;
    retval.soft = true;
  }

  return retval;
}

function getMinBankroll(attributes) {
  const game = attributes[attributes.currentGame];
  let minBankroll;
  game.players.forEach((player) => {
    if ((minBankroll === undefined) || (attributes.playerList[player].bankroll < minBankroll)) {
      minBankroll = attributes.playerList[player].bankroll;
    }
  });

  return minBankroll;
}
