let sketch = function (p) {

    //#region To Do
    //to do
    //story lol
    //i think there's leaks or smthg
    //smooth scroll on text
    //scroll bar on text
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
    //jump to end of dialog list when new line
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
    /** Grid x starting point for the visible grid. */
    var gridXVisible = 0;
    /** Grid y starting point for the visible grid. */
    var gridYVisible = 0;

    /** Rightmost boarder that the camera will stop moving at. */
    var gridXLimit;
    /** Bottommost boarder that the camera will stop moving at. */
    var gridYLimit;

    /** Inner left boarder of where camera should start moving. */
    var minX;
    /** Inner top boarder of where camera should start moving. */
    var minY;
    /** Inner right boarder of where camera should start moving. */
    var maxX;
    /** Inner bottom boarder of where camera should start moving. */
    var maxY;

    /** Object of player. */
    var player;
    /** X position the player begins at. */
    var playerStartX = 33;
    /** Y position the player begins at. */
    var playerStartY = 4;

    var upKey = 'w';
    var downKey = 's';
    var rightKey = 'd';
    var leftKey = 'a';

    /** Indicates if dialog should draw to the canvas. */
    var showDialog = true;
    /** Array of all dialog text to draw. */
    var dialogToShow = [];
    /** X position the dialog starts at. */
    var dialogX = 800;
    /** Y position the dialog starts at. */
    var dialogY = 50;
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
    /** Reference to the x position of the character the player is currently talking to. */
    var talkCellX = -10;
    /** Reference to the y position of the character the player is currently talking to. */
    var talkCellY = -10;

    /** Array of all the items the player is holding. */
    var inventory = [];

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
        minX = gridWidthVisible * .3;
        minY = gridHeightVisible * .3;
        maxX = gridWidthVisible * .7;
        maxY = gridHeightVisible * .7;
        gridXLimit = gridWidth - (gridWidthVisible - maxX);
        gridYLimit = gridHeight - (gridHeightVisible - maxY);
        //#endregion

        //loop through the grid to find what each cell is
        for (var x = 0; x < gridWidth; x++) {
            grid[x] = [];
            for (var y = 0; y < gridHeight; y++) {
                switch (level.get(y, x)) {
                    case '@':
                    case 'R':
                        grid[x][y] = new p.Character(x * cellOffset + gridOffset, y * cellOffset + gridOffset, level.get(y, x));
                        break;
                    case '#':
                        grid[x][y] = new p.TallGrass(x * cellOffset + gridOffset, y * cellOffset + gridOffset, level.get(y, x));
                        break;
                    case ',':
                        grid[x][y] = new p.ShortGrass(x * cellOffset + gridOffset, y * cellOffset + gridOffset, level.get(y, x));
                        break;
                    case "{":
                        grid[x][y] = new p.Water(x * cellOffset + gridOffset, y * cellOffset + gridOffset, level.get(y, x));
                        break;
                    case "}":
                        grid[x][y] = new p.Water(x * cellOffset + gridOffset, y * cellOffset + gridOffset, level.get(y, x));
                        break;
                    case "Π":
                        grid[x][y] = new p.Door(x * cellOffset + gridOffset, y * cellOffset + gridOffset, level.get(y, x));
                        break;
                    case "$":
                        grid[x][y] = new p.PickAbleItem(x * cellOffset + gridOffset, y * cellOffset + gridOffset, level.get(y, x));
                        break;
                    default:
                        grid[x][y] = new p.Cell(x * cellOffset + gridOffset, y * cellOffset + gridOffset, level.get(y, x));
                        break;
                }
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
        var yCheck = maxY;
        var tempPlayerY = playerStartY;
        while(tempPlayerY >= yCheck){
            playerStartY--;
            gridYVisible++;
            yCheck++;
        }
        var xCheck = maxX;
        var tempPlayerX = playerStartX;
        while(tempPlayerX >= xCheck){
            playerStartX--;
            gridXVisible++;
            xCheck++;
        }
        //#endregion

        player = new p.Player(visibleGrid[playerStartX][playerStartY].x, visibleGrid[playerStartX][playerStartY].y, "O", playerStartX, playerStartY);
        p.adjustVisibleGrid();
        visibleGrid[player.gridX][player.gridY].shouldDraw = false;
        p.angleMode(p.DEGREES);
        p.rectMode(p.CENTER);
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
            if (p.checkOuterBounds(player.gridX + moveX, player.gridY + moveY)) {
                var colVal = p.checkColl(player.gridX + Math.sign(moveX), player.gridY + Math.sign(moveY));
                if (Math.sign(moveX) != 0 || Math.sign(moveY) != 0) {
                    if (colVal == 0 || colVal == 3 || colVal == 4) {
                        p.switchVisibility(player.gridX, player.gridY, player.gridX + moveX, player.gridY + moveY);
                        if (p.checkInnerBoundsX(player.gridX + moveX, player.gridY + moveY, moveX) || p.checkInnerBoundsY(player.gridX + moveX, player.gridY + moveY, moveY)) {
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

        if(p.key == 'i' || p.key == 'I'){
            p.addInventory();
        }
    }

    p.mouseWheel = function (event) {
        if (showDialog) {
            if (event.delta < 0) {
                if (dialogToShow.length > dialogScreenLimit) {
                    dialogY += event.delta;
                    if (dialogToShow[dialogToShow.length - dialogScreenLimit].y < 50) {
                        dialogY = 50 - ((dialogToShow.length - dialogScreenLimit) * dialogOffset);
                    }
                }
            } else if (event.delta > 0) {
                if (dialogToShow.length > dialogScreenLimit) {
                    dialogY += event.delta;
                    if (dialogToShow[0].y > 50) {
                        dialogY = 50;
                    }
                }
            }
            for (var i = 0; i < dialogToShow.length; i++) {
                dialogToShow[i].y = dialogY + (i * dialogOffset);
            }
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
    p.checkInventory = function(_cellX, _cellY){
        if(visibleGrid[_cellX][_cellY].neededItem != 0){ //if the cell needs an item
            for(var i = 0; i < inventory.length; i++){ //check if the player has it
                if(inventory[i].img == visibleGrid[_cellX][_cellY].neededItem){
                    visibleGrid[_cellX][_cellY].adjustDialog();
                    p.addItemDialog(_cellX, _cellY);
                    visibleGrid[_cellX][_cellY].openDoor();
                } 
            }
        } 
    }

    /** checks if the player has met the camera bounds on the X */
    p.checkInnerBoundsX = function (_newX, _newY, _dir) {
        if (_dir < 0 && gridXVisible == 0) {
            return true;
        } else if (_dir < 0 && gridXVisible > 0) {
            if (_newX < minX) {
                gridXVisible--;
                return false;
            } else {
                return true;
            }
        }
        if (_dir > 0 && gridXVisible == 0) {
            if (_newX < maxX) {
                return true;
            } else if (_newX >= maxX) {
                gridXVisible++;
                return false;
            }
        }
        if (_dir > 0 && gridXVisible > 0) {
            if (maxX + gridXVisible < gridXLimit && _newX > maxX) {
                gridXVisible++;
                return false;
            } else {
                return true;
            }
        }
    }

    /** checks if the player has met the camera bounds on the Y*/
    p.checkInnerBoundsY = function (_newX, _newY, _dir) {
        if (_dir < 0 && gridYVisible == 0) {
            return true;
        } else if (_dir < 0 && gridYVisible > 0) {
            if (_newY < minY) {
                gridYVisible--;
                return false;
            } else {
                return true;
            }
        }
        if (_dir > 0 && gridYVisible == 0) {
            if (_newY < maxY) {
                return true;
            } else if (_newY >= maxY) {
                gridYVisible++;
                return false;
            }
        }
        if (_dir > 0 && gridYVisible > 0) {
            if (maxY + gridYVisible < gridYLimit && _newY > maxY) {
                gridYVisible++;
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
    //i don't think i need this?
    p.shiftDialog = function(){
        if (dialogToShow[dialogToShow.length - 1].y > p.height - dialogOffset) {
            dialogY = p.height - (dialogToShow.length * dialogOffset);
            for (var i = 0; i < dialogToShow.length; i++) {
                dialogToShow[i].y = dialogY + (i * dialogOffset);
            }
        }
    }

    /** adding a new dialog line and its color */
    p.newDialogLine = function(_text, _color){
        dialogToShow.push(new p.Dialog(dialogX, dialogY + (dialogToShow.length * dialogOffset), _text, _color));
    }

    /** add item dialog */
    p.addItemDialog = function(_cellX, _cellY){
        p.newDialogLine("-----------------", p.color(255));
        p.newDialogLine(visibleGrid[_cellX][_cellY].dialog, visibleGrid[_cellX][_cellY].col);
        //p.shiftDialog();
    }

    /** add character dialog */
    p.addDialog = function (_cellX, _cellY) {
        var choices = visibleGrid[_cellX][_cellY].choices;
        p.newDialogLine("-----------------", p.color(255));
        p.newDialogLine(visibleGrid[_cellX][_cellY].dialog, visibleGrid[_cellX][_cellY].col);
        if (choices.length > 0) {
            p.newDialogLine(choices[0] + " [1] or " + choices[1] + " [2]", p.color(255));
            talkCellX = _cellX;
            talkCellY = _cellY;
            mustAnswer = true;
        } else {
            visibleGrid[talkCellX][talkCellY].adjustDialog();
        }
        //p.shiftDialog();
    }

    /** add answer dialog */
    p.addAnswerDialog = function (_index) {
        p.newDialogLine(visibleGrid[talkCellX][talkCellY].choices[_index], p.color(255));
        p.newDialogLine(visibleGrid[talkCellX][talkCellY].answers[_index], visibleGrid[talkCellX][talkCellY].col);
        //p.shiftDialog();
        visibleGrid[talkCellX][talkCellY].adjustDialog();
        mustAnswer = false;
    }

    /** add answer warning dialog */
    p.addMustAnswerDialog = function () {
        p.newDialogLine("You must answer the question.", visibleGrid[talkCellX][talkCellY].col);
        //p.shiftDialog();
    }

    /** add inventory text to the dialog */
    p.addInventory = function(){
        var inventoryText = "I have: ";
        if(inventory.length > 0){
            for(var i = 0; i <= inventory.length; i++){
                if(i == inventory.length){
                    inventoryText = inventoryText + ".";
                } else if(i == 0){
                    inventoryText = inventoryText + " " + inventory[i].name;
                }else{
                    inventoryText = inventoryText + ", " + inventory[i].name;
                }
            }
        } else{
            inventoryText = inventoryText + "nothing.";
        }
        p.newDialogLine(inventoryText, p.color(255));
    }

    /** move the "camera" over the grid */
    p.adjustVisibleGrid = function () {
        for (var x = 0; x < gridWidthVisible; x++) {
            for (var y = 0; y < gridHeightVisible; y++) {
                visibleGrid[x][y] = grid[gridXVisible + x][gridYVisible + y];
                visibleGrid[x][y].x = x * cellOffset + gridOffset;
                visibleGrid[x][y].y = y * cellOffset + gridOffset;
                visibleGrid[x][y].baseX = visibleGrid[x][y].x;
                visibleGrid[x][y].baseY = visibleGrid[x][y].y;
            }
        }
    }

    p.Cell = class {
        constructor(_x, _y, _img) {
            this.x = _x;
            this.y = _y;
            this.img = _img;
            this.startImg = _img;
            this.shouldDraw = true;

            this.wall = false;

            this.baseX = _x;
            this.baseY = _y;

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
            if(this.shouldDraw){
                p.fill(this.col);
                p.text(this.img, this.x, this.y);
            }
        }

    }

    p.TallGrass = class extends p.Cell {

        constructor(_x, _y, _img) {
            super(_x, _y, _img);

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
                this.x = 0;
                this.y = 0;
                p.translate(this.baseX, this.baseY);
                p.shearX(this.sheerAmt);
                this.sheerTime--;
                if (this.sheerTime < 0) {
                    this.sheerAmt += this.sheerSpd;
                    if (this.sheerAmt > 5 || this.sheerAmt < -5) {
                        this.sheerSpd = -this.sheerSpd;
                    }
                    this.sheerTime = this.sheerStart;
                }
                p.text(this.img, this.x, this.y);
                p.pop();
                if (this.overlapCount > 0) {
                    this.overlapTimer();
                }
            }
        }

    }

    p.ShortGrass = class extends p.Cell {
        constructor(_x, _y, _img) {
            super(_x, _y, _img);

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
                this.x = this.x + (this.sign * p.noise(this.off));
                this.y = this.y + (this.sign * p.noise(this.off));
                if (this.ambiantCounter < -20) {
                    this.x = this.baseX;
                    this.y = this.baseY;
                    this.ambiantCounter = this.ambiantStart;
                    this.off = 0;
                }
            }
        }
    }

    p.Water = class extends p.Cell {
        constructor(_x, _y, _img) {
            super(_x, _y, _img);

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
            if(this.shouldDraw){
                this.animate();
                p.fill(this.col);
                p.text(this.animFrames[this.frameIndex], this.x, this.y);
            }
        }
    }

    p.Door = class extends p.Cell{
        constructor(_x, _y, _img){
            super(_x, _y, _img);
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

        openDoor(){
            this.col = p.color(100, 100, 100);
            this.door = false;
            this.img = ".";
            this.dialog = "";
        }
    }

    p.PickAbleItem = class extends p.Cell{
        constructor(_x, _y, _img){
            super(_x, _y, _img);
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
        constructor(_x, _y, _img) {
            super(_x, _y, _img);
            this.allDialog = [];
            this.choices;
            this.answers;
            this.nextScene = [];

            this.bumpStart = 20;
            this.bumpTime = this.bumpStart;
            this.doBump = false;

            this.storyIndex = 0;

            this.off = 0;

            if(this.img == '@'){
                this.col = p.color(255, 0, 0);
            }  else if (this.img == 'R'){
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
                this.x = this.baseX;
                this.y = this.baseY;
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

    p.InventoryItem = class{
        constructor(_img, _name){
            this.img = _img;
            this.name = _name;
        }
    }

    p.Player = class {
        constructor(_x, _y, _img, _gX, _gY) {
            this.x = _x;
            this.y = _y;
            this.gridX = _gX;
            this.gridY = _gY;
            this.img = _img;
        }

        display() {
            p.text(this.img, this.x, this.y);
        }

        move(_x, _y) {
            this.x += _x;
            this.y += _y;
            this.gridX += Math.sign(_x);
            this.gridY += Math.sign(_y);
        }
    }

    p.Dialog = class {
        constructor(_x, _y, _txt, _color) {
            this.x = _x;
            this.y = _y;
            this.col = _color;
            this.txt = _txt;
        }

        display() {
            p.fill(this.col);
            p.text(this.txt, this.x, this.y);
        }
    }

}