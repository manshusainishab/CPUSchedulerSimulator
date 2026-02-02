// Main Application Entry Point
import './style.css';
import { Process, createSampleProcesses, createStressProcesses } from './Process.js';
import { Scheduler } from './Scheduler.js';

class CPUSchedulerApp {
  constructor() {
    this.scheduler = new Scheduler();
    this.scheduler2 = new Scheduler(); // For comparison mode
    this.isComparisonMode = false;

    this.init();
  }

  init() {
    this.createStars();
    this.setupEventListeners();
    this.initializeProcesses();
    this.setupSchedulerCallbacks();
    this.render();
  }

  createStars() {
    const starsContainer = document.getElementById('stars');
    const starCount = 150;

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        width: ${Math.random() * 2 + 1}px;
        height: ${Math.random() * 2 + 1}px;
        --opacity: ${Math.random() * 0.5 + 0.3};
        --duration: ${Math.random() * 3 + 2}s;
      `;
      starsContainer.appendChild(star);
    }

    // Add a few shooting stars
    for (let i = 0; i < 3; i++) {
      const shootingStar = document.createElement('div');
      shootingStar.className = 'shooting-star';
      shootingStar.style.cssText = `
        left: ${Math.random() * 50}%;
        top: ${Math.random() * 30}%;
        animation-delay: ${Math.random() * 10 + i * 5}s;
      `;
      starsContainer.appendChild(shootingStar);
    }
  }

  setupEventListeners() {
    // Algorithm buttons
    document.querySelectorAll('.algo-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.scheduler.setAlgorithm(e.target.dataset.algo);
        this.updateRRControlsVisibility();
      });
    });

    // Time quantum slider
    const quantumSlider = document.getElementById('quantumSlider');
    const quantumValue = document.getElementById('quantumValue');
    quantumSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      quantumValue.textContent = value;
      this.scheduler.options.quantum = value;
      this.scheduler2.options.quantum = value;
    });

    // Speed slider
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    speedSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      speedValue.textContent = `${value}x`;
      this.scheduler.speed = value;
      this.scheduler2.speed = value;
    });

    // Action buttons
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
    document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    document.getElementById('addProcess').addEventListener('click', () => this.addNewProcess());
    document.getElementById('clearProcesses').addEventListener('click', () => this.clearProcesses());
    document.getElementById('stressMode').addEventListener('click', () => this.enableStressMode());

    // Comparison mode toggle
    document.getElementById('comparisonToggle').addEventListener('click', () => this.toggleComparisonMode());

    // Comparison algorithm selects
    document.getElementById('algoSelect1')?.addEventListener('change', (e) => {
      this.scheduler.setAlgorithm(e.target.value);
    });
    document.getElementById('algoSelect2')?.addEventListener('change', (e) => {
      this.scheduler2.setAlgorithm(e.target.value);
    });
  }

  updateRRControlsVisibility() {
    const rrControls = document.getElementById('rrControls');
    const isRR = this.scheduler.currentAlgorithm === 'rr';
    rrControls.style.display = isRR ? 'block' : 'none';
  }

  initializeProcesses() {
    const processes = createSampleProcesses(5);
    this.scheduler.setProcesses(processes);
    this.renderProcessList();
  }

  setupSchedulerCallbacks() {
    this.scheduler.onTick = (time, currentProcess) => {
      this.updateTimeDisplay(time);
      this.updateCPUCore(currentProcess);
      this.updateReadyQueue();
      this.updateCompletedArea();

      // Also update CPU1 in comparison mode
      if (this.isComparisonMode) {
        this.updateComparisonCPU(1, currentProcess);
      }
    };

    this.scheduler.onGanttUpdate = (history) => {
      if (this.isComparisonMode) {
        this.renderComparisonGantt(1, history);
      } else {
        this.renderGanttChart(history);
      }
    };

    this.scheduler.onMetricsUpdate = (metrics) => {
      this.updateMetrics(metrics);
      if (this.isComparisonMode) {
        this.updateComparisonMetrics();
      }
    };

    this.scheduler.onContextSwitch = (process, time) => {
      this.animateContextSwitch(process);
    };

    this.scheduler.onProcessComplete = (process) => {
      this.animateProcessComplete(process);
    };

    // Setup scheduler2 for comparison mode
    this.scheduler2.onTick = (time, currentProcess) => {
      if (this.isComparisonMode) {
        this.updateComparisonCPU(2, currentProcess);
      }
    };

    this.scheduler2.onGanttUpdate = (history) => {
      if (this.isComparisonMode) {
        this.renderComparisonGantt(2, history);
      }
    };

    this.scheduler2.onMetricsUpdate = (metrics) => {
      if (this.isComparisonMode) {
        this.updateComparisonMetrics();
      }
    };
  }

  start() {
    if (this.scheduler.processes.length === 0) {
      this.initializeProcesses();
    }

    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;

    this.scheduler.start();

    if (this.isComparisonMode) {
      this.scheduler2.start();
    }

    // Add active class to CPU
    document.getElementById('cpuCore').classList.add('active');
  }

  togglePause() {
    const pauseBtn = document.getElementById('pauseBtn');

    if (this.scheduler.isPaused) {
      this.scheduler.resume();
      if (this.isComparisonMode) this.scheduler2.resume();
      pauseBtn.querySelector('span:last-child').textContent = 'Pause';
      pauseBtn.querySelector('.btn-icon').textContent = '⏸';
    } else {
      this.scheduler.pause();
      if (this.isComparisonMode) this.scheduler2.pause();
      pauseBtn.querySelector('span:last-child').textContent = 'Resume';
      pauseBtn.querySelector('.btn-icon').textContent = '▶';
    }
  }

  reset() {
    this.scheduler.reset();
    if (this.isComparisonMode) this.scheduler2.reset();

    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('pauseBtn').querySelector('span:last-child').textContent = 'Pause';
    document.getElementById('pauseBtn').querySelector('.btn-icon').textContent = '⏸';

    document.getElementById('cpuCore').classList.remove('active');
    document.getElementById('currentProcess').textContent = 'IDLE';
    const currentTimeEl = document.getElementById('currentTime');
    if (currentTimeEl) currentTimeEl.textContent = '0';

    this.renderProcessList();
    this.render();
    this.clearGanttChart();
    this.resetMetrics();
  }

  addNewProcess() {
    const newProcess = new Process({
      arrivalTime: this.scheduler.currentTime + Math.floor(Math.random() * 3),
      burstTime: Math.floor(Math.random() * 8) + 2,
      priority: Math.floor(Math.random() * 10) + 1
    });

    this.scheduler.addProcess(newProcess);

    if (this.isComparisonMode) {
      this.scheduler2.addProcess(newProcess.clone());
    }

    this.renderProcessList();
    this.animateNewProcess(newProcess);
  }

  clearProcesses() {
    Process.idCounter = 0;
    this.scheduler.setProcesses([]);
    this.scheduler2.setProcesses([]);
    this.reset();
    this.renderProcessList();
  }

  enableStressMode() {
    const processes = createStressProcesses(100);
    this.scheduler.setProcesses(processes);

    if (this.isComparisonMode) {
      const clonedProcesses = processes.map(p => p.clone());
      this.scheduler2.setProcesses(clonedProcesses);
    }

    this.renderProcessList();
    this.reset();
  }

  toggleComparisonMode() {
    this.isComparisonMode = !this.isComparisonMode;

    const toggle = document.getElementById('comparisonToggle');
    const singleMode = document.getElementById('singleMode');
    const comparisonMode = document.getElementById('comparisonMode');

    toggle.classList.toggle('active', this.isComparisonMode);

    if (this.isComparisonMode) {
      singleMode.classList.add('hidden');
      comparisonMode.classList.remove('hidden');

      // Clone processes for second scheduler - create fresh clones
      const clonedProcesses = this.scheduler.processes.map(p => {
        const clone = p.clone();
        clone.reset(); // Ensure clean state
        return clone;
      });

      // Reset scheduler1 processes too for fair comparison
      this.scheduler.processes.forEach(p => p.reset());

      this.scheduler2.setProcesses(clonedProcesses);
      this.scheduler2.setAlgorithm(document.getElementById('algoSelect2').value);

      // Sync algorithm for scheduler1 from select
      this.scheduler.setAlgorithm(document.getElementById('algoSelect1').value);

      this.renderComparisonMetricsCharts();
    } else {
      singleMode.classList.remove('hidden');
      comparisonMode.classList.add('hidden');
    }

    this.reset();
  }

  render() {
    this.updateReadyQueue();
    this.updateCompletedArea();
  }

  renderProcessList() {
    const list = document.getElementById('processList');
    list.innerHTML = '';

    this.scheduler.processes.forEach(p => {
      const item = document.createElement('div');
      item.className = 'process-item';
      item.innerHTML = `
        <span class="process-color" style="color: ${p.color}; background: ${p.color}"></span>
        <span class="process-name">${p.name}</span>
        <span class="process-stats">B:${p.burstTime} P:${p.priority}</span>
        <button class="process-remove" data-id="${p.id}">×</button>
      `;

      item.querySelector('.process-remove').addEventListener('click', () => {
        this.scheduler.removeProcess(p.id);
        if (this.isComparisonMode) this.scheduler2.removeProcess(p.id);
        this.renderProcessList();
      });

      list.appendChild(item);
    });
  }

  updateReadyQueue() {
    const container = document.getElementById('queueContainer');
    container.innerHTML = '';

    // Add compact class if many processes
    const isCompact = this.scheduler.readyQueue.length > 10;
    container.classList.toggle('compact', isCompact);

    this.scheduler.readyQueue.forEach((p, index) => {
      const node = this.createProcessNode(p, isCompact);
      node.style.animationDelay = `${index * 0.05}s`;
      container.appendChild(node);
    });
  }

  updateCompletedArea() {
    const container = document.getElementById('completedContainer');
    container.innerHTML = '';

    // Add compact class if many processes
    const isCompact = this.scheduler.completedProcesses.length > 10;
    container.classList.toggle('compact', isCompact);

    this.scheduler.completedProcesses.forEach((p, index) => {
      const node = this.createProcessNode(p, isCompact);
      node.classList.add('completed');
      node.style.opacity = '0.6';
      if (isCompact) node.style.animation = 'none';
      container.appendChild(node);
    });
  }

  createProcessNode(process, isCompact = false) {
    const node = document.createElement('div');
    node.className = 'process-node';
    node.dataset.id = process.id;

    const style = process.getStyle();

    // Adjust size for compact mode
    if (isCompact) {
      style.width = '28px';
      style.height = '28px';
    }

    Object.assign(node.style, style);

    node.innerHTML = `<span>${process.name}</span>`;
    node.title = `${process.name}\nBurst: ${process.burstTime}\nRemaining: ${process.remainingTime}\nPriority: ${process.priority}`;

    if (process.state === 'running') {
      node.classList.add('running');
    }

    return node;
  }

  updateCPUCore(currentProcess) {
    const cpuCore = document.getElementById('cpuCore');
    const currentProcessDisplay = document.getElementById('currentProcess');

    if (currentProcess) {
      cpuCore.classList.add('active');
      currentProcessDisplay.textContent = currentProcess.name;
      currentProcessDisplay.style.color = currentProcess.color;

      // Update CPU border color to match process
      const cpuCenter = cpuCore.querySelector('.cpu-center');
      cpuCenter.style.borderColor = currentProcess.color;
      cpuCenter.style.boxShadow = `0 0 30px ${currentProcess.color}60, inset 0 0 30px ${currentProcess.color}20`;
    } else {
      cpuCore.classList.remove('active');
      currentProcessDisplay.textContent = 'IDLE';
      currentProcessDisplay.style.color = 'var(--text-muted)';

      const cpuCenter = cpuCore.querySelector('.cpu-center');
      cpuCenter.style.borderColor = 'var(--neon-cyan)';
      cpuCenter.style.boxShadow = '';
    }
  }

  updateTimeDisplay(time) {
    const el = document.getElementById('currentTime');
    if (el) el.textContent = time;
  }

  renderGanttChart(history) {
    const chart = document.getElementById('ganttChart');

    chart.innerHTML = '';

    if (history.length === 0) return;

    const blockWidth = 40;

    history.forEach((entry, index) => {
      const duration = entry.endTime - entry.startTime;
      const block = document.createElement('div');
      block.className = 'gantt-block';

      if (entry.preempted) block.classList.add('preempted');
      if (entry.contextSwitch && index > 0) block.classList.add('context-switch');

      block.style.cssText = `
        width: ${duration * blockWidth}px;
        background: linear-gradient(135deg, ${entry.color}, ${this.adjustColor(entry.color, -30)});
        color: ${this.getContrastColor(entry.color)};
      `;
      block.textContent = entry.processName;
      block.title = `${entry.processName}: ${entry.startTime} - ${entry.endTime}`;

      chart.appendChild(block);
    });

    // Auto-scroll to end
    const container = chart.parentElement;
    container.scrollLeft = container.scrollWidth;
  }

  clearGanttChart() {
    document.getElementById('ganttChart').innerHTML = '';
  }

  updateMetrics(metrics) {
    // Update values with animation
    this.animateValue('cpuUtilization', metrics.cpuUtilization + '%');
    this.animateValue('avgWaitTime', metrics.avgWaitTime);
    this.animateValue('avgTurnaround', metrics.avgTurnaround);
    this.animateValue('avgResponse', metrics.avgResponse);
    this.animateValue('contextSwitches', metrics.contextSwitches);
    this.animateValue('throughput', metrics.throughput);

    // Update gauge
    const utilization = parseFloat(metrics.cpuUtilization);
    const gaugeCircle = document.getElementById('gaugeCircle');
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (utilization / 100) * circumference;
    gaugeCircle.style.strokeDashoffset = offset;
    gaugeCircle.style.stroke = this.getUtilizationColor(utilization);

    // Update bars
    const maxTime = 20;
    document.getElementById('waitBar').style.width = `${Math.min(parseFloat(metrics.avgWaitTime) / maxTime * 100, 100)}%`;
    document.getElementById('turnaroundBar').style.width = `${Math.min(parseFloat(metrics.avgTurnaround) / maxTime * 100, 100)}%`;
    document.getElementById('responseBar').style.width = `${Math.min(parseFloat(metrics.avgResponse) / maxTime * 100, 100)}%`;
  }

  resetMetrics() {
    this.animateValue('cpuUtilization', '0%');
    this.animateValue('avgWaitTime', '0.00');
    this.animateValue('avgTurnaround', '0.00');
    this.animateValue('avgResponse', '0.00');
    this.animateValue('contextSwitches', '0');
    this.animateValue('throughput', '0.00');

    document.getElementById('gaugeCircle').style.strokeDashoffset = 251.2;
    document.getElementById('waitBar').style.width = '0%';
    document.getElementById('turnaroundBar').style.width = '0%';
    document.getElementById('responseBar').style.width = '0%';
  }

  animateValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value;
    }
  }

  getUtilizationColor(utilization) {
    if (utilization < 30) return '#ef4444';
    if (utilization < 60) return '#f97316';
    if (utilization < 80) return '#eab308';
    return '#22c55e';
  }

  animateContextSwitch(process) {
    const cpuCenter = document.querySelector('.cpu-center');
    cpuCenter.classList.add('context-switch-flash');
    setTimeout(() => cpuCenter.classList.remove('context-switch-flash'), 300);
  }

  animateProcessComplete(process) {
    // Flash effect when process completes
    const completedContainer = document.getElementById('completedContainer');
    completedContainer.classList.add('completion-flash');
    setTimeout(() => completedContainer.classList.remove('completion-flash'), 300);
  }

  animateNewProcess(process) {
    const node = this.createProcessNode(process);
    node.classList.add('new-process-animation');

    // Remove animation class after it plays
    setTimeout(() => node.classList.remove('new-process-animation'), 500);
  }

  // Comparison mode methods
  updateComparisonCPU(cpuNum, currentProcess) {
    const cpuCore = document.getElementById(`cpuCore${cpuNum}`);
    const currentProcessDisplay = document.getElementById(`currentProcess${cpuNum}`);

    if (currentProcess) {
      cpuCore.classList.add('active');
      currentProcessDisplay.textContent = currentProcess.name;
      currentProcessDisplay.style.color = currentProcess.color;
    } else {
      cpuCore.classList.remove('active');
      currentProcessDisplay.textContent = 'IDLE';
      currentProcessDisplay.style.color = 'var(--text-muted)';
    }
  }

  renderComparisonGantt(cpuNum, history) {
    const chart = document.getElementById(`ganttChart${cpuNum}`);
    if (!chart) return;

    chart.innerHTML = '';

    const blockWidth = 25;

    history.forEach((entry) => {
      const duration = entry.endTime - entry.startTime;
      const block = document.createElement('div');
      block.className = 'gantt-block';
      block.style.cssText = `
        width: ${duration * blockWidth}px;
        height: 35px;
        min-width: 20px;
        background: linear-gradient(135deg, ${entry.color}, ${this.adjustColor(entry.color, -30)});
        font-size: 0.6rem;
      `;
      block.textContent = entry.processName;
      chart.appendChild(block);
    });

    chart.scrollLeft = chart.scrollWidth;
  }

  renderComparisonMetricsCharts() {
    const container = document.getElementById('metricsCharts');
    container.innerHTML = `
      <div class="comparison-bar">
        <div class="comparison-bar-track">
          <div class="comparison-bar-fill" id="waitBar1" data-value="0"></div>
          <div class="comparison-bar-fill algo-2" id="waitBar2" data-value="0"></div>
        </div>
        <div class="comparison-bar-label">Avg Wait Time</div>
      </div>
      <div class="comparison-bar">
        <div class="comparison-bar-track">
          <div class="comparison-bar-fill" id="turnBar1" data-value="0"></div>
          <div class="comparison-bar-fill algo-2" id="turnBar2" data-value="0"></div>
        </div>
        <div class="comparison-bar-label">Avg Turnaround</div>
      </div>
      <div class="comparison-bar">
        <div class="comparison-bar-track">
          <div class="comparison-bar-fill" id="csBar1" data-value="0"></div>
          <div class="comparison-bar-fill algo-2" id="csBar2" data-value="0"></div>
        </div>
        <div class="comparison-bar-label">Context Switches</div>
      </div>
    `;
  }

  updateComparisonMetrics() {
    const metrics1 = this.scheduler.getMetrics();
    const metrics2 = this.scheduler2.getMetrics();

    const maxWait = Math.max(parseFloat(metrics1.avgWaitTime), parseFloat(metrics2.avgWaitTime), 1);
    const maxTurn = Math.max(parseFloat(metrics1.avgTurnaround), parseFloat(metrics2.avgTurnaround), 1);
    const maxCS = Math.max(metrics1.contextSwitches, metrics2.contextSwitches, 1);

    this.updateComparisonBar('waitBar1', metrics1.avgWaitTime, maxWait);
    this.updateComparisonBar('waitBar2', metrics2.avgWaitTime, maxWait);
    this.updateComparisonBar('turnBar1', metrics1.avgTurnaround, maxTurn);
    this.updateComparisonBar('turnBar2', metrics2.avgTurnaround, maxTurn);
    this.updateComparisonBar('csBar1', metrics1.contextSwitches, maxCS);
    this.updateComparisonBar('csBar2', metrics2.contextSwitches, maxCS);
  }

  updateComparisonBar(id, value, max) {
    const bar = document.getElementById(id);
    if (!bar) return;

    const height = (parseFloat(value) / max) * 80;
    bar.style.height = `${height}px`;
    bar.dataset.value = value;
  }

  // Utility methods
  adjustColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
  }

  getContrastColor(hex) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  window.app = new CPUSchedulerApp();
});
