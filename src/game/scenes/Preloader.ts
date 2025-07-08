import { Scene } from 'phaser';

export class Preloader extends Scene
{
    progressTimer: Phaser.Time.TimerEvent | null = null;
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        const { width, height } = this.sys.game.config;
        this.add.image(+width/2, +height/2, 'background');
        this.add.sprite(+width/2, +height/2 - 84, 'logo').setDisplaySize(228, 75);
        this.add.rectangle(+width/2, +height/2 ,228, 32).setStrokeStyle(1, 0xffffff);

        const bar = this.add.rectangle(+width/2-110, +height/2, 4, 28, 0xffffff);

        let currentProgress = 0;
        let targetProgress = 0;
        const animationSpeed = 0.02; 

        this.load.on('progress', (progress: number) => {
            console.log(`Progress: ${progress * 100}%`);
            targetProgress = progress;
        });
        this.progressTimer = this.time.addEvent({
            delay: 16, 
            callback: () => {
                if (currentProgress < targetProgress) {
                    currentProgress += animationSpeed;
                    if (currentProgress > targetProgress) {
                        currentProgress = targetProgress;
                    }
                    bar.width = 4 + (220 * currentProgress);
                }
            },
            loop: true
        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');
        this.load.image('star', 'star.png');
    }

    create ()
    {

        this.time.delayedCall(1000, () => {
            if (this.progressTimer) {
                this.progressTimer.destroy();
            }
            this.scene.start('MainMenu');
        });
    }
}
