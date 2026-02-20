from flask import Flask, session, jsonify
from flask_cors import CORS
from flask_session import Session
from database import init_db
from auth_routes import auth_bp
from job_routes import jobs_bp
from material_routes import materials_bp
from sparepart_routes import spareparts_bp
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev-secret-key-change-in-production'
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
Session(app)

# Enable CORS for React frontend (allow credentials)
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

# Initialize database
init_db()

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(jobs_bp)
app.register_blueprint(materials_bp)
app.register_blueprint(spareparts_bp)

@app.route('/api/check-session')
def check_session():
    if 'user_id' in session:
        return jsonify({'authenticated': True, 'role': session.get('role')})
    return jsonify({'authenticated': False}), 401

if __name__ == '__main__':
    app.run(debug=True)