document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const resultsTitle = document.getElementById('results-title');
  const testName = document.getElementById('test-name');
  const testDate = document.getElementById('test-date');
  const testDuration = document.getElementById('test-duration');
  const overallScore = document.getElementById('overall-score');
  const totalScore = document.querySelector('.total-score');
  const percentage = document.getElementById('percentage');
  const correctCount = document.getElementById('correct-count');
  const incorrectCount = document.getElementById('incorrect-count');
  const notAttemptedCount = document.getElementById('not-attempted-count');
  const sectionAnalysisBody = document.getElementById('section-analysis-body');
  const questionsList = document.getElementById('questions-list');
  const toggleAnswersBtn = document.getElementById('toggle-answers');
  const downloadPdfBtn = document.getElementById('download-pdf');
  
  // State variables
  let results = null;
  let showAllQuestions = false;
  
  // Initialize the results page
  function initResults() {
    // Try to get results from session storage
    const storedResults = sessionStorage.getItem('testResults');
    
    if (storedResults) {
      results = JSON.parse(storedResults);
      renderResults();
    } else {
      // If no results in session storage, try to get from URL parameter
      const urlParams = new URLSearchParams(window.location.search);
      const testId = urlParams.get('id');
      
      if (testId) {
        // In a real app, this would be an API call to fetch results
        // Using mock data for demonstration
        getMockResults(testId);
      } else {
        showError('No results available');
      }
    }
  }
  
  // Get mock results for demo
  function getMockResults(testId) {
    // Simulating API delay
    showLoading();
    
    setTimeout(() => {
      // Generate mock results
      results = generateMockResults(testId);
      
      if (results) {
        renderResults();
      } else {
        showError('Results not found');
      }
    }, 1000);
  }
  
  // Show loading state
  function showLoading() {
    const sections = document.querySelectorAll('section:not(.results-header)');
    sections.forEach(section => {
      section.innerHTML = `
        <div class="loading-indicator">
          <i class="fas fa-circle-notch fa-spin"></i>
          <p>Loading results...</p>
        </div>
      `;
    });
  }
  
  // Show error message
  function showError(message) {
    const sections = document.querySelectorAll('section:not(.results-header)');
    sections.forEach(section => {
      section.innerHTML = '';
    });
    
    document.querySelector('.score-summary .container').innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <h3>Error</h3>
        <p>${message}</p>
        <a href="tests.html" class="btn btn-primary">Back to Tests</a>
      </div>
    `;
  }
  
  // Render results
  function renderResults() {
    updateResultsHeader();
    updateScoreSummary();
    renderCharts();
    renderSectionAnalysis();
    renderQuestionAnalysis();
  }
  
  // Update results header
  function updateResultsHeader() {
    resultsTitle.textContent = 'Test Results';
    testName.innerHTML = `<i class="fas fa-file-alt"></i> ${results.testTitle}`;
    testDate.innerHTML = `<i class="fas fa-calendar-alt"></i> Date: ${formatDate(results.date)}`;
    
    const hours = Math.floor(results.timeSpent / 3600);
    const minutes = Math.floor((results.timeSpent % 3600) / 60);
    const seconds = results.timeSpent % 60;
    
    const timeString = `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`;
    testDuration.innerHTML = `<i class="fas fa-clock"></i> Duration: ${timeString} / ${results.duration} minutes`;
  }
  
  // Update score summary
  function updateScoreSummary() {
    overallScore.textContent = results.totalScore;
    totalScore.textContent = `/ ${results.totalMarks}`;
    percentage.textContent = `${results.percentage}%`;
    correctCount.textContent = results.correctAnswers;
    incorrectCount.textContent = results.incorrectAnswers;
    notAttemptedCount.textContent = results.notAttempted;
    
    // Add color to percentage based on score
    if (results.percentage >= 70) {
      percentage.style.color = 'var(--secondary-color)';
    } else if (results.percentage >= 40) {
      percentage.style.color = 'var(--accent-color)';
    } else {
      percentage.style.color = 'var(--danger-color)';
    }
  }
  
  // Render charts
  function renderCharts() {
    // Score distribution chart
    const scoreCtx = document.getElementById('score-chart').getContext('2d');
    const scoreData = {
      labels: ['Correct', 'Incorrect', 'Not Attempted'],
      datasets: [{
        data: [results.correctAnswers, results.incorrectAnswers, results.notAttempted],
        backgroundColor: ['rgba(52, 168, 83, 0.7)', 'rgba(234, 67, 53, 0.7)', 'rgba(154, 160, 166, 0.7)'],
        borderColor: ['rgba(52, 168, 83, 1)', 'rgba(234, 67, 53, 1)', 'rgba(154, 160, 166, 1)'],
        borderWidth: 1
      }]
    };
    
    new Chart(scoreCtx, {
      type: 'doughnut',
      data: scoreData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
    
    // Time per section chart
    const timeCtx = document.getElementById('time-chart').getContext('2d');
    
    // Calculate approximate time per section based on results
    const sections = Object.keys(results.sectionAnalysis);
    const totalQuestions = results.totalQuestions;
    const timeData = [];
    const sectionColors = [];
    
    sections.forEach((section, index) => {
      const sectionData = results.sectionAnalysis[section];
      const sectionTime = Math.round((sectionData.total / totalQuestions) * results.timeSpent);
      timeData.push(sectionTime);
      
      // Generate colors for sections
      const hue = index * (360 / sections.length);
      sectionColors.push(`hsla(${hue}, 70%, 60%, 0.7)`);
    });
    
    const timeChartData = {
      labels: sections,
      datasets: [{
        label: 'Time Spent (seconds)',
        data: timeData,
        backgroundColor: sectionColors,
        borderColor: sectionColors.map(color => color.replace('0.7', '1')),
        borderWidth: 1
      }]
    };
    
    new Chart(timeCtx, {
      type: 'bar',
      data: timeChartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw;
                const minutes = Math.floor(value / 60);
                const seconds = value % 60;
                return `Time: ${minutes}m ${seconds}s`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                const minutes = Math.floor(value / 60);
                const seconds = value % 60;
                return `${minutes}m ${seconds}s`;
              }
            }
          }
        }
      }
    });
  }
  
  // Render section analysis
  function renderSectionAnalysis() {
    sectionAnalysisBody.innerHTML = '';
    
    Object.keys(results.sectionAnalysis).forEach(section => {
      const sectionData = results.sectionAnalysis[section];
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${section}</td>
        <td>${sectionData.total}</td>
        <td>${sectionData.attempted}</td>
        <td>${sectionData.correct}</td>
        <td>${sectionData.incorrect}</td>
        <td>${sectionData.score}</td>
        <td>${sectionData.accuracy}%</td>
      `;
      
      sectionAnalysisBody.appendChild(row);
    });
  }
  
  // Render question analysis
  function renderQuestionAnalysis() {
    // Update toggle button
    toggleAnswersBtn.textContent = showAllQuestions ? 'Show Incorrect Only' : 'Show All Questions';
    
    // Clear questions list
    questionsList.innerHTML = '';
    
    // Filter questions if needed
    let questionsToShow = [];
    
    if (showAllQuestions) {
      questionsToShow = results.questions.map((q, i) => ({ question: q, response: results.userResponses[i], index: i }));
    } else {
      questionsToShow = results.questions
        .map((q, i) => ({ question: q, response: results.userResponses[i], index: i }))
        .filter(item => {
          // Show only incorrect or unattempted questions
          const userAnswer = item.response.selectedOption;
          return userAnswer === null || userAnswer !== item.question.correctOption;
        });
    }
    
    // If no questions to show
    if (questionsToShow.length === 0) {
      questionsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3>All questions answered correctly!</h3>
          <p>Great job! You didn't miss any questions.</p>
        </div>
      `;
      return;
    }
    
    // Create question items
    questionsToShow.forEach(item => {
      const question = item.question;
      const response = item.response;
      const index = item.index;
      
      const userAnswer = response.selectedOption;
      const correctAnswer = question.correctOption;
      let status = '';
      let statusClass = '';
      
      if (userAnswer === null) {
        status = 'Not Attempted';
        statusClass = 'status-not-attempted';
      } else if (userAnswer === correctAnswer) {
        status = 'Correct';
        statusClass = 'status-correct';
      } else {
        status = 'Incorrect';
        statusClass = 'status-incorrect';
      }
      
      const questionItem = document.createElement('div');
      questionItem.className = 'question-item';
      
      // Generate options HTML
      let optionsHTML = '';
      question.options.forEach((option, optIndex) => {
        let optionClass = '';
        let optionLabel = '';
        
        if (optIndex === correctAnswer) {
          optionClass = 'option-correct';
          optionLabel = `<span class="correct-answer-label">Correct Answer</span>`;
        } else if (optIndex === userAnswer && userAnswer !== correctAnswer) {
          optionClass = 'option-incorrect';
          optionLabel = `<span class="user-answer-label">Your Answer</span>`;
        }
        
        optionsHTML += `
          <div class="option-item ${optionClass}">
            <div class="option-marker">${String.fromCharCode(65 + optIndex)}</div>
            <div class="option-text">${option} ${optionLabel}</div>
          </div>
        `;
      });
      
      questionItem.innerHTML = `
        <div class="question-header">
          <div class="question-number">Question ${index + 1}</div>
          <span class="question-status ${statusClass}">${status}</span>
        </div>
        <div class="question-text">${question.text}</div>
        <div class="options-list">
          ${optionsHTML}
        </div>
        <div class="explanation">
          <h4>Explanation</h4>
          <p>The correct answer is option ${String.fromCharCode(65 + correctAnswer)}.
          ${generateExplanation(question, index)}</p>
        </div>
      `;
      
      questionsList.appendChild(questionItem);
    });
  }
  
  // Generate mock explanation
  function generateExplanation(question, index) {
    // Simple explanations for demo purposes
    const explanations = [
      'This question tests your understanding of logical sequences and patterns. The key is to identify the underlying rule.',
      'When solving this type of problem, start by breaking it down into smaller steps and analyze each component separately.',
      'This question requires applying the correct formula and careful calculation. Make sure to convert units if necessary.',
      'The answer involves understanding the relationships between different entities and applying deductive reasoning.',
      'To solve this problem, you need to recognize the pattern or sequence and extend it correctly to find the next value.',
      'This question tests your knowledge of specific concepts and definitions. Remember to review the fundamentals regularly.',
      'The solution requires applying multiple concepts together. Practice similar problems to improve your approach.',
      'This question evaluates your ability to interpret the given information and draw the correct conclusion.',
      'Remember to consider all possible scenarios and eliminate options that don\'t satisfy all conditions.',
      'Careful reading of the question is essential. Pay attention to key words that might change the meaning.'
    ];
    
    return explanations[index % explanations.length];
  }
  
  // Format date
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  // Generate mock results
  function generateMockResults(testId) {
    // Test details
    const testDetails = {
      '1': {
        id: '1',
        title: 'Reasoning Ability Mock Test',
        duration: 30,
        totalMarks: 30,
        questions: 30,
        sections: ['Reasoning']
      },
      '2': {
        id: '2',
        title: 'Quantitative Aptitude',
        duration: 25,
        totalMarks: 50,
        questions: 25,
        sections: ['Quantitative']
      },
      '3': {
        id: '3',
        title: 'Computer Science Mock Test',
        duration: 60,
        totalMarks: 80,
        questions: 40,
        sections: ['Computer Science']
      }
    };
    
    const test = testDetails[testId];
    
    if (!test) {
      return null;
    }
    
    // Generate random scores
    const totalQuestions = test.questions;
    const correctAnswers = Math.floor(Math.random() * (totalQuestions * 0.8)) + Math.floor(totalQuestions * 0.2);
    const attempted = Math.floor(Math.random() * (totalQuestions - correctAnswers)) + correctAnswers;
    const incorrectAnswers = attempted - correctAnswers;
    const notAttempted = totalQuestions - attempted;
    
    // Generate score
    const scorePerQuestion = test.totalMarks / totalQuestions;
    const totalScore = Math.round(correctAnswers * scorePerQuestion);
    const percentage = Math.round((totalScore / test.totalMarks) * 100);
    
    // Generate mock questions and responses
    const questions = [];
    const userResponses = [];
    
    for (let i = 0; i < totalQuestions; i++) {
      const section = test.sections[i % test.sections.length];
      
      // Create question
      questions.push({
        id: `q${i + 1}`,
        text: generateQuestionText(section, i),
        options: generateOptions(section, i),
        correctOption: Math.floor(Math.random() * 4),
        marks: scorePerQuestion,
        negativeMarks: 0.25,
        section: section
      });
      
      // Create user response
      let selectedOption = null;
      let isCorrect = false;
      
      if (i < attempted) {
        if (i < correctAnswers) {
          // Correct answer
          selectedOption = questions[i].correctOption;
          isCorrect = true;
        } else {
          // Incorrect answer
          do {
            selectedOption = Math.floor(Math.random() * 4);
          } while (selectedOption === questions[i].correctOption);
          isCorrect = false;
        }
      }
      
      userResponses.push({
        selectedOption: selectedOption,
        marked: Math.random() > 0.8,
        visited: i < attempted
      });
    }
    
    // Generate section analysis
    const sectionAnalysis = {};
    
    test.sections.forEach(section => {
      sectionAnalysis[section] = {
        total: 0,
        attempted: 0,
        correct: 0,
        incorrect: 0,
        score: 0,
        accuracy: 0
      };
    });
    
    questions.forEach((question, i) => {
      const section = question.section;
      const response = userResponses[i];
      
      sectionAnalysis[section].total++;
      
      if (response.selectedOption !== null) {
        sectionAnalysis[section].attempted++;
        
        if (response.selectedOption === question.correctOption) {
          sectionAnalysis[section].correct++;
          sectionAnalysis[section].score += question.marks;
        } else {
          sectionAnalysis[section].incorrect++;
          sectionAnalysis[section].score -= question.negativeMarks;
        }
      }
    });
    
    // Calculate section accuracy
    Object.keys(sectionAnalysis).forEach(section => {
      const sectionData = sectionAnalysis[section];
      sectionData.accuracy = sectionData.attempted > 0 
        ? Math.round((sectionData.correct / sectionData.attempted) * 100) 
        : 0;
    });
    
    return {
      testId: test.id,
      testTitle: test.title,
      totalQuestions: totalQuestions,
      totalMarks: test.totalMarks,
      attempted: attempted,
      notAttempted: notAttempted,
      correctAnswers: correctAnswers,
      incorrectAnswers: incorrectAnswers,
      totalScore: totalScore,
      percentage: percentage,
      userResponses: userResponses,
      questions: questions,
      sectionAnalysis: sectionAnalysis,
      duration: test.duration,
      timeSpent: Math.floor(Math.random() * (test.duration * 60 * 0.8)) + Math.floor(test.duration * 60 * 0.2),
      date: new Date().toISOString()
    };
  }
  
  // Generate question text
  function generateQuestionText(section, index) {
    const questionBanks = {
      'Reasoning': [
        'In a certain code language, "COMPUTER" is written as "RFUVQNPD". How is "FURNITURE" written in that code?',
        'If A + B means A is the mother of B; A - B means A is the brother of B; A * B means A is the father of B and A / B means A is the sister of B, then what does P + R - Q * S mean?',
        'In a row of boys, Aman is 7th from the left and Vishal is 9th from the right. When Aman and Vishal interchange their positions, Aman becomes 11th from the left. How many boys are there in the row?',
        'If the positions of the first and the sixth digits of the number 5379164 are interchanged, similarly the positions of the second and the seventh digits are interchanged and so on, which of the following will be the second digit from the right end after the rearrangement?',
        'Study the following information carefully and answer the given question. P, Q, R, S, T, U and V are sitting in a straight line facing north with equal distances between each other, but not necessarily in the same order. R sits third to the right of P. T sits second to the left of P. V is not an immediate neighbor of P. S sits second to the right of T. U is not an immediate neighbor of S. Which of the following represents the position of Q with respect to S?',
        'Five persons A, B, C, D and E are sitting in a row. B is between E and C. A is between E and D. Who is at the right end?',
        'If 9th January 2007 is Tuesday, what day of the week will be 9th January 2008?',
        'In a certain code, RIPPLE is written as 613382 and LIFE is written as 8192. How is PILLER written in that code?',
        'What will come in place of the question mark (?) in the following series? 3, 10, 29, 66, 127, ?',
        'Pointing to a photograph, a man said, "I have no brother or sister but that man\'s father is my father\'s son." Whose photograph was it?'
      ],
      'Quantitative': [
        'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?',
        'A sum of money doubles itself in 8 years. What is the rate of interest?',
        'If the cost price of 12 articles is equal to the selling price of 10 articles, then the profit percent is?',
        'A and B together can complete a work in 12 days. A alone can complete it in 20 days. In how many days can B alone complete the work?',
        'The average of first 50 natural numbers is:',
        'A boat goes 30 km upstream and 44 km downstream in 10 hours. In 13 hours, it can go 40 km upstream and 55 km downstream. The speed of the stream is:',
        'What is the value of x in the equation 3x - 15 = 6?',
        'Two trains running in opposite directions cross a man standing on the platform in 27 seconds and 17 seconds respectively and they cross each other in 23 seconds. The ratio of their speeds is:',
        'If A : B = 5 : 9 and B : C = 3 : 7, then A : C = ?',
        'A can complete a work in 12 days working 8 hours per day. B can complete the same work in 8 days working 10 hours per day. If A and B work together, working 8 hours per day, in how many days can they complete the work?'
      ],
      'Computer Science': [
        'What is the time complexity of binary search algorithm?',
        'Which of the following sorting algorithms has the worst case time complexity of O(n²)?',
        'What data structure is used for implementing recursion?',
        'In the worst case, the number of comparisons needed to search a singly linked list of length n for a given element is:',
        'The prefix form of A-B/ (C * D ^ E) is:',
        'What is the output of the following C code snippet?\nint x = 5;\nprintf("%d %d %d", x, ++x, x++);',
        'Which of the following is not a valid storage class in C?',
        'The minimum number of edges that must be removed from a complete graph on n vertices to make it bipartite is:',
        'Which of the following is true about the HTTP protocol?',
        'The number of edges in a complete graph with n vertices is:'
      ]
    };
    
    const bankIndex = index % questionBanks[section].length;
    return questionBanks[section][bankIndex];
  }
  
  // Generate options
  function generateOptions(section, index) {
    const optionBanks = {
      'Reasoning': [
        ['EQTOHUQF', 'GTSTJUVSF', 'GVSOJUVSF', 'HWUQLWXUH'],
        ['P is the mother of S', 'P is the uncle of S', 'P is the father of S', 'Cannot be determined'],
        ['19', '20', '21', '22'],
        ['1', '3', '7', '9'],
        ['Second to the right', 'Third to the right', 'Third to the left', 'Second to the left'],
        ['A', 'B', 'C', 'D'],
        ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        ['318324', '318342', '381342', '381243'],
        ['216', '218', '220', '224'],
        ['His own photograph', 'His son\'s photograph', 'His father\'s photograph', 'His nephew\'s photograph']
      ],
      'Quantitative': [
        ['85 seconds', '89 seconds', '90 seconds', '94 seconds'],
        ['8.5%', '9%', '12.5%', '10%'],
        ['15%', '20%', '25%', '30%'],
        ['30 days', '26 days', '24 days', '20 days'],
        ['25', '25.5', '26', '27.5'],
        ['2 km/hr', '2.5 km/hr', '3 km/hr', '3.5 km/hr'],
        ['7', '8', '9', '10'],
        ['3 : 2', '3 : 5', '5 : 3', '5 : 7'],
        ['5 : 21', '15 : 49', '5 : 7', '35 : 63'],
        ['4.8 days', '5 days', '5.5 days', '6 days']
      ],
      'Computer Science': [
        ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        ['Merge sort', 'Heap sort', 'Quick sort', 'Bubble sort'],
        ['Array', 'Queue', 'Stack', 'Tree'],
        ['log n', 'n/2', 'n', 'n log n'],
        ['- A / B * C ^ D E', '- A / B * ^ C D E', '- A / B * ^ D E C', '/ - A * B ^ C D E'],
        ['5 5 5', '5 6 6', '5 6 5', 'Undefined behavior'],
        ['auto', 'extern', 'register', 'volatile'],
        ['n/2', 'n(n-1)/4', 'n(n-2)/4', 'n(n-1)/2'],
        ['It is a connection-oriented protocol', 'It is a stateful protocol', 'It uses UDP at the transport layer', 'It is a stateless protocol'],
        ['n', 'n(n-1)', 'n(n-1)/2', 'n²']
      ]
    };
    
    const bankIndex = index % optionBanks[section].length;
    return optionBanks[section][bankIndex];
  }
  
  // Event listeners
  toggleAnswersBtn.addEventListener('click', function() {
    showAllQuestions = !showAllQuestions;
    renderQuestionAnalysis();
  });
  
  downloadPdfBtn.addEventListener('click', function(e) {
    e.preventDefault();
    alert('In a real application, this would generate and download a PDF of your results.');
  });
  
  // Initialize the page
  initResults();
});