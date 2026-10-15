console.log("index.js is loaded!");

// Creates players and event listeners

import * as DOM from "./dom.js";
import { GameController } from "./gameController.js";

const playerBoard = document.querySelector("#player-board");
const opponentBoard = document.querySelector("#opponent-board");

const game = new GameController("human", "computer");

DOM.renderBoard(playerBoard, 10);
DOM.renderBoard(opponentBoard, 10);

game.setupGame();

DOM.renderShips(playerBoard, game.player1.gameboard);
DOM.renderShips(opponentBoard, game.player2.gameboard);

async function handleAttack(event) {
  if (game.currentPlayer !== game.player1) return;
  const cell = event.target.closest(".cell");

  if (!cell) return;

  const coordinate = [Number(cell.dataset.x), Number(cell.dataset.y)];

  const { defender, result } = game.attack(coordinate);

  if (!result) return;

  const boardElement = defender === game.player1 ? playerBoard : opponentBoard;
  DOM.renderAttack(boardElement, coordinate, result);

  game.switchTurn();
  if (game.currentPlayer === game.player2) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const { defender, coordinate, result } = game.computerAttack();

    if (result) {
      const boardElement = defender === game.player1 ? playerBoard : opponentBoard;
      DOM.renderAttack(boardElement, coordinate, result);
    }
  }
  game.switchTurn();
}

//playerBoard.addEventListener("click", handleAttack);
opponentBoard.addEventListener("click", handleAttack);
