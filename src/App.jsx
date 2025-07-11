import { useRef, useState, useEffect } from "react";
import { PhaserGame } from "./PhaserGame";
import { useSocket } from "./services/socket";
import { EventBus } from "./game/EventBus";

function App() {
    const [canMoveSprite, setCanMoveSprite] = useState(true);
    const { emit, on, off, removeAllListeners, once } = useSocket();
    const phaserRef = useRef();
    const [cardNumbers, setCardNumbers] = useState([]);
    const [isVisible, setIsVisible] = useState(true);

    const currentScene = (scene) => {
        setCanMoveSprite(scene.scene.key !== "MainMenu");
    };

    useEffect(() => {
        const handleStartGame = () => {
            emit("startGame", {
                action: "join",
                timestamp: Date.now(),
                player: "current-user",
            });
        };

        const handlePlayerJoined = (data) => {
            if (data?.bingoCard) {
                const cardNumbers = Array.isArray(data.bingoCard)
                    ? data.bingoCard.flat()
                    : data.bingoCard;
                setCardNumbers(cardNumbers);
            }
        };

        const handleGameStart = () => {
            if (phaserRef.current?.game) {
                EventBus.emit("StartGameScene");
            }
        };

        EventBus.on("start-game", handleStartGame);
        EventBus.on("gameSceneReady", () => {
            EventBus.emit("info", cardNumbers);
        });
        on("playerJoined", handlePlayerJoined);
        on("gameStart", handleGameStart);
        on("numberCalled", (data) => {
            EventBus.emit("numberCalled", data);
        });
        on("waitingCountdown", (data) => {
            if (data?.remainingSeconds !== undefined) {
                EventBus.emit("waitingCountdown", data.remainingSeconds);
                off("waitingCountdown");
            }
        });
        on("joinError", (data) => {
            if (data?.roomStatus === "playing") {
                alert(
                    "room is already in progress, please wait for the next game."
                );
            }
        });

        on("reSyncNumbersResult", (data) => {
            if (data?.bingoCard) {
                EventBus.emit("reSyncNumbersResult", data.calledNumbers);
            }
        });

        EventBus.on("bingo", () => {
            off("numberCalled");
            off("reSyncNumbersResult")
            EventBus.off("reSyncNumbersResult")
        });
        EventBus.on("QuitGame", () => {
            emit("leaveGame");
        });

        return () => {
            off("playerJoined", handlePlayerJoined);
            off("joinError");
            off("gameStart", handleGameStart);
            EventBus.off("start-game", handleStartGame);
            EventBus.off("gameSceneReady");
            EventBus.off("bingo");
            EventBus.off("QuitGame");

            off("numberCalled");
            removeAllListeners();
        };
    }, [on, off, cardNumbers]);
    on("reSyncNumbersResult", (data) => {
        EventBus.emit("reSyncNumbersResult", data.calledNumbers);
        setIsVisible(true);
    });
    const handleVisibilityChange = () => {
        if (document.visibilityState === "hidden") {
            setIsVisible(false);
        } else {
            if (!isVisible) {
                on("waitingCountdown", (data) => {
                    if (data?.remainingSeconds !== undefined) {
                        EventBus.emit(
                            "waitingCountdown",
                            data.remainingSeconds
                        );
                        off("waitingCountdown");
                    }
                });
                emit("reSyncNumbers");
            }
        }
    };
    useEffect(() => {
        if (document) {
            document.addEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        }
        return () => {
            if (document) {
                document.removeEventListener(
                    "visibilitychange",
                    handleVisibilityChange
                );
            }
        };
    }, [isVisible, emit]);

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
        </div>
    );
}

export default App;
