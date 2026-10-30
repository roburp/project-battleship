import * as DOM from "./dom.js";
import { GameController } from "./gameController.js";
import { initializeShipPlacement, initializeAttack } from "./eventHandlers.js";

const shipTrayContainer = document.querySelector("#ship-container");
const playerBoard = document.querySelector("#player-board");
const opponentBoard = document.querySelector("#opponent-board");

const game = new GameController("human", "computer");

// Initialize game interface
DOM.renderShipTray(shipTrayContainer, game.fleet);

DOM.renderBoard(playerBoard, 10);
DOM.renderBoard(opponentBoard, 10);

game.setupGame();

DOM.renderShips(playerBoard, game.player1.gameboard);
DOM.renderShips(opponentBoard, game.player2.gameboard);

DOM.renderPhase("deployment");

// Initialize interactions
initializeShipPlacement(shipTrayContainer, playerBoard, game);
initializeAttack(opponentBoard, playerBoard, game);
