import React from 'react';
import { useScheduler } from '../../context/SchedulerContext';

const algorithms = [
    { key: 'fcfs', label: 'FCFS' },
    { key: 'sjf', label: 'SJF' },
    { key: 'sjf-preemptive', label: 'SJF-P' },
    { key: 'priority', label: 'Priority' },
    { key: 'rr', label: 'Round Robin' }
];

function AlgorithmButtons() {
    const { currentAlgorithm, selectAlgorithm } = useScheduler();

    return (
        <div className="algorithm-buttons">
            {algorithms.map(algo => (
                <button
                    key={algo.key}
                    className={`algo-btn ${currentAlgorithm === algo.key ? 'active' : ''}`}
                    onClick={() => selectAlgorithm(algo.key)}
                >
                    {algo.label}
                </button>
            ))}
        </div>
    );
}

export default AlgorithmButtons;
