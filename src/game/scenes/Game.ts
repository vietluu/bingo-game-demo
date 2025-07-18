import { EventBus } from "../EventBus";
import { Scene, Tweens } from "phaser";
export class Game extends Scene {
    bingoCard: Array<{
        number: number | "FREE";
        graphics: Phaser.GameObjects.Graphics;
        text: Phaser.GameObjects.Text;
        interactiveRect: Phaser.GameObjects.Rectangle;
        star?: Phaser.GameObjects.Image;
        marked: boolean;
        x: number;
        y: number;
    }> = [];

    numberButtons: Array<{
        circle: Phaser.GameObjects.Arc;
        text: Phaser.GameObjects.Text;
        drawn: boolean;
    }> = [];

    drawnNumbers: Set<number> = new Set();
    drawButton!: Phaser.GameObjects.Text;
    replayButton!: Phaser.GameObjects.Text;
    bingoText!: Phaser.GameObjects.Text;
    confetti!: Phaser.GameObjects.Image;
    nearBingoText!: Phaser.GameObjects.Text;
    freeIndex = 12;
    interval: number | undefined;
    bingoSound: Phaser.Sound.BaseSound | undefined;
    gameSound: Phaser.Sound.BaseSound | undefined;
    activeSound: Phaser.Sound.BaseSound | undefined;
    numbers: number[] = [];
    needReload: boolean = false;
    rexUI: any;
    constructor() {
        super("Game");
     
    }
    
    preload() {
        this.bingoSound = this.sound.add("bingoSound", {
            loop: false,
            volume: 1,
        });
        this.gameSound = this.sound.add("gamePlay", {
            loop: true,
            volume: 0.5,
        });
        this.activeSound = this.sound.add("activeSound", {
            loop: false,
            volume: 1,
        });
        this.sound.pauseAll();
        this.gameSound.play();
        this.rexUI = this.load.scenePlugin({
            key: "rexuiplugin",
            url: "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js",
            sceneKey: "rexUI"
        })
    
    }
 createGrid = function (scene:any, orientation:any) {
    var sizer = scene.rexUI.add.sizer({
        orientation: 'x',
        space: {
            left: 3,
            right: 3,
            top: 3,
            bottom: 3,
            item: 8,
        },
    })
        .addBackground(scene.rexUI.add.roundRectangle(0, 0, 10, 10, 0, 0x000000, 0))

    for (var i = 0; i < 6; i++) {
        sizer.add(scene.rexUI.add.label({
            width: 60, height: 60,

            background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 14, 0x000000, 0.05),
            text: scene.add.text(0, 0, `${i + 1}`, {
                fontSize: 18
            }),
            
            align: 'center',
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
            }
        }));
    }

    return sizer;
}
    generateUniqueNumbers(count: number, min: number, max: number): number[] {
        const numbers: number[] = [];
        const used = new Set<number>();
        while (numbers.length < count) {
            const num = Phaser.Math.Between(min, max);
            if (!used.has(num)) {
                used.add(num);
                numbers.push(num);
            }
        }
        return numbers;
    }

    changeScene() {
        this.scene.start("Preloader");
    }

    drawCellDefault(cell: any) {
        const cellSize = +this.sys.game.config.width / 6;
        cell.graphics.clear();

        cell.graphics.fillStyle(0x000000, 0.15);
        cell.graphics.fillRoundedRect(
            cell.x - cellSize / 2 + 3,
            cell.y - cellSize / 2 + 3,
            cellSize,
            cellSize,
            8
        );

        if (cell.number === "FREE") {
            cell.graphics.fillStyle(0xff6b6b, 1);
        } else {
            cell.graphics.fillStyle(0xffffff, 1);
        }
        cell.graphics.fillRoundedRect(
            cell.x - cellSize / 2,
            cell.y - cellSize / 2,
            cellSize,
            cellSize,
            8
        );

        cell.graphics.lineStyle(2, 0xcccccc, 1);
        cell.graphics.strokeRoundedRect(
            cell.x - cellSize / 2,
            cell.y - cellSize / 2,
            cellSize,
            cellSize,
            8
        );
    }

    drawCellMarked(cell: any) {
        const cellSize = +this.sys.game.config.width / 6;
        cell.graphics.clear();

        cell.graphics.fillStyle(0x000000, 0.15);
        cell.graphics.fillRoundedRect(
            cell.x - cellSize / 2 + 3,
            cell.y - cellSize / 2 + 3,
            cellSize,
            cellSize,
            8
        );

        cell.graphics.fillStyle(0x6699ff, 1);
        cell.graphics.fillRoundedRect(
            cell.x - cellSize / 2,
            cell.y - cellSize / 2,
            cellSize,
            cellSize,
            8
        );

        cell.graphics.lineStyle(2, 0x4466cc, 1);
        cell.graphics.strokeRoundedRect(
            cell.x - cellSize / 2,
            cell.y - cellSize / 2,
            cellSize,
            cellSize,
            8
        );
    }

    markNumber(number: number, scene: Phaser.Scene) {
        if (this.numberButtons[number]) {
            this.numberButtons[number].circle.setFillStyle(0xffd700);
            this.numberButtons[number].drawn = true;
        }

        this.bingoCard.forEach((cell) => {
            if (cell.number === number && !cell.marked) {
                this.drawCellMarked(cell);
                cell.marked = true;
                cell.text.setColor("#ffffff");
                this.activeSound?.play();
                this.tweens.add({
                    targets: [cell.graphics],
                    rotation: { from: 0, to: -0.005, duration: 80 },
                    ease: "Power2.easeInOut",
                    yoyo: true,
                    repeat: 3,
                });
                scene.tweens.add({
                    targets: [cell.text],
                    alpha: { from: 1, to: 0.5, duration: 200 },
                    scaleX: { from: 1, to: 1.15, duration: 200 },
                    scaleY: { from: 1, to: 1.15, duration: 200 },
                    ease: "Sine.easeInOut",
                    yoyo: true,
                    repeat: 2,
                });

                scene.tweens.add({
                    targets: [cell.graphics, cell.text],
                    flipX: { from: 1, to: 1.1, duration: 200 },
                    flipY: { from: 1, to: 1.1, duration: 200 },
                    ease: "Back.easeOut",
                    yoyo: true,
                    repeat: 0,
                });

                scene.tweens.add({
                    targets: cell.graphics,
                    alpha: { from: 1, to: 0.8, duration: 150 },
                    ease: "Sine.easeInOut",
                    yoyo: true,
                    repeat: 1,
                });

                const checkmark = scene.add
                    .text(cell.x, cell.y - 30, "✓", {
                        font: "20px Arial Bold",
                        color: "#6699FF",
                        stroke: "#FFFFFF",
                        strokeThickness: 2,
                    })
                    .setOrigin(0.5)
                    .setAlpha(0);

                scene.tweens.add({
                    targets: checkmark,
                    y: checkmark.y - 20,
                    alpha: { from: 0, to: 1, duration: 250 },
                    scale: { from: 0.5, to: 1, duration: 250 },
                    ease: "Back.easeOut",
                    onComplete: () => {
                        scene.tweens.add({
                            targets: checkmark,
                            alpha: 0,
                            duration: 300,
                            delay: 200,
                            onComplete: () => {
                                checkmark.destroy();
                            },
                        });
                    },
                });
            }
        });

        if (this.checkBingo()) {
            this.triggerBingo(scene);
        } else {
            this.updateNearBingo();
        }
    }

    drawRandomNumber(scene: Phaser.Scene, number: number) {
        const availableNumbers: number[] = [];
        for (let i = 1; i <= 75; i++) {
            if (!this.drawnNumbers.has(i)) availableNumbers.push(i);
        }

        if (availableNumbers.length === 0) {
            alert("All numbers have been drawn!");
            return;
        }

        const drawnNumber = number;
        this.drawnNumbers.add(drawnNumber);
        this.markNumber(drawnNumber, scene);
    }

    checkBingo(): boolean {
        const grid: boolean[][] = [];
        for (let i = 0; i < 5; i++) {
            grid[i] = [];
            for (let j = 0; j < 5; j++) {
                grid[i][j] = this.bingoCard[i * 5 + j]?.marked;
            }
        }
        grid[2][2] = true;
        for (let i = 0; i < 5; i++) {
            if (grid[i].every((cell) => cell)) return true;
        }

        for (let j = 0; j < 5; j++) {
            let col = true;
            for (let i = 0; i < 5; i++) {
                if (!grid[i][j]) {
                    col = false;
                    break;
                }
            }
            if (col) return true;
        }

        let diag1 = true;
        let diag2 = true;
        for (let i = 0; i < 5; i++) {
            if (!grid[i][i]) diag1 = false;
            if (!grid[i][4 - i]) diag2 = false;
        }
        if (diag1 || diag2) return true;

        return false;
    }

    updateNearBingo() {
        const grid: boolean[][] = [];
        for (let i = 0; i < 5; i++) {
            grid[i] = [];
            for (let j = 0; j < 5; j++) {
                grid[i][j] = this.bingoCard[i * 5 + j]?.marked;
            }
        }

        let nearBingoCount = 0;

        for (let i = 0; i < 5; i++) {
            const rowMarked = grid[i].filter((cell) => cell).length;
            if (
                rowMarked === 4 ||
                (rowMarked === 4 && this.bingoCard[i * 5 + 2].number === "FREE")
            ) {
                nearBingoCount++;
            }
        }

        for (let j = 0; j < 5; j++) {
            let colMarked = 0;
            for (let i = 0; i < 5; i++) {
                if (grid[i][j]) colMarked++;
            }
            if (
                colMarked === 4 ||
                (colMarked === 4 && this.bingoCard[2 * 5 + j].number === "FREE")
            ) {
                nearBingoCount++;
            }
        }

        let diag1Marked = 0;
        let diag2Marked = 0;
        for (let i = 0; i < 5; i++) {
            if (grid[i][i]) diag1Marked++;
            if (grid[i][4 - i]) diag2Marked++;
        }
        if (
            diag1Marked === 4 ||
            (diag1Marked === 4 &&
                this.bingoCard[this.freeIndex].number === "FREE")
        )
            nearBingoCount++;
        if (
            diag2Marked === 4 ||
            (diag2Marked === 4 &&
                this.bingoCard[this.freeIndex].number === "FREE")
        )
            nearBingoCount++;

        this.nearBingoText.setText(`Near Bingo: ${nearBingoCount}`);
    }

    triggerBingo(scene: Phaser.Scene) {
        this.bingoText.setVisible(true);
        this.sound.pauseAll();
        this.bingoSound?.play();
        scene.tweens.add({
            targets: this.bingoText,
            alpha: { from: 0, to: 1 },
            scale: { from: 0.5, to: 1 },
            duration: 3000,
            ease: "Bounce.easeOut",
        });
        setTimeout(() => {
            this.replayButton.setVisible(true);
        }, 5000);
        clearInterval(this.interval);
        this.interval = undefined;
        this.drawButton.disableInteractive();
        this.nearBingoText.setVisible(false);
        this.drawButton.setVisible(false);
        this.updateNearBingo.call(this);
        EventBus.emit("bingo");
    }
    createGame() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        const {
            width,
            height,
        }: {
            width: number | string;
            height: number | string;
        } = this.sys.game.config;
        const uniqueNumbers = this.numbers;

        const text = this.add.text(0, centerY - 270, "Bingo Game", {
            font: "42px Arial Black",
            color: "#ffd700",
            stroke: "#fff",
            align: "center",
            fixedWidth: +width,
            strokeThickness: 1,
        });

        const gradient = text.context.createLinearGradient(
            0,
            0,
            0,
            text.height
        );
        gradient.addColorStop(0, "#FFD700");
        gradient.addColorStop(0.3, "#FFA500");
        gradient.addColorStop(0.7, "#B8860B");
        gradient.addColorStop(1, "#DAA520");
        text.setFill(gradient);

        const cardGroup = this.add.group();
        const cardStartX = +width / 6 - 13;
        const cardStartY = centerY - 120;
        const cellSize = +width / 6;
        const padding = 6;

        const bingoColors = [0xff6b6b, 0xffd93d, 0x6bcf7f, 0x4ecdc4, 0xa8e6cf];
        const bingoLetters = ["B", "I", "N", "G", "O"];
        const headerY = cardStartY - 60;

        bingoLetters.forEach((letter, index) => {
            const graphics = this.add.graphics();
            const x = cardStartX + index * (cellSize + padding);

            graphics.fillStyle(0x000000, 0.2);
            graphics.fillRoundedRect(
                x - cellSize / 2 + 3,
                headerY - 20 + 3,
                cellSize,
                40,
                {
                    tl: 16,
                    tr: 16,
                    bl: 0,
                    br: 0,
                }
            );

            graphics.fillStyle(bingoColors[index], 1);
            graphics.fillRoundedRect(
                x - cellSize / 2,
                headerY - 20,
                cellSize,
                40,
                {
                    tl: 16,
                    tr: 16,
                    bl: 0,
                    br: 0,
                }
            );

            const headerText = this.add
                .text(x, headerY, letter, {
                    font: "24px Arial Black",
                    color: "#fff",
                    stroke: "#000",
                    strokeThickness: 2,
                })
                .setOrigin(0.5);

            cardGroup.add(graphics);
            cardGroup.add(headerText);
        });

        this.bingoCard = Array.from({ length: 25 }, (_, index) => {
            let cell =
                index === this.freeIndex
                    ? "FREE"
                    : uniqueNumbers[index]?.toString();

            const row = Math.floor(index / 5);
            const col = index % 5;
            const x = cardStartX + col * (cellSize + padding);
            const y = cardStartY + row * (cellSize + padding);

            const graphics = this.add.graphics();

            graphics.fillStyle(0x000000, 0.05);
            graphics.fillRoundedRect(
                x - cellSize / 2 + 3,
                y - cellSize / 2 + 3,
                cellSize,
                cellSize,
                16
            );

            if (index === this.freeIndex) {
                graphics.fillStyle(0xff6b6b, 1);
            } else {
                graphics.fillStyle(0xffffff, 1);
            }
            graphics.fillRoundedRect(
                x - cellSize / 2,
                y - cellSize / 2,
                cellSize,
                cellSize,
                8
            );

            graphics.lineStyle(2, 0xcccccc, 1);
            graphics.strokeRoundedRect(
                x - cellSize / 2,
                y - cellSize / 2,
                cellSize,
                cellSize,
                8
            );

            const text = this.add
                .text(x, y, cell, {
                    font: "30px Arial Bold",
                    color: "#000000",
                })
                .setOrigin(0.5);

            const interactiveRect = this.add
                .rectangle(x, y, cellSize, cellSize, 0xffffff, 0)
                .setInteractive();

            let star: Phaser.GameObjects.Image | undefined = undefined;
            if (index === this.freeIndex) {
                star = this.add
                    .image(x, y, "star")
                    .setScale(0.4)
                    .setTint(0xffffff);
                text.setVisible(false);
                cardGroup.add(star);
            }
            this.tweens.add({
               targets: [text, graphics, interactiveRect],
                alpha: { from: 0, to: 1, duration:500 },
                ease: 'Power2',
                duration: 500,
                delay: Math.floor(index / 5) * 100,
                repeat: 0,
            });
            cardGroup.add(graphics);
            cardGroup.add(text);
            cardGroup.add(interactiveRect);

            return {
                number:
                    index === this.freeIndex ? "FREE" : uniqueNumbers[index],
                graphics: graphics,
                text: text,
                interactiveRect: interactiveRect,
                star: star,
                marked: index === this.freeIndex,
                x: x,
                y: y,
            };
        });

        this.nearBingoText = this.add
            .text(85, 40, "", {
                font: "24px Arial",
                color: "#FFD700",
                stroke: "#000",
                strokeThickness: 0,
            })
            .setOrigin(0.5);

        this.drawButton = this.add
            .text(centerX, centerY + 250, "Draw Number", {
                font: "32px Arial",
                color: "#fff",
                backgroundColor: "#007BFF",
                padding: { x: 20, y: 10 },
            })
            .setOrigin(0.5)
            .setInteractive()
            .setVisible(false);
        this.replayButton = this.add
            .text(centerX, centerY + 150, "Replay", {
                font: "32px Arial",
                color: "#fff",
                backgroundColor: "#28a745",
                padding: { x: 20, y: 10 },
            })
            .setOrigin(0.5)
            .setInteractive()
            .setVisible(false);

        this.replayButton.on("pointerdown", () => {
            EventBus.emit("QuitGame");
            this.scene.start("MainMenu");
        });

        this.bingoText = this.add
            .text(centerX, centerY - 50, "BINGO!", {
                font: "64px Arial Black",
                color: "#FFD700",
                stroke: "#fffda0",
                strokeThickness: 1,
            })
            .setOrigin(0.5);
        this.bingoText.setVisible(false);

        this.confetti = this.add
            .image(centerX, centerY, "confetti")
            .setScale(0.5);
        this.confetti.setVisible(false);
        this.confetti.setAlpha(0);
    }
    update(time: number, delta: number): void {
        if (this.needReload) {
            this.createGame();
            this.needReload = false;
        }
    }
    create() {
        const {
            width,
            height,
        }: {
            width: number | string;
            height: number | string;
        } = this.sys.game.config;
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        this.add.image(0, centerY, "background");
        const audio = this.add.image(+width - 30, 30, "audio");
        const mute = this.add.image(+width - 30, 30, "mute");
        mute.setVisible(false);
        mute.setInteractive();
        audio.setInteractive();
        this.sound.mute = false;
        audio.on("pointerdown", () => {
            this.sound.mute = true;
            mute.setVisible(true);
            audio.setVisible(false);
        });
        mute.on("pointerdown", () => {
            this.sound.mute = false;
            audio.setVisible(true);
            mute.setVisible(false);
        });

        this.drawnNumbers.clear();
        this.bingoCard = [];
        this.numberButtons = [];
        EventBus.on("info", (data: number[]) => {
            this.numbers = data;
            this.needReload = true;
        });
        EventBus.on(
            "numberCalled",
            (data: {
                number: number;
                totalCalled: number;
                remaining: number;
            }) => {
                this.drawRandomNumber.call(this, this, data.number);
            }
        );
        EventBus.on("reSyncNumbersResult", (data: number[]) => {
            if (data) {
                data.forEach((number) => {
                        console.log("Re-syncing numbers", number, this.drawnNumbers.has(number));
                    if (!this.drawnNumbers.has(number)) {
                        console.log("Drawing number:", number);
                        this.drawRandomNumber.call(this, this, number);
                    }
                });
            }
        });

        var scrollMode = 1; // 0, 1
        var scrollablePanel = this.rexUI.add.scrollablePanel({
            x: centerX,
            y: centerY + 400,
            width: (scrollMode === 0) ? +width - 40 : +width - 40,
            height: (scrollMode === 0) ? 200 : 200,

            scrollMode: scrollMode,
            panel: {
                child: this.createGrid(this, scrollMode),
                mask: {
                    mask: true,
                    padding: 1,
                }
            },
            mouseWheelScroller: {
                focus: false,
                speed: 0.1
            },

            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,

                panel: 10,
            }
        })
            .layout()

        var print = this.add.text(0, 0, '');
        var selectedChild: any = null; 

        scrollablePanel
            .setChildrenInteractive()
            .on('child.click', function (child:any, pointer:any, event:any) {
                print.text += `Click ${child.text}\n`;
                if (selectedChild && selectedChild !== child) {
                    if (selectedChild.getElement && selectedChild.getElement('background')) {
                        selectedChild.getElement('background').setFillStyle(0x000000, 0.05);
                    } else if (selectedChild.background) {
                        selectedChild.background.setFillStyle(0x000000, 0.05); 
                    }
                }
                
                if (child.getElement && child.getElement('background')) {
                    child.getElement('background').setFillStyle(0xff6b6b); 
                } else if (child.background) {
                    child.background.setFillStyle(0xff6b6b);
                }
                
                selectedChild = child;
            })
            .on('child.pressstart', function (child:any, pointer:any, event:any) {
               // print.text += `Press ${child.text}\n`;
            })
        EventBus.emit("current-scene-ready", this);
        EventBus.emit("gameSceneReady");
    }

}
