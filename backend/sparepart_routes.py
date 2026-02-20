from flask import Blueprint, request, jsonify, session
from database import get_db_connection
from job_routes import login_required, manager_required

spareparts_bp = Blueprint('spareparts', __name__, url_prefix='/api/spareparts')

@spareparts_bp.route('', methods=['GET'])
@login_required
def get_spareparts():
    conn = get_db_connection()
    parts = conn.execute('''
        SELECT spare_parts.*, users.name as used_by_name 
        FROM spare_parts LEFT JOIN users ON spare_parts.used_by = users.id
        ORDER BY used_date DESC
    ''').fetchall()
    conn.close()
    return jsonify([dict(p) for p in parts])

@spareparts_bp.route('', methods=['POST'])
@login_required
@manager_required
def add_sparepart_usage():
    data = request.json
    conn = get_db_connection()
    cursor = conn.execute('''
        INSERT INTO spare_parts (part_name, quantity_used, used_by)
        VALUES (?, ?, ?)
    ''', (data['part_name'], data['quantity_used'], session['user_id']))
    conn.commit()
    conn.close()
    return jsonify({'id': cursor.lastrowid, 'message': 'Usage recorded'})

@spareparts_bp.route('/<int:part_id>', methods=['DELETE'])
@login_required
@manager_required
def delete_sparepart(part_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM spare_parts WHERE id = ?', (part_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Entry deleted'})

# Optional: monthly summary
@spareparts_bp.route('/summary/monthly', methods=['GET'])
@login_required
def monthly_summary():
    conn = get_db_connection()
    summary = conn.execute('''
        SELECT strftime('%Y-%m', used_date) as month,
               part_name,
               SUM(quantity_used) as total_used
        FROM spare_parts
        GROUP BY month, part_name
        ORDER BY month DESC, part_name
    ''').fetchall()
    conn.close()
    return jsonify([dict(s) for s in summary])