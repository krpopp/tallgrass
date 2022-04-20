let sketch = function (p) {



    //to do
    //dynamic player placement
    //story lol
    //don't run animation code unless on screen


    var grid = [];

    var level;
    var text;

    var gridWidth;
    var gridHeight;
    var cellOffset = 25;
    var gridOffset = 40;

    var visibleGrid = [];

    var gridWidthVisible = 30;
    var gridHeightVisible = 30;
    var gridXVisible = 0;
    var gridYVisible = 0;

    var gridXLimit;
    var gridYLimit;

    var minX;
    var minY;
    var maxX;
    var maxY;

    var player;
    var playerStartX = 15;
    var playerStartY = 15;

    var upKey = 'w';
    var downKey = 's';
    var rightKey = 'd';
    var leftKey = 'a';

    var showDialog = false;
    var dialogToShow = [];
    var dialogX = 800;
    var dialogY = 50;
    var dialogOffset = 50;

    var dialogScreenLimit = 13;

    var font;

    p.preload = function () {
        level = p.loadTable('leveltest.csv');
        text = p.loadJSON('text.json');
        wallSheet = p.loadImage('assets/walls.png');
        font = p.loadFont('myprime2.ttf');
    }

    p.setup = function () {
        p.createCanvas(1700, 800);

        gridWidth = level.getColumnCount();
        gridHeight = level.getRowCount();

        minX = gridWidthVisible * .3;
        minY = gridHeightVisible * .3;
        maxX = gridWidthVisible * .7;
        maxY = gridHeightVisible * .7;

        gridXLimit = gridWidth - (gridWidthVisible - maxX);
        gridYLimit = gridHeight - (gridHeightVisible - maxY);

        for (var x = 0; x < gridWidth; x++) {
            grid[x] = [];
            for (var y = 0; y < gridHeight; y++) {
                grid[x][y] = new p.Cell(x * cellOffset + gridOffset, y * cellOffset + gridOffset, level.get(y, x));
            }
        }

        for (var x = 0; x < gridWidthVisible; x++) {
            visibleGrid[x] = [];
            for (var y = 0; y < gridHeightVisible; y++) {
                visibleGrid[x][y] = grid[x][y];
            }
        }

        player = new p.Player(visibleGrid[playerStartX][playerStartY].x, visibleGrid[playerStartX][playerStartY].y, "O", playerStartX, playerStartY);

        visibleGrid[player.gridX][player.gridY].shouldDraw = false;
        p.textFont(font);
    };

    p.draw = function () {
        p.clear();
        p.textSize(24);
        // for(var x = 0; x < gridWidth; x++){
        //     for(var y = 0; y < gridHeight; y++){
        //         grid[x][y].display();
        //     }
        // }
        for (var x = 0; x < gridWidthVisible; x++) {
            for (var y = 0; y < gridHeightVisible; y++) {
                visibleGrid[x][y].display();
            }
        }
        p.textSize(18);
        p.fill(255);
        player.display();
        if (showDialog) {
            for (var i = 0; i < dialogToShow.length; i++) {
                dialogToShow[i].display();
            }
        }
    };

    p.keyPressed = function () {
        if (p.key == upKey, downKey, leftKey, rightKey) {
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
                if (Math.sign(moveX) != 0) {
                    if (colVal == 0 || colVal == 3 || colVal == 4) {
                        p.switchVisibility(player.gridX, player.gridY, player.gridX + moveX, player.gridY + moveY);
                        if (p.checkInnerBoundsX(player.gridX + moveX, player.gridY + moveY, moveX)) {
                            player.move(moveX * cellOffset, moveY * cellOffset);
                        }
                    } 
                }
                if (Math.sign(moveY) != 0) {
                    if (colVal == 0 || colVal == 3 || colVal == 4) {
                        p.switchVisibility(player.gridX, player.gridY, player.gridX + moveX, player.gridY + moveY);
                        if (p.checkInnerBoundsY(player.gridX + moveX, player.gridY + moveY, moveY)) {
                            player.move(moveX * cellOffset, moveY * cellOffset);
                        }
                    }
                }
                if (colVal == 3) {
                    grid[player.gridX][player.gridY].isCollected();
                }
                p.adjustVisibleGrid();
            }
        }
    }

    p.mouseWheel = function (event) {
        if(showDialog){
            if (event.delta < 0) {
                if(dialogToShow.length > dialogScreenLimit){
                    dialogY += event.delta;
                    if(dialogToShow[dialogToShow.length - dialogScreenLimit].y < 50){
                        dialogY = 50 - ((dialogToShow.length - dialogScreenLimit) * dialogOffset);
                    }
                }
            } else if (event.delta > 0) {
                if(dialogToShow.length > dialogScreenLimit){
                    dialogY += event.delta;
                    if(dialogToShow[0].y > 50){
                        dialogY = 50;
                    }
                }
            }
            for(var i = 0; i < dialogToShow.length; i++){
                dialogToShow[i].y = dialogY + (i * dialogOffset);
            }
        }
    }

    p.switchVisibility = function (_prevX, _prevY, _nextX, _nextY) {
        visibleGrid[_prevX][_prevY].shouldDraw = true;
        visibleGrid[_nextX][_nextY].shouldDraw = false;
    }

    p.checkColl = function (_cellX, _cellY) {
        if (visibleGrid[_cellX][_cellY].wall) {
            //p.addDialog(_cellX, _cellY);
            return 1;
        } else if (visibleGrid[_cellX][_cellY].interact || visibleGrid[_cellX][_cellY].door) {
            p.addDialog(_cellX, _cellY);
            return 2;
        } else if (visibleGrid[_cellX][_cellY].collect) {
            p.addDialog(_cellX, _cellY);
            return 3;
        } else if(visibleGrid[_cellX][_cellY].hasOverlap){
            visibleGrid[_cellX][_cellY].overlap();
            return 4;
        } else {
            return 0;
        }
    }

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
        if(_dir > 0 && gridXVisible == 0){
            if(_newX < maxX){
                return true;
            } else if(_newX >= maxX){
                gridXVisible++;
                return false;
            }
        }
        if(_dir > 0 && gridXVisible > 0){
            if(maxX + gridXVisible < gridXLimit){
                gridXVisible++;
                return false;
            } else{
                return true;
            }
        }
    }

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
            } else  if(_newY >= maxY){
                gridYVisible++;
                return false;
            }
        } 
        if(_dir > 0 && gridYVisible > 0){
            if(maxY + gridYVisible < gridYLimit){
                gridYVisible++;
                return false;
            } else{
                return true;
            }
        }
    }

    p.checkOuterBounds = function (_newX, _newY) {
        if (_newX < 0 || _newX >= gridWidthVisible) {
            return false;
        } else if (_newY < 0 || _newY >= gridHeightVisible) {
            return false;
        } else {
            return true;
        }
    }

    p.addDialog = function (_cellX, _cellY) {
        var plsText = visibleGrid[_cellX][_cellY].dialog;
        dialogToShow.push(new p.Dialog(dialogX, dialogY + (dialogToShow.length * dialogOffset), plsText));
        dialogToShow.push(new p.Dialog(dialogX, dialogY + (dialogToShow.length * dialogOffset), "-----------------"));
        if(dialogToShow[dialogToShow.length-1].y > p.height - dialogOffset){
            dialogY = p.height - (dialogToShow.length * dialogOffset);
            for(var i = 0; i < dialogToShow.length; i++){
                dialogToShow[i].y = dialogY + (i * dialogOffset);
            }
        }
        showDialog = true;
    }

    p.adjustVisibleGrid = function () {
        for (var x = 0; x < gridWidthVisible; x++) {
            for (var y = 0; y < gridHeightVisible; y++) {
                visibleGrid[x][y] = grid[gridXVisible + x][gridYVisible + y];
                visibleGrid[x][y].x = x * cellOffset + gridOffset;
                visibleGrid[x][y].y = y * cellOffset + gridOffset;
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
            this.interact = false;
            this.collect = false;
            this.door = false;

            this.hasOverlap = false;
            this.overlapStart = 100;
            this.overlapCount = 0;
            this.overlapImg;

            this.hasAnim = false;
            this.animFrames = [];
            this.animStart;
            this.animCount;
            this.frameIndex = 0;

            this.hasAmbiant = false;
            this.baseX = _x;
            this.baseY = _y;
            this.ambiantStart;
            this.ambiantCounter;

            this.dialog;
            if (this.img == ".") {
                this.col = p.color(100, 100, 100);
            } else if(this.img == ','){
                this.col = p.color(50, 168, 82);
                this.hasAmbiant = true;
                this.ambiantStart = p.random(100, 200);
                this.ambiantCounter = this.ambiantStart;
                this.off = 0;
            } else if(this.img == '#'){
                this.col = p.color(209, 165, 63);
                this.hasOverlap = true;
                this.overlapImg = '≥';
            } else if(this.img == '|'){
                this.col = p.color(100, 100, 100);
            } else if(this.img == '-'){
                this.col = p.color(107, 76, 57);
            } else if(this.img == '〰'){
                this.col = p.color(48, 29, 16);
            } else if(this.img == '}' || this.img == '{'){
                this.col = p.color(61, 77, 184);
                this.hasAnim = true;
                this.animStart = 10;
                this.animCount = this.animStart;
                if(this.img == '}'){
                    this.animFrames = ['}', '{'];
                } else{
                    this.animFrames = ['{', '}'];
                }
            } else if (this.img == '█') {
                this.col = p.color(79, 47, 45);
                //this.dialog = this.assignDialog();
                this.wall = true;
            } else if (this.img == '@') {
                this.col = p.color(255, 0, 0);
                this.dialog = this.assignDialog();
                this.interact = true;
            } else if (this.img == '$') {
                this.col = p.color(0, 0, 255);
                this.dialog = this.assignDialog();
                this.collect = true;
            } else if(this.img == 'Π'){
                this.col = p.color(176, 148, 63);
                this.dialog = this.assignDialog();
                this.door = true;
            }else if(this.img == '='){
                this.col = p.color(0, 148, 0);
                //this.dialog = this.assignDialog();
                this.wall = true;
            }else {
                this.col = p.color(255, 255, 255);
            }
        }

        display() {
            if (this.shouldDraw) {
                    p.fill(this.col);
                if(this.hasAnim){
                    this.animate();
                    p.text(this.animFrames[this.frameIndex], this.x, this.y);
                } else{
                    p.text(this.img, this.x, this.y);
                }
                if(this.hasAmbiant){
                    this.ambiantMove();
                }
                if(this.hasOverlap && this.overlapCount > 0){
                    this.overlapTimer();
                }
            }
        }

        assignDialog() {
            for (var i = 0; i < text.dialog.scene.length; i++) {
                //console.log(text.dialog.scene[i]);
                if (this.img == text.dialog.scene[i].name) {
                    return text.dialog.scene[i].line;
                }
            }
        }

        overlap(){
            this.img = this.overlapImg;
            this.overlapCount = this.overlapStart;
        }

        overlapTimer(){
            this.overlapCount--;
            if(this.overlapCount <= 0){
                this.img = this.startImg;
                this.overlapCount = 0;
            }
        }

        animate(){
            this.animCount--;
            if(this.animCount < 0){
                this.frameIndex++;
                if(this.frameIndex >= this.animFrames.length){
                    this.frameIndex = 0;
                }
                this.animCount = this.animStart;
            }
        }

        ambiantMove(){
            this.ambiantCounter--;
            if(this.ambiantCounter < 0){
                this.off = this.off + 0.1;
                this.sign = Math.round(p.random(-1, 1));
                this.x = this.x + (this.sign * p.noise(this.off));
                this.y = this.y + (this.sign * p.noise(this.off));
                console.log(this.x);
                if(this.ambiantCounter < -20){
                    this.x = this.baseX;
                    this.y = this.baseY;
                    this.ambiantCounter = this.ambiantStart;
                    this.off = 0;
                }
            }
        }

        isCollected() {
            this.img = "#";
            this.col = p.color(100, 100, 100);
            this.collect = false;
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
            //p.rectMode(p.CENTER);
            //p.image(this.img, this.x, this.y);
            p.text(this.img, this.x, this.y);
        }

        move(_x, _y) {
            this.x += _x;
            this.y += _y;
            this.gridX += Math.sign(_x);
            this.gridY += Math.sign(_y);
        }
    }

    p.Dialog = class{
        constructor(_x, _y, _txt){
            this.x = _x;
            this.y = _y;
            this.txt = _txt;
        }

        display(){
            p.text(this.txt, this.x, this.y);
        }
    }

}