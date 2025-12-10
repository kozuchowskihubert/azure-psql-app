// HAOS System Monitor - Real-time metrics and visualization
class HAOSSystemMonitor {
    constructor() {
        this.metrics = {
            cpu: 0,
            memory: 0,
            activeSessions: 0,
            apiRequests: 0,
            databaseConnections: 0,
            audioLatency: 0,
        };

        this.history = {
            cpu: [],
            memory: [],
            requests: [],
        };

        this.maxHistoryLength = 50;
        this.updateInterval = 2000; // 2 seconds
    }

    async init() {
        console.log('🔧 HAOS System Monitor initializing...');
        this.startMonitoring();
        return this;
    }

    startMonitoring() {
        // Simulated metrics - in production, these would come from real API
        setInterval(() => {
            this.updateMetrics();
        }, this.updateInterval);
    }

    updateMetrics() {
        // Simulate realistic metrics
        this.metrics.cpu = Math.min(100, Math.max(10, this.metrics.cpu + (Math.random() - 0.5) * 20));
        this.metrics.memory = Math.min(100, Math.max(20, this.metrics.memory + (Math.random() - 0.5) * 15));
        this.metrics.apiRequests = Math.max(0, this.metrics.apiRequests + Math.floor((Math.random() - 0.3) * 50));
        this.metrics.activeSessions = Math.max(1, Math.floor(5 + Math.random() * 10));
        this.metrics.databaseConnections = Math.max(0, Math.floor(2 + Math.random() * 5));
        this.metrics.audioLatency = Math.max(5, Math.min(50, 15 + (Math.random() - 0.5) * 10));

        // Add to history
        this.history.cpu.push(this.metrics.cpu);
        this.history.memory.push(this.metrics.memory);
        this.history.requests.push(this.metrics.apiRequests);

        // Trim history
        if (this.history.cpu.length > this.maxHistoryLength) {
            this.history.cpu.shift();
            this.history.memory.shift();
            this.history.requests.shift();
        }

        // Dispatch update event
        window.dispatchEvent(new CustomEvent('haos:metrics-update', {
            detail: {
                metrics: this.metrics,
                history: this.history,
            },
        }));
    }

    getMetrics() {
        return this.metrics;
    }

    getHistory() {
        return this.history;
    }
}

// Initialize global monitor
window.HAOSMonitor = new HAOSSystemMonitor();
