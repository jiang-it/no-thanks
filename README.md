# No Thanks! (Card Game)

## [Demo](https://evening-river-12851.herokuapp.com/)

An online multiplayer version of No Thanks!, the simple, elegant card game designed by Thorsten Gimmler and published by Amigo Spiele. Powered by Node.js, Socket.io, and Phaser.io. 

## Rules and Gameplay

### How to win:

The goal of the game is to reduce the number of points you take. The player with the fewest points at the end of the game wins. At the end of the game, the number of points you have is the sum of the face value of all cards in hand minus the number of chips a player has. The exception is that cards in a "run" are worth only the lowest face value of the cards in the run where a run is a set of consecutive valued cards. For instance, if a player's hand is:

[7, 8, 9, 10, 13, 15, 16, 17, 24, 26, 27], the hand is worth 7 + 13 + 15 + 24 + 26 = 85. Then we subtract the number of chips the player has. 

### At the beginning of the game:

Every player starts with 0 cards in hand and a fixed number of chips. The deck is shuffled and a random subset of cards is removed. The top card is flipped over. 

### On a player's turn:

On each player's turn, that player may take or pass the top card. If a player passes the card, he/she must put a chip on the top card. If a player takes the top card, he/she gets all of the chips placed on the top card. The next card is flipped over. If a player has no chips, he/she must take the top card.

### The game ends:

When there are no more cards in the deck.