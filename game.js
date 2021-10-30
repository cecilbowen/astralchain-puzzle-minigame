//Constants (Hard-wired)
//==============================================================================================================================================
//==============================================================================================================================================

const INSTRUCTIONS = 
`Your goal is to clear the yellow path of all vehicles by using the stand (big circle) to move them.
Spaces with a vehicle cannot be moved through.
The player cannot move vehicles, but he can recall the stand to his position.
You can only push/pull vehicles in the direction you are moving.
So in other words, you cannot, for instance, pull a vehicle to the left while you're behind it.

Use the [WADS] to move the stand, and the [Arrow Keys] to move the player.
You can push vehicles by moving the stand into them.
You can pull vehicles by holding [SHIFT] and moving the stand away from them.
Use [SPACE] to recall the stand to the player's position.

Try to clear it under 35 turns for a high score!
`;

const GAME_WIN_MESSAGE =
`Congratulations, you cleared the level!  Replay or pick another level.
`;

//vehicle id that increases per vehicle
let vehicleID = 0;
let vehicleDivID = 0;
let moveCount = 0;

const HOR = "horizontal";
const VER = "vertical";

const DIR_LEFT = "left";
const DIR_RIGHT = "right";
const DIR_UP = "up";
const DIR_DOWN = "down";

const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;

const KEY_A = 65;
const KEY_D = 68;
const KEY_S = 83;
const KEY_W = 87;

const OUT_OF_BOUNDS = { outOfBounds: true };

let SCORES = ["S+", "S", "A", "A-", "B", "B-", "C", "C-", "D", "D-"];
let SCORE_TIERS = [10, 20, 35, 40, 45, 55, 75, 100, 200, 300];

const AUDIO_YES = "https://raw.githubusercontent.com/madmikeyb/Destiny2-Soundboard/master/ogg/shaxx/80F1EA01.mp3"; //S+
const AUDIO_OUTSTANDING = "https://raw.githubusercontent.com/madmikeyb/Destiny2-Soundboard/master/ogg/shaxx/80C93A05.mp3"; //S
const AUDIO_NICE = "https://raw.githubusercontent.com/madmikeyb/Destiny2-Soundboard/master/ogg/shaxx/80F5D630.mp3"; //A
const AUDIO_GOOD = "https://raw.githubusercontent.com/madmikeyb/Destiny2-Soundboard/master/ogg/shaxx/80F5D62D.mp3"; //A-
const AUDIO_AHA = "https://cdn.asun.co/d2.asun.co/drifter/static/media/ah_hah.d249ec12.ogg"; //B
const AUDIO_MID = "https://raw.githubusercontent.com/madmikeyb/Destiny2-Soundboard/master/ogg/shaxx/80C90D37.mp3"; //B-
const AUDIO_WHY = "https://raw.githubusercontent.com/madmikeyb/Destiny2-Soundboard/master/ogg/saladin/80F5D7AB.mp3"; //C
const AUDIO_CHUCKLE = "https://raw.githubusercontent.com/madmikeyb/Destiny2-Soundboard/master/ogg/shaxx/80F5D62E.mp3"; //C-
const AUDIO_CANT = "https://raw.githubusercontent.com/madmikeyb/Destiny2-Soundboard/master/ogg/saladin/81001924.mp3"; //D
const AUDIO_COULDVE_GONE_BETTER = "https://raw.githubusercontent.com/madmikeyb/Destiny2-Soundboard/master/ogg/saladin/81001926.mp3"; //D-

let AUDIOS = [AUDIO_YES, AUDIO_OUTSTANDING, AUDIO_NICE, AUDIO_GOOD, AUDIO_AHA, AUDIO_MID, AUDIO_WHY, AUDIO_CHUCKLE, AUDIO_CANT, AUDIO_COULDVE_GONE_BETTER];

//holder of below
let boardHolder;

//actual DIV gridspace
let board;

//holder of below
let moveListHolder;

//move list DIV
let moveList;

//level picker SELECT
let levelPicker;

//load button - starts selected level
let loadButton;

//timer DIV
let timerDiv;

//audio
let audioDiv;

//empty 5x5 grid
let grid = [
    new Array(5).fill(undefined),
    new Array(5).fill(undefined),
    new Array(5).fill(undefined),
    new Array(5).fill(undefined),
    new Array(5).fill(undefined),
];

let highwayGrid = [
    new Array(5).fill(0),
    new Array(5).fill(0),
    new Array(5).fill(0),
    new Array(5).fill(0),
    new Array(5).fill(0),
];

//Settings (Configurable)
//==============================================================================================================================================
//==============================================================================================================================================

let DEBUG = false;

let gameOver = false;

const STAND_LEFT = KEY_A;
const STAND_RIGHT = KEY_D;
const STAND_UP = KEY_W;
const STAND_DOWN = KEY_S;

const PLAYER_LEFT = KEY_LEFT;
const PLAYER_RIGHT = KEY_RIGHT;
const PLAYER_UP = KEY_UP;
const PLAYER_DOWN = KEY_DOWN;

let shiftDown = false;

let _timer; //timer placeholder var
let timerStarted = false;
let minutesLabel = document.getElementById("minutes");
let secondsLabel = document.getElementById("seconds");
let totalSeconds = 0;

const PosEnum = Object.freeze({
    "up":"left: 20px;",
    "down":"top: 42px; left: 20px;",
    "left":"top: 20px; left: -1px;",
    "right":"top: 20px; left: 42px;",
    "center":"top: 20px; left: 20px;",
    "centerHor":"top: 20px; left: 20px; transform: scaleX(1.5);",
    "centerVer":"top: 20px; left: 20px; transform: scaleY(1.5);",
});

let cellSize = 130;
let cellWidth = cellSize;
let cellHeight = cellSize;

let highwayColor = "lightyellow";

let COLORS = [ "white", "blue", "yellow" ];

let currentLevel;

let you = new Player();
let stand = new Stand();
let vehicles = [];
let moves = [];

//Classes
//==============================================================================================================================================
//==============================================================================================================================================
function Vehicle(size, x = 0, y = 0, orientation = HOR) {
    switch (size) {
        case 1: this.name = "Car"; break;
        case 2: this.name = "Van"; break;
        case 3: this.name = "Bus"; break;
    }

    this.size = size;
    this.x = x;
    this.y = y;
    this.orientation = orientation;
    this.divs = [];
    this.dirty = false; //regen div flag

    this.id = vehicleID;
    vehicleID++;
}

function VehicleBlock() {
    this.div = undefined;
}

function VehicleBlock(div) {
    this.div = div;
}

function VehicleBlock(div, xx, yy) {
    this.div = div;
    this.x = xx;
    this.y = yy;
}

function Space() {
    this.x = 0; this.y = 0;
    this.vehicle = undefined;
    this.vehicleDiv = undefined;
    this.boardDiv = undefined;
    this.backgroundDiv = undefined;
    this.canvasDiv = undefined;

    this.canCleanup = false;
}

function Space(vehicle) {
    this.x = 0; this.y = 0;
    this.vehicle = vehicle;
    this.vehicleDiv = undefined;
    this.boardDiv = undefined;
    this.backgroundDiv = undefined;
    this.canvasDiv = undefined;

    this.canCleanup = false;
}

function Highway(a, b, orientation) {
    this.a = a;
    this.b = b;
    this.orientation = orientation;
}

function Level(level, row, col, highway) {
    this.level = level;
    this.row = row;
    this.col = col;
    this.highway = highway;
}

function Player() {
    this.player = true;
    this.name = "Player";
    this.row = 0;
    this.col = 0;

    this.setPosition = function setPosition(x, y) {
        this.row = x;
        this.col = y;
    }
}

function Stand() {
    this.player = true;
    this.name = "Stand";
    this.row = 0;
    this.col = 0;

    this.setPosition = function setPosition(x, y) {
        this.row = x;
        this.col = y;
    }
}

function Move(vehicle, dir, oldPos, newPos) {
    this.count = moveCount;
    moveCount++;
    this.vehicle = vehicle;
    this.dir = dir;
    this.oldPos = oldPos;
    this.newPos = newPos;
    this.message = `Turn ${this.count + 1}: Moved ${vehicle.name} ${dir} from (${oldPos}) to (${newPos}).`;

    DEBUG && console.log(this.message);

    updateMoveList(this);
}

//Levels
//==============================================================================================================================================
//==============================================================================================================================================

const L1 = `
==
a00bb
a00cc
0ddd0
eee00
00*0f
`;

const L2 = `
 ==
abbc0
00dc0
00d00
efdgg
00*h0
`;

const L3 = `
 ==
abbcc
a0d00
0fe00
gf0hh
gf*00
`;

const LEVELS = [L1, L2, L3];

//Utility Functions
//==============================================================================================================================================
//==============================================================================================================================================

function getScore() {
    let applicable = SCORE_TIERS.filter(x => x <= moveCount);
    //console.log(applicable, moveCount);
    return Math.max(Math.min(applicable.length, SCORE_TIERS.length - 1), 0);
}

//returns string with all unique chars of input string
function getUniqueChars(inStr) {
    var str = inStr;
    var uniques = "";

    for (var x = 0; x < str.length; x++) {
        if (uniques.indexOf(str.charAt(x))==-1) {
            uniques += str[x];
        }
    }

    return uniques;
}

function setTime() {
  ++totalSeconds;
  secondsLabel.innerHTML = pad(totalSeconds % 60);
  minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
}

function pad(val) {
  var valString = val + "";
  if (valString.length < 2) {
    return "0" + valString;
  } else {
    return valString;
  }
}

function choose(a, b) {
    if (a === undefined) {
        return b;
    }

    return a;
}

function setSize(el, x) {
    setWidth(el, x);
    setHeight(el, x);
}

function setWidth(el, x) {
    el.width = x + "px";
    el.style.width = x + "px";
}

function setHeight(el, x) {
    el.height = x + "px";
    el.style.height = x + "px";
}

function getNamedCoords(row, col) {
    let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    //we'll let the columns be the letters
    let letter = alphabet[(col) % 26];
    
    return `${letter}${row + 1}`;
}

function setPositionFromStyle(el, style) {
    let styleList = style.split(";");

    for (const s of styleList) {
        if (s.length <= 0) { continue; }
        let data = s.split(":");
        let prop = data[0].trim();
        let value = data[1].trim();
        
        el.style[prop] = value;
    }
}

//returns string array of all blocks coords a vehicle takes up
const getVehicleCoords = (vehicle, named = true) => {
    let coords = [];
    for (const v of vehicle.divs) {
        coords.push(!named ? `(${v.x}, ${v.y})` : getNamedCoords(v.x, v.y));
    }

    return coords;
}

const getVehicleByID = (id) => {
    return vehicles.filter(x => x.id === id)[0];
}

function getReverseDirection(dir) {
    switch (dir) {
        case "up": return "down";
        case "down": return "up";
        case "left": return "right";
        case "right": return "left";
    }
    
    return "none";
}

function getCoordsFromDirection(dir, obj) {
    let x = choose(obj.x, obj.row);
    let y = choose(obj.y, obj.col);

    let retX = x;
    let retY = y;

    switch (dir) {
        case "up": retY = y - 1; break;
        case "down": retY = y + 1; break;
        case "left": retX = x - 1; break;
        case "right": retX = x + 1; break;
    }

    return { x: retX, y: retY };
}

function setObjPosition(obj, x, y) {
    if (!obj) {
        console.warn("setObjPosition() undefind object!");
        return;
    }

    if (obj.x || obj.y) {
        obj.x = x;
        obj.y = y;
    } else if (obj.row || obj.col) {
        obj.row = x;
        obj.col = y;
    }

    return { x, y };
}

//"Run Once" Functions
//==============================================================================================================================================
//==============================================================================================================================================

function extractLevel(levelStr) {
    let level = levelStr;

    const EMPTY_SYMBOL = '0';
    const HWY_SYMBOL = '=';
    const PLAYER_SYMBOL = '*';

    let removeEmptyLines = level.split("\n").filter(x => x.length > 0).join("\n");

    let lineGrid = removeEmptyLines.split("\n");

    //find out which side highway is oriented (horizontal or vertical)
    let hwyOrientation = lineGrid.length > 5 ? VER : HOR;

    //now find out hwy coords from orientation and symbol location
    let hwy1, hwy2;
    if (hwyOrientation == VER) {
        hwy1 = lineGrid[0].indexOf(HWY_SYMBOL);
        hwy2 = hwy1 + 1;
    } else {
        for (var i = 0; i < lineGrid.length; i++) {
            let symbolPresent = lineGrid[i].indexOf(HWY_SYMBOL);
            if (symbolPresent === -1) {
                continue;
            }
            hwy1 = i;
            hwy2 = hwy1 + 1;
            break;
        }
    }

    //now get the grid without the hwy symbols
    let lineGridTrim = lineGrid.join("\n")
        .split(HWY_SYMBOL).filter(x => x !== HWY_SYMBOL)
        .join("").split("\n")
        .filter(x => x.trim().length > 0);

    let uniques = getUniqueChars(lineGridTrim.join("\n"))
        .split("\n").join("")
        .split(EMPTY_SYMBOL).join("")
        .split(PLAYER_SYMBOL).join("");

    let lineGridStr = lineGridTrim.join("");

    //figuring out vehicles from grid
    let levelVehicles = [];
    for (const letter of uniques) {
        var indices = [];
        for (var i = 0; i < lineGridStr.length; i++) {
            if (lineGridStr[i] === letter) {
                indices.push({
                    x: Math.floor(i / 5),
                    y: i % 5,
                });
            }
        }

        let x = indices[0].x;
        let dogX = indices.slice(0);
        while (dogX.length > 1) {
            let preDogX = dogX.filter(aa => aa.x < x);
            if (preDogX.length === 0) {
                break;
            }
            dogX = preDogX;
            x = dogX[0].x;
        }

        let y = indices[0].y;
        let dogY = indices.slice(0);
        while (dogY.length > 1) {
            let preDogY = dogY.filter(aa => aa.y < y);
            if (preDogY.length === 0) {
                break;
            }
            dogY = preDogY;
            y = dogY[0].y;
        }

        let orientation = HOR;
        if (indices.length > 1 && indices[0].y === indices[1].y) {
            orientation = VER;
        }

        let v = new Vehicle(indices.length, y, x, orientation);
        v.letter = letter; //why not

        levelVehicles.push(v);
    }

    let pIndex = lineGridStr.indexOf(PLAYER_SYMBOL);
    let playerY = Math.floor(pIndex / 5);
    let playerX = pIndex % 5;
    
    let newLevel = new Level(levelVehicles, playerX, playerY, new Highway(hwy1, hwy2, hwyOrientation));

    DEBUG && console.log("LEVEL", newLevel);
    return newLevel;
}

function createDOMShit() {
    //holder of below
    boardHolder = document.createElement("div");
    boardHolder.className = "boardHolder";

    //actual DIV gridspace
    board = document.createElement("div");
    board.id = "board";
    board.className = "board";
    boardHolder.appendChild(board);

    //holder of below
    moveListHolder = document.createElement("div");
    moveListHolder.className = "moveListHolder";

    //move list DIV
    moveList = document.createElement("div");
    moveList.id = "moveList";
    moveList.className = "moveList";
    moveListHolder.appendChild(moveList);

    //level picker SELECT
    levelPicker = document.createElement("select");
    levelPicker.id = "levelPicker";
    levelPicker.className = "levelPicker";
    moveListHolder.appendChild(levelPicker);

    //load button - starts selected level
    loadButton = document.createElement("button");
    loadButton.id = "loadButton";
    loadButton.className = "loadButton";
    loadButton.innerText = "Load Level";
    moveListHolder.appendChild(loadButton);

    //timer DIV
    timerDiv = document.createElement("div");
    timerDiv.className = "timerDiv";
    timerDiv.innerHTML = `<label id="minutes">00</label>:<label id="seconds">00</label>`;

    //audio div
    audioDiv = document.createElement("audio");
    audioSrc = document.createElement("source");
    audioSrc.src = AUDIO_NICE;
    audioSrc.type = "audio/mp3";
    audioDiv.appendChild(audioSrc);
}

function addExtraDivs() {
    document.body.appendChild(moveListHolder);
    document.body.appendChild(timerDiv);

    for (var i = 0; i < LEVELS.length; i++) {
        let l = LEVELS[i];
        let option = document.createElement("option");
        option.value = l;
        option.innerText = "Level " + (i + 1);
        levelPicker.appendChild(option);
    }

    loadButton.onclick = function() {
        restart(levelPicker.value);
    }

    document.body.appendChild(audioDiv);
}

function setupGrid() {
    createDOMShit();
    document.body.appendChild(boardHolder);
    for (const v of currentLevel.level) {
        let x = v.x;
        let y = v.y;

        DEBUG && console.group("Setting up " + v.name + `(${v.id}) in (${v.x}, ${v.y})..`);
        for (var j = 0; j < v.size; j++) {
            let xAdd = 1;
            let yAdd = 0;
            if (v.orientation === VER) {
                xAdd = 0;
                yAdd = 1;
            }

            let xx = x + (j * xAdd);
            let yy = y + (j * yAdd);

            DEBUG && console.log(xx, yy);

            if (!grid[xx][yy]) {
                grid[xx][yy] = new Space(v);
                grid[xx][yy].x = xx;
                grid[xx][yy].y = yy;
            } else {
                DEBUG && console.log(v.id, "Space occupied!", x + ", " + y);
            }
        }
        DEBUG && console.groupEnd();
        vehicles.push(v);
    }

    you.setPosition(currentLevel.row, currentLevel.col);
    stand.setPosition(currentLevel.row, currentLevel.col);

    setupHighwayGrid(currentLevel.highway);
    addExtraDivs();

    minutesLabel = document.getElementById("minutes");
    secondsLabel = document.getElementById("seconds");
}

function setupHighwayGrid(highway) {
    let row1 = highway.a;
    let row2 = highway.b;
    let orientation = highway.orientation;

    if (orientation === HOR) {
        for (var i = 0; i < highwayGrid.length; i++) {
            highwayGrid[i][row1] = 1;
            highwayGrid[i][row2] = 1;
        }
    } else {
        for (var i = 0; i < highwayGrid.length; i++) {
            highwayGrid[row1][i] = 1;
            highwayGrid[row2][i] = 1;
        }
    }
}

function drawGrid() {
    genDivs(grid.length, grid.length);

    //color highway
    for (var i = 0; i < highwayGrid.length; i++) {
        for (var j = 0; j < highwayGrid.length; j++) {
            if (highwayGrid[i][j] === 1) {
                let spot = grid[i][j];
                if (spot && spot.boardDiv) {
                    spot.boardDiv.style.backgroundColor = highwayColor;
                }
            }
        }
    }
}

function createSpace(id, row, col) {
    let x = row - 1;
    let y = col - 1;

    //board grid "cell" space
    var cell = document.createElement("div");
    cell.className = "gridsquare";
    cell.name = id;
    cell.id = "cell-" + id;
    setSize(cell, cellWidth);

    //background text div with cell name (eg A1, C3, etc)
    var backTextDiv = document.createElement("div");
    backTextDiv.className = "backText";
    backTextDiv.innerText = getNamedCoords(x, y);
    setSize(backTextDiv, cellWidth);
    cell.appendChild(backTextDiv);

    //canvas div used for player/stand drawing
    var canvasDiv = document.createElement("div");
    canvasDiv.className = "canvasDiv";
    var canvas = document.createElement("canvas");
    canvas.width = cellWidth;
    canvas.height = cellHeight;
    canvasDiv.appendChild(canvas);
    setSize(canvasDiv, cellWidth);
    cell.appendChild(canvasDiv);

    let spot = grid[x][y] || new Space();
    spot.x = x; spot.y = y;

    if (spot.vehicle) {
        //creating the actual vehicle square "piece"
        //need to store its x,y too
        /*
        var vehicleDiv = document.createElement("div");
        vehicleDiv.id = `${spot.vehicle.name}-${spot.vehicle.id}-div`;
        vehicleDiv.className = "vehicleDiv";
        vehicleDiv.x = x;
        vehicleDiv.y = y;
        vehicleDiv.vehicle = spot.vehicle; //backwards reference for ease of use
        //vehicleDiv.innerText = spot.vehicle.id;

        setWidth(vehicleDiv, (2/3) * parseInt(cell.style.width, 10));
        setHeight(vehicleDiv, (2/3) * parseInt(cell.style.height, 10));

        cell.appendChild(vehicleDiv);

        vehicleDiv.style.backgroundColor = COLORS[spot.vehicle.size - 1];
        */
        let vehicleDiv = createVehicleDiv(spot.vehicle, cell, x, y);

        let vehicleBlock = new VehicleBlock(vehicleDiv, x, y);
        vehicleBlock.vehicle = spot.vehicle;

        spot.vehicleDiv = vehicleDiv;
        spot.vehicle.divs.push(vehicleBlock); //add div to vehicle div list each vehicle has
    }

    grid[x][y] = spot;

    spot.boardDiv = cell;
    spot.backgroundDiv = backTextDiv;
    spot.canvasDiv = canvasDiv;

    return cell;
}

function genDivs(w, h) {
    ROWS = w;
    COLS = h;

    for (var i = 0; i < h; i++) {
        var row = document.createElement("div");
        row.className = "row";
        for (var x = 1; x <= w; x++) {
            let id = (i * w) + x;
            let r = i + 1;
            let c = x;
            var cell = createSpace(id, r, c);
            row.appendChild(cell);
        }
        board.appendChild(row);
    }
}

function startTimer() {
    _timer = setInterval(setTime, 1000);
    timerStarted = true;
}

function stopTimer() {
    clearInterval(_timer);
    timerStarted = false;
}

//Repeatable Functions
//==============================================================================================================================================
//==============================================================================================================================================

function updateMoveList(move) {
    let addMsg = "";
    let cls = "move";
    if (typeof move === "string") {
        addMsg = move;
        cls = "instructions";
    } else addMsg = move.message;

    //moveList.innerText += (addMsg + "\n");
    moveList.innerHTML += `<div class="${cls}">${addMsg.split("\n").join("<br>")}</div><br>`;
    moveList.scrollTop = moveList.scrollHeight;
}

function refreshVehicleDivs() {
    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid.length; j++) {
            let spot = grid[i][j];
            if (!spot) { continue; } //shouldn't happen
            if (!spot.vehicle) { continue; }

            let vehicleDiv = spot.vehicleDiv;

            if (!vehicleDiv) { continue; } //shouldn't happen

            let myID = spot.vehicle.id;
            let dummy = { name: "both" };
            
            //left
            let left = getObjFromDirection(DIR_LEFT, vehicleDiv, dummy);
            if (left && !left.outOfBounds && left.vehicle.id === myID) {
                setPositionFromStyle(vehicleDiv, PosEnum.left);
            } else { left = undefined; }

            //right
            let right = getObjFromDirection(DIR_RIGHT, vehicleDiv, dummy);
            if (right && !right.outOfBounds && right.vehicle.id === myID) {
                setPositionFromStyle(vehicleDiv, PosEnum.right);
            } else { right = undefined; }

            //check middle (horizontal)
            if (right && left) {
                setPositionFromStyle(vehicleDiv, PosEnum.centerHor);
                continue;
            }

            //up
            let up = getObjFromDirection(DIR_UP, vehicleDiv, dummy);
            if (up && !up.outOfBounds && up.vehicle.id === myID) {
                setPositionFromStyle(vehicleDiv, PosEnum.up);
            } else { up = undefined; }

            //down
            let down = getObjFromDirection(DIR_DOWN, vehicleDiv, dummy);
            if (down && !down.outOfBounds && down.vehicle.id === myID) {
                setPositionFromStyle(vehicleDiv, PosEnum.down);
            } else { down = undefined; }

            //check middle (vertical)
            if (up && down) {
                setPositionFromStyle(vehicleDiv, PosEnum.centerVer);
                continue;
            }

            if (!left && !right && !up && !down) {
                setPositionFromStyle(vehicleDiv, PosEnum.center);
            }
        }
    }
    
    checkWin();
}

//refreshes all vehicleDiv styles based on adjacent positional divs
function refreshVehicles() {
    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid.length; j++) {
            let spot = grid[i][j];
            if (!spot) { continue; }
            if (!spot.vehicle) { continue; }

            let myID = spot.vehicle.id;
            let left, right, up, down;
            left = right = up = down = undefined;

            //check left
            if (i > 0) {
                left = grid[i - 1][j];
                if (left && left.vehicle && myID === left.vehicle.id) {
                    setPositionFromStyle(spot.vehicleDiv, PosEnum.left);
                } else { left = undefined; }
            }

            //check right
            if (i + 1 < grid.length) {
                right = grid[i + 1][j];
                if (right && right.vehicle && myID === right.vehicle.id) {
                    setPositionFromStyle(spot.vehicleDiv, PosEnum.right);
                } else { right = undefined; }
            }

            //check middle (horizontal)
            if (right && left) {
                setPositionFromStyle(spot.vehicleDiv, PosEnum.centerHor);
                continue;
            }

            //check up
            if (j > 0) {
                up = grid[i][j - 1];
                if (up && up.vehicle && myID === up.vehicle.id) {
                    setPositionFromStyle(spot.vehicleDiv, PosEnum.up);
                } else { up = undefined; }
            }

            //check down
            if (j + 1 < grid.length) {
                down = grid[i][j + 1];
                if (down && down.vehicle && myID === down.vehicle.id) {
                    setPositionFromStyle(spot.vehicleDiv, PosEnum.down);
                } else { down = undefined; }
            }

            //check middle (vertical)
            if (up && down) {
                setPositionFromStyle(spot.vehicleDiv, PosEnum.centerVer);
                continue;
            }

            if (!left && !right && !up && !down) {
                setPositionFromStyle(spot.vehicleDiv, PosEnum.center);
            }
        }
    }
}

function refreshPlayers() {
    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid.length; j++) {
            let spot = grid[i][j];

            var c = spot.canvasDiv.firstElementChild;
            var ctx = c.getContext("2d");
            ctx.clearRect(0, 0, c.width, c.height); //clear canvas

            if (spot.x === you.row && spot.y === you.col) {
                //draw player
                ctx.beginPath();
                ctx.strokeStyle = "#0000FF";
                ctx.arc(c.width / 2, c.height / 2, 20, 0, 2 * Math.PI);
                ctx.stroke();
            }

            if (spot.x === stand.row && spot.y === stand.col) {
                //draw stand
                ctx.beginPath();
                ctx.strokeStyle = "#00FFFF";
                ctx.arc(c.width / 2, c.height / 2, 40, 0, 2 * Math.PI);
                ctx.stroke(); 
            }           
        }
    }
}

document.onkeydown = checkKey;
document.onkeyup = checkKeyUp;

function checkKeyUp(e) {
    e = e || window.event;

    if (gameOver) { return; }

    if (e.keyCode === 16) {
        e.preventDefault();
        shiftDown = false;
    } else if (e.keyCode === 32) {
        e.preventDefault();
        recallStand();
    }
}

function checkKey(e) {
    e = e || window.event;

    if (gameOver) { return; }

    let x = stand.row;
    let y = stand.col;

    let dir = "none";

    let mult = -1;
    if (shiftDown) {
        mult = 1;
    }

    let playerMoving = false;

    switch (e.keyCode) {
        //stand movement
        case STAND_UP:
            e.preventDefault();
            dir = "up";
            xx = x;
            yy = y + mult;
        break;
        case STAND_DOWN:
            e.preventDefault();
            dir = "down";
            xx = x;
            yy = y - mult;
        break;
        case STAND_LEFT:
            e.preventDefault();
            dir = "left";
            xx = x + mult;
            yy = y;
        break;
        case STAND_RIGHT:
            e.preventDefault();
            dir = "right";
            xx = x - mult;
            yy = y;
        break;

        //player movement
        case PLAYER_UP:
            e.preventDefault();
            playerMoving = true;
            dir = "up";
            xx = x;
            yy = y - 1;
        break;
        case PLAYER_DOWN:
            e.preventDefault();
            playerMoving = true;
            dir = "down";
            xx = x;
            yy = y + 1;
        break;
        case PLAYER_LEFT:
            e.preventDefault();
            playerMoving = true;
            dir = "left";
            xx = x - 1;
            yy = y;
        break;
        case PLAYER_RIGHT:
            e.preventDefault();
            playerMoving = true;
            dir = "right";
            xx = x + 1;
            yy = y;
        break;

        //shift
        case 16:
            e.preventDefault();
            shiftDown = true;
        break;
    }

    if (dir === "none") { return; }
    
    if (!timerStarted) {
        startTimer();
    }

    if (playerMoving) {
        if (canMoveObject(dir, you, stand)) {
            movePlayer(dir);
        }
        return;
    }

    let pulling = shiftDown;
    if (canMoveObject(dir)) {
        if (!pulling) {
            moveStand(dir);
        } else {
            tryAction(dir);
        }
    } else {
        tryAction(dir);
    }
}

function tryAction(dir) {
    let id = 0;
    let canPush = true;
    let canPull = true;

    let pulling = shiftDown;

    if (!pulling) {
        canPull = false;

        let checkObj = getObjFromDirection(dir);
		if (checkObj && !checkObj.outOfBounds && !checkObj.player) { //obj exists, so check if can push
			for (const div of checkObj.vehicle.divs) {
				if (!checkDirectionChainFree(dir, div)) {
					canPush = false;
					break;
                }
                id = checkObj.vehicle.id;           
            }
        } else {
			//must be out of bounds so cant do anything
			canPush = false;
        }
    } else { //must be tryna pull
        canPush = false;

		if (!canMoveObject(dir)) {
            canPull = false;
        } else {
            let sourceBlock = getObjFromDirection(getReverseDirection(dir)); //get potential "pull" object from behind player 
			if (sourceBlock && !sourceBlock.outOfBounds && !sourceBlock.player) {
				for (const div of sourceBlock.vehicle.divs) {
					if (!checkDirectionChainFree(dir, div, stand)) { //want to ignore stand here
						canPull = false;
						break;
                    }
                }
                id = sourceBlock.vehicle.id;
            } else {
				//must be out of bounds
				//cant do anything
				canPull = false;
			}
		}
    }

    if (canPush || canPull) {
        moveVehicleByID(id, dir);
        //moveStand(dir);
    }

}

const moveVehicleByID = (id, dir) => {
    let vehicle = getVehicleByID(id);

    if (!vehicle) {
        console.log("Something went horribly wrong!");
        return;
    }

    let oldDisplayCoords = getVehicleCoords(vehicle).join(", ");

    for (const v of vehicle.divs) {
        moveInDirection(v, dir);
    }

    let newDisplayCoords = getVehicleCoords(vehicle).join(", ");

    moves.push(new Move(vehicle, dir, oldDisplayCoords, newDisplayCoords));

    moveStand(dir);
    vehicle.dirty = true;

    refreshVehicleBlocks();
}

//returns true if player/stand is at (x,y)
function isPlayerInSpot(x, y, ignorePlayer = false) {
    if (ignorePlayer) {
        return false;
    }

    return ((you.row === x && you.col === y) || (stand.row === x && stand.col === y));
}

//returns true/false if space to dir of obj is free
function canMoveObject(dir, obj = stand, ignore = you) {
    return getObjFromDirection(dir, obj, ignore) === undefined;
}

//returns object in space to dir of obj, OUT_OF_BOUNDS, or undefined if space is free
//ignoreName = "stand", "player", "both" or undefined
function getObjFromDirection(dir, obj = stand, ignoreName = undefined) {
    let coords = getCoordsFromDirection(dir, obj);

    let xx = coords.x;
    let yy = coords.y;

    if (xx >= grid.length || yy >= grid.length || xx < 0 || yy < 0) {
        return OUT_OF_BOUNDS;
    }

    if (ignoreName && ignoreName.name === "both") {
        return grid[xx][yy].vehicleDiv;
    }

    //return player if in spot and not ignored
    if (you.row === xx && you.col === yy) {
        if (!ignoreName || ignoreName.name !== you.name) {
            return you;
        }
    }

    //return stand if in spot and not ignored
    if (stand.row === xx && stand.col === yy) {
        if (!ignoreName || ignoreName.name !== stand.name) {
            return stand;
        }
    }

    return grid[xx][yy].vehicleDiv;
}

//returns true if space at end of obj chain is free, false otherwise
//ignoreName = "stand", "player" or undefined
function checkDirectionChainFree(dir, obj, ignoreName = undefined) {
    let newObj = getObjFromDirection(dir, obj, ignoreName);

    if (newObj) { //something in space
        if (newObj.outOfBounds || newObj.player) {
            return false;
        } else if (newObj.vehicle.id === obj.vehicle.id) {
            return checkDirectionChainFree(dir, newObj, ignoreName);
        } else {
            return false;
        }
    }

    return true;
}

function recallStand() {
    stand.row = you.row;
    stand.col = you.col;

    refreshPlayers();
}

function moveStand(dir) {
    let coords = getCoordsFromDirection(dir, stand);
    stand.row = coords.x;
    stand.col = coords.y;

    refreshPlayers();
}

function movePlayer(dir) {
    let coords = getCoordsFromDirection(dir, you);
    you.row = coords.x;
    you.col = coords.y;

    refreshPlayers();
}

const moveInDirection = (obj, dir) => {
    let x = choose(obj.x, obj.row);
    let y = choose(obj.y, obj.col);

    //store previous position (used to remove old divs)
    obj.oldX = x;
    obj.oldY = y;

    let coords = getCoordsFromDirection(dir, obj);
    let destX = coords.x;
    let destY = coords.y;

    let newPos = setObjPosition(obj, destX, destY);
    obj.x = newPos.x; obj.y = newPos.y;
}
const createVehicleDiv = (vehicle, cell, x, y) => {
    //creating the actual vehicle square "piece"
    //need to store its x,y too
    var vehicleDiv = document.createElement("div");
    vehicleDiv.divID = vehicleDivID;
    vehicleDivID++;
    vehicleDiv.id = `${vehicle.name}-${vehicle.id}-div-${vehicleDiv.divID}`;
    vehicleDiv.className = "vehicleDiv";
    vehicleDiv.x = x;
    vehicleDiv.y = y;
    vehicleDiv.vehicle = vehicle; //backwards reference for ease of use

    setWidth(vehicleDiv, (2/3) * parseInt(cell.style.width, 10));
    setHeight(vehicleDiv, (2/3) * parseInt(cell.style.height, 10));

    vehicleDiv.style.backgroundColor = COLORS[vehicle.size - 1];

    cell.appendChild(vehicleDiv);

    return vehicleDiv;
}

const setVehicleDiv = (vehicleDiv, cell, x, y) => {
    //creating the actual vehicle square "piece"
    //need to store its x,y too
    vehicleDiv.x = x;
    vehicleDiv.y = y;

    cell.appendChild(vehicleDiv);
}

const refreshVehicleBlocks = () => {
    //first remove all vehicle divs
    //then add back with new positions
    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid.length; j++) {
            let spot = grid[i][j];
            let vehicle = spot.vehicle;

            let spotsToCleanup = [];

            if (vehicle && vehicle.dirty) {
                for (const d of vehicle.divs) {
                    spotsToCleanup.push(grid[d.oldX][d.oldY]);
                    let divToMove = d.div;
                    divToMove.remove();

                    let thisSpot = grid[d.x][d.y];
                    thisSpot.vehicle = vehicle;
                    setVehicleDiv(divToMove, thisSpot.boardDiv, d.x, d.y);
                    thisSpot.vehicleDiv = divToMove;
                }

                for (const sp of spotsToCleanup) {
                    let s = sp.boardDiv;
                    let hasVehicleDiv = [].slice.call(s.children).filter(x => x.className === "vehicleDiv")[0];
                    if (!hasVehicleDiv) {
                        sp.vehicle = undefined;
                        sp.vehicleDiv = undefined;
                    }
                }

                vehicle.dirty = false;
            }

        }
    }

    refreshVehicleDivs();
}

function checkWin() {
    let win = true;
    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid.length; j++) {
            if (highwayGrid[i][j] !== 1) { continue; }
            let spot = grid[i][j];
            if (spot.vehicleDiv) {
                win = false;
                break;
            }
        }
    }

    if (win) {
        let s = getScore();
        console.log(s);
        updateMoveList(`${SCORES[s]} [${timerDiv.innerText}] ${GAME_WIN_MESSAGE}`);
        stopGame();
        audioSrc.src = AUDIOS[s];
        audioDiv.load();
        audioDiv.play();
    }
}

function init(level = undefined) {
    currentLevel = extractLevel(level || L1);
    setupGrid();
    drawGrid();
    refreshVehicleDivs();
    refreshPlayers();

    updateMoveList(INSTRUCTIONS);
    gameOver = false;
}

function stopGame() {
    gameOver = true;
    stopTimer();
}

function restart(level) {
    stopGame();

    totalSeconds = 0;
    vehicleID = 0;
    vehicleDivID = 0;
    moveCount = 0;
    
    vehicles = [];
    moves = [];

    //clear grid
    boardHolder.remove();
    moveListHolder.remove();
    timerDiv.remove();
    
    grid = [
        new Array(5).fill(undefined),
        new Array(5).fill(undefined),
        new Array(5).fill(undefined),
        new Array(5).fill(undefined),
        new Array(5).fill(undefined),
    ];

    highwayGrid = [
        new Array(5).fill(0),
        new Array(5).fill(0),
        new Array(5).fill(0),
        new Array(5).fill(0),
        new Array(5).fill(0),
    ];

    init(level);
}

init();
