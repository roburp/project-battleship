import * as DOM from "./dom.js";

// Ship placement interactions
export function initializeShipPlacement(shipTrayContainer, playerBoard, game) {
  let selectedShip = null;
  let grabbedIndex = null;
  let grabLocalX = 0;
  let grabLocalY = 0;
  let isVertical = false;
  let lastPointerX = 0;
  let lastPointerY = 0;

  const opponentBoard = document.querySelector("#opponent-board");

  function renderDeployment() {
    // Reset player board
    DOM.renderBoard(playerBoard, 10);
    DOM.renderShips(playerBoard, game.getHumanBoardState());
    DOM.renderShipTray(shipTrayContainer, game.getFleet());

    // Reset computer board
    DOM.renderBoard(opponentBoard, 10);
    DOM.renderShips(opponentBoard, game.getComputerBoardState());

    DOM.renderPhase("deployment");
    DOM.updateStartButton(game.isHumanDeploymentComplete());
  }

  const randomizeButton = document.querySelector("#randomize-fleet");
  randomizeButton.addEventListener("click", () => {
    game.randomizeHumanFleet();
    shipTrayContainer.innerHTML = "";

    renderDeployment();
  });

  const resetBoardButton = document.querySelector("#reset-board");
  resetBoardButton.addEventListener("click", () => {
    game.resetHumanFleet();

    renderDeployment();
  });

  const startGameButton = document.querySelector("#start-game");
  startGameButton.addEventListener("click", () => {
    if (!game.isHumanDeploymentComplete()) return;
    game.beginBattle();
    DOM.renderPhase("playing");
  });

  const playAgainButton = document.querySelector("#play-again");
  playAgainButton.addEventListener("click", () => {
    game.resetGame();
    renderDeployment();
  });

  shipTrayContainer.addEventListener("pointerdown", (event) => {
    const shipCell = event.target.closest(".placeable-ship .cell");
    if (!shipCell) return;

    selectedShip = shipCell.closest(".placeable-ship");
    grabbedIndex = [...selectedShip.children].indexOf(shipCell);

    const shipRect = selectedShip.getBoundingClientRect();
    const cellRect = shipCell.getBoundingClientRect();

    grabLocalX = cellRect.left + cellRect.width / 2 - shipRect.left;
    grabLocalY = cellRect.top + cellRect.height / 2 - shipRect.top;

    isVertical = false;

    selectedShip.style.position = "fixed";
    selectedShip.style.pointerEvents = "none";
    selectedShip.style.transformOrigin = `${grabLocalX}px ${grabLocalY}px`;

    // prevent selecting text while dragging
    event.preventDefault();
  });

  document.addEventListener("pointermove", (event) => {
    if (!selectedShip) return;

    selectedShip.style.left = `${event.clientX - grabLocalX}px`;
    selectedShip.style.top = `${event.clientY - grabLocalY}px`;

    selectedShip.style.transformOrigin = `${grabLocalX}px ${grabLocalY}px`;
    selectedShip.style.transform = isVertical ? "rotate(90deg)" : "none";

    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    updatePreview(event);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() !== "r" || !selectedShip) return;

    isVertical = !isVertical;

    // rotate immediately, without waiting for pointer movement
    selectedShip.style.transform = isVertical ? "rotate(90deg)" : "none";

    updatePreview({
      clientX: lastPointerX,
      clientY: lastPointerY,
    });
  });

  document.addEventListener("pointerup", (event) => {
    if (!selectedShip) return;

    clearPreview();

    const ship = selectedShip;
    const length = Number(ship.dataset.length);

    const target = document.elementFromPoint(event.clientX, event.clientY);
    const boardCell = target?.closest("#player-board .cell[data-x][data-y]");

    let coordinates = [];
    let validDrop = false;

    if (boardCell) {
      const x = Number(boardCell.dataset.x);
      const y = Number(boardCell.dataset.y);

      // calculate the ship's coordinates according to its orientation
      if (isVertical) {
        const startY = y - grabbedIndex;
        coordinates = Array.from({ length }, (_, i) => [x, startY + i]);
      } else {
        const startX = x - grabbedIndex;
        coordinates = Array.from({ length }, (_, i) => [startX + i, y]);
      }

      validDrop = game.isValidPlayerPlacement(coordinates);
    }

    if (validDrop) {
      const placed = game.placePlayerShip(length, coordinates);

      if (placed) {
        ship.remove();
        DOM.renderShips(playerBoard, game.getHumanBoardState());

        if (game.isHumanDeploymentComplete()) {
          DOM.updateStartButton(game.isHumanDeploymentComplete());
        }
      } else {
        restoreShip(ship);
      }
    } else {
      restoreShip(ship);
    }

    selectedShip = null;
    grabbedIndex = null;
    grabLocalX = 0;
    grabLocalY = 0;
    isVertical = false;
  });

  function restoreShip(ship) {
    ship.style.position = "";
    ship.style.left = "";
    ship.style.top = "";
    ship.style.pointerEvents = "";
    ship.style.transform = "";
    ship.style.transformOrigin = "";
  }

  function updatePreview(event) {
    clearPreview();

    const target = document.elementFromPoint(event.clientX, event.clientY);
    const boardCell = target?.closest("#player-board .cell[data-x][data-y]");

    if (!boardCell) return;

    const x = Number(boardCell.dataset.x);
    const y = Number(boardCell.dataset.y);
    const length = Number(selectedShip.dataset.length);

    const coordinates = Array.from({ length }, (_, i) =>
      isVertical ? [x, y - grabbedIndex + i] : [x - grabbedIndex + i, y],
    );

    const valid = game.isValidPlayerPlacement(coordinates);

    coordinates.forEach(([cx, cy]) => {
      const cell = playerBoard.querySelector(`.cell[data-x="${cx}"][data-y="${cy}"]`);

      if (cell) {
        cell.classList.add(valid ? "preview" : "preview-invalid");
      }
    });
  }

  function clearPreview() {
    playerBoard.querySelectorAll(".preview, .preview-invalid").forEach((cell) => {
      cell.classList.remove("preview", "preview-invalid");
    });
  }
}

// attack interactions
export function initializeAttack(opponentBoard, playerBoard, game) {
  async function handleAttack(event) {
    if (!game.isPlayerTurn()) return;

    const cell = event.target.closest(".cell");
    if (!cell) return;

    const coordinate = [Number(cell.dataset.x), Number(cell.dataset.y)];

    const { defender, result, ship, gameOver } = game.attack(coordinate);
    if (!result) return;

    const boardElement = game.isHumanPlayer(defender) ? playerBoard : opponentBoard;
    DOM.renderAttack(boardElement, coordinate, result, ship);

    if (gameOver) {
      DOM.renderPhase("gameover", game.winner === game.player1 ? "Player 1" : "Computer");
      return;
    }

    game.switchTurn();

    if (game.isComputerTurn()) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const { defender, coordinate, result, ship, gameOver } = game.computerAttack();

      if (result) {
        const boardElement = game.isHumanPlayer(defender) ? playerBoard : opponentBoard;
        DOM.renderAttack(boardElement, coordinate, result, ship);
      }

      if (gameOver) {
        DOM.renderPhase("gameover", game.winner === game.player1 ? "Player 1" : "Computer");
        return;
      }

      game.switchTurn();
    }
  }
  opponentBoard.addEventListener("click", handleAttack);
}
