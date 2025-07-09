// Live Graph Tab - Processing Grapher Web
import { setStatusBar, showModal } from './ui.js';
import { fileNamingSystem } from './file_naming.js';
import { driveIntegration } from './drive_integration.js';

export class LiveGraph {
  constructor(state) {
    this.state = state;
    this.graphType = 'line'; // line, dot, bar
    this.data = [];
    this.channelNames = ['Signal-1', 'Signal-2', 'Signal-3', 'Signal-4', 'Signal-5', 'Signal-6', 'Signal-7', 'Signal-8', 'Signal-9', 'Signal-10', 'Signal-11', 'Signal-12', 'Signal-13'];
    this.channelColors = ['#67d8ef', '#d02662', '#61afef', '#e05c7e', '#98c379', '#e5c07b', '#c678dd', '#56b6c2', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
    this.channelVisible = new Array(13).fill(true);
    this.maxSamples = 1000;
    this.recording = false;
    this.paused = false;
    this.baud = 9600;
    this.port = null;
    this.reader = null;
    this.connected = false;
    this.autoScale = true;
    this.yMin = -10;
    this.yMax = 10;
    this.dataRate = 24.0;
    this.lastDataTime = Date.now();
    this.dataCount = 0;
    this.rawBuffer = '';
    this.expandOnly = true;
    this.splitChannels = [1, 2, 3, 4];
    this.currentValues = new Array(13).fill(0);
    this.smoothingBuffer = [];
    this.smoothingFactor = 0.8;
    this.animationFrame = null;
    this.splitMode = false; // false = single graph, true = split graphs
    this.canvases = [];
    this.contexts = [];
    this.driveLink = null; // Store the drive link for current recording
    this.init();
  }

  // ... rest of the class implementation ...

} // Added closing brace for class LiveGraph