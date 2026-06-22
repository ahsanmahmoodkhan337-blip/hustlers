import os
import json
import uuid
import hashlib
from datetime import datetime, timezone
from flask import Flask, request, jsonify, send_from_directory, abort

app = Flask(__name__, static_folder='.')

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
SUBMISSIONS_FILE = os.path.join(DATA_DIR, 'submissions.json')
STUDENT_IDS_FILE = os.path.join(DATA_DIR, 'student_ids.json')
ADMIN_PASSWORD = 'admin123'  # Simple password for demo

os.makedirs(DATA_DIR, exist_ok=True)

def load_submissions():
    if not os.path.exists(SUBMISSIONS_FILE):
        return []
    with open(SUBMISSIONS_FILE, 'r') as f:
        return json.load(f)

def save_submissions(data):
    with open(SUBMISSIONS_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def generate_token():
    return uuid.uuid4().hex

# ────────── API ENDPOINTS ──────────

@app.route('/api/submit', methods=['POST'])
def api_submit():
    data = request.get_json(force=True)
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    whatsapp = data.get('whatsapp', '').strip()
    transaction_id = data.get('transaction_id', '').strip()

    if not name or not email:
        return jsonify({'error': 'Name and email are required'}), 400

    submissions = load_submissions()

    submission = {
        'id': str(uuid.uuid4()),
        'name': name,
        'email': email,
        'whatsapp': whatsapp,
        'transaction_id': transaction_id,
        'status': 'pending',
        'token': None,
        'created_at': datetime.now(timezone.utc).isoformat(),
    }

    submissions.append(submission)
    save_submissions(submissions)

    return jsonify({
        'message': 'Your request is pending approval — we will notify you shortly.',
        'id': submission['id']
    }), 200

@app.route('/api/submissions', methods=['GET'])
def api_get_submissions():
    auth = request.headers.get('Authorization', '')
    if auth != f'Bearer {ADMIN_PASSWORD}':
        return jsonify({'error': 'Unauthorized'}), 401

    submissions = load_submissions()
    # Sort newest first
    submissions.sort(key=lambda s: s.get('created_at', ''), reverse=True)
    return jsonify(submissions), 200

@app.route('/api/approve', methods=['POST'])
def api_approve():
    auth = request.headers.get('Authorization', '')
    if auth != f'Bearer {ADMIN_PASSWORD}':
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json(force=True)
    submission_id = data.get('id', '')
    action = data.get('action', 'approve')  # 'approve' or 'reject'

    submissions = load_submissions()
    found = False
    for sub in submissions:
        if sub['id'] == submission_id:
            if action == 'approve':
                sub['status'] = 'approved'
                sub['token'] = generate_token()
                sub['approved_at'] = datetime.now(timezone.utc).isoformat()
            else:
                sub['status'] = 'rejected'
                sub['token'] = None
            found = True
            break

    if not found:
        return jsonify({'error': 'Submission not found'}), 404

    save_submissions(submissions)
    return jsonify({'message': f'Submission {action}d successfully'}), 200

@app.route('/api/check-access', methods=['GET'])
def api_check_access():
    token = request.args.get('token', '').strip()
    if not token:
        return jsonify({'valid': False, 'error': 'No token provided'}), 400

    submissions = load_submissions()
    for sub in submissions:
        if sub.get('token') == token and sub.get('status') == 'approved':
            return jsonify({
                'valid': True,
                'name': sub['name'],
                'email': sub['email']
            }), 200

    return jsonify({'valid': False, 'error': 'Invalid or expired token'}), 403


# ────────── STUDENT DISCOUNT API ──────────

def load_student_ids():
    if not os.path.exists(STUDENT_IDS_FILE):
        return []
    with open(STUDENT_IDS_FILE, 'r') as f:
        return json.load(f)

def save_student_ids(data):
    with open(STUDENT_IDS_FILE, 'w') as f:
        json.dump(data, f, indent=2)

@app.route('/api/validate-student', methods=['POST'])
def api_validate_student():
    data = request.get_json(force=True)
    student_id = data.get('student_id', '').strip().upper()

    if not student_id:
        return jsonify({'valid': False, 'error': 'Please enter a Student ID'}), 400

    ids = load_student_ids()
    for entry in ids:
        if entry['id'] == student_id:
            if entry['used']:
                return jsonify({'valid': False, 'error': 'This Student ID has already been used'}), 400
            return jsonify({
                'valid': True,
                'discount': 30,
                'message': '✅ 30% discount applied! Price reduced from $1 to $0.70'
            }), 200

    return jsonify({'valid': False, 'error': 'Invalid Student ID. Please check and try again.'}), 400

@app.route('/api/mark-student-used', methods=['POST'])
def api_mark_student_used():
    data = request.get_json(force=True)
    student_id = data.get('student_id', '').strip().upper()

    ids = load_student_ids()
    for entry in ids:
        if entry['id'] == student_id:
            entry['used'] = True
            entry['used_at'] = datetime.now(timezone.utc).isoformat()
            save_student_ids(ids)
            return jsonify({'message': 'Student ID marked as used'}), 200

    return jsonify({'error': 'Student ID not found'}), 404

@app.route('/api/student-ids', methods=['GET'])
def api_get_student_ids():
    auth = request.headers.get('Authorization', '')
    if auth != f'Bearer {ADMIN_PASSWORD}':
        return jsonify({'error': 'Unauthorized'}), 401

    ids = load_student_ids()
    return jsonify(ids), 200

@app.route('/api/reset-student-id', methods=['POST'])
def api_reset_student_id():
    auth = request.headers.get('Authorization', '')
    if auth != f'Bearer {ADMIN_PASSWORD}':
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json(force=True)
    student_id = data.get('student_id', '').strip().upper()

    ids = load_student_ids()
    for entry in ids:
        if entry['id'] == student_id:
            entry['used'] = False
            entry.pop('used_at', None)
            save_student_ids(ids)
            return jsonify({'message': f'Student ID {student_id} reset to unused'}), 200

    return jsonify({'error': 'Student ID not found'}), 404


# ────────── STATIC FILE SERVING ──────────

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    # Serve static files from the current directory
    try:
        return send_from_directory('.', filename)
    except:
        abort(404)

if __name__ == '__main__':
    print("Starting Healthcare Hustlers server on port 3000...")
    app.run(host='0.0.0.0', port=3000, debug=False)