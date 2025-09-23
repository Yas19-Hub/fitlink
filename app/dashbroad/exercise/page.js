function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab content
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Add active class to clicked button
    event.target.classList.add('active');

    // Reset animation for cards in the new tab
    const cards = selectedTab.querySelectorAll('.exercise-card');
    cards.forEach((card, index) => {
        card.style.animation = 'none';
        card.offsetHeight; // Trigger reflow
        card.style.animation = `fadeInUp 0.6s ease forwards`;
        card.style.animationDelay = `${(index + 1) * 0.1}s`;
    });
}

// Add click handlers for exercise cards
document.addEventListener('DOMContentLoaded', function() {
    const exerciseCards = document.querySelectorAll('.exercise-card');
    
    exerciseCards.forEach(card => {
        card.addEventListener('click', function() {
            const exerciseName = this.querySelector('h3').textContent;
            console.log(`Selected exercise: ${exerciseName}`);
            // Here you can add functionality to show exercise details, start workout, etc.
        });
    });
});

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';
