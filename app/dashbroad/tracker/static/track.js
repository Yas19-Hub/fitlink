// Global variables
let currentWorkoutStart = null;
let dailyStats = {
    steps: 0,
    calories: 0,
    workoutTime: 0,
    water: 0
};

// API base URL for tracker blueprint
const API_BASE = '/tracker/api';

// Load data when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadDailyStats();
    loadTodayActivities();
    setupEventListeners();
});

function setupEventListeners() {
    // Activity form submission
    document.getElementById('activityForm').addEventListener('submit', handleActivitySubmit);
}

async function handleActivitySubmit(e) {
    e.preventDefault();
    
    const formData = {
        activity_type: document.getElementById('activityType').value,
        duration: parseInt(document.getElementById('duration').value),
        intensity: document.getElementById('intensity').value,
        notes: document.getElementById('notes').value
    };

    try {
        const response = await fetch(`${API_BASE}/activities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            showNotification('Activity logged successfully!', 'success');
            document.getElementById('activityForm').reset();
            loadDailyStats();
            loadTodayActivities();
        } else {
            showNotification('Error logging activity', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Network error', 'error');
    }
}

async function loadDailyStats() {
    try {
        const response = await fetch(`${API_BASE}/stats/today`);
        if (response.ok) {
            const stats = await response.json();
            updateStatsDisplay(stats);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function updateStatsDisplay(stats) {
    document.getElementById('todaySteps').textContent = stats.steps.toLocaleString();
    document.getElementById('caloriesBurned').textContent = stats.calories;
    document.getElementById('workoutTime').textContent = stats.workout_time + ' min';
    document.getElementById('waterIntake').textContent = (stats.water / 1000).toFixed(1) + 'L';
}

async function loadTodayActivities() {
    try {
        const response = await fetch(`${API_BASE}/activities/today`);
        if (response.ok) {
            const activities = await response.json();
            displayActivities(activities);
        }
    } catch (error) {
        console.error('Error loading activities:', error);
    }
}

function displayActivities(activities) {
    const activityList = document.getElementById('activityList');
    
    if (activities.length === 0) {
        activityList.innerHTML = '<p style="text-align: center; color: #666;">No activities logged today</p>';
        return;
    }

    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-details">
                <h4>${formatActivityName(activity.activity_type)}</h4>
                <p>${activity.duration} minutes • ${activity.intensity} intensity</p>
                ${activity.notes ? `<p><em>${activity.notes}</em></p>` : ''}
            </div>
            <div class="activity-meta">
                <div>${activity.calories_burned} cal</div>
                <div>${formatTime(activity.created_at)}</div>
            </div>
        </div>
    `).join('');
}

async function addWater() {
    try {
        const response = await fetch(`${API_BASE}/water`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount: 250 })
        });

        if (response.ok) {
            showNotification('Water intake logged!', 'success');
            loadDailyStats();
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error adding water', 'error');
    }
}

async function addSteps() {
    try {
        const response = await fetch(`${API_BASE}/steps`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ steps: 1000 })
        });

        if (response.ok) {
            showNotification('Steps added!', 'success');
            loadDailyStats();
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error adding steps', 'error');
    }
}

function startWorkout() {
    currentWorkoutStart = new Date();
    showNotification('Workout started!', 'info');
    
    // Update button states
    const startBtn = document.querySelector('[onclick="startWorkout()"]');
    const endBtn = document.querySelector('[onclick="endWorkout()"]');
    startBtn.disabled = true;
    startBtn.style.opacity = '0.5';
    endBtn.disabled = false;
    endBtn.style.opacity = '1';
}

async function endWorkout() {
    if (!currentWorkoutStart) {
        showNotification('No active workout found', 'warning');
        return;
    }

    const duration = Math.round((new Date() - currentWorkoutStart) / 60000); // minutes
    
    try {
        const response = await fetch(`${API_BASE}/workout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ duration: duration })
        });

        if (response.ok) {
            showNotification(`Workout completed! Duration: ${duration} minutes`, 'success');
            currentWorkoutStart = null;
            loadDailyStats();
            
            // Reset button states
            const startBtn = document.querySelector('[onclick="startWorkout()"]');
            const endBtn = document.querySelector('[onclick="endWorkout()"]');
            startBtn.disabled = false;
            startBtn.style.opacity = '1';
            endBtn.disabled = true;
            endBtn.style.opacity = '0.5';
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error ending workout', 'error');
    }
}

function formatActivityName(activity) {
    return activity.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
