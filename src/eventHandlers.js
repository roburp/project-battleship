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

      validDrop = game.player1.gameboard.isValidPlacement(coordinates);
    }

    if (validDrop) {
      game.player1.gameboard.placeShip(length, coordinates);
      ship.remove();
      DOM.renderShips(playerBoard, game.player1.gameboard);

      if (shipTrayContainer.children.length === 0) {
        game.beginBattle();
        DOM.renderPhase("playing");
      }
    } else {
      // restore the ship to its original tray layout
      ship.style.position = "";
      ship.style.left = "";
      ship.style.top = "";
      ship.style.pointerEvents = "";
      ship.style.transform = "";
      ship.style.transformOrigin = "";
    }

    selectedShip = null;
    grabbedIndex = null;
    grabLocalX = 0;
    grabLocalY = 0;
    isVertical = false;
  });

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

    const valid = game.player1.gameboard.isValidPlacement(coordinates);

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
    if (game.currentPlayer !== game.player1) return;

    const cell = event.target.closest(".cell");
    if (!cell) return;

    const coordinate = [Number(cell.dataset.x), Number(cell.dataset.y)];

    const { defender, result, ship } = game.attack(coordinate);
    if (!result) return;

    const boardElement = defender === game.player1 ? playerBoard : opponentBoard;
    DOM.renderAttack(boardElement, coordinate, result, ship);

    game.switchTurn();

    if (game.currentPlayer === game.player2) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const { defender, coordinate, result, ship } = game.computerAttack();

      if (result) {
        const boardElement = defender === game.player1 ? playerBoard : opponentBoard;
        DOM.renderAttack(boardElement, coordinate, result, ship);
      }
    }

    game.switchTurn();
  }
  opponentBoard.addEventListener("click", handleAttack);
}
