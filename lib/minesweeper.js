if (window.location.search.length < 17) {
  window.location.search = "?rows=10&columns=10";
}

const gridInfo = window.location.search.substr(1).split("&");


//  MINE FIELD PERAMETERS
const gridRows = () => {
  return gridInfo[(gridInfo[0].includes("row") ? 0 : 1)].replace("rows=", "");
};
const gridColumns = () => {
  return gridInfo[(gridInfo[0].includes("column") ? 0 : 1)].replace("columns=", "");
};


const mineField = document.querySelector(`#minesweeper`);
const gridCount = gridRows() * gridColumns();
const mineCount = Math.floor(gridCount * 0.2);
let mineCounter = mineCount;
let clickCounter = 0;

document.querySelector(".gameTitle>h1").style.fontSize = `${(gridColumns() * 0.1) + 1}em`;


const initialMineDisplay = () => {
  let display = "";
  for (let i = 4; i > mineCounter.toString().length; i--) {
    display += "0";
  }
  display += mineCounter.toString();
  return display;
};
document.querySelector("#minesRemaining").innerText = initialMineDisplay();


const addClickCount = () => {
  clickCounter++;
  let display = "";
  const clickdisplay = () => {
    for (let i = 4; i > clickCounter.toString().length; i--) {
      display += "0";
    }
    display += clickCounter.toString();
    return display;
  };
  document.querySelector("#clickCounter").innerText = clickdisplay();
};


const subtractMineCount = () => {
  mineCounter--;
  let display = "";
  const minedisplay = () => {
    for (let i = 4; i > mineCounter.toString().length; i--) {
      display += "0";
    }
    display += mineCounter.toString();
    return display;
  };
  document.querySelector("#minesRemaining").innerText = minedisplay();
};

const addMineCount = () => {
  mineCounter++;
  let display = "";
  const minedisplay = () => {
    for (let i = 4; i > mineCounter.toString().length; i--) {
      display += "0";
    }
    display += mineCounter.toString();
    return display;
  };
  document.querySelector("#minesRemaining").innerText = minedisplay();
};


const shuffleArray = (array) => {
  let arraySize = array.length;
  let holder;
  let rand;
  while (arraySize > 0) {
    rand = Math.floor(Math.random() * arraySize);
    arraySize--;
    holder = array[arraySize];
    array[arraySize] = array[rand];
    array[rand] = holder;
  }
  return array;
};


const getMineArray = (mineCountArgument, gridCountArgument) => {
  const mineArray = [];
  for (let x = 0; x < mineCountArgument; x++) { mineArray.push("y"); }
  for (let x = 0; x < (gridCountArgument - mineCountArgument); x++) { mineArray.push("n"); }
  return shuffleArray(mineArray);
};


const populateGame = () => {
  let rowNum = 1;
  const mineArray = getMineArray(mineCount, gridCount);
  for (let i = 0; i < gridRows(); i++) {
    let gridId = 10;
    let row = `<tr>`;
    for (let j = 0; j < gridColumns(); j++) {
      row += `<td data-grid_id="${rowNum}${gridId}" data-bomb="${mineArray.pop()}" class="unopened"></td>`;
      gridId++;
    }
    row += `</tr>`;
    mineField.insertAdjacentHTML(`beforeend`, row);
    rowNum++;
  }
};


const revealAllMines = () => {
  document.querySelectorAll(`[data-bomb="y"]`).forEach((grid) => {
    setTimeout(grid.classList.add("mine"), 5000);
  });
};


const sumAllSurroundingMines = (clickedId) => {
  const x = parseInt(clickedId, 10);
  let sum = 0;
  const surroundingArray = [(x - 101), (x - 100), (x - 99),
    (x - 1), (x + 1), (x + 99), (x + 100), (x + 101)];
  surroundingArray.forEach((position) => {
    if (document.querySelector(`[data-grid_id="${position}"]`) !== null) {
      if (document.querySelector(`[data-grid_id="${position}"]`).dataset.bomb === "y") {
        sum++;
      }
    }
  });
  return sum;
};


populateGame();
const grid = document.querySelectorAll(".unopened");


const clickEvent = (event) => {
  if (event.button === 0) {
    checkClick(event.currentTarget);
  } else {
    markingClick(event.currentTarget);
  }
};


const removeEventListenerAll = () => {
  grid.forEach((gridId) => {
    gridId.removeEventListener("mousedown", clickEvent);
  });
};


const revealClickedBox = (clickedBox) => {
  const idNumber = clickedBox.dataset.grid_id;
  const mineNeighborNumber = sumAllSurroundingMines(idNumber);
  clickedBox.classList.remove("unopened");
  clickedBox.classList.add(`mine-neighbour-${mineNeighborNumber}`);
};


const checkClick = (clickedBox) => {
  addClickCount();
  if (document.querySelectorAll(`.unopened`).length === 0) {
    removeEventListenerAll();
    alert("\n\nYou freakin' won!\n\n");
    return false;
  } else if (clickedBox.classList.contains("flagged") || clickedBox.classList.contains("question")) {
    return false;
  } else if (clickedBox.dataset.bomb === "y") {
    clickedBox.classList.add("mine");
    clickedBox.innerHTML = `<img src="img/bomb_going_off_01.gif" class="bombGoingOff" />`;
    revealAllMines();
    removeEventListenerAll();
  } else {
    revealClickedBox(clickedBox);
  }
  // console.log(document.querySelectorAll(`.unopened`).length);
};


const markingClick = (clickedBox) => {
  if (clickedBox.classList.contains("question")) {
    addMineCount();
    clickedBox.classList.remove("question");
    clickedBox.classList.add("unopened");
  } else if (clickedBox.classList.contains("flagged")) {
    clickedBox.classList.remove("flagged");
    clickedBox.classList.add("question");
  } else {
    subtractMineCount();
    clickedBox.classList.remove("unopened");
    clickedBox.classList.add("flagged");
  }
};


grid.forEach((gridId) => {
  gridId.addEventListener("mousedown", clickEvent);
});
