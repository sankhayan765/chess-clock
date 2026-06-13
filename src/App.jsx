import { useState, useEffect, useRef } from "react";
import "./App.css";
import SetTime from "./components/SetTime";

const TICK_INTERVAL = 100;

function App() {
  // --- State ---
  const [playerConfig, setPlayerConfig] = useState({
    p1: { initialTime: 5 * 60 * 1000, increment: 0, moves: 0 },
    p2: { initialTime: 5 * 60 * 1000, increment: 0, moves: 0 },
  });

  const [p1Time, setP1Time] = useState(5 * 60 * 1000);
  const [p2Time, setP2Time] = useState(5 * 60 * 1000);

  const [activePlayer, setActivePlayer] = useState(null); // null | 1 | 2
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showSetTime, setShowSetTime] = useState(false);
  const [adjustingPlayer, setAdjustingPlayer] = useState(null); // null | 1 | 2

  const [, forceRender] = useState(0);

  const turnStartRef = useRef(null);

  // --- Live countdown ticker ---
  useEffect(() => {
    const isRunning = activePlayer && !gameOver && !isPaused;
    if (!isRunning) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - turnStartRef.current;
      const currentTime = activePlayer === 1 ? p1Time : p2Time;
      const remaining = currentTime - elapsed;

      if (remaining <= 0) {
        if (activePlayer === 1) setP1Time(0);
        else setP2Time(0);
        setGameOver(true);
      } else {
        forceRender(n => n + 1);
      }
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, [activePlayer, p1Time, p2Time, gameOver, isPaused]);

  // --- Helpers ---

  const getDisplayTime = (player) => {
    const savedTime = player === 1 ? p1Time : p2Time;
    const isThisPlayerActive = player === activePlayer && turnStartRef.current && !isPaused;

    if (!isThisPlayerActive) return savedTime;

    const elapsed = Date.now() - turnStartRef.current;
    return Math.max(savedTime - elapsed, 0);
  };

  const formatTime = (ms) => {
    if (ms < 20000) return (ms / 1000).toFixed(1);

    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const formatConfig = (config) => {
    const totalSeconds = Math.floor(config.initialTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const increment = config.increment / 1000;

    const timeStr = totalSeconds < 60
      ? `${totalSeconds} sec`
      : minutes === Math.floor(minutes) && seconds === 0
        ? `${minutes} min`
        : `${minutes} min ${seconds} sec`;

    return `${timeStr} | ${increment} sec`;
  };

  const commitElapsedTime = () => {
    const elapsed = Date.now() - turnStartRef.current;
    if (activePlayer === 1) setP1Time(prev => Math.max(prev - elapsed, 0));
    else setP2Time(prev => Math.max(prev - elapsed, 0));
  };

  // --- Actions ---

  const startGame = () => {
    turnStartRef.current = Date.now();
    setActivePlayer(1);
  };

  const switchTurn = () => {
    if (!activePlayer || gameOver || isPaused) return;

    const elapsed = Date.now() - turnStartRef.current;
    const key = activePlayer === 1 ? "p1" : "p2";
    const { increment } = playerConfig[key];
    const setCurrentPlayerTime = activePlayer === 1 ? setP1Time : setP2Time;

    setCurrentPlayerTime(prev => {
      const remaining = prev - elapsed;
      if (remaining <= 0) {
        setGameOver(true);
        return 0;
      }
      return remaining + increment;
    });

    setActivePlayer(activePlayer === 1 ? 2 : 1);

    activePlayer === 1 ? setPlayerConfig(prev => ({
      ...prev,
      p1: { ...prev.p1, moves: prev.p1.moves + 1 },
    })) : setPlayerConfig(prev => ({
      ...prev,
      p2: { ...prev.p2, moves: prev.p2.moves + 1 },
    }));

    turnStartRef.current = Date.now();
  };

  const pauseGame = () => {
    commitElapsedTime();
    setIsPaused(true);
  };

  const resumeGame = () => {
    turnStartRef.current = Date.now();
    setIsPaused(false);
  };

  const resetGame = () => {
    setP1Time(playerConfig.p1.initialTime);
    setP2Time(playerConfig.p2.initialTime);
    setPlayerConfig(prev => ({
      p1: { ...prev.p1, moves: 0 },
      p2: { ...prev.p2, moves: 0 },
    }));
    setActivePlayer(null);
    setGameOver(false);
    setIsPaused(false);
    turnStartRef.current = null;
  };

  const applyNewTimeControl = (newTime, newIncrement) => {
    if (adjustingPlayer === 1) {
      setPlayerConfig(prev => ({
        ...prev,
        p1: { initialTime: newTime, increment: newIncrement, moves: 0 },
      }));
      setP1Time(newTime);
    } else if (adjustingPlayer === 2) {
      setPlayerConfig(prev => ({
        ...prev,
        p2: { initialTime: newTime, increment: newIncrement, moves: 0 },
      }));
      setP2Time(newTime);
    } else {
      // Global Set Time — applies to both
      setPlayerConfig(({
        p1: { initialTime: newTime, increment: newIncrement, moves: 0 },
        p2: { initialTime: newTime, increment: newIncrement, moves: 0 },
      }));
      setP1Time(newTime);
      setP2Time(newTime);
    }

    setActivePlayer(null);
    setGameOver(false);
    setIsPaused(false);
    turnStartRef.current = null;
    setShowSetTime(false);
    setAdjustingPlayer(null);
  };

  const handleClockClick = (player) => {
    if (gameOver || isPaused) return;

    if (!activePlayer) {
      startGame();
    } else if (activePlayer === player) {
      switchTurn();
    }
  };

  // --- Render ---
  return (
    <>
      <div className="app">

        {/* Player 1 (White) clock */}
        <div
          className={`clock white ${activePlayer === 1 ? "active" : ""} ${p1Time === 0 ? "flagged" : ""}`}
          onClick={() => handleClockClick(1)}
        >
          <h2>White</h2>
          <span>{formatTime(getDisplayTime(1))}</span>

          {!activePlayer && <p className="clock-config-label">{formatConfig(playerConfig.p1)}</p>}
          <p className="clock-config-label">Moves: {playerConfig.p1.moves}</p>
          {!activePlayer && (
            <button
              className="adjust-btn"
              onClick={(e) => {
                e.stopPropagation();
                setAdjustingPlayer(1);
                setShowSetTime(true);
              }}
            >
              Adjust
            </button>
          )}
        </div>

        {/* Center controls */}
        <div className="controls" onClick={e => e.stopPropagation()}>
          {activePlayer && (
            <button onClick={resetGame}>Reset</button>
          )}
          {activePlayer && (
            <button onClick={isPaused ? resumeGame : pauseGame}>
              {isPaused ? "Resume" : "Pause"}
            </button>
          )}
          {!activePlayer && (
            <button onClick={() => setShowSetTime(true)}>Set Time</button>
          )}
        </div>

        {/* Player 2 (Black) clock */}
        <div
          className={`clock black ${activePlayer === 2 ? "active" : ""} ${p2Time === 0 ? "flagged" : ""}`}
          onClick={() => handleClockClick(2)}
        >
          <h2>Black</h2>
          <span>{formatTime(getDisplayTime(2))}</span>

          {!activePlayer && <p className="clock-config-label">{formatConfig(playerConfig.p2)}</p>}
          <p className="clock-config-label">Moves: {playerConfig.p2.moves}</p>
          {!activePlayer && (
            <button
              className="adjust-btn"
              onClick={(e) => {
                e.stopPropagation();
                setAdjustingPlayer(2);
                setShowSetTime(true);
              }}
            >
              Adjust
            </button>
          )}
        </div>

      </div>

      {showSetTime && (
        <SetTime
          onSetTime={applyNewTimeControl}
          onClose={() => {
            setShowSetTime(false);
            setAdjustingPlayer(null);
          }}
        />
      )}
    </>
  );
}

export default App;