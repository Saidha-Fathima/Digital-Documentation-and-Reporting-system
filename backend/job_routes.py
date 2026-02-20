from flask import Blueprint, request, jsonify, session
from database import get_db_connection

jobs_bp = Blueprint('jobs', __name__, url_prefix='/api/jobs')

# Middleware to check login
def login_required(f):
    def wrapper(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

def manager_required(f):
    def wrapper(*args, **kwargs):
        if session.get('role') != 'manager':
            return jsonify({'error': 'Forbidden'}), 403
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

@jobs_bp.route('', methods=['GET'])
@login_required
def get_jobs():
    role = session.get('role')
    user_id = session.get('user_id')
    conn = get_db_connection()
    if role == 'manager':
        jobs = conn.execute('''
            SELECT jobs.*, users.name as assigned_name 
            FROM jobs LEFT JOIN users ON jobs.assigned_to = users.id
            ORDER BY jobs.created_at DESC
        ''').fetchall()
    else:
        jobs = conn.execute('''
            SELECT jobs.*, users.name as assigned_name 
            FROM jobs LEFT JOIN users ON jobs.assigned_to = users.id
            WHERE jobs.assigned_to = ?
            ORDER BY jobs.created_at DESC
        ''', (user_id,)).fetchall()
    conn.close()
    return jsonify([dict(job) for job in jobs])

@jobs_bp.route('', methods=['POST'])
@login_required
@manager_required
def create_job():
    data = request.json
    conn = get_db_connection()
    cursor = conn.execute('''
        INSERT INTO jobs (job_title, assigned_to, status, progress)
        VALUES (?, ?, ?, ?)
    ''', (data['job_title'], data.get('assigned_to'), 'pending', 0))
    conn.commit()
    job_id = cursor.lastrowid
    conn.close()
    return jsonify({'id': job_id, 'message': 'Job created'})

@jobs_bp.route('/<int:job_id>', methods=['PUT'])
@login_required
def update_job(job_id):
    data = request.json
    role = session.get('role')
    user_id = session.get('user_id')
    conn = get_db_connection()

    # Check if job exists and permissions
    job = conn.execute('SELECT * FROM jobs WHERE id = ?', (job_id,)).fetchone()
    if not job:
        conn.close()
        return jsonify({'error': 'Job not found'}), 404

    # Employees can only update progress and status, and only their assigned jobs
    if role == 'employee':
        if job['assigned_to'] != user_id:
            conn.close()
            return jsonify({'error': 'You can only update your own jobs'}), 403
        # Allowed fields for employee: status, progress
        allowed_fields = {'status', 'progress'}
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
    else:
        # Manager can update everything
        update_data = data

    if not update_data:
        conn.close()
        return jsonify({'error': 'No valid fields to update'}), 400

    # Build dynamic update query
    set_clause = ', '.join([f"{key} = ?" for key in update_data.keys()])
    values = list(update_data.values()) + [job_id]
    conn.execute(f'UPDATE jobs SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?', values)
    conn.commit()
    conn.close()
    return jsonify({'message': 'Job updated'})

@jobs_bp.route('/<int:job_id>', methods=['DELETE'])
@login_required
@manager_required
def delete_job(job_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM jobs WHERE id = ?', (job_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Job deleted'})

@jobs_bp.route('/employees', methods=['GET'])
@login_required
@manager_required
def get_employees():
    conn = get_db_connection()
    employees = conn.execute('SELECT id, name FROM users WHERE role = "employee"').fetchall()
    conn.close()
    return jsonify([dict(emp) for emp in employees])