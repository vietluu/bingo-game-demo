import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    logoTween: Phaser.Tweens.Tween | null = null;
    logo: Phaser.GameObjects.Sprite | null = null;
    startGameSound: Phaser.Sound.BaseSound | undefined;
    countdownText: Phaser.GameObjects.Text | null = null;
    countdownTimer: Phaser.Time.TimerEvent | null = null;
    countdownSeconds: number = 0;
    constructor ()
    {
        super('MainMenu');
        
    }
    preload() {
        this.sound.pauseOnBlur = false;
        this.startGameSound = this.sound.add('startGameSound', {
            loop: true,
            volume: 1,
        });
    }
    update(time: number, delta: number): void {
        // Remove this logic - it's causing issues
    }
    create ()
    {   
        const { width, height } = this.sys.game.config;         
        this.add.image(+width/2, +height/2, 'background');

        this.logo = this.add.sprite(+width/2, +height/2 - 84, 'logo');
        this.logo.setDisplaySize(228, 75);
        
        // Reset countdown properties when scene is created
        this.countdownText = null;
        this.countdownTimer = null;
        this.countdownSeconds = 0;

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
            console.log("Start Game button clicked in MainMenu scene");
            EventBus.emit('start-game');            
            this.startCountdown();
            
        });
       
        this.startGameSound?.play();
        EventBus.on("StartGameScene", () => {
            this.changeScene();
        })
        EventBus.on("waitingCountdown", (remainingSeconds: number) => {
            console.log("📊 Received countdown from server:", remainingSeconds);
            this.countdownSeconds = remainingSeconds;
            this.startCountdown();
        });
        EventBus.emit('current-scene-ready', this);
    }

    /**
     * Start countdown timer with specified duration in seconds
     */
    startCountdown() {
        console.log("🕒 Starting countdown with:", this.countdownSeconds, "seconds");
        
        if (!this.countdownSeconds || this.countdownSeconds <= 0) {
            console.log("⚠️ Cannot start countdown - no time remaining");
            return;
        }
        
        // Stop and cleanup existing timer
        if (this.countdownTimer) {
            console.log("🛑 Stopping existing countdown timer");
            this.countdownTimer.destroy();
            this.countdownTimer = null;
        }

        // Always create new countdown text (don't reuse old one)
        if (this.countdownText) {
            this.countdownText.destroy();
            this.countdownText = null;
        }
        
        const { width, height } = this.sys.game.config;
        
        // Create waiting text
        const waiting = this.add.text(
            +width / 2,
            +height / 2 + 150,
            "Waiting for more players...",
            {
                fontFamily: "Arial Black",
                fontSize: 24,
                color: "#ffffff",
                align: "center",
                padding: { x: 16, y: 8 },
            }
        )
        .setDepth(100)
        .setOrigin(0.5);

        // Create new countdown text
        this.countdownText = this.add.text(
            +width/2, 
            +height/2 + 100, 
            this.formatTime(this.countdownSeconds), 
            {
                fontFamily: 'Arial Black', 
                fontSize: 32, 
                color: '#ff6b6b',
                align: 'center',
                padding: { x: 16, y: 8 },
            }
        ).setDepth(100).setOrigin(0.5);
        
        console.log("✨ Created new countdown text element");

        // Create timer that runs every second
        this.countdownTimer = this.time.addEvent({
            delay: 1000, // 1 second intervals
            callback: this.updateCountdown,
            callbackScope: this,
            repeat: this.countdownSeconds - 1 // Repeat for remaining seconds
        });
        
        console.log("⏰ Countdown timer started successfully");
    }
    
    updateCountdown() {
        this.countdownSeconds--;
        
        if (this.countdownText) {
            this.countdownText.setText(this.formatTime(this.countdownSeconds));
            
            // Color changes based on remaining time
            if (this.countdownSeconds <= 10) {
                this.countdownText.setColor('#ff0000'); // Red for last 10 seconds
                // Add pulsing effect for urgency
                this.tweens.add({
                    targets: this.countdownText,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 200,
                    ease: 'Power2',
                    yoyo: true,
                    repeat: 0
                });
            } else if (this.countdownSeconds <= 30) {
                this.countdownText.setColor('#ff8800'); // Orange for last 30 seconds
            }
        }
        
        if (this.countdownSeconds <= 0) {
            this.onCountdownComplete();
        }
    }
    
    onCountdownComplete() {
        
        if (this.countdownText) {
            this.countdownText.setText("00:00");
            this.countdownText.setColor('#ff0000');
            
            // Final animation
            this.tweens.add({
                targets: this.countdownText,
                scaleX: 1.5,
                scaleY: 1.5,
                alpha: 0.5,
                duration: 500,
                ease: 'Power2',
                yoyo: true,
                repeat: 2,
                onComplete: () => {
                    this.countdownText?.setVisible(false);
                }
            });
        }
        
        // Clean up timer
        if (this.countdownTimer) {
            this.countdownTimer.destroy();
            this.countdownTimer = null;
        }
        
        // Reset countdown seconds
        this.countdownSeconds = 0;
        
        // Emit event that countdown finished
        EventBus.emit('countdown-finished');
    }
    
    /**
     * Format seconds into MM:SS format
     * @param totalSeconds - Total seconds to format
     * @returns Formatted string like "02:30"
     */
    formatTime(totalSeconds: number): string {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    stopCountdown() {
        console.log("🛑 Stopping countdown");
        
        if (this.countdownTimer) {
            this.countdownTimer.destroy();
            this.countdownTimer = null;
        }
        
        if (this.countdownText) {
            this.countdownText.destroy();
            this.countdownText = null;
        }
        
        this.countdownSeconds = 0;
        console.log("✅ Countdown stopped and cleaned up");
    }

    changeScene ()
    {
        this.stopCountdown();
        
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }
        console.log("Changing scene to Game");
        this.scene.start('Game');
    }

    shutdown() {
        console.log("🔄 MainMenu scene shutting down - cleaning up countdown");
        this.stopCountdown();
        
        // Clean up EventBus listeners to prevent memory leaks
        EventBus.off("StartGameScene");
        EventBus.off("waitingCountdown");
    }

    destroy() {
        console.log("💥 MainMenu scene destroyed - final cleanup");
        this.stopCountdown();
    }

    moveLogo (reactCallback: (coords: { x: number; y: number }) => void)
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
                        if (this.logo) {
                            reactCallback({
                                x: Math.floor(this.logo.x),
                                y: Math.floor(this.logo.y)
                            });
                        }
                    }
                }
            });
        }
    }
}
