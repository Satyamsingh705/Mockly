document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const testsContainer = document.getElementById('tests-container');
  const categoryFilter = document.getElementById('category-filter');
  const durationFilter = document.getElementById('duration-filter');
  const difficultyFilter = document.getElementById('difficulty-filter');
  const applyFiltersBtn = document.getElementById('apply-filters');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  const pageNumbers = document.getElementById('page-numbers');
  const searchTests = document.getElementById('search-tests');
  
  // State variables
  let currentPage = 1;
  const testsPerPage = 6;
  let filteredTests = [];
  
  // Category mapping to handle broad categories
  const categoryMapping = {
    'banking': ['bank-po', 'bank-clerk', 'sbi-po', 'ibps', 'rbi', 'insurance'],
    'government': ['ssc-cgl', 'ssc-chsl', 'railway', 'upsc', 'state-psc', 'cbse', 'bihar-board'],
    'engineering': ['jee-main', 'jee-advanced', 'bitsat', 'gate', 'ese'],
    'medical': ['neet', 'aiims', 'jipmer', 'pgimer'],
    'management': ['cat', 'xat', 'mat', 'snap', 'iift'],
    'law': ['clat', 'ailet', 'lsat', 'du-llb'],
    'school': ['ntse', 'olympiads', 'kvpy'],
    'language': ['ielts', 'toefl', 'gre', 'gmat']
  };
  
  // Category display names
  const categoryDisplayNames = {
    'bank-po': 'Bank PO',
    'bank-clerk': 'Bank Clerk',
    'sbi-po': 'SBI PO',
    'ibps': 'IBPS',
    'rbi': 'RBI',
    'insurance': 'Insurance',
    'ssc-cgl': 'SSC CGL',
    'ssc-chsl': 'SSC CHSL',
    'railway': 'Railway',
    'upsc': 'UPSC',
    'state-psc': 'State PSC',
    'gate': 'GATE',
    'jee-main': 'JEE Main',
    'jee-advanced': 'JEE Advanced',
    'bitsat': 'BITSAT',
    'ese': 'ESE',
    'neet': 'NEET',
    'aiims': 'AIIMS',
    'jipmer': 'JIPMER',
    'pgimer': 'PGIMER',
    'cat': 'CAT',
    'xat': 'XAT',
    'mat': 'MAT',
    'snap': 'SNAP',
    'iift': 'IIFT',
    'clat': 'CLAT',
    'ailet': 'AILET',
    'lsat': 'LSAT',
    'du-llb': 'DU LLB',
    'ntse': 'NTSE',
    'olympiads': 'Olympiads',
    'kvpy': 'KVPY',
    'ielts': 'IELTS',
    'toefl': 'TOEFL',
    'gre': 'GRE',
    'gmat': 'GMAT'
  };
  
  // Mock data for tests - all available test categories
  const tests = [
    {
      id: 1,
      title: "Reasoning Ability Mock Test",
      category: "bank-po",
      categoryName: "Bank PO",
      duration: 30,
      questions: 30,
      difficulty: "medium",
      description: "Test your reasoning abilities with questions on analogy, classification, series, and more.",
      rating: 4.5,
      ratings: 120,
      attempts: 1500,
      date: "2023-08-15"
    },
    {
      id: 2,
      title: "Quantitative Aptitude",
      category: "ssc-cgl",
      categoryName: "SSC CGL",
      duration: 25,
      questions: 25,
      difficulty: "hard",
      description: "Practice questions on arithmetic, algebra, geometry, and data interpretation.",
      rating: 4.2,
      ratings: 98,
      attempts: 1200,
      date: "2023-08-10"
    },
    {
      id: 3,
      title: "Computer Science Mock Test",
      category: "gate",
      categoryName: "GATE",
      duration: 60,
      questions: 40,
      difficulty: "hard",
      description: "Comprehensive test covering algorithms, data structures, operating systems and more.",
      rating: 4.7,
      ratings: 150,
      attempts: 1800,
      date: "2023-08-05"
    },
    // Add more test data with different categories
    {
      id: 4,
      title: "English Language Practice",
      category: "bank-clerk",
      categoryName: "Bank Clerk",
      duration: 20,
      questions: 25,
      difficulty: "easy",
      description: "Practice English language questions for banking exams.",
      rating: 4.3,
      ratings: 85,
      attempts: 950,
      date: "2023-08-02"
    },
    {
      id: 5,
      title: "SBI PO Prelims",
      category: "sbi-po",
      categoryName: "SBI PO",
      duration: 60,
      questions: 100,
      difficulty: "medium",
      description: "Complete prelims test for SBI PO exam preparation.",
      rating: 4.8,
      ratings: 210,
      attempts: 2200,
      date: "2023-07-28"
    },
    {
      id: 6,
      title: "Physics Full Test",
      category: "neet",
      categoryName: "NEET",
      duration: 90,
      questions: 45,
      difficulty: "hard",
      description: "Complete physics test with all topics for NEET.",
      rating: 4.6,
      ratings: 175,
      attempts: 1900,
      date: "2023-07-22"
    },
    {
      id: 7,
      title: "Indian History",
      category: "upsc",
      categoryName: "UPSC",
      duration: 60,
      questions: 50,
      difficulty: "medium",
      description: "Comprehensive test on Indian history for UPSC preparation.",
      rating: 4.4,
      ratings: 130,
      attempts: 1400,
      date: "2023-07-15"
    },
    {
      id: 8,
      title: "Advanced Mathematics",
      category: "jee-advanced",
      categoryName: "JEE Advanced",
      duration: 90,
      questions: 30,
      difficulty: "hard",
      description: "In-depth mathematics test for JEE Advanced preparation.",
      rating: 4.9,
      ratings: 220,
      attempts: 2400,
      date: "2023-07-10"
    },
    {
      id: 9,
      title: "CLAT Legal Aptitude",
      category: "clat",
      categoryName: "CLAT",
      duration: 40,
      questions: 35,
      difficulty: "medium",
      description: "Legal aptitude test for CLAT preparation.",
      rating: 4.5,
      ratings: 95,
      attempts: 850,
      date: "2023-07-05"
    }
  ];
  
  // Initialize the page
  function init() {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const broadCategory = urlParams.get('category');
    const specificExams = urlParams.get('exams');
    const categoryName = urlParams.get('categoryName');
    
    // Populate category dropdown dynamically
    populateCategoryDropdown(broadCategory, specificExams, categoryName);
    
    // Handle other parameters
    const difficultyParam = urlParams.get('difficulty');
    if (difficultyParam && difficultyFilter) {
      difficultyFilter.value = difficultyParam;
    }
    
    const searchParam = urlParams.get('search');
    if (searchParam && searchTests) {
      searchTests.value = searchParam;
    }
    
    // Apply initial filters
    applyFilters();
    
    // Add event listeners
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', goToPrevPage);
    }
    
    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', goToNextPage);
    }
    
    if (searchTests) {
      searchTests.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          applyFilters();
        }
      });
    }
    
    // Page number clicks
    if (pageNumbers) {
      pageNumbers.addEventListener('click', function(e) {
        if (e.target.tagName === 'SPAN' && !e.target.classList.contains('current-page')) {
          currentPage = parseInt(e.target.textContent);
          displayTests();
          updatePagination();
        }
      });
    }
  }
  
  // Populate category dropdown based on URL parameters and available tests
  function populateCategoryDropdown(broadCategory, specificExams, categoryName) {
    if (!categoryFilter) return;
    
    // Clear existing options except "All Categories"
    while (categoryFilter.options.length > 1) {
      categoryFilter.remove(1);
    }
    
    // If a specific broad category is provided
    if (broadCategory && categoryMapping[broadCategory]) {
      // Add the broad category as an option
      const broadOption = document.createElement('option');
      broadOption.value = broadCategory;
      broadOption.textContent = capitalizeFirstLetter(broadCategory);
      categoryFilter.appendChild(broadOption);
      
      // Set page title if category name is provided
      if (categoryName) {
        const pageTitle = document.querySelector('.page-title h1');
        if (pageTitle) {
          pageTitle.textContent = `${decodeURIComponent(categoryName)} Tests`;
        }
      }
      
      // If specific exams are provided, add them
      if (specificExams) {
        const exams = decodeURIComponent(specificExams).split(',');
        exams.forEach(exam => {
          const examSlug = exam.toLowerCase().replace(/\s+/g, '-');
          const option = document.createElement('option');
          option.value = examSlug;
          option.textContent = exam;
          categoryFilter.appendChild(option);
        });
        
        // Select the broad category
        categoryFilter.value = broadCategory;
      } 
      // Otherwise add all exams from this broad category
      else {
        categoryMapping[broadCategory].forEach(category => {
          const option = document.createElement('option');
          option.value = category;
          option.textContent = categoryDisplayNames[category] || capitalizeFirstLetter(category);
          categoryFilter.appendChild(option);
        });
        
        // Select the broad category
        categoryFilter.value = broadCategory;
      }
    } 
    // If no specific category is provided, add all unique categories from tests
    else {
      // Get unique categories from test data
      const uniqueCategories = [...new Set(tests.map(test => test.category))];
      
      // Add each category as an option
      uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = categoryDisplayNames[category] || capitalizeFirstLetter(category);
        categoryFilter.appendChild(option);
      });
    }
  }
  
  // Apply filters
  function applyFilters() {
    const category = categoryFilter ? categoryFilter.value : 'all';
    const duration = durationFilter ? durationFilter.value : 'all';
    const difficulty = difficultyFilter ? difficultyFilter.value : 'all';
    const searchTerm = searchTests ? searchTests.value.toLowerCase().trim() : '';
    
    filteredTests = tests.filter(test => {
      // Category filter
      if (category !== 'all') {
        // Check if it's a broad category first
        if (categoryMapping[category]) {
          if (!categoryMapping[category].includes(test.category)) {
            return false;
          }
        } 
        // Otherwise check for exact category match
        else if (test.category !== category) {
          return false;
        }
      }
      
      // Duration filter
      if (duration !== 'all') {
        if (duration === 'short' && test.duration >= 30) {
          return false;
        } else if (duration === 'medium' && (test.duration < 30 || test.duration > 60)) {
          return false;
        } else if (duration === 'long' && test.duration <= 60) {
          return false;
        }
      }
      
      // Difficulty filter
      if (difficulty !== 'all' && test.difficulty !== difficulty) {
        return false;
      }
      
      // Search term
      if (searchTerm && !test.title.toLowerCase().includes(searchTerm) && 
          !test.description.toLowerCase().includes(searchTerm)) {
        return false;
      }
      
      return true;
    });
    
    // Reset to first page
    currentPage = 1;
    
    // Display filtered tests
    displayTests();
    updatePagination();
  }
  
  // Display tests
  function displayTests() {
    if (!testsContainer) return;
    
    // Calculate start and end index
    const startIndex = (currentPage - 1) * testsPerPage;
    const endIndex = startIndex + testsPerPage;
    const currentTests = filteredTests.slice(startIndex, endIndex);
    
    // Clear container
    testsContainer.innerHTML = '';
    
    // If no tests match the filters
    if (currentTests.length === 0) {
      testsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-search"></i>
          </div>
          <h3>No Tests Found</h3>
          <p>Try adjusting your filters or search criteria.</p>
          <button class="btn btn-primary" onclick="location.reload()">Reset Filters</button>
        </div>
      `;
      return;
    }
    
    // Create test cards
    currentTests.forEach(test => {
      const testCard = document.createElement('div');
      testCard.className = 'test-card';
      
      // Generate star rating
      let stars = '';
      for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(test.rating)) {
          stars += '<i class="fas fa-star"></i>'; // Full star
        } else if (i === Math.ceil(test.rating) && !Number.isInteger(test.rating)) {
          stars += '<i class="fas fa-star-half-alt"></i>'; // Half star
        } else {
          stars += '<i class="far fa-star"></i>'; // Empty star
        }
      }
      
      testCard.innerHTML = `
        <div class="test-card-header">
          <span class="difficulty ${test.difficulty}">${capitalizeFirstLetter(test.difficulty)}</span>
          <h3>${test.title}</h3>
        </div>
        <div class="test-card-body">
          <span class="test-category">${test.categoryName}</span>
          <div class="test-meta">
            <span><i class="fas fa-question-circle"></i> ${test.questions} Questions</span>
            <span><i class="fas fa-clock"></i> ${test.duration} Minutes</span>
            <span><i class="fas fa-calendar-alt"></i> ${formatDate(test.date)}</span>
          </div>
          <p class="test-description">${test.description}</p>
          <div class="test-rating">
            <div class="stars">${stars}</div>
            <span class="rating-count">(${test.ratings} ratings)</span>
          </div>
        </div>
        <div class="test-card-footer">
          <span class="test-attempts"><i class="fas fa-users"></i> ${test.attempts}+ attempts</span>
          <a href="test-interface.html?id=${test.id}" class="btn btn-primary">Start Test</a>
        </div>
      `;
      
      testsContainer.appendChild(testCard);
    });
  }
  
  // Update pagination
  function updatePagination() {
    if (!pageNumbers || !prevPageBtn || !nextPageBtn) return;
    
    const totalPages = Math.ceil(filteredTests.length / testsPerPage);
    
    // Update prev/next buttons
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    
    // Update page numbers
    pageNumbers.innerHTML = '';
    
    // Calculate range of page numbers to show
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + 2);
    
    if (endPage - startPage < 2) {
      startPage = Math.max(1, endPage - 2);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      const pageSpan = document.createElement('span');
      pageSpan.textContent = i;
      
      if (i === currentPage) {
        pageSpan.className = 'current-page';
      }
      
      pageNumbers.appendChild(pageSpan);
    }
  }
  
  // Go to previous page
  function goToPrevPage() {
    if (currentPage > 1) {
      currentPage--;
      displayTests();
      updatePagination();
    }
  }
  
  // Go to next page
  function goToNextPage() {
    const totalPages = Math.ceil(filteredTests.length / testsPerPage);
    
    if (currentPage < totalPages) {
      currentPage++;
      displayTests();
      updatePagination();
    }
  }
  
  // Helper function to capitalize first letter
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).replace(/-/g, ' ');
  }
  
  // Helper function to format date
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  // Initialize the page
  init();
});