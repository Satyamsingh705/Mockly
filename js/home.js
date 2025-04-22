document.addEventListener('DOMContentLoaded', function() {
  // Update recent tests with user scores if available
  updateRecentTestsWithScores();
  
  function updateRecentTestsWithScores() {
    // Get all test cards
    const testCards = document.querySelectorAll('.recent-tests-section .test-card');
    
    // Process each test card
    testCards.forEach(card => {
      // Get the test ID from the link
      const testLink = card.querySelector('a.btn-primary');
      if (!testLink) return;
      
      const href = testLink.getAttribute('href');
      const testIdMatch = href.match(/id=(\d+)/);
      if (!testIdMatch) return;
      
      const testId = testIdMatch[1];
      
      // Try to retrieve results for this test from localStorage
      try {
        const resultsKey = `test_results_${testId}`;
        const storedResults = localStorage.getItem(resultsKey);
        
        if (storedResults) {
          const results = JSON.parse(storedResults);
          
          // Add score information to the test card
          const testMeta = card.querySelector('.test-meta');
          const scoreSpan = document.createElement('span');
          scoreSpan.className = 'test-score';
          scoreSpan.innerHTML = `<i class="fas fa-trophy"></i> Your Score: ${results.percentage}%`;
          
          // Add color based on score
          if (results.percentage >= 70) {
            scoreSpan.style.color = '#4CAF50';  // Green
          } else if (results.percentage >= 40) {
            scoreSpan.style.color = '#FF9800';  // Orange/amber
          } else {
            scoreSpan.style.color = '#F44336';  // Red
          }
          
          testMeta.appendChild(scoreSpan);
          
          // Update the button text to "Retake Test"
          testLink.textContent = "Retake Test";
        }
      } catch (error) {
        console.error("Error retrieving test results:", error);
      }
    });
  }
});