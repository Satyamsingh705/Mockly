document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const testTitle = document.getElementById('test-title');
  const totalQuestions = document.getElementById('total-questions');
  const totalMarks = document.getElementById('total-marks');
  const timerElement = document.getElementById('timer');
  const questionPalette = document.getElementById('question-palette');
  const questionArea = document.getElementById('question-area');
  const prevQuestionBtn = document.getElementById('prev-question');
  const nextQuestionBtn = document.getElementById('next-question');
  const markReviewBtn = document.getElementById('mark-review');
  const clearResponseBtn = document.getElementById('clear-response');
  const endTestBtn = document.getElementById('end-test');
  const submitModal = document.getElementById('submit-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const cancelSubmitBtn = document.getElementById('cancel-submit');
  const confirmSubmitBtn = document.getElementById('confirm-submit');
  const answeredCount = document.getElementById('answered-count');
  const notAnsweredCount = document.getElementById('not-answered-count');
  const markedCount = document.getElementById('marked-count');
  const modalTotal = document.getElementById('modal-total');
  const modalAnswered = document.getElementById('modal-answered');
  const modalNotAnswered = document.getElementById('modal-not-answered');
  const modalMarked = document.getElementById('modal-marked');
  
  // State variables
  let currentQuestionIndex = 0;
  let testData = null;
  let userResponses = [];
  let timer = null;
  
  // Initialize the test
  function initTest() {
    // Get test ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const testId = urlParams.get('id');
    
    if (!testId) {
      showError('Test ID not provided');
      return;
    }
    
    // Load test data
    loadTestData(testId);
  }
  
  // Load test data
  function loadTestData(testId) {
    // In a real app, this would be an API call
    // Using mock data for demonstration
    
    // Simulating API delay
    showLoading();
    
    setTimeout(() => {
      testData = getTestById(testId);
      
      if (!testData) {
        showError('Test not found');
        return;
      }
      
      // Initialize user responses
      initializeUserResponses();
      
      // Initialize the UI
      updateTestInfo();
      createQuestionPalette();
      showQuestion(0);
      
      // Initialize timer
      timer = new TestTimer(testData.duration, timerElement, handleTimeUp);
      timer.start();
      
      // Hide loading
      document.querySelector('.test-body').classList.remove('loading');
    }, 1000);
  }
  
  // Show loading state
  function showLoading() {
    document.querySelector('.test-body').classList.add('loading');
    questionArea.innerHTML = `
      <div class="loading-indicator">
        <i class="fas fa-circle-notch fa-spin"></i>
        <p>Loading test...</p>
      </div>
    `;
  }
  
  // Show error message
  function showError(message) {
    questionArea.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <h3>Error</h3>
        <p>${message}</p>
        <a href="tests.html" class="btn btn-primary">Back to Tests</a>
      </div>
    `;
  }
  
  // Initialize user responses
  function initializeUserResponses() {
    userResponses = testData.questions.map(() => ({
      selectedOption: null,
      marked: false,
      visited: false
    }));
  }
  
  // Update test information
  function updateTestInfo() {
    testTitle.textContent = testData.title;
    totalQuestions.innerHTML = `<i class="fas fa-question-circle"></i> ${testData.questions.length} Questions`;
    totalMarks.innerHTML = `<i class="fas fa-trophy"></i> ${testData.totalMarks} Marks`;
  }
  
  // Create question palette
  function createQuestionPalette() {
    questionPalette.innerHTML = '';
    
    testData.questions.forEach((question, index) => {
      const button = document.createElement('div');
      button.className = 'palette-btn';
      button.textContent = index + 1;
      button.setAttribute('data-index', index);
      
      if (index === currentQuestionIndex) {
        button.classList.add('current');
      }
      
      button.addEventListener('click', () => {
        showQuestion(index);
      });
      
      questionPalette.appendChild(button);
    });
  }
  
  // Update question palette
  function updateQuestionPalette() {
    const buttons = questionPalette.querySelectorAll('.palette-btn');
    
    buttons.forEach((button, index) => {
      // Reset classes
      button.className = 'palette-btn';
      
      // Add appropriate classes based on state
      if (index === currentQuestionIndex) {
        button.classList.add('current');
      }
      
      if (userResponses[index].selectedOption !== null) {
        button.classList.add('answered');
      }
      
      if (userResponses[index].marked) {
        button.classList.add('marked');
      }
    });
    
    // Update counters
    updateCounters();
  }
  
  // Update counters
  function updateCounters() {
    const answered = userResponses.filter(r => r.selectedOption !== null).length;
    const marked = userResponses.filter(r => r.marked).length;
    const notAnswered = userResponses.length - answered;
    
    answeredCount.textContent = answered;
    notAnsweredCount.textContent = notAnswered;
    markedCount.textContent = marked;
    
    // Update modal counters
    modalTotal.textContent = userResponses.length;
    modalAnswered.textContent = answered;
    modalNotAnswered.textContent = notAnswered;
    modalMarked.textContent = marked;
  }
  
  // Show a specific question
  function showQuestion(index) {
    if (index < 0 || index >= testData.questions.length) {
      return;
    }
    
    currentQuestionIndex = index;
    const question = testData.questions[index];
    const response = userResponses[index];
    
    // Mark as visited
    userResponses[index].visited = true;
    
    // Update question area
    questionArea.innerHTML = `
      <div class="question-number">Question ${index + 1} of ${testData.questions.length}</div>
      <div class="question-text">${question.text}</div>
      <div class="options-list">
        ${question.options.map((option, optIndex) => `
          <div class="option-item ${response.selectedOption === optIndex ? 'selected' : ''}" data-index="${optIndex}">
            <div class="option-marker">${String.fromCharCode(65 + optIndex)}</div>
            <div class="option-text">${option}</div>
          </div>
        `).join('')}
      </div>
    `;
    
    // Add event listeners to options
    const optionItems = questionArea.querySelectorAll('.option-item');
    optionItems.forEach(item => {
      item.addEventListener('click', () => {
        const optIndex = parseInt(item.getAttribute('data-index'));
        selectOption(optIndex);
      });
    });
    
    // Update mark for review button text
    updateMarkReviewBtn();
    
    // Update question palette
    updateQuestionPalette();
    
    // Update navigation buttons
    prevQuestionBtn.disabled = index === 0;
    nextQuestionBtn.disabled = index === testData.questions.length - 1;
  }
  
  // Select an option
  function selectOption(optionIndex) {
    userResponses[currentQuestionIndex].selectedOption = optionIndex;
    
    // Update UI
    const optionItems = questionArea.querySelectorAll('.option-item');
    optionItems.forEach((item, index) => {
      if (index === optionIndex) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
    
    // Update question palette
    updateQuestionPalette();
  }
  
  // Clear response for current question
  function clearResponse() {
    userResponses[currentQuestionIndex].selectedOption = null;
    
    // Update UI
    const optionItems = questionArea.querySelectorAll('.option-item');
    optionItems.forEach(item => {
      item.classList.remove('selected');
    });
    
    // Update question palette
    updateQuestionPalette();
  }
  
  // Toggle mark for review
  function toggleMarkForReview() {
    userResponses[currentQuestionIndex].marked = !userResponses[currentQuestionIndex].marked;
    
    // Update mark for review button text
    updateMarkReviewBtn();
    
    // Update question palette
    updateQuestionPalette();
  }
  
  // Update mark for review button text
  function updateMarkReviewBtn() {
    if (userResponses[currentQuestionIndex].marked) {
      markReviewBtn.innerHTML = '<i class="fas fa-bookmark"></i> Unmark';
    } else {
      markReviewBtn.innerHTML = '<i class="fas fa-bookmark"></i> Mark for Review';
    }
  }
  
  // Navigate to previous question
  function goToPrevQuestion() {
    if (currentQuestionIndex > 0) {
      showQuestion(currentQuestionIndex - 1);
    }
  }
  
  // Navigate to next question
  function goToNextQuestion() {
    if (currentQuestionIndex < testData.questions.length - 1) {
      showQuestion(currentQuestionIndex + 1);
    }
  }
  
  // Handle time up
  function handleTimeUp() {
    alert('Time is up! Your test will be submitted automatically.');
    submitTest();
  }
  
  // Submit test
  function submitTest() {
    // Calculate results
    const results = calculateResults();
    
    // Store results in session storage for results page
    sessionStorage.setItem('testResults', JSON.stringify(results));
    
    // Navigate to results page
    window.location.href = `results.html?id=${testData.id}`;
  }
  
  // Calculate test results
  function calculateResults() {
    const totalQuestions = testData.questions.length;
    const attempted = userResponses.filter(r => r.selectedOption !== null).length;
    const notAttempted = totalQuestions - attempted;
    
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let totalScore = 0;
    
    // Section-wise analysis
    const sectionAnalysis = {};
    
    testData.questions.forEach((question, index) => {
      const userAnswer = userResponses[index].selectedOption;
      const isCorrect = userAnswer === question.correctOption;
      
      // Update section analysis
      if (!sectionAnalysis[question.section]) {
        sectionAnalysis[question.section] = {
          total: 0,
          attempted: 0,
          correct: 0,
          incorrect: 0,
          score: 0
        };
      }
      
      sectionAnalysis[question.section].total++;
      
      if (userAnswer !== null) {
        sectionAnalysis[question.section].attempted++;
        
        if (isCorrect) {
          correctAnswers++;
          incorrectAnswers += 0;
          totalScore += question.marks;
          sectionAnalysis[question.section].correct++;
          sectionAnalysis[question.section].score += question.marks;
        } else {
          incorrectAnswers++;
          totalScore -= question.negativeMarks || 0;
          sectionAnalysis[question.section].incorrect++;
          sectionAnalysis[question.section].score -= question.negativeMarks || 0;
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
      testId: testData.id,
      testTitle: testData.title,
      totalQuestions,
      totalMarks: testData.totalMarks,
      attempted,
      notAttempted,
      correctAnswers,
      incorrectAnswers,
      totalScore: Math.max(0, totalScore), // Ensure score is not negative
      percentage: Math.round((totalScore / testData.totalMarks) * 100),
      userResponses,
      questions: testData.questions,
      sectionAnalysis,
      duration: testData.duration,
      timeSpent: timer.getElapsedTime(),
      date: new Date().toISOString()
    };
  }
  
  // Show/hide modal
  function toggleModal(show) {
    if (show) {
      submitModal.classList.add('active');
    } else {
      submitModal.classList.remove('active');
    }
  }
  
  // Get test by ID
  function getTestById(id) {
    // Mock data for demonstration
    const mockTests = [
      {
        id: '1',
        title: 'Reasoning Ability Mock Test',
        category: 'bank-po',
        duration: 30,
        totalMarks: 30,
        negativeMarking: 0.25,
        instructions: 'Read each question carefully and select the best answer.',
        questions: generateMockQuestions(30, 'Reasoning')
      },
      {
        id: '2',
        title: 'Quantitative Aptitude',
        category: 'ssc-cgl',
        duration: 25,
        totalMarks: 50,
        negativeMarking: 0.5,
        instructions: 'Each question carries 2 marks. 0.5 marks will be deducted for each wrong answer.',
        questions: generateMockQuestions(25, 'Quantitative')
      },
      {
        id: '3',
        title: 'Computer Science Mock Test',
        category: 'gate',
        duration: 60,
        totalMarks: 80,
        negativeMarking: 1,
        instructions: 'This test contains both MCQs and numerical answer type questions.',
        questions: generateMockQuestions(40, 'Computer Science')
      }
    ];
    
    return mockTests.find(test => test.id === id);
  }
  
  // Generate mock questions
  function generateMockQuestions(count, section) {
    const questions = [];
    
    for (let i = 0; i < count; i++) {
      questions.push({
        id: `q${i + 1}`,
        text: generateQuestionText(section, i),
        options: generateOptions(section, i),
        correctOption: Math.floor(Math.random() * 4),
        marks: 1,
        negativeMarks: 0.25,
        section: section
      });
    }
    
    return questions;
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
  prevQuestionBtn.addEventListener('click', goToPrevQuestion);
  nextQuestionBtn.addEventListener('click', goToNextQuestion);
  markReviewBtn.addEventListener('click', toggleMarkForReview);
  clearResponseBtn.addEventListener('click', clearResponse);
  endTestBtn.addEventListener('click', () => toggleModal(true));
  closeModalBtn.addEventListener('click', () => toggleModal(false));
  cancelSubmitBtn.addEventListener('click', () => toggleModal(false));
  confirmSubmitBtn.addEventListener('click', submitTest);
  
  // Prevent accidental leaving of page
  window.addEventListener('beforeunload', function(e) {
    // If test is in progress, show warning
    if (testData && timer && timer.getRemainingTime() > 0) {
      const message = 'Are you sure you want to leave? Your test progress will be lost.';
      e.returnValue = message;
      return message;
    }
  });
  
  // Initialize the test
  initTest();
});