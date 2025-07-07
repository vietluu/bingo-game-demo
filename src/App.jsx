import { useRef, useState } from 'react';
import { PhaserGame } from './PhaserGame';

function App ()
{
    const [canMoveSprite, setCanMoveSprite] = useState(true);
    
    const phaserRef = useRef();
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });


    const currentScene = (scene) => {

        setCanMoveSprite(scene.scene.key !== 'MainMenu');
        
    }

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
        </div>
    )
}

export default App
