from flask import Blueprint, request, jsonify, session
from database import get_db_connection

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE email = ? AND password = ?', (email, password)).fetchone()
    conn.close()

    if user:
        session['user_id'] = user['id']
        session['user_name'] = user['name']
        session['role'] = user['role']
        return jsonify({
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'role': user['role']
        })
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out'})

@auth_bp.route('/me', methods=['GET'])
def me():
    if 'user_id' in session:
        return jsonify({
            'id': session['user_id'],
            'name': session['user_name'],
            'role': session['role']
        })
    return jsonify({'error': 'Not logged in'}), 401