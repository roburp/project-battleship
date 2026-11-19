// Manage turns and win conditions

import { Player } from "./player.js";

export class GameController {
  constructor(player1, player2) {
    this.player1 = new Player(player1);
    this.player2 = new Player(player2);
    this.winner = null;

    this.fleet = [5, 4, 3, 3, 2];

    this.currentPlayer = this.player1;
    this.gameState = "deployment";

    this.targetQueue = [];
    this.lastHit = null;
  }

  resetGame() {
    this.gameState = "deployment";
    this.currentPlayer = this.player1;
    this.winner = null;

    this.targetQueue = [];
    this.lastHit = null;

    this.player1.gameboard.resetBoard();
    this.player2.gameboard.resetBoard();

    this.randomizePlayer2Fleet();
  }

  getFleet() {
    return this.fleet;
  }

  resetHumanFleet() {
    this.player1.gameboard.resetBoard();
  }

  isHumanDeploymentComplete() {
    return this.player1.gameboard.ships.length === this.fleet.length;
  }

  beginBattle() {
    if (this.gameState !== "deployment") return;
    if (!this.isHumanDeploymentComplete()) return;

    this.gameState = "playing";
  }

  endGame() {
    this.gameState = "gameover";
  }

  attack(coordinate) {
    if (this.gameState !== "playing") return;
    // Get defending player
    const defender = this.currentPlayer === this.player1 ? this.player2 : this.player1;
    const attackResult = defender.gameboard.receiveAttack(coordinate);

    if (defender.gameboard.allShipsSunk()) {
      this.endGame();
      this.winner = this.currentPlayer;
    }

    return {
      defender,
      coordinate,
      ...attackResult,
      gameOver: this.gameState === "gameover",
    };
  }

  getAdjacentCoordinates([x, y]) {
    return [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ];
  }

  isInBounds([x, y]) {
    return x >= 1 && x <= 10 && y >= 1 && y <= 10;
  }

  computerAttack() {
    if (this.currentPlayer !== this.player2) return;

    const humanBoard = this.player1.gameboard;
    let coordinate;

    // 1. Try adjacent targets first
    while (this.targetQueue.length > 0) {
      const target = this.targetQueue.shift();

      // checks if already attacked
      const alreadyAttacked = humanBoard.attacks.some((attack) => attack[0] === target[0] && attack[1] === target[1]);

      if (this.isInBounds(target) && !alreadyAttacked) {
        coordinate = target;
        break;
      }
    }

    // 2. If no targets remain, attack randomly
    if (!coordinate) {
      do {
        coordinate = [Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 10) + 1];
      } while (humanBoard.attacks.some((attack) => attack[0] === coordinate[0] && attack[1] === coordinate[1]));
    }

    // 3. Perform the attack through GameController
    const attackResult = this.attack(coordinate);

    // 4. If hit, investigate adjacent cells
    if (attackResult.result === "hit") {
      this.lastHit = coordinate;

      const adjacent = this.getAdjacentCoordinates(coordinate);

      adjacent.forEach((target) => {
        const alreadyAttacked = humanBoard.attacks.some((attack) => attack[0] === target[0] && attack[1] === target[1]);

        const alreadyQueued = this.targetQueue.some(([x, y]) => x === target[0] && y === target[1]);

        if (this.isInBounds(target) && !alreadyAttacked && !alreadyQueued) {
          this.targetQueue.push(target);
        }
      });
    }

    // 5. If ship sunk, clear targeting information
    if (attackResult.result === "sunk") {
      this.targetQueue = [];
      this.lastHit = null;
    }

    return attackResult;
  }

  #randomizeFleet(player) {
    player.gameboard.resetBoard();
    player.gameboard.randomizeShipPlacement(this.fleet);
  }

  randomizeHumanFleet() {
    this.#randomizeFleet(this.player1);
  }

  randomizePlayer2Fleet() {
    this.#randomizeFleet(this.player2);
  }

  isValidPlayerPlacement(coordinates) {
    return this.player1.gameboard.isValidPlacement(coordinates);
  }

  placePlayerShip(length, coordinates) {
    if (this.gameState !== "deployment") return false;

    if (!this.isValidPlayerPlacement(coordinates)) return false;

    this.player1.gameboard.placeShip(length, coordinates);

    return true;
  }

  getHumanBoardState() {
    return this.player1.gameboard;
  }

  getComputerBoardState() {
    return this.player2.gameboard;
  }

  isHumanPlayer(player) {
    return player === this.player1;
  }

  isPlayerTurn() {
    return this.currentPlayer === this.player1 && this.gameState === "playing";
  }

  isComputerTurn() {
    return this.currentPlayer === this.player2 && this.gameState === "playing";
  }

  switchTurn() {
    if (this.gameState !== "playing") return;

    this.currentPlayer = this.currentPlayer === this.player1 ? this.player2 : this.player1;
  }
}
