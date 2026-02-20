import sqlite3

def get_db_connection():
    conn = sqlite3.connect('goltens.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('manager', 'employee'))
        )
    ''')

    # Jobs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_title TEXT NOT NULL,
            assigned_to INTEGER,
            status TEXT DEFAULT 'pending',
            progress INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (assigned_to) REFERENCES users(id)
        )
    ''')

    # Materials table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS materials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            material_name TEXT NOT NULL,
            quantity INTEGER DEFAULT 0,
            minimum_level INTEGER DEFAULT 5
        )
    ''')

    # Spare parts consumption table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS spare_parts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            part_name TEXT NOT NULL,
            quantity_used INTEGER DEFAULT 0,
            used_by INTEGER,
            used_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (used_by) REFERENCES users(id)
        )
    ''')

    # Insert default users (password is plain text for demo; use hashing in production)
    cursor.execute("SELECT * FROM users WHERE email='manager@example.com'")
    if not cursor.fetchone():
        cursor.execute("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                       ('Manager', 'manager@example.com', 'manager123', 'manager'))
        cursor.execute("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                       ('Employee', 'employee@example.com', 'employee123', 'employee'))

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()