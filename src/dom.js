// Render board

function createCell(x, y) {
  const cell = document.createElement("div");
  cell.dataset.x = x;
  cell.dataset.y = y;
  cell.classList.add("cell");
  return cell;
}

export function renderBoard(boardElement, size) {
  for (let y = 1; y <= size; y++) {
    for (let x = 1; x <= size; x++) {
      const cell = createCell(x, y);
      boardElement.append(cell);
    }
  }
}

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

export function renderAttack(boardElement, coordinate, result) {
  const x = coordinate[0];
  const y = coordinate[1];
  console.log(boardElement);
  const cell = boardElement.querySelector(`[data-x="${x}"][data-y="${y}"]`);
  console.log(cell);
  cell.classList.add(result);
}
