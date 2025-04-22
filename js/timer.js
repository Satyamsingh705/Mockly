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
    this.warningPlayed = false; // Track if warning sound has been played
    
    // Create multiple sound options for better browser compatibility
    this.warningSound = null;
    this.initializeSound();
    
    this.popupShown = false; // Track if warning popup has been shown
  }
  
  // Initialize sound with error handling and multiple options
  initializeSound() {
    // Try loading from multiple sources for better compatibility
    const soundSources = [
      'https://soundbible.com/grab.php?id=2218&type=mp3',
      'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
      'https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3'
    ];
    
    // Try each sound source until one works
    for (const source of soundSources) {
      try {
        const sound = new Audio(source);
        
        // Preload the sound
        sound.load();
        
        // If we successfully created an Audio object, use it
        if (sound) {
          this.warningSound = sound;
          console.log('Sound initialized successfully');
          break;
        }
      } catch (err) {
        console.error('Error creating Audio object:', err);
      }
    }
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
    this.timerElement.style.color = ''; // Reset the color
    this.warningPlayed = false; // Reset warning flag
    this.popupShown = false; // Reset popup flag
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
      this.timerElement.style.color = 'red'; // Make timer text red at 5 minutes
      
      // Play warning sound and show popup only once when we first reach the threshold
      if (!this.warningPlayed && this.warningSound) {
        console.log('Attempting to play sound...');
        
        // Create user interaction check
        const playPromise = this.warningSound.play();
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('Sound playing successfully');
            this.warningPlayed = true;
          }).catch(err => {
            console.error('Sound playback failed:', err);
            // If autoplay is prevented, we'll show a button to play the sound
            this.createSoundPlayButton();
          });
        }
        
        // Show popup alert
        if (!this.popupShown) {
          this.showWarningPopup("5 minutes remaining, hurry up!");
          this.popupShown = true;
        }
      }
    }
    // Check for danger threshold (1 minute)
    else if (this.remainingSeconds <= this.dangerThreshold) {
      this.timerElement.classList.remove('timer-warning');
      this.timerElement.classList.add('timer-danger');
      this.timerElement.style.color = 'red'; // Keep timer text red at 1 minute
    } else {
      // Reset color if above warning threshold
      this.timerElement.style.color = '';
    }
  }
  
  // Add a method to create a button that plays the sound when clicked
  createSoundPlayButton() {
    const button = document.createElement('button');
    button.textContent = "Click to Play Alert Sound";
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.right = '10px';
    button.style.zIndex = '10000';
    button.style.backgroundColor = '#ff3333';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.padding = '8px 16px';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    
    button.addEventListener('click', () => {
      if (this.warningSound) {
        this.warningSound.play();
        document.body.removeChild(button);
      }
    });
    
    document.body.appendChild(button);
  }
  
  showWarningPopup(message) {
    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'time-warning-popup';
    popup.innerHTML = `
      <div class="popup-content">
        <h3>Time Alert</h3>
        <p>${message}</p>
        <button id="close-popup">Continue</button>
      </div>
    `;
    
    // Style the popup
    const style = document.createElement('style');
    style.textContent = `
      .time-warning-popup {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      }
      .popup-content {
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        max-width: 400px;
        animation: popup-bounce 0.5s;
      }
      .popup-content h3 {
        color: #ff3333;
        margin-top: 0;
      }
      .popup-content button {
        background-color: #ff3333;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        margin-top: 10px;
      }
      @keyframes popup-bounce {
        0% { transform: scale(0.8); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(popup);
    
    // Add event listener to close button
    document.getElementById('close-popup').addEventListener('click', () => {
      document.body.removeChild(popup);
    });
    
    // Auto-close after 5 seconds so it doesn't block the test if ignored
    setTimeout(() => {
      if (document.body.contains(popup)) {
        document.body.removeChild(popup);
      }
    }, 5000);
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