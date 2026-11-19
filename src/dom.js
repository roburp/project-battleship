// Render board

function createCell(x, y) {
  const cell = document.createElement("div");

  if (x !== undefined && y !== undefined) {
    cell.dataset.x = x;
    cell.dataset.y = y;
  }
  cell.classList.add("cell");
  return cell;
}

// renders the ship placement tray
export function renderShipTray(boardElement, fleet) {
  boardElement.innerHTML = "";
  fleet.forEach((length) => {
    const ship = document.createElement("div");
    ship.classList.add("placeable-ship");
    ship.dataset.length = length;

    for (let i = 0; i < length; i++) {
      const cell = createCell();
      ship.append(cell);
    }

    boardElement.append(ship);
  });
}

// renders the gameboard (ideally 10x10)
export function renderBoard(boardElement, size) {
  boardElement.innerHTML = "";

  for (let y = 1; y <= size; y++) {
    for (let x = 1; x <= size; x++) {
      const cell = createCell(x, y);
      boardElement.append(cell);
    }
  }
}

// renders ships inside the gameboard
export function renderShips(boardElement, gameboard) {
  const ships = gameboard.ships;

  ships.forEach((ship) => {
    ship.coordinates.forEach((coordinate) => {
      const x = coordinate[0];
      const y = coordinate[1];

      const cell = boardElement.querySelector(`[data-x="${x}"][data-y="${y}"]`);
      cell.classList.add("ship");
    });
  });
}

export function renderAttack(boardElement, coordinate, result, ship) {
  const x = coordinate[0];
  const y = coordinate[1];
  const cell = boardElement.querySelector(`[data-x="${x}"][data-y="${y}"]`);

  if (result === "hit" || result === "sunk") {
    cell.classList.add("hit");
  } else {
    cell.classList.add("miss");
  }

  if (result === "sunk") {
    ship.coordinates.forEach(([x, y]) => {
      const cell = boardElement.querySelector(`[data-x="${x}"][data-y="${y}"]`);

      cell.classList.add("sunk");
    });
  }
}

export function updateStartButton(isDeploymentComplete) {
  const startGameButton = document.querySelector("#start-game");
  startGameButton.disabled = !isDeploymentComplete;
}

export function renderPhase(gameState, winner = null) {
  const opponentBoard = document.querySelector("#opponent-board");
  const shipTray = document.querySelector("#ship-tray");
  const gameOverScreen = document.querySelector("#game-over");

  gameOverScreen.hidden = true;

  if (gameState === "deployment") {
    opponentBoard.hidden = true;
    shipTray.hidden = false;
  } else if (gameState === "playing") {
    opponentBoard.hidden = false;
    shipTray.hidden = true;
  } else if (gameState === "gameover") {
    opponentBoard.hidden = false;
    shipTray.hidden = true;
    gameOverScreen.hidden = false;

    gameOverScreen.querySelector(".winner-message").textContent = `${winner} wins!`;
  }
}
