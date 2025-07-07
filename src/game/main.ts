import { Boot } from './scenes/Boot.ts';
import { Game } from './scenes/Game.ts';
import { MainMenu } from './scenes/MainMenu.ts';
import Phaser, { Scale } from 'phaser';
import { Preloader } from './scenes/Preloader.ts';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
    type: Phaser.AUTO,
    width: window.navigator.userAgent.includes('Mobile') ? window.innerWidth : 480, 
    height: window.innerHeight,
    Scale: {
        mode: Phaser.Scale.RESIZE, // Tự động resize
        parent: 'game-container',
        width: window.navigator.userAgent.includes('Mobile') ? window.innerWidth : 480,
        height: window.innerHeight,
        autoCenter: Phaser.Scale.CENTER_BOTH

    },
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
        Boot,
        Preloader,
        MainMenu,
        Game,
    ]
};

const StartGame = (parent) => {
    return new Phaser.Game({ ...config, parent });
}

export default StartGame;
