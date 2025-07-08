import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        this.load.image('background', 'assets/bg.png');
        this.load.image('logo', 'assets/logo.png');
        this.load.image('audio', 'assets/volume.png');
        this.load.image('mute', 'assets/mute.png');
        this.load.audio('startGameSound', 'assets/startGame.wav');
        this.load.audio('bingoSound', 'assets/bingo.wav');
        this.load.audio('gamePlay', 'assets/gamePlay.wav');
        this.load.audio('activeSound', 'assets/active.wav');

    }

    create ()
    {
        this.scene.start('Preloader');
    }
}
