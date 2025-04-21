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
  
  // Mock data for tests
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
    {
      id: 4,
      title: "English Language Practice Test",
      category: "bank-po",
      categoryName: "Bank PO",
      duration: 20,
      questions: 20,
      difficulty: "easy",
      description: "Improve your English skills with questions on grammar, vocabulary, comprehension, and more.",
      rating: 4.0,
      ratings: 85,
      attempts: 950,
      date: "2023-08-01"
    },
    {
      id: 5,
      title: "Biology Mock Test",
      category: "neet",
      categoryName: "NEET",
      duration: 45,
      questions: 45,
      difficulty: "medium",
      description: "Practice questions on human physiology, cell biology, genetics, and more.",
      rating: 4.6,
      ratings: 110,
      attempts: 1350,
      date: "2023-07-28"
    },
    {
      id: 6,
      title: "General Knowledge Test",
      category: "upsc",
      categoryName: "UPSC",
      duration: 30,
      questions: 30,
      difficulty: "medium",
      description: "Test your knowledge on current affairs, history, geography, and more.",
      rating: 4.3,
      ratings: 95,
      attempts: 1100,
      date: "2023-07-25"
    },
    {
      id: 7,
      title: "Data Interpretation Test",
      category: "bank-po",
      categoryName: "Bank PO",
      duration: 25,
      questions: 20,
      difficulty: "hard",
      description: "Practice interpreting data from tables, graphs, charts, and more.",
      rating: 4.4,
      ratings: 88,
      attempts: 980,
      date: "2023-07-20"
    },
    {
      id: 8,
      title: "Physics Full Mock Test",
      category: "neet",
      categoryName: "NEET",
      duration: 60,
      questions: 45,
      difficulty: "hard",
      description: "Comprehensive physics test covering mechanics, thermodynamics, optics, and more.",
      rating: 4.8,
      ratings: 135,
      attempts: 1650,
      date: "2023-07-15"
    },
    {
      id: 9,
      title: "Indian Polity Test",
      category: "upsc",
      categoryName: "UPSC",
      duration: 40,
      questions: 40,
      difficulty: "medium",
      description: "Test your knowledge on Indian constitution, governance, political system, and more.",
      rating: 4.5,
      ratings: 105,
      attempts: 1250,
      date: "2023-07-10"
    }
  ];
  
  // Initialize the page
  function init() {
    // Check for URL parameters
    const urlParams = utils.getUrlParams();
    
    // Apply filters from URL if available
    if (urlParams.category) {
      categoryFilter.value = urlParams.category;
    }
    
    if (urlParams.difficulty) {
      difficultyFilter.value = urlParams.difficulty;
    }
    
    if (urlParams.search) {
      searchTests.value = urlParams.search;
    }
    
    // Apply initial filters
    applyFilters();
    
    // Event listeners
    applyFiltersBtn.addEventListener('click', applyFilters);
    prevPageBtn.addEventListener('click', goToPrevPage);
    nextPageBtn.addEventListener('click', goToNextPage);
    
    searchTests.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        applyFilters();
      }
    });
    
    // Page number clicks
    pageNumbers.addEventListener('click', function(e) {
      if (e.target.tagName === 'SPAN' && !e.target.classList.contains('current-page')) {
        currentPage = parseInt(e.target.textContent);
        displayTests();
        updatePagination();
      }
    });
  }
  
  // Apply filters
  function applyFilters() {
    const category = categoryFilter.value;
    const duration = durationFilter.value;
    const difficulty = difficultyFilter.value;
    const searchTerm = searchTests.value.toLowerCase().trim();
    
    filteredTests = tests.filter(test => {
      // Category filter
      if (category !== 'all' && test.category !== category) {
        return false;
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
      if (searchTerm && !test.title.toLowerCase().includes(searchTerm) && !test.description.toLowerCase().includes(searchTerm)) {
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
      const stars = generateStarRating(test.rating);
      
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
  
  // Helper functions
  function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      starsHTML += '<i class="fas fa-star"></i>';
    }
    
    // Half star
    if (halfStar) {
      starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
  }
  
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  // Initialize the page
  init();
});