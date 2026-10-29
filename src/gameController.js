// Manage turns and win conditions

import { Player } from "./player.js";

export class GameController {
  constructor(player1, player2) {
    this.player1 = new Player(player1);
    this.player2 = new Player(player2);

    this.fleet = [5, 4, 3, 3, 2];

    this.currentPlayer = this.player1;
    this.gameState = "deployment";
  }

  setupGame() {
    this.player1.gameboard.placeShip(2, [
      [1, 1],
      [1, 2],
    ]);

    this.player2.gameboard.placeShip(2, [
      [1, 3],
      [1, 4],
    ]);
  }

  beginBattle() {
    if (this.gameState !== "deployment") return;

    this.gameState = "playing";
  }

  endGame() {
    this.gameState = "gameover";
  }

  resetGame() {
    this.gameState = "deployment";
    this.currentPlayer = this.player1;
  }

  attack(coordinate) {
    // Get defending player
    const defender = this.currentPlayer === this.player1 ? this.player2 : this.player1;
    const result = defender.gameboard.receiveAttack(coordinate);

    return { defender, coordinate, result };
  }

  computerAttack() {
    if (this.currentPlayer !== this.player2) return;

    let coordinate;
    // Make sure it does not attack a cell that's already been attacked
    do {
      const x = Math.floor(Math.random() * 10) + 1;
      const y = Math.floor(Math.random() * 10) + 1;
      coordinate = [x, y];
    } while (
      this.player1.gameboard.attacks.some((attack) => attack[0] === coordinate[0] && attack[1] === coordinate[1])
    );

    return this.attack(coordinate);
  }

  switchTurn() {
    //if (this.gameState !== "playing") return;

    this.currentPlayer = this.currentPlayer === this.player1 ? this.player2 : this.player1;
  }
}
