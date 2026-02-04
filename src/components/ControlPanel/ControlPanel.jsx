import React from 'react';
import { useScheduler } from '../../context/SchedulerContext';
import AlgorithmButtons from './AlgorithmButtons';
import ProcessList from './ProcessList';

function ControlPanel() {
    const {
        quantum,
        speed,
        currentAlgorithm,
        isRunning,
        isPaused,
        setTimeQuantum,
        setSimulationSpeed,
        start,
        togglePause,
        reset,
        addProcess,
        clearProcesses,
        enableStressMode
    } = useScheduler();

    const showRRControls = currentAlgorithm === 'rr';

    return (
        <aside className="control-panel glass-panel">
            <div className="panel-header">
                <h2>Controls</h2>
            </div>

            <div className="control-section">
                <h3>Algorithm</h3>
                <AlgorithmButtons />
            </div>

            {showRRControls && (
                <div className="control-section">
                    <h3>Time Quantum</h3>
                    <div className="slider-container">
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={quantum}
                            onChange={(e) => setTimeQuantum(parseInt(e.target.value))}
                            className="neon-slider"
                        />
                        <span className="slider-value">{quantum}</span>
                    </div>
                </div>
            )}

            <div className="control-section">
                <h3>Simulation Speed</h3>
                <div className="slider-container">
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={speed}
                        onChange={(e) => setSimulationSpeed(parseInt(e.target.value))}
                        className="neon-slider"
                    />
                    <span className="slider-value">{speed}x</span>
                </div>
            </div>

            <div className="control-section">
                <h3>Processes</h3>
                <div className="process-controls">
                    <button className="action-btn" onClick={addProcess}>
                        <span>+</span> Add Process
                    </button>
                    <button className="action-btn secondary" onClick={clearProcesses}>
                        Clear All
                    </button>
                </div>
                <ProcessList />
            </div>

            <div className="control-section">
                <h3>Actions</h3>
                <div className="action-buttons">
                    <button
                        className="primary-btn"
                        onClick={start}
                        disabled={isRunning && !isPaused}
                    >
                        <span className="btn-icon">▶</span>
                        <span>Start</span>
                    </button>
                    <button
                        className="primary-btn pause"
                        onClick={togglePause}
                        disabled={!isRunning}
                    >
                        <span className="btn-icon">{isPaused ? '▶' : '⏸'}</span>
                        <span>{isPaused ? 'Resume' : 'Pause'}</span>
                    </button>
                    <button className="primary-btn reset" onClick={reset}>
                        <span className="btn-icon">↻</span>
                        <span>Reset</span>
                    </button>
                </div>
            </div>

            <div className="control-section">
                <button className="stress-btn" onClick={enableStressMode}>
                    🔥 Stress Mode (100+ Processes)
                </button>
            </div>
        </aside>
    );
}

export default ControlPanel;
