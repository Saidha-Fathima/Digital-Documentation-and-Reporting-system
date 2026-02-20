from flask import Blueprint, request, jsonify, session
from database import get_db_connection
from job_routes import login_required, manager_required

materials_bp = Blueprint('materials', __name__, url_prefix='/api/materials')

@materials_bp.route('', methods=['GET'])
@login_required
def get_materials():
    conn = get_db_connection()
    materials = conn.execute('SELECT * FROM materials ORDER BY material_name').fetchall()
    conn.close()
    return jsonify([dict(m) for m in materials])

@materials_bp.route('', methods=['POST'])
@login_required
@manager_required
def add_material():
    data = request.json
    conn = get_db_connection()
    cursor = conn.execute('''
        INSERT INTO materials (material_name, quantity, minimum_level)
        VALUES (?, ?, ?)
    ''', (data['material_name'], data['quantity'], data.get('minimum_level', 5)))
    conn.commit()
    conn.close()
    return jsonify({'id': cursor.lastrowid, 'message': 'Material added'})

@materials_bp.route('/<int:material_id>', methods=['PUT'])
@login_required
@manager_required
def update_material(material_id):
    data = request.json
    conn = get_db_connection()
    conn.execute('''
        UPDATE materials SET material_name = ?, quantity = ?, minimum_level = ?
        WHERE id = ?
    ''', (data['material_name'], data['quantity'], data['minimum_level'], material_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Material updated'})

@materials_bp.route('/<int:material_id>', methods=['DELETE'])
@login_required
@manager_required
def delete_material(material_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM materials WHERE id = ?', (material_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Material deleted'})