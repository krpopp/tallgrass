let sketch = function (p) {

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

    var cellType;


    p.preload = function () {
        level = p.loadTable('level.csv');
        text = p.loadJSON('text.json');
        wallSheet = p.loadImage('assets/walls.png');
    }

    p.setup = function () {
        p.createCanvas(1700, 800);

        gridWidth = level.getColumnCount();
        gridHeight = level.getRowCount();

        minX = gridWidthVisible * .3;
        minY = gridHeightVisible * .3;
        maxX = gridWidthVisible * .7;
        maxY = gridHeightVisible * .7;

        gridXLimit = maxX;
        gridYLimit = maxY;

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
        p.textFont("IBM Plex Mono");
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
                    moveY = -1 * cellOffset;
                    break;
                case downKey:
                    moveY = 1 * cellOffset;
                    break;
                case rightKey:
                    moveX = 1 * cellOffset;
                    break;
                case leftKey:
                    moveX = -1 * cellOffset;
                    break;
            }
            if (p.checkOuterBounds(player.x + moveX, player.y + moveY)) {
                var colVal = p.checkColl(player.gridX + Math.sign(moveX), player.gridY + Math.sign(moveY));
                if (Math.sign(moveX) != 0) {
                    if (colVal == 0 || colVal == 3) {
                        p.switchVisibility(player.gridX, player.gridY, player.gridX + Math.sign(moveX), player.gridY + Math.sign(moveY));
                        if (p.checkInnerBoundsX(player.x + moveX, player.y + moveY, Math.sign(moveX))) {
                            player.move(moveX, moveY);
                        }
                    }
                }
                if (Math.sign(moveY) != 0) {
                    if (colVal == 0 || colVal == 3) {
                        p.switchVisibility(player.gridX, player.gridY, player.gridX + Math.sign(moveX), player.gridY + Math.sign(moveY));
                        if (p.checkInnerBoundsY(player.x + moveX, player.y + moveY, Math.sign(moveY))) {
                            player.move(moveX, moveY);
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
        } else {
            return 0;
        }
    }

    p.checkInnerBoundsX = function (_newX, _newY, _dir) {
        if (_dir < 0 && gridXVisible == 0) {
            return true;
        } else if (_dir < 0 && gridXVisible > 0) {
            if (_newX < visibleGrid[minX][minY].x) {
                gridXVisible--;
                return false;
            } else {
                return true;
            }
        }
        if (_dir > 0 && gridXVisible == 0) {
            if (_newX > visibleGrid[maxX][maxY].x) {
                gridXVisible++;
                return false;
            } else {
                return true;
            }
        } else if (_dir > 0 && gridXVisible > 0) {
            if (_newX > visibleGrid[maxX][maxY].x && gridXVisible < gridXLimit) {
                gridXVisible++;
                return false;
            } else if (gridXVisible == gridXLimit) {
                return true;
            } else {
                return true;
            }
        }
    }

    p.checkInnerBoundsY = function (_newX, _newY, _dir) {
        if (_dir < 0 && gridYVisible == 0) {
            return true;
        } else if (_dir < 0 && gridYVisible > 0) {
            if (_newY < visibleGrid[minX][minY].y) {
                gridYVisible--;
                return false;
            } else {
                return true;
            }
        }
        if (_dir > 0 && gridYVisible == 0) {
            if (_newY > visibleGrid[maxX][maxY].y) {
                gridYVisible++;
                return false;
            } else {
                return true;
            }
        } else if (_dir > 0 && gridYVisible > 0) {
            if (_newY > visibleGrid[maxX][maxY].y && gridYVisible < gridYLimit) {
                gridYVisible++;
                return false;
            } else if (gridYVisible == gridYLimit) {
                return true;
            } else {
                return true;
            }
        }
    }


    p.checkOuterBounds = function (_newX, _newY) {
        if (_newX < visibleGrid[0][0].x || _newX > visibleGrid[visibleGrid.length - 1][visibleGrid.length - 1].x) {
            return false;
        } else if (_newY < visibleGrid[0][0].y || _newY > visibleGrid[visibleGrid.length - 1][visibleGrid.length - 1].y) {
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
            this.shouldDraw = true;
            this.wall = false;
            this.interact = false;
            this.collect = false;
            this.door = false;
            this.dialog;
            if (this.img == "#") {
                this.col = p.color(100, 100, 100);
            } else if (this.img == "%") {
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
            } else if(this.img == 'X'){
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
                p.text(this.img, this.x, this.y);
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