import React, { useRef, useEffect } from 'react';

function GanttChart({ history, isMini = false }) {
    const chartRef = useRef(null);

    // Auto-scroll to end when history updates
    useEffect(() => {
        if (chartRef.current) {
            const container = isMini ? chartRef.current : chartRef.current.parentElement;
            container.scrollLeft = container.scrollWidth;
        }
    }, [history, isMini]);

    const blockWidth = isMini ? 25 : 40;

    // Helper to adjust color brightness
    const adjustColor = (hex, amount) => {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + amount));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
        const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
        return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
    };

    // Helper to get contrast color
    const getContrastColor = (hex) => {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#ffffff';
    };

    if (isMini) {
        return (
            <div className="mini-gantt glass-panel" ref={chartRef}>
                {history.map((entry, index) => {
                    const duration = entry.endTime - entry.startTime;
                    return (
                        <div
                            key={`${entry.processId}-${entry.startTime}`}
                            className="gantt-block"
                            style={{
                                width: `${duration * blockWidth}px`,
                                height: '35px',
                                minWidth: '20px',
                                background: `linear-gradient(135deg, ${entry.color}, ${adjustColor(entry.color, -30)})`,
                                fontSize: '0.6rem'
                            }}
                        >
                            {entry.processName}
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="gantt-section glass-panel">
            <div className="gantt-header">
                <h3>Execution Timeline</h3>
            </div>
            <div className="gantt-chart-container">
                <div className="gantt-chart" ref={chartRef}>
                    {history.map((entry, index) => {
                        const duration = entry.endTime - entry.startTime;
                        return (
                            <div
                                key={`${entry.processId}-${entry.startTime}`}
                                className={`gantt-block ${entry.preempted ? 'preempted' : ''} ${entry.contextSwitch && index > 0 ? 'context-switch' : ''}`}
                                style={{
                                    width: `${duration * blockWidth}px`,
                                    background: `linear-gradient(135deg, ${entry.color}, ${adjustColor(entry.color, -30)})`,
                                    color: getContrastColor(entry.color)
                                }}
                                title={`${entry.processName}: ${entry.startTime} - ${entry.endTime}`}
                            >
                                {entry.processName}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default GanttChart;
