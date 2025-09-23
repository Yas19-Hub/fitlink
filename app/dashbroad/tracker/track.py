from flask import render_template, request, jsonify, Blueprint
from datetime import datetime, date

# Import db from your main app - adjust this import based on your app structure
try:
    from app import db
except ImportError:
    # Alternative import if your structure is different
    from ..app import db

# Create tracker blueprint
tracker_bp = Blueprint('tracker', __name__, template_folder='templates', static_folder='static')

# Database Models
class Activity(db.Model):
    __tablename__ = 'activities'
    id = db.Column(db.Integer, primary_key=True)
    activity_type = db.Column(db.String(50), nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    intensity = db.Column(db.String(20), nullable=False)
    calories_burned = db.Column(db.Integer, nullable=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    date = db.Column(db.Date, default=date.today)

class DailyStats(db.Model):
    __tablename__ = 'daily_stats'
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, default=date.today, unique=True)
    steps = db.Column(db.Integer, default=0)
    water_intake = db.Column(db.Integer, default=0)
    workout_time = db.Column(db.Integer, default=0)
    total_calories = db.Column(db.Integer, default=0)

# Calorie calculation rates
CALORIE_RATES = {
    'running': {'low': 8, 'moderate': 10, 'high': 12},
    'walking': {'low': 3, 'moderate': 4, 'high': 5},
    'cycling': {'low': 6, 'moderate': 8, 'high': 10},
    'swimming': {'low': 8, 'moderate': 10, 'high': 12},
    'weightlifting': {'low': 4, 'moderate': 6, 'high': 8},
    'yoga': {'low': 2, 'moderate': 3, 'high': 4},
    'cardio': {'low': 6, 'moderate': 8, 'high': 10}
}

def calculate_calories(activity_type, duration, intensity):
    rate = CALORIE_RATES.get(activity_type, {}).get(intensity, 5)
    return rate * duration

def get_or_create_daily_stats(target_date=None):
    if target_date is None:
        target_date = date.today()
    
    stats = DailyStats.query.filter_by(date=target_date).first()
    if not stats:
        stats = DailyStats(date=target_date)
        db.session.add(stats)
        db.session.commit()
    return stats

# Routes
@tracker_bp.route('/')
def tracker_home():
    return render_template('page.html')

@tracker_bp.route('/api/activities', methods=['POST'])
def log_activity():
    try:
        data = request.get_json()
        
        calories = calculate_calories(
            data['activity_type'], 
            data['duration'], 
            data['intensity']
        )
        
        activity = Activity(
            activity_type=data['activity_type'],
            duration=data['duration'],
            intensity=data['intensity'],
            calories_burned=calories,
            notes=data.get('notes', '')
        )
        
        db.session.add(activity)
        
        stats = get_or_create_daily_stats()
        stats.workout_time += data['duration']
        stats.total_calories += calories
        
        db.session.commit()
        
        return jsonify({
            'success': True, 
            'activity_id': activity.id,
            'calories_burned': calories
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400

@tracker_bp.route('/api/activities/today')
def get_today_activities():
    try:
        today = date.today()
        activities = Activity.query.filter_by(date=today).order_by(Activity.created_at.desc()).all()
        
        return jsonify([{
            'id': activity.id,
            'activity_type': activity.activity_type,
            'duration': activity.duration,
            'intensity': activity.intensity,
            'calories_burned': activity.calories_burned,
            'notes': activity.notes,
            'created_at': activity.created_at.isoformat()
        } for activity in activities])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@tracker_bp.route('/api/stats/today')
def get_today_stats():
    try:
        stats = get_or_create_daily_stats()
        
        return jsonify({
            'steps': stats.steps,
            'calories': stats.total_calories,
            'workout_time': stats.workout_time,
            'water': stats.water_intake
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@tracker_bp.route('/api/water', methods=['POST'])
def add_water():
    try:
        data = request.get_json()
        amount = data.get('amount', 250)
        
        stats = get_or_create_daily_stats()
        stats.water_intake += amount
        
        db.session.commit()
        
        return jsonify({'success': True, 'total_water': stats.water_intake})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400

@tracker_bp.route('/api/steps', methods=['POST'])
def add_steps():
    try:
        data = request.get_json()
        steps = data.get('steps', 1000)
        
        stats = get_or_create_daily_stats()
        stats.steps += steps
        
        step_calories = int(steps * 0.04)
        stats.total_calories += step_calories
        
        db.session.commit()
        
        return jsonify({'success': True, 'total_steps': stats.steps})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400

@tracker_bp.route('/api/workout', methods=['POST'])
def log_workout():
    try:
        data = request.get_json()
        duration = data.get('duration', 0)
        
        stats = get_or_create_daily_stats()
        stats.workout_time += duration
        
        workout_calories = duration * 5
        stats.total_calories += workout_calories
        
        db.session.commit()
        
        return jsonify({'success': True, 'total_workout_time': stats.workout_time})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400
