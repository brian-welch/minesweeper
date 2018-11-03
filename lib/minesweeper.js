if (window.location.search.length < 17) {
  window.location.search = "?rows=10&columns=10&level=3";
}

const gridInfo = window.location.search.substr(1).split("&");

const gridRows = () => {
  return parseInt(gridInfo[(gridInfo[0].includes("row") ? 0 : 1)].replace("rows=", ""), 10);
};
const gridColumns = () => {
  return parseInt(gridInfo[(gridInfo[0].includes("column") ? 0 : 1)].replace("columns=", ""), 10);
};
const difficultyLevel = () => {
  return parseInt(gridInfo[2].replace("level=", ""), 10);
};

console.log(gridRows(), gridColumns(), difficultyLevel());

if ((gridRows() < 10) || (gridColumns() < 10) || !gridRows() || !gridColumns()) {
  window.location.search = "?rows=10&columns=10&level=3&10_rows_and_10_columns_is_the_minimum";
}

if (difficultyLevel() < 1 || !difficultyLevel()) {
  window.location.search = "?rows=10&columns=10&level=3&10_rows_and_10_columns_is_the_minimum";
}

const mineField = document.querySelector(`#minesweeper`);
const gridCount = gridRows() * gridColumns();
const mineCount = Math.floor(difficultyLevel() * (gridCount * 0.05)) + 5;
let mineCounter = mineCount;
let clickCounter = 0;
let startTime;
// Reactive game title base on column count - not perfect, but ok
document.querySelector(".gameTitle>h1").style.fontSize = `${(gridColumns() * 0.1) + 1}em`;




const addClickCount = () => {
  if (clickCounter === 0) { startTime = new Date().getTime(); }
  clickCounter++;
  let display = "";
  const clickdisplay = () => {
    for (let i = 4; i > clickCounter.toString().length; i--) { display += "0"; }
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
  const initialMineDisplay = () => {
    let display = "";
    for (let i = 4; i > mineCounter.toString().length; i--) { display += "0"; }
    display += mineCounter.toString();
    return display;
  };
  document.querySelector("#minesRemaining").innerText = initialMineDisplay();
};


const revealAllMines = () => {
  const remianingMines = document.querySelectorAll(`[data-bomb="y"]`);
  remianingMines.forEach((grid) => {
    if (grid.classList.contains("flagged") === false) {
      setTimeout(() => {grid.classList.add("mine");}, 500);
    }
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


const getElapsedTime = () => {
  const endTime = new Date().getTime();
  return Math.floor((endTime - startTime) / 1000);
};



const showWinnerMessage = () => {
  getElapsedTime();
  const maxPoints = mineCount * 1000;
  let finalScore = maxPoints - (((gridRows() * gridColumns()) - clickCounter) * 75)
  finalScore -= getElapsedTime();
  const messageBox = document.querySelector(".messageBox");
  messageBox.classList.add("winnerNotice");
  messageBox.innerHTML = `<div>Winner!<br>Final Score: <span class="finalScore">${finalScore}</span></div><input type="button" value="Play Again" id="restartButton">`;
  document.querySelector("#restartButton").addEventListener("click", () => {
    window.location.reload(true);
  });
};


const revealClickedBox = (clickedBox) => {
  const idNumber = clickedBox.dataset.grid_id;
  const mineNeighborNumber = sumAllSurroundingMines(idNumber);
  clickedBox.classList.remove("unopened");
  clickedBox.classList.add(`mine-neighbour-${mineNeighborNumber}`);
  if (document.querySelectorAll(`.unopened`).length === 0 && mineCounter === 0) {
    removeEventListenerAll();
    setTimeout(() => {
      showWinnerMessage();
    }, 100);
  }
};


const showDeadMessage = () => {
  const messageBox = document.querySelector(".messageBox");
  messageBox.classList.add("deathNotice");
  messageBox.innerHTML = `<div>Poor Decision!<br>You're dead.</div><input type="button" value="Play Again" id="restartButton">`;
  document.querySelector("#restartButton").addEventListener("click", () => {
    window.location.reload(true);
  });
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
    showDeadMessage();
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
  if (document.querySelectorAll(`.unopened`).length === 0 && mineCounter === 0) {
    removeEventListenerAll();
    setTimeout(() => {
      showWinnerMessage();
    }, 100);
  }
};


grid.forEach((gridId) => {
  gridId.addEventListener("mousedown", clickEvent);
});
