import * as DOM from "./dom.js";

// Ship placement interactions
export function initializeShipPlacement(shipTrayContainer, playerBoard, game) {
  let selectedShip = null;
  let grabbedIndex = null;
  let grabLocalX = 0;
  let grabLocalY = 0;
  let isVertical = false;

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
  });

  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() !== "r" || !selectedShip) return;

    isVertical = !isVertical;

    // rotate immediately, without waiting for pointer movement
    selectedShip.style.transform = isVertical ? "rotate(90deg)" : "none";
  });

  document.addEventListener("pointerup", (event) => {
    if (!selectedShip) return;

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

      const inBounds = coordinates.every(([cx, cy]) => cx >= 1 && cx <= 10 && cy >= 1 && cy <= 10);

      const overlaps = game.player1.gameboard.ships.some((placedShip) =>
        placedShip.coordinates.some(([px, py]) => coordinates.some(([cx, cy]) => cx === px && cy === py)),
      );

      validDrop = inBounds && !overlaps;
    }

    if (validDrop) {
      game.player1.gameboard.placeShip(length, coordinates);
      ship.remove();
      DOM.renderShips(playerBoard, game.player1.gameboard);
      console.log(shipTrayContainer.children.length);

      if (shipTrayContainer.children.length === 1) {
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
}

// attack interactions
export function initializeAttack(opponentBoard, playerBoard, game) {
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

  opponentBoard.addEventListener("click", handleAttack);
}
