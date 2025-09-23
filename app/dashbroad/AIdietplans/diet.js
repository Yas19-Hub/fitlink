// Global variables
let mealData = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
};

let currentMealType = '';
let dailyGoal = 2000;

// BMR Calculator
function calculateBMR(weight, height, age, gender) {
    if (gender === 'male') {
        return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
}

// Sample food database
const foodDatabase = {
    'vegetarian': {
        'breakfast': [
            { name: 'Oats with Milk', quantity: '1 bowl', calories: 250 },
            { name: 'Banana', quantity: '1 medium', calories: 105 },
            { name: 'Greek Yogurt', quantity: '1 cup', calories: 130 },
            { name: 'Whole Wheat Toast', quantity: '2 slices', calories: 160 }
        ],
        'lunch': [
            { name: 'Brown Rice', quantity: '1 cup', calories: 220 },
            { name: 'Dal (Lentils)', quantity: '1 cup', calories: 200 },
            { name: 'Mixed Vegetables', quantity: '1 cup', calories: 80 },
            { name: 'Chapati', quantity: '2 pieces', calories: 140 }
        ],
        'dinner': [
            { name: 'Quinoa', quantity: '1 cup', calories: 220 },
            { name: 'Paneer Curry', quantity: '1 cup', calories: 300 },
            { name: 'Salad', quantity: '1 bowl', calories: 50 }
        ],
        'snacks': [
            { name: 'Almonds', quantity: '10 pieces', calories: 70 },
            { name: 'Apple', quantity: '1 medium', calories: 95 },
            { name: 'Green Tea', quantity: '1 cup', calories: 2 }
        ]
    },
    'non-vegetarian': {
        'breakfast': [
            { name: 'Scrambled Eggs', quantity: '2 eggs', calories: 180 },
            { name: 'Whole Wheat Toast', quantity: '2 slices', calories: 160 },
            { name: 'Avocado', quantity: '1/2 piece', calories: 160 }
        ],
        'lunch': [
            { name: 'Grilled Chicken Breast', quantity: '150g', calories: 250 },
            { name: 'Brown Rice', quantity: '1 cup', calories: 220 },
            { name: 'Steamed Broccoli', quantity: '1 cup', calories: 55 }
        ],
        'dinner': [
            { name: 'Baked Salmon', quantity: '150g', calories: 280 },
            { name: 'Sweet Potato', quantity: '1 medium', calories: 110 },
            { name: 'Green Salad', quantity: '1 bowl', calories: 50 }
        ],
        'snacks': [
            { name: 'Greek Yogurt', quantity: '1 cup', calories: 130 },
            { name: 'Berries', quantity: '1/2 cup', calories: 40 }
        ]
    },
    'vegan': {
        'breakfast': [
            { name: 'Oat Smoothie', quantity: '1 glass', calories: 200 },
            { name: 'Chia Seeds', quantity: '1 tbsp', calories: 60 },
            { name: 'Banana', quantity: '1 medium', calories: 105 }
        ],
        'lunch': [
            { name: 'Quinoa Bowl', quantity: '1 bowl', calories: 300 },
            { name: 'Black Beans', quantity: '1/2 cup', calories: 115 },
            { name: 'Avocado', quantity: '1/2 piece', calories: 160 }
        ],
        'dinner': [
            { name: 'Tofu Stir Fry', quantity: '1 cup', calories: 200 },
            { name: 'Brown Rice', quantity: '1 cup', calories: 220 },
            { name: 'Mixed Vegetables', quantity: '1 cup', calories: 80 }
        ],
        'snacks': [
            { name: 'Mixed Nuts', quantity: '1 oz', calories: 170 },
            { name: 'Apple', quantity: '1 medium', calories: 95 }
        ]
    }
};

// Desi food options
const desiFoodDatabase = {
    'breakfast': [
        { name: 'Poha', quantity: '1 bowl', calories: 180 },
        { name: 'Upma', quantity: '1 bowl', calories: 200 },
        { name: 'Idli', quantity: '3 pieces', calories: 120 },
        { name: 'Dosa', quantity: '1 piece', calories: 150 }
    ],
    'lunch': [
        { name: 'Dal Rice', quantity: '1 plate', calories: 350 },
        { name: 'Rajma Chawal', quantity: '1 plate', calories: 400 },
        { name: 'Chole Bhature', quantity: '1 plate', calories: 500 },
        { name: 'Sabzi Roti', quantity: '2 roti + sabzi', calories: 300 }
    ],
    'dinner': [
        { name: 'Khichdi', quantity: '1 bowl', calories: 200 },
        { name: 'Dal Fry', quantity: '1 bowl', calories: 150 },
        { name: 'Mixed Dal', quantity: '1 bowl', calories: 180 },
        { name: 'Vegetable Curry', quantity: '1 bowl', calories: 120 }
    ],
    'snacks': [
        { name: 'Roasted Chana', quantity: '1/4 cup', calories: 90 },
        { name: 'Fruit Chaat', quantity: '1 bowl', calories: 100 },
        { name: 'Lassi', quantity: '1 glass', calories: 150 },
        { name: 'Mixed Namkeen', quantity: '1 oz', calories: 140 }
    ]
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners
    document.getElementById('generate-btn').addEventListener('click', generateDietPlan);
    
    // Add meal button listeners
    document.querySelectorAll('.add-meal-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentMealType = this.dataset.meal;
            openFoodModal();
        });
    });
    
    // Modal listeners
    document.querySelector('.close-btn').addEventListener('click', closeFoodModal);
    document.getElementById('add-food-btn').addEventListener('click', addFoodItem);
    
    // Click outside modal to close
    document.getElementById('food-modal').addEventListener('click', function(e) {
        if (e.target === this) closeFoodModal();
    });
    
    updateTotals();
});

// Generate diet plan
function generateDietPlan() {
    const weight = document.getElementById('weight').value;
    const goal = document.getElementById('fitness-goals').value;
    const dietType = document.getElementById('dietary-preferences').value || 'vegetarian';
    const isDesi = document.getElementById('desi-diet').checked;
    
    if (!weight || !goal) {
        alert('Please fill in weight and fitness goal');
        return;
    }
    
    // Calculate daily goal based on weight and goal
    const baseCalories = weight * 25; // Simple calculation
    const goalAdjustments = {
        'weight-loss': -300,
        'weight-gain': +500,
        'muscle-gain': +300,
        'maintenance': 0
    };
    
    dailyGoal = baseCalories + (goalAdjustments[goal] || 0);
    document.getElementById('goal-calories').textContent = Math.round(dailyGoal);
    
    // Clear existing meals and add suggestions
    clearAllMeals();
    
    const foodSource = isDesi ? desiFoodDatabase : (foodDatabase[dietType] || foodDatabase['vegetarian']);
    
    // Add suggested meals
    Object.keys(foodSource).forEach(mealType => {
        const meals = foodSource[mealType];
        const randomMeal = meals[Math.floor(Math.random() * meals.length)];
        addMealToColumn(mealType, randomMeal);
    });
    
    updateTotals();
    
    // Scroll to diet plan
    document.querySelector('.diet-columns').scrollIntoView({ behavior: 'smooth' });
}

// Open food modal
function openFoodModal() {
    document.getElementById('food-modal').style.display = 'block';
    document.getElementById('food-name').focus();
    
    // Clear form
    document.getElementById('food-name').value = '';
    document.getElementById('food-quantity').value = '';
    document.getElementById('food-calories').value = '';
}

// Close food modal
function closeFoodModal() {
    document.getElementById('food-modal').style.display = 'none';
}

// Add food item
function addFoodItem() {
    const name = document.getElementById('food-name').value.trim();
    const quantity = document.getElementById('food-quantity').value.trim();
    const calories = parseInt(document.getElementById('food-calories').value);
    
    if (!name || !quantity || !calories) {
        alert('Please fill in all fields');
        return;
    }
    
    const foodItem = { name, quantity, calories };
    addMealToColumn(currentMealType, foodItem);
    
    closeFoodModal();
    updateTotals();
}

// Add meal to column
function addMealToColumn(mealType, foodItem) {
    mealData[mealType].push(foodItem);
    
    const mealList = document.getElementById(mealType + '-list');
    
    // Remove empty state
    const emptyState = mealList.querySelector('.empty-state');
    if (emptyState) emptyState.remove();
    
    // Create food item element
    const foodElement = document.createElement('div');
    foodElement.className = 'food-item';
    foodElement.innerHTML = `
        <button class="remove-btn" onclick="removeFoodItem('${mealType}', ${mealData[mealType].length - 1})">&times;</button>
        <h4>${foodItem.name}</h4>
        <p>${foodItem.quantity}</p>
        <span class="calories">${foodItem.calories} cal</span>
    `;
    
    mealList.appendChild(foodElement);
}

// Remove food item
function removeFoodItem(mealType, index) {
    mealData[mealType].splice(index, 1);
    renderMealColumn(mealType);
    updateTotals();
}

// Render meal column
function renderMealColumn(mealType) {
    const mealList = document.getElementById(mealType + '-list');
    mealList.innerHTML = '';
    
    if (mealData[mealType].length === 0) {
        mealList.innerHTML = '<div class="empty-state">Click + Add to add ' + mealType + ' items</div>';
        return;
    }
    
    mealData[mealType].forEach((foodItem, index) => {
        const foodElement = document.createElement('div');
        foodElement.className = 'food-item';
        foodElement.innerHTML = `
            <button class="remove-btn" onclick="removeFoodItem('${mealType}', ${index})">&times;</button>
            <h4>${foodItem.name}</h4>
            <p>${foodItem.quantity}</p>
            <span class="calories">${foodItem.calories} cal</span>
        `;
        mealList.appendChild(foodElement);
    });
}

// Update totals
function updateTotals() {
    let totalCalories = 0;
    
    Object.keys(mealData).forEach(mealType => {
        const mealCalories = mealData[mealType].reduce((sum, item) => sum + item.calories, 0);
        document.getElementById(mealType + '-calories').textContent = mealCalories;
        totalCalories += mealCalories;
    });
    
    document.getElementById('total-calories').textContent = totalCalories;
    const remaining = dailyGoal - totalCalories;
    document.getElementById('remaining-calories').textContent = remaining;
    
    // Change color based on remaining calories
    const remainingElement = document.querySelector('.remaining-calories .calories-number');
    if (remaining < 0) {
        remainingElement.style.color = '#ff4444';
    } else if (remaining < 200) {
        remainingElement.style.color = '#ffa500';
    } else {
        remainingElement.style.color = '#4CAF50';
    }
}

// Clear all meals
function clearAllMeals() {
    Object.keys(mealData).forEach(mealType => {
        mealData[mealType] = [];
        renderMealColumn(mealType);
    });
}
