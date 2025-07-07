import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    logoTween;
    logo;
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {   
         const { width, height } = this.sys.game.config;         
        // Căn giữa background
        this.add.image(+width/2, +height/2, 'background');

        // Căn giữa logo
        this.logo = this.add.sprite(+width/2, +height/2 - 84, 'logo');
        this.logo.setDisplaySize(228, 75);

        // Căn giữa text title
       let text =  this.add.text(+width/2, +height/2 , 'Start game', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center',
            padding: { x: 16, y: 8 },
            backgroundColor: '#000000',
            
            
        }).setDepth(100).setOrigin(0.5);
        this.tweens.add({
         targets: text,
            alpha: 0.5,
            duration: 1000,
            ease: 'Power2',
            yoyo: true,
            repeat: -1
        })
        text.setInteractive();
        text.on('pointerdown', () => {
            this.scene.start('Game');
        });
        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start('Game');
    }

    moveLogo (reactCallback)
    {
        if (this.logoTween)
        {
            if (this.logoTween.isPlaying())
            {
                this.logoTween.pause();
            }
            else
            {
                this.logoTween.play();
            }
        }
        else
        {
            const { width, height } = this.sys.game.config;
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: +width/2 + 160, duration: 3000, ease: 'Back.easeInOut' },
                y: { value: +height/2 - 304, duration: 1500, ease: 'Sine.easeOut' },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    if (reactCallback)
                    {
                        reactCallback({
                            x: Math.floor(this.logo.x),
                            y: Math.floor(this.logo.y)
                        });
                    }
                }
            });
        }
    }
}
