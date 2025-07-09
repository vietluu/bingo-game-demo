class Waiting extends Phaser.Scene {
    constructor() {
        super('Waiting');
    }
    preload() {
        this.sound.pauseOnBlur = false;
        this.load.image('waitingBackground', 'assets/waitingBackground.png');
    }
    create() {
    const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        this.add.image(0, centerY, "background");
        this.add.tileSprite(centerX, centerY, 800, 600, 'waiting for more players').setOrigin(0.5);

    }
}