document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const searchCategories = document.getElementById('search-categories');
  const categoryCards = document.querySelectorAll('.category-card');
  const topicCards = document.querySelectorAll('.topic-card');
  
  // Search functionality
  if (searchCategories) {
    searchCategories.addEventListener('keyup', function() {
      const searchTerm = searchCategories.value.toLowerCase().trim();
      
      if (searchTerm === '') {
        // Reset all cards
        categoryCards.forEach(card => {
          card.style.display = 'flex';
        });
        return;
      }
      
      // Filter category cards
      categoryCards.forEach(card => {
        const cardTitle = card.querySelector('h3').textContent.toLowerCase();
        const cardContent = card.querySelector('p').textContent.toLowerCase();
        const examTypes = Array.from(card.querySelectorAll('.exam-types span'))
          .map(span => span.textContent.toLowerCase());
        
        // Check if the search term matches any content
        const isMatch = cardTitle.includes(searchTerm) || 
                        cardContent.includes(searchTerm) || 
                        examTypes.some(type => type.includes(searchTerm));
        
        card.style.display = isMatch ? 'flex' : 'none';
      });
    });
  }
  
  // Add hover animations
  categoryCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      // Scale up the icon slightly
      const icon = card.querySelector('.category-icon');
      if (icon) {
        icon.style.transform = 'scale(1.1)';
        icon.style.transition = 'transform 0.3s ease';
      }
      
      // Highlight exam types
      const examTypes = card.querySelectorAll('.exam-types span');
      examTypes.forEach((span, index) => {
        setTimeout(() => {
          span.style.backgroundColor = 'rgba(26, 115, 232, 0.1)';
          span.style.color = 'var(--primary-color)';
        }, index * 50);
      });
    });
    
    card.addEventListener('mouseleave', function() {
      // Reset icon
      const icon = card.querySelector('.category-icon');
      if (icon) {
        icon.style.transform = 'scale(1)';
      }
      
      // Reset exam types
      const examTypes = card.querySelectorAll('.exam-types span');
      examTypes.forEach(span => {
        span.style.backgroundColor = 'var(--bg-light)';
        span.style.color = 'var(--text-medium)';
      });
    });
  });
  
  topicCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      // Scale up the icon with a slight bounce
      const icon = card.querySelector('.topic-icon');
      if (icon) {
        icon.style.transform = 'scale(1.1)';
        icon.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        icon.style.backgroundColor = 'rgba(26, 115, 232, 0.2)';
      }
    });
    
    card.addEventListener('mouseleave', function() {
      // Reset icon
      const icon = card.querySelector('.topic-icon');
      if (icon) {
        icon.style.transform = 'scale(1)';
        icon.style.backgroundColor = 'rgba(26, 115, 232, 0.1)';
      }
    });
  });
  
  // Track recently viewed categories in localStorage
  categoryCards.forEach(card => {
    card.addEventListener('click', function() {
      const categoryName = card.querySelector('h3').textContent;
      
      // Get recent categories from localStorage
      let recentCategories = JSON.parse(localStorage.getItem('recentCategories')) || [];
      
      // Add current category to the beginning of the array
      recentCategories = [categoryName, ...recentCategories.filter(cat => cat !== categoryName)].slice(0, 5);
      
      // Save back to localStorage
      localStorage.setItem('recentCategories', JSON.stringify(recentCategories));
    });
  });
});