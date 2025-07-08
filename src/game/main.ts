import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import Phaser, { Scale } from 'phaser';
import { Preloader } from './scenes/Preloader';

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
    audio: {
        disableWebAudio: false,
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

const StartGame = (parent: any) => {
    return new Phaser.Game({ ...config, parent });
}

export default StartGame;
