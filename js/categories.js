document.addEventListener('DOMContentLoaded', function() {
  // Set up category cards to pass exam types to tests page
  const categoryCards = document.querySelectorAll('.category-card');
  
  categoryCards.forEach(card => {
    const viewTestsBtn = card.querySelector('.btn-primary');
    if (viewTestsBtn) {
      // Get all exam types in this category
      const examTypes = Array.from(card.querySelectorAll('.exam-types span'))
        .map(span => span.textContent.trim())
        .join(',');
      
      // Get the category name
      const categoryName = card.querySelector('h3').textContent.trim();
      
      // Update the href to include exam types
      const currentHref = viewTestsBtn.getAttribute('href');
      const baseUrl = currentHref.split('?')[0];
      const category = currentHref.split('=')[1];
      
      viewTestsBtn.setAttribute('href', 
        `${baseUrl}?category=${category}&exams=${encodeURIComponent(examTypes)}&categoryName=${encodeURIComponent(categoryName)}`);
    }
  });
});