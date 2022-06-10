let sketch = function (p) {

    //#region To Do
    //to do
    //story lol
    //i think there's leaks or smthg
    //smooth scroll on text
    //help
    //intro text
    //moving NPCs?
    //think about sound
    //differentiate b/t diff sounds
    //better way to set up characters
    //animations
    //the color when opening a door is wrong
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

    var sounds = [];

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

        sounds[0] = p.loadSound('sound1.mp3');
        sounds[1] = p.loadSound('sound2.mp3');
        sounds[2] = p.loadSound('sound3.mp3');

        player = new p.Player(visibleGrid[playerStartPos.x][playerStartPos.y].pos.x, visibleGrid[playerStartPos.x][playerStartPos.y].pos.y, "O", playerStartPos);
        p.adjustVisibleGrid();
        visibleGrid[player.gridPos.x][player.gridPos.y].shouldDraw = false;
        p.angleMode(p.DEGREES);
        p.setAttributes('antialias', false);
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
        }else if (p.key == upKey || p.key == downKey || p.key == leftKey || p.key == rightKey && !mustAnswer) {
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
                //var colVal = p.checkColl(player.gridPos.x + Math.sign(moveX), player.gridPos.y + Math.sign(moveY));
                if (Math.sign(moveX) != 0 || Math.sign(moveY) != 0) {
                    var nextCell = visibleGrid[player.gridPos.x + Math.sign(moveX)][player.gridPos.y + Math.sign(moveY)];
                    p.handleDialog(nextCell);
                    if (!p.checkColl(nextCell)) {
                        p.switchVisibility(player.gridPos.x, player.gridPos.y, player.gridPos.x + moveX, player.gridPos.y + moveY);
                        if(nextCell.hasOverlap){
                            nextCell.overlap();
                        }
                        if (p.checkInnerBoundsX(player.gridPos.x + moveX, player.gridPos.y + moveY, moveX) || p.checkInnerBoundsY(player.gridPos.x + moveX, player.gridPos.y + moveY, moveY)) {
                            player.move(moveX * cellOffset, moveY * cellOffset);
                        } else{
                            p.adjustVisibleGrid();
                        }
                    }
                }
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
                grid[_x][_y] = new p.Character(_x, _y,_pos, _img);
                break;
            case '#':
                grid[_x][_y] = new p.TallGrass(_x, _y,_pos, _img);
                break;
            case ',':
                grid[_x][_y] = new p.ShortGrass(_x, _y,_pos, _img);
                break;
            case "{":
                grid[_x][_y] = new p.Water(_x, _y,_pos, _img);
                break;
            case "}":
                grid[_x][_y] = new p.Water(_x, _y,_pos, _img);
                break;
            case "Π":
                grid[_x][_y] = new p.Door(_x, _y,_pos, _img);
                break;
            case "$":
                grid[_x][_y] = new p.PickAbleItem(_x, _y,_pos, _img);
                break;
            default:
                grid[_x][_y] = new p.Cell(_x, _y,_pos, _img);
                break;
        }
    }

    /** turns on the last cell and turns the next cell on */
    p.switchVisibility = function (_prevX, _prevY, _nextX, _nextY) {
        visibleGrid[_prevX][_prevY].shouldDraw = true;
        visibleGrid[_nextX][_nextY].shouldDraw = false;
    }

     /** checks to see if the cell the player is moving into has a collision event */
     p.checkColl = function (_nextCell) {
        if(_nextCell.collide){
            return true;
        } else{
            return false;
        }
    }

    p.handleDialog = function(_nextCell){
        if(_nextCell.data != undefined){
            if("needItem" in _nextCell.currentStory && _nextCell.isItem){
                if(p.checkGate(_nextCell)){
                    _nextCell.gateSuccess();
                } 
                p.addDialog(_nextCell);
            }  else {
                    p.addDialog(_nextCell);
                    if(_nextCell.hasBump){
                        var randSound = p.random(sounds);
                        randSound.play();
                        _nextCell.doBump = true;
                    }
                    if(_nextCell.collect){
                        inventory.push(new p.InventoryItem(_nextCell.img, _nextCell.name));
                        _nextCell.isCollected();
                    }
                
            }
        }
    }

    p.checkGate = function(_nextCell){
        if(p.checkInventory(_nextCell)){
            return true;
        } else{
            return false;
        }
    }

    /** checks if the cell needs an item to work */
    p.checkInventory = function (_nextCell) {
        if ("needItem" in _nextCell.currentStory) { //if the cell needs an item
            for (var i = 0; i < inventory.length; i++) { //check if the player has it
                if (inventory[i].img == _nextCell.currentStory.needItem) {
                    return true;
                } else{
                    return false;
                }
            }
        } else{
            return true;
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

    p.addDialog = function (_nextCell) {
        p.newDialogLine("-----------------", p.color(255));
        p.newDialogLine(_nextCell.currentStory.line, _nextCell.col);
        if("choices" in _nextCell.currentStory){
            p.newDialogLine(_nextCell.currentStory.choices[0] + " [1] or " + _nextCell.currentStory.choices[1] + " [2]", p.color(255));
            talkCellPos.x = _nextCell.gridPos.x;
            talkCellPos.y = _nextCell.gridPos.y;
            mustAnswer = true;
        }
    }

    p.addFailDialog = function (_nextCell) {
        p.newDialogLine("-----------------", p.color(255));
        p.newDialogLine(_nextCell.currentStory.gateFail, _nextCell.col);
    }

    /** add answer dialog */
    p.addAnswerDialog = function ( _index) {
        var cell = visibleGrid[talkCellPos.x][talkCellPos.y];
        var cellData = cell.currentStory;
        cell.doBump = true;
        var randSound = p.random(sounds);
        randSound.play();
        p.newDialogLine(cellData.choices[_index], p.color(255));
        if("gateFail" in cellData){
            if(p.checkGate(talkCellPos.x, talkCellPos.y) && _index == 0){
                p.newDialogLine(cellData.answers[_index], cell.col);
                cell.adjustDialog();
            } else if(_index == 1){
                p.newDialogLine(cellData.answers[_index], cell.col);
            }else{
                p.newDialogLine(cellData.gateFail, cell.col);
            }
        } else{
            p.newDialogLine(cellData.answers[_index], cell.col);
            cell.adjustDialog();
        }
        
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
                visibleGrid[x][y].gridPos.x = x;
                visibleGrid[x][y].gridPos.y = y;
                visibleGrid[x][y].basePos.x = visibleGrid[x][y].pos.x;
                visibleGrid[x][y].basePos.y = visibleGrid[x][y].pos.y;
            }
        }
    }

    p.Cell = class {
        constructor(_x, _y, _pos, _img) {
            this.pos = p.createVector(_pos.x, _pos.y);
            this.img = _img;
            this.startImg = _img;
            this.shouldDraw = true;

            this.gridPos = p.createVector(_x, _y);

            this.collide = false;

            this.basePos = p.createVector(_pos.x, _pos.y);

            if (this.img == ".") {
                this.col = p.color(100, 100, 100);
            } else if (this.img == '|') {
                this.col = p.color(100, 100, 100);
                this.collide = true;
            } else if (this.img == '-') {
                this.col = p.color(107, 76, 57);
            } else if (this.img == '〰') {
                this.col = p.color(48, 29, 16);
            } else if (this.img == '█') {
                this.col = p.color(79, 47, 45);
                this.collide = true;
            } else if (this.img == '=') {
                this.col = p.color(0, 148, 0);
                this.collide = true;
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

        constructor(_x, _y, _pos, _img) {
            super(_x, _y, _pos, _img);

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
        constructor(_x, _y, _pos, _img) {
            super(_x, _y, _pos, _img);

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
        constructor(_x, _y, _pos, _img) {
            super(_x, _y, _pos, _img);

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
        constructor(_x, _y, _pos, _img) {
            super(_x, _y, _pos, _img);
            this.col = p.color(176, 148, 63);
            this.collide = true;

            this.data = this.assignData();
            this.storyIndex = 0;
            this.currentStory = this.data[this.storyIndex];

            this.isItem = true;
        }

        assignData() {
            for (var i = 0; i < itemText.items.length; i++) {
                if (this.img == itemText.items[i].object) {
                    return itemText.items[i].data;
                }
            }
        }

        adjustDialog() {
            this.storyIndex = this.data[this.storyIndex].nextScene;
            this.currentStory = this.data[this.storyIndex];
        }

        gateSuccess(){
            this.adjustDialog();
            this.col = p.color(100, 100, 100);
            this.collide = false;
            this.img = ".";
            this.data = undefined;
        }

    }

    p.PickAbleItem = class extends p.Cell {
        constructor(_x, _y, _pos, _img) {
            super(_x, _y, _pos, _img);
            this.col = p.color(176, 148, 63);
            this.collect = true;
            this.col = p.color(0, 0, 255);
            this.data = this.assignData();
            this.storyIndex = 0;
            this.currentStory = this.data[this.storyIndex];

            this.name = this.currentStory.name;

            this.isItem = true;
        }

        assignData() {
            for (var i = 0; i < itemText.items.length; i++) {
                if (this.img == itemText.items[i].object) {
                    return itemText.items[i].data;
                }
            }
        }

        adjustDialog(){

        }

        isCollected() {
            this.img = ".";
            this.col = p.color(100, 100, 100);
            this.data = undefined;
        }

    }

    p.Character = class extends p.Cell {
        constructor(_x, _y, _pos, _img) {
            super(_x, _y, _pos, _img);
            this.nextScene = [];

            this.collide = true;

            this.animStart = 20;
            this.animTime = this.animStart;
            this.doBump = false;

            this.data = this.assignData();
            this.storyIndex = 0;

            this.currentStory = this.data[this.storyIndex];

            this.isItem = false;
            this.off = 0;

            if (this.img == '@') {
                this.col = p.color(255, 0, 0);
            } else if (this.img == 'R') {
                this.col = p.color(171, 235, 52);
            }

            this.interact = true;
            this.hasBump = true;

            this.animDir = 1;
            this.animFactor = 1.2;

            this.animFrame = 0;
            this.animMod = 1;
        }

        bumpAnim() {
            this.animTime--;
            this.off = this.off + 0.1;
            this.sign = Math.round(p.random(-1, 1));
            this.pos.y = this.pos.y + (this.sign * p.noise(this.off));
            if (this.animTime < 0) {
                this.pos = p.createVector(this.basePos);
                this.off = 0;
                this.animTime = this.animStart;
                this.doBump = false;
            }
        }

        talkAnim(){
            this.animTime--;
            var dir = this.animDir;
            dir = dir * this.animFactor;
            if(this.pos.y > this.basePos.y + 2 && this.animDir > 0){
                this.animDir = -this.animDir;
            } else if(this.pos.y < this.basePos.y - 2 && this.animDir < 1){
                this.animDir = -this.animDir;
            }
            this.pos.y = this.pos.y + dir;
            if(this.animTime < 0){
                this.pos = p.createVector(this.basePos.x, this.basePos.y);
                this.animTime = this.animStart;
                this.animDir = 1;
                this.doBump = false;
            }
        }

        shakeAnim(){
            this.animTime--;
            var dir = this.animDir;
            dir = dir * this.animFactor;
            if(this.pos.x > this.basePos.x + 2 && this.animDir > 0){
                this.animDir = -this.animDir;
            } else if(this.pos.x < this.basePos.x - 2 && this.animDir < 1){
                this.animDir = -this.animDir;
            }
            this.pos.x = this.pos.x + dir;
            if(this.animTime < 0){
                this.pos = p.createVector(this.basePos.x, this.basePos.y);
                this.animTime = this.animStart;
                this.animDir = 1;
                this.doBump = false;
            }
        }

        perishAnim(){
            p.push();
            p.fill(this.col);
            this.pos = p.createVector(0, 0);
            p.translate(this.basePos.x, this.basePos.y - 10);
            p.rotate(90);
            p.text(this.img, this.pos.x, this.pos.y);
            p.pop();
        }

        display() {
            if (this.shouldDraw) {
                if (this.doBump) {
                    this.talkAnim();
                } 
                // if(this.data[this.storyIndex].animWalk != null){
                //     this.walkAnim();
                // }
                super.display();
            }
        }

        // walkAnim(){ 
        //     console.log("run");
        //     this.animTime--;
        //     if(this.animTime < 0){
        //         var x = this.data[this.storyIndex].animWalk[this.animFrame][0];
        //         var y = this.data[this.storyIndex].animWalk[this.animFrame][1];
        //         var newPos = p.createVector(x * cellOffset, y * cellOffset);
        //         this.pos = p.createVector(this.pos.x + newPos.x, this.pos.y + newPos.y);
        //         this.animFrame += this.animMod;
        //         this.animTime = this.animStart;
        //         if(this.animFrame >= this.data[this.storyIndex].animWalk.length){
        //             this.animFrame = 0;
        //         } 
        //     }
        // }

        assignData() {
            for (var i = 0; i < text.characters.length; i++) {
                if (this.img == text.characters[i].name) {
                    return text.characters[i].data;
                }
            }
        }

        adjustDialog() {
            this.storyIndex = this.data[this.storyIndex].nextScene;
            this.currentStory = this.data[this.storyIndex];
        }

        gateSuccess(){
            adjustDialog();
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
            p.text(this.txt, this.pos.x, this.pos.y, 400);
        }
    }

}