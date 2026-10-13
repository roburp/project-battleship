// Render board
function createCell(x, y) {
  const cell = document.createElement("div");

  cell.dataset.x = x;
  cell.dataset.y = y;
  cell.classList.add("cell");

  return cell;
}

function renderBoard(size) {
  const playerBoard = document.querySelector("#player-board");
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = createCell(x, y);
      playerBoard.append(cell);
    }
  }
}
