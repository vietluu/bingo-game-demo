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

        this.load.on('progress', (progress) => {
            console.log(`Progress: ${progress * 100}%`);
            targetProgress = progress;
        });
        this.progressTimer = this.time.addEvent({
            delay: 16, // 60 FPS
            callback: () => {
                if (currentProgress < targetProgress) {
                    currentProgress += animationSpeed;
                    if (currentProgress > targetProgress) {
                        currentProgress = targetProgress;
                    }
                    //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
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
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Wait for the progress bar animation to complete before moving to MainMenu
        this.time.delayedCall(1000, () => {
            //  Clean up the progress timer
            if (this.progressTimer) {
                this.progressTimer.destroy();
            }
            //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
            this.scene.start('MainMenu');
        });
    }
}
