let sketch = function (p) {

    //#region To Do
    //to do
    //story lol
    //i think there's leaks or smthg
    //smooth scroll on text
    //inventory
    //help
    //intro text
    //level test with various things to do
        //take item, put in inventory
        //give item in inventory to NPC
        //NPC completes action
    //moving NPCs?
    //think about sound
    //differentiate b/t diff sounds
    //better way to set up characters
    //worried about usage of visible grid vs grid
    //diff b/t items w/ same character
    //need to check items to move forward in character's dialog 
    //#endregion

    //#region Variable definitions

    /** Array holding entire level grid. */
    var grid = [];

    /** CSV of the level. */
    var level;
    /** All character dialog text. */
    var text;
    /** All item text. */
    var itemText;

    /** Width of entire grid. */
    var gridWidth = 0;
    /** Height of entire grid. */
    var gridHeight = 0;

    /** Offset for x and y of each character visible in the grid. */
    var cellOffset = 25;
    /** Offset for x and y of the entire grid. */
    var gridOffset = 40;

    /** Array holding visible grid. */
    var visibleGrid = [];

    /** Width of visible grid. */
    var gridWidthVisible = 30;
    /** Height of visible grid */
    var gridHeightVisible = 30;
    /** Top left starting point for the visible grid */
    var gridVisiblePos = p.createVector(0, 0);

    /** Fartherest outer bounds the camera can move */
    var gridLimit = p.createVector(0, 0);

    /** Min inner boarder of where camera should start moving. */
    var minInnerBoarder = p.createVector(0, 0);
    /** Max inner boarder of where camera should start moving. */
    var maxInnerBoarder = p.createVector(0, 0);

    /** Object of player. */
    var player;
    /** Cell player starts at */
    var playerStartPos = p.createVector(33, 4);

    var upKey = 'w';
    var downKey = 's';
    var rightKey = 'd';
    var leftKey = 'a';

    /** Indicates if dialog should draw to the canvas. */
    var showDialog = true;
    /** Array of all dialog text to draw. */
    var dialogToShow = [];
    /** Top left start of dialog box */
    var dialogStart = p.createVector(800, 50);
    /** Y offset for each line of dialog. */
    var dialogOffset = 50;

    /** Max number of dialog lines until they need to be in a scroll container. */
    var dialogScreenLimit = 13;

    /** Font of level. */
    var font;
    /** Font of dialog. */
    var textFont;

    /** Indicates if the player needs to answer a question before resuming. */
    var mustAnswer = false;
    /** Reference to the cell position the player is talking to. */
    var talkCellPos = p.createVector(-10, -10);

    /** Array of all the items the player is holding. */
    var inventory = [];

    /** scroll bar width */
    var scrollWidth = 10;
    /** scroll bar height */
    var scrollHeight = 0;
    /** scroll bar start position */
    var scrollPos = p.createVector(0, 0);

    //#endregion

    p.preload = function () {
        level = p.loadTable('level1.csv');
        text = p.loadJSON('text.json');
        itemText = p.loadJSON('itemtext.json');
        font = p.loadFont('myprime2.ttf');
        textFont = p.loadFont('baseprime.ttf');
    }

    p.setup = function () {
        p.createCanvas(1700, 800);

        scrollPos = p.createVector(p.width - 500, 0);

        gridWidth = level.getColumnCount();
        gridHeight = level.getRowCount();

        //#region not sure if i need this
        // if (playerStartX > gridWidth) {
        //     playerStartX = gridWidth - 30;
        // }
        // if (playerStartY > gridHeight) {
        //     playerStartY = gridHeight - 30;
        // }
        //#endregion

        //#region Setting the camera bounds.
        minInnerBoarder = p.createVector(gridWidthVisible * .3, gridHeightVisible * .3);
        maxInnerBoarder = p.createVector(gridWidthVisible * .7, gridHeightVisible * .7);
        gridLimit = p.createVector(gridWidth - (gridWidthVisible - maxInnerBoarder.x), gridHeight - (gridHeightVisible - maxInnerBoarder.y));
        //#endregion

        //loop through the grid to find what each cell is
        for (var x = 0; x < gridWidth; x++) {
            grid[x] = [];
            for (var y = 0; y < gridHeight; y++) {
                p.setCell(x, y, p.createVector(x * cellOffset + gridOffset, y * cellOffset + gridOffset), level.get(y, x));
            }
        }

        //loop through the grid to fill initial visible grid
        for (var x = 0; x < gridWidthVisible; x++) {
            visibleGrid[x] = [];
            for (var y = 0; y < gridHeightVisible; y++) {
                visibleGrid[x][y] = grid[x][y];
            }
        }

        //#region adjust the camera's start position and player's start positon if it's not within the initial visible grid
        var yCheck = maxInnerBoarder.y;
        var tempPlayerY = playerStartPos.y;
        while (tempPlayerY >= yCheck) {
            playerStartPos.y--;
            gridVisiblePos.y++;
            yCheck++;
        }
        var xCheck = maxInnerBoarder.x;
        var tempPlayerX = playerStartPos.x;
        while (tempPlayerX >= xCheck) {
            playerStartPos.x--;
            gridVisiblePos.x++;
            xCheck++;
        }
        //#endregion

        //player = new p.Player(visibleGrid[playerStartPos.x][playerStartPos.y].x, visibleGrid[playerStartPos.x][playerStartPos.y].y, "O", playerStartPos.x, playerStartPos.y);
        player = new p.Player(visibleGrid[playerStartPos.x][playerStartPos.y].pos.x, visibleGrid[playerStartPos.x][playerStartPos.y].pos.y, "O", playerStartPos);
        p.adjustVisibleGrid();
        visibleGrid[player.gridPos.x][player.gridPos.y].shouldDraw = false;
        p.angleMode(p.DEGREES);
    };

    p.draw = function () {
        p.clear();
        p.textSize(24);
        p.textFont(font);

        //loop through and show the grid
        for (var x = 0; x < gridWidthVisible; x++) {
            for (var y = 0; y < gridHeightVisible; y++) {
                visibleGrid[x][y].display();
            }
        }

        p.textSize(18);
        p.fill(255);
        player.display();

        if (showDialog) {
            p.textFont(textFont);
            for (var i = 0; i < dialogToShow.length; i++) {
                dialogToShow[i].display();
            }
            if (dialogToShow.length >= dialogScreenLimit) {
                p.fill(255);
                p.rect(scrollPos.x, scrollPos.y, scrollWidth, scrollHeight);
            }
        }
    };

    p.keyPressed = function () {
        if (p.key != '1' && p.key != '2' && mustAnswer) {
            p.addMustAnswerDialog();
        }
        if (p.key == upKey, downKey, leftKey, rightKey && !mustAnswer) {
            var moveX = 0;
            var moveY = 0;
            switch (p.key) {
                case upKey:
                    moveY = -1;
                    break;
                case downKey:
                    moveY = 1;
                    break;
                case rightKey:
                    moveX = 1;
                    break;
                case leftKey:
                    moveX = -1;
                    break;
            }
            if (p.checkOuterBounds(player.gridPos.x + moveX, player.gridPos.y + moveY)) {
                var colVal = p.checkColl(player.gridPos.x + Math.sign(moveX), player.gridPos.y + Math.sign(moveY));
                if (Math.sign(moveX) != 0 || Math.sign(moveY) != 0) {
                    if (colVal == 0 || colVal == 3 || colVal == 4) {
                        p.switchVisibility(player.gridPos.x, player.gridPos.y, player.gridPos.x + moveX, player.gridPos.y + moveY);
                        if (p.checkInnerBoundsX(player.gridPos.x + moveX, player.gridPos.y + moveY, moveX) || p.checkInnerBoundsY(player.gridPos.x + moveX, player.gridPos.y + moveY, moveY)) {
                            player.move(moveX * cellOffset, moveY * cellOffset);
                        }
                    }
                }
                p.adjustVisibleGrid();
            }
        }

        if (p.key == '1' || p.key == '2') {
            if (mustAnswer) {
                if (p.key == '1') {
                    p.addAnswerDialog(0);
                } else {
                    p.addAnswerDialog(1);
                }
            }
        }

        if (p.key == 'i' || p.key == 'I') {
            p.addInventory();
        }
    }

    p.mouseWheel = function (event) {
        if (showDialog) {
            if (event.delta < 0) { //down
                if (dialogToShow.length > dialogScreenLimit) {
                    if (dialogToShow[dialogToShow.length - dialogScreenLimit].pos.y > 170) {
                        dialogStart.y += event.delta;
                        scrollPos.y -= event.delta;
                    }
                }
            } else if (event.delta > 0) { //up
                if (dialogToShow.length > dialogScreenLimit) {
                    if (dialogToShow[0].pos.y < 50) {
                        dialogStart.y += event.delta;
                        scrollPos.y -= event.delta;
                    }
                }
            }
            for (var i = 0; i < dialogToShow.length; i++) {
                dialogToShow[i].pos.y = dialogStart.y + (i * dialogOffset);
            }
        }
    }

    p.setCell = function (_x, _y, _pos, _img) {
        switch (_img) {
            case '@':
            case 'R':
                grid[_x][_y] = new p.Character(_pos, _img);
                break;
            case '#':
                grid[_x][_y] = new p.TallGrass(_pos, _img);
                break;
            case ',':
                grid[_x][_y] = new p.ShortGrass(_pos, _img);
                break;
            case "{":
                grid[_x][_y] = new p.Water(_pos, _img);
                break;
            case "}":
                grid[_x][_y] = new p.Water(_pos, _img);
                break;
            case "Π":
                grid[_x][_y] = new p.Door(_pos, _img);
                break;
            case "$":
                grid[_x][_y] = new p.PickAbleItem(_pos, _img);
                break;
            default:
                grid[_x][_y] = new p.Cell(_pos, _img);
                break;
        }
    }

    /** turns on the last cell and turns the next cell on */
    p.switchVisibility = function (_prevX, _prevY, _nextX, _nextY) {
        visibleGrid[_prevX][_prevY].shouldDraw = true;
        visibleGrid[_nextX][_nextY].shouldDraw = false;
    }

    /** checks to see if the cell the player is moving into has a collision event */
    p.checkColl = function (_cellX, _cellY) {
        if (visibleGrid[_cellX][_cellY].wall || visibleGrid[_cellX][_cellY].door) { //if it's a wall or door
            p.checkInventory(_cellX, _cellY); //check if you need an item to go past
            return 1; //don't go into that cell
        } else if (visibleGrid[_cellX][_cellY].interact) { //if it's a cell you can interact with
            p.addDialog(_cellX, _cellY);
            if (visibleGrid[_cellX][_cellY].hasBump) {
                visibleGrid[_cellX][_cellY].doBump = true;
            }
            return 2;
        } else if (visibleGrid[_cellX][_cellY].collect) { //if it's a cell you can pick up
            p.addItemDialog(_cellX, _cellY);
            inventory.push(new p.InventoryItem(visibleGrid[_cellX][_cellY].img, visibleGrid[_cellX][_cellY].name));
            visibleGrid[_cellX][_cellY].isCollected();
            return 3;
        } else if (visibleGrid[_cellX][_cellY].hasOverlap) { //if it's a cell that you can walk on, but it does something
            visibleGrid[_cellX][_cellY].overlap();
            return 4;
        } else {
            return 0;
        }
    }

    /** checks if the cell needs an item to work */
    p.checkInventory = function (_cellX, _cellY) {
        if (visibleGrid[_cellX][_cellY].neededItem != 0) { //if the cell needs an item
            for (var i = 0; i < inventory.length; i++) { //check if the player has it
                if (inventory[i].img == visibleGrid[_cellX][_cellY].neededItem) {
                    visibleGrid[_cellX][_cellY].adjustDialog();
                    p.addItemDialog(_cellX, _cellY);
                    visibleGrid[_cellX][_cellY].openDoor();
                }
            }
        }
    }

    /** checks if the player has met the camera bounds on the X */
    p.checkInnerBoundsX = function (_newX, _newY, _dir) {
        if (_dir < 0 && gridVisiblePos.x == 0) {
            return true;
        } else if (_dir < 0 && gridVisiblePos.x > 0) {
            if (_newX < minInnerBoarder.x) {
                gridVisiblePos.x--;
                return false;
            } else {
                return true;
            }
        }
        if (_dir > 0 && gridVisiblePos.x == 0) {
            if (_newX < maxInnerBoarder.x) {
                return true;
            } else if (_newX >= maxInnerBoarder.x) {
                gridVisiblePos.x++;
                return false;
            }
        }
        if (_dir > 0 && gridVisiblePos.x > 0) {
            if (maxInnerBoarder.x + gridVisiblePos.x < gridLimit.x && _newX > maxInnerBoarder.x) {
                gridVisiblePos.x++;
                return false;
            } else {
                return true;
            }
        }
    }

    /** checks if the player has met the camera bounds on the Y*/
    p.checkInnerBoundsY = function (_newX, _newY, _dir) {
        if (_dir < 0 && gridVisiblePos.y == 0) {
            return true;
        } else if (_dir < 0 && gridVisiblePos.y > 0) {
            if (_newY < minInnerBoarder.y) {
                gridVisiblePos.y--;
                return false;
            } else {
                return true;
            }
        }
        if (_dir > 0 && gridVisiblePos.y == 0) {
            if (_newY < maxInnerBoarder.y) {
                return true;
            } else if (_newY >= maxInnerBoarder.y) {
                gridVisiblePos.y++;
                return false;
            }
        }
        if (_dir > 0 && gridVisiblePos.y > 0) {
            if (maxInnerBoarder.y + gridVisiblePos.y < gridLimit.y && _newY > maxInnerBoarder.y) {
                gridVisiblePos.y++;
                return false;
            } else {
                return true;
            }
        }
    }

    /** checks if the player has met the outside edge of the grid */
    p.checkOuterBounds = function (_newX, _newY) {
        if (_newX < 0 || _newX >= gridWidthVisible) {
            return false;
        } else if (_newY < 0 || _newY >= gridHeightVisible) {
            return false;
        } else {
            return true;
        }
    }

    /** move the dialog text positions down */
    p.shiftDialog = function () {
        if (dialogToShow[dialogToShow.length - 1].pos.y > p.height - dialogOffset) {
            dialogStart.y = p.height - (dialogToShow.length * dialogOffset);
            for (var i = 0; i < dialogToShow.length; i++) {
                dialogToShow[i].pos.y = dialogStart.y + (i * dialogOffset);
                scrollPos.y = p.height - scrollHeight;
            }
        }
    }

    /** adding a new dialog line and its color */
    p.newDialogLine = function (_text, _color) {
        dialogToShow.push(new p.Dialog(p.createVector(dialogStart.x, dialogStart.y + (dialogToShow.length * dialogOffset)), _text, _color));
        p.shiftDialog();
        p.adjustScroll();
    }

    p.adjustScroll = function () {
        if (dialogToShow.length == dialogScreenLimit) {
            scrollHeight = p.height - 20;
        } else if (dialogToShow.length > dialogScreenLimit && scrollHeight > 10) {
            scrollHeight -= 40;
            scrollPos.y += 40;
        }
    }

    /** add item dialog */
    p.addItemDialog = function (_cellX, _cellY) {
        p.newDialogLine("-----------------", p.color(255));
        p.newDialogLine(visibleGrid[_cellX][_cellY].dialog, visibleGrid[_cellX][_cellY].col);
    }

    /** add character dialog */
    p.addDialog = function (_cellX, _cellY) {
        var choices = visibleGrid[_cellX][_cellY].choices;
        p.newDialogLine("-----------------", p.color(255));
        p.newDialogLine(visibleGrid[_cellX][_cellY].dialog, visibleGrid[_cellX][_cellY].col);
        if (choices.length > 0) {
            p.newDialogLine(choices[0] + " [1] or " + choices[1] + " [2]", p.color(255));
            talkCellPos.x = _cellX;
            talkCellPos.y = _cellY;
            mustAnswer = true;
        } else {
            visibleGrid[talkCellPos.x][talkCellPos.y].adjustDialog();
        }
    }

    /** add answer dialog */
    p.addAnswerDialog = function (_index) {
        p.newDialogLine(visibleGrid[talkCellPos.x][talkCellPos.y].choices[_index], p.color(255));
        p.newDialogLine(visibleGrid[talkCellPos.x][talkCellPos.y].answers[_index], visibleGrid[talkCellPos.x][talkCellPos.y].col);
        visibleGrid[talkCellPos.x][talkCellPos.y].adjustDialog();
        mustAnswer = false;
    }

    /** add answer warning dialog */
    p.addMustAnswerDialog = function () {
        p.newDialogLine("You must answer the question.", visibleGrid[talkCellPos.x][talkCellPos.y].col);
    }

    /** add inventory text to the dialog */
    p.addInventory = function () {
        var inventoryText = "I have: ";
        if (inventory.length > 0) {
            for (var i = 0; i <= inventory.length; i++) {
                if (i == inventory.length) {
                    inventoryText = inventoryText + ".";
                } else if (i == 0) {
                    inventoryText = inventoryText + " " + inventory[i].name;
                } else {
                    inventoryText = inventoryText + ", " + inventory[i].name;
                }
            }
        } else {
            inventoryText = inventoryText + "nothing.";
        }
        p.newDialogLine(inventoryText, p.color(255));
    }

    /** move the "camera" over the grid */
    p.adjustVisibleGrid = function () {
        for (var x = 0; x < gridWidthVisible; x++) {
            for (var y = 0; y < gridHeightVisible; y++) {
                visibleGrid[x][y] = grid[gridVisiblePos.x + x][gridVisiblePos.y + y];
                visibleGrid[x][y].pos.x = x * cellOffset + gridOffset;
                visibleGrid[x][y].pos.y = y * cellOffset + gridOffset;
                visibleGrid[x][y].basePos.x = visibleGrid[x][y].pos.x;
                visibleGrid[x][y].basePos.y = visibleGrid[x][y].pos.y;
            }
        }
    }

    p.Cell = class {
        constructor(_pos, _img) {
            this.pos = _pos;
            this.img = _img;
            this.startImg = _img;
            this.shouldDraw = true;

            this.wall = false;

            this.basePos = _pos;

            if (this.img == ".") {
                this.col = p.color(100, 100, 100);
            } else if (this.img == '|') {
                this.col = p.color(100, 100, 100);
                this.wall = true;
            } else if (this.img == '-') {
                this.col = p.color(107, 76, 57);
            } else if (this.img == '〰') {
                this.col = p.color(48, 29, 16);
            } else if (this.img == '█') {
                this.col = p.color(79, 47, 45);
                this.wall = true;
            } else if (this.img == '=') {
                this.col = p.color(0, 148, 0);
                this.wall = true;
            } else {
                this.col = p.color(255, 255, 255);
            }
        }

        display() {
            if (this.shouldDraw) {
                p.fill(this.col);
                p.text(this.img, this.pos.x, this.pos.y);
            }
        }

    }

    p.TallGrass = class extends p.Cell {

        constructor(_pos, _img) {
            super(_pos, _img);

            this.overlapStart = 100;
            this.overlapCount = 0;
            this.overlapImg;

            this.sheerAmt = 0;
            this.sheerSpd = 1;
            this.sheerStart = p.random(3, 5);
            this.sheerTime = this.sheerStart;

            this.col = p.color(209, 165, 63);
            this.hasOverlap = true;
            this.overlapImg = '≥';

        }

        overlap() {
            this.img = this.overlapImg;
            this.overlapCount = this.overlapStart;
        }

        overlapTimer() {
            this.overlapCount--;
            if (this.overlapCount <= 0) {
                this.img = this.startImg;
                this.overlapCount = 0;
            }
        }

        display() {
            if (this.shouldDraw) {
                p.fill(this.col);
                p.push();
                this.pos = p.createVector(0, 0);
                p.translate(this.basePos.x, this.basePos.y);
                p.shearX(this.sheerAmt);
                this.sheerTime--;
                if (this.sheerTime < 0) {
                    this.sheerAmt += this.sheerSpd;
                    if (this.sheerAmt > 5 || this.sheerAmt < -5) {
                        this.sheerSpd = -this.sheerSpd;
                    }
                    this.sheerTime = this.sheerStart;
                }
                p.text(this.img, this.pos.x, this.pos.y);
                p.pop();
                if (this.overlapCount > 0) {
                    this.overlapTimer();
                }
            }
        }

    }

    p.ShortGrass = class extends p.Cell {
        constructor(_pos, _img) {
            super(_pos, _img);

            this.off = 0;

            this.col = p.color(50, 168, 82);
            this.hasAmbiant = true;
            this.ambiantStart = p.random(200, 500);
            this.ambiantCounter = this.ambiantStart;
        }

        ambiantMove() {
            this.ambiantCounter--;
            if (this.ambiantCounter < 0) {
                this.off = this.off + 0.1;
                this.sign = Math.round(p.random(-1, 1));
                this.pos = p.createVector(this.pos.x + (this.sign * p.noise(this.off)), this.pos.y + (this.sign * p.noise(this.off)));
                if (this.ambiantCounter < -20) {
                    this.pos = p.createVector(this.basePos.x, this.basePos.y);
                    this.ambiantCounter = this.ambiantStart;
                    this.off = 0;
                }
            }
        }
    }

    p.Water = class extends p.Cell {
        constructor(_pos, _img) {
            super(_pos, _img);

            this.animFrames = [];
            this.frameIndex = 0;

            this.col = p.color(61, 77, 184);
            this.hasAnim = true;
            this.animStart = 10;
            this.animCount = this.animStart;
            if (this.img == '}') {
                this.animFrames = ['}', '{'];
            } else {
                this.animFrames = ['{', '}'];
            }
        }

        animate() {
            this.animCount--;
            if (this.animCount < 0) {
                this.frameIndex++;
                if (this.frameIndex >= this.animFrames.length) {
                    this.frameIndex = 0;
                }
                this.animCount = this.animStart;
            }
        }

        display() {
            if (this.shouldDraw) {
                this.animate();
                p.fill(this.col);
                p.text(this.animFrames[this.frameIndex], this.pos.x, this.pos.y);
            }
        }
    }

    p.Door = class extends p.Cell {
        constructor(_pos, _img) {
            super(_pos, _img);
            this.col = p.color(176, 148, 63);
            this.door = true;
            this.allDialog = [];
            this.dialog;
            this.neededItem = 0;

            this.storyIndex = 0;
            this.dialog = this.assignDialog();
        }

        assignDialog() {
            for (var i = 0; i < itemText.items.length; i++) {
                if (this.img == itemText.items[i].object) {
                    this.allDialog = itemText.items[i].dialog;
                    this.nextScene = itemText.items[i].dialog[this.storyIndex].nextScene;
                    this.neededItem = itemText.items[i].dialog[this.storyIndex].needItem;
                    return itemText.items[i].dialog[this.storyIndex].line;
                }
            }
        }

        adjustDialog() {
            this.storyIndex = this.nextScene;
            this.dialog = this.allDialog[this.storyIndex].line;
            this.nextScene = this.allDialog[this.storyIndex].nextScene;
        }

        openDoor() {
            this.col = p.color(100, 100, 100);
            this.door = false;
            this.img = ".";
            this.dialog = "";
        }
    }

    p.PickAbleItem = class extends p.Cell {
        constructor(_pos, _img) {
            super(_pos, _img);
            this.col = p.color(176, 148, 63);
            this.collect = true;
            this.allDialog = [];
            this.dialog;
            this.neededItem;
            this.name;
            this.col = p.color(0, 0, 255);
            this.storyIndex = 0;
            this.dialog = this.assignDialog();
        }

        assignDialog() {
            for (var i = 0; i < itemText.items.length; i++) {
                if (this.img == itemText.items[i].object) {
                    this.allDialog = itemText.items[i].dialog;
                    this.name = itemText.items[i].dialog[this.storyIndex].name;
                    this.nextScene = itemText.items[i].dialog[this.storyIndex].nextScene;
                    this.neededItem = itemText.items[i].dialog[this.storyIndex].neededItem;
                    return itemText.items[i].dialog[this.storyIndex].line;
                }
            }
        }

        isCollected() {
            this.img = ".";
            this.col = p.color(100, 100, 100);
            this.collect = false;
        }

    }

    p.Character = class extends p.Cell {
        constructor(_pos, _img) {
            super(_pos, _img);
            this.allDialog = [];
            this.choices;
            this.answers;
            this.nextScene = [];

            this.bumpStart = 20;
            this.bumpTime = this.bumpStart;
            this.doBump = false;

            this.storyIndex = 0;

            this.off = 0;

            if (this.img == '@') {
                this.col = p.color(255, 0, 0);
            } else if (this.img == 'R') {
                this.col = p.color(171, 235, 52);
            }

            this.dialog = this.assignDialog();
            this.interact = true;
            this.hasBump = true;
        }

        bumpAnim() {
            this.bumpTime--;
            this.off = this.off + 0.1;
            this.sign = Math.round(p.random(-1, 1));
            this.y = this.y + (this.sign * p.noise(this.off));
            if (this.bumpTime < 0) {
                this.pos = p.createVector(this.basePos.x, this.basePos.y);
                this.off = 0;
                this.bumpTime = this.bumpStart;
                this.doBump = false;
            }
        }

        display() {
            if (this.shouldDraw) {
                super.display();
                if (this.doBump) {
                    this.bumpAnim();
                }
            }
        }

        assignDialog() {
            for (var i = 0; i < text.characters.length; i++) {
                if (this.img == text.characters[i].name) {
                    this.allDialog = text.characters[i].dialog;
                    if (text.characters[i].dialog[this.storyIndex].choices.length > 0) {
                        this.choices = text.characters[i].dialog[this.storyIndex].choices;
                        this.answers = text.characters[i].dialog[this.storyIndex].answers;
                    }
                    this.nextScene = text.characters[i].dialog[this.storyIndex].nextScene;
                    return text.characters[i].dialog[this.storyIndex].line;
                }
            }
        }

        adjustDialog() {
            this.storyIndex = this.nextScene;
            this.choices = [];
            this.answers = [];
            if (this.allDialog[this.storyIndex].choices.length > 0) {
                this.choices = this.allDialog[this.storyIndex].choices;
                this.answers = this.allDialog[this.storyIndex].answers;
            }
            this.dialog = this.allDialog[this.storyIndex].line;
            this.nextScene = this.allDialog[this.storyIndex].nextScene;
        }


    }

    p.InventoryItem = class {
        constructor(_img, _name) {
            this.img = _img;
            this.name = _name;
        }
    }

    p.Player = class {
        constructor(_x, _y, _img, _pos) {
            this.pos = p.createVector(_x, _y);
            this.gridPos = _pos;
            this.img = _img;
        }

        display() {
            p.text(this.img, this.pos.x, this.pos.y);
        }

        move(_x, _y) {
            this.pos.add(_x, _y);
            this.gridPos.add(Math.sign(_x), Math.sign(_y));
        }
    }

    p.Dialog = class {
        constructor(_pos, _txt, _color) {
            this.pos = _pos;
            this.col = _color;
            this.txt = _txt;
        }

        display() {
            p.fill(this.col);
            p.text(this.txt, this.pos.x, this.pos.y);
        }
    }

}