class TestTimer {
  constructor(durationInMinutes, timerElement, onTimeUp) {
    this.totalSeconds = durationInMinutes * 60;
    this.remainingSeconds = this.totalSeconds;
    this.timerElement = timerElement;
    this.onTimeUp = onTimeUp;
    this.intervalId = null;
    this.warningThreshold = 300; // 5 minutes
    this.dangerThreshold = 60; // 1 minute
    this.isPaused = false;
  }
  
  start() {
    this.updateDisplay();
    
    this.intervalId = setInterval(() => {
      if (!this.isPaused) {
        this.remainingSeconds--;
        this.updateDisplay();
        
        // Check for warning/danger thresholds
        this.checkThresholds();
        
        // Check if time is up
        if (this.remainingSeconds <= 0) {
          this.stop();
          if (typeof this.onTimeUp === 'function') {
            this.onTimeUp();
          }
        }
      }
    }, 1000);
  }
  
  stop() {
    clearInterval(this.intervalId);
  }
  
  pause() {
    this.isPaused = true;
  }
  
  resume() {
    this.isPaused = false;
  }
  
  reset() {
    this.remainingSeconds = this.totalSeconds;
    this.updateDisplay();
    this.timerElement.classList.remove('timer-warning', 'timer-danger');
  }
  
  updateDisplay() {
    const hours = Math.floor(this.remainingSeconds / 3600);
    const minutes = Math.floor((this.remainingSeconds % 3600) / 60);
    const seconds = this.remainingSeconds % 60;
    
    this.timerElement.textContent = 
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  checkThresholds() {
    // Check for warning threshold (5 minutes)
    if (this.remainingSeconds <= this.warningThreshold && this.remainingSeconds > this.dangerThreshold) {
      this.timerElement.classList.add('timer-warning');
      this.timerElement.classList.remove('timer-danger');
    }
    // Check for danger threshold (1 minute)
    else if (this.remainingSeconds <= this.dangerThreshold) {
      this.timerElement.classList.remove('timer-warning');
      this.timerElement.classList.add('timer-danger');
    }
  }
  
  getRemainingTime() {
    return this.remainingSeconds;
  }
  
  getElapsedTime() {
    return this.totalSeconds - this.remainingSeconds;
  }
  
  getPercentageRemaining() {
    return (this.remainingSeconds / this.totalSeconds) * 100;
  }
}