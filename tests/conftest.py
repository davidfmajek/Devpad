# tests/conftest.py

import pytest
import os
import sys
from datetime import timedelta
from dotenv import load_dotenv

# Load test environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env.test'))

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server.extensions import db, bcrypt, jwt
from server.models.note_model import User, Note, Tag

@pytest.fixture
def app():
    """Create a test Flask application."""
    from server.app import app as flask_app
    
    # Use the test database from environment
    test_database_url = os.getenv('TEST_DATABASE_URL')
    if not test_database_url:
        test_database_url = 'postgresql://postgres:devpad%402025@localhost:5432/devpad_test'
    
    # Configure the app for testing
    flask_app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': test_database_url,
        'JWT_SECRET_KEY': os.getenv('JWT_SECRET_KEY', 'test-secret-key'),
        'JWT_ACCESS_TOKEN_EXPIRES': timedelta(hours=1),
        'WTF_CSRF_ENABLED': False
    })
    
    with flask_app.app_context():
        # Create all tables
        db.create_all()
        yield flask_app
        # Clean up: remove all data but keep tables
        db.session.remove()
        # Truncate all tables instead of dropping
        for table in reversed(db.metadata.sorted_tables):
            db.session.execute(table.delete())
        db.session.commit()

@pytest.fixture
def client(app):
    """Create a test client for the Flask application."""
    return app.test_client()

@pytest.fixture
def auth_headers(client):
    """Create a user and return authorization headers."""
    # Register a test user
    response = client.post('/api/auth/register', json={
        'email': 'test@example.com',
        'password': 'TestPassword123'
    })
    
    assert response.status_code == 201
    data = response.get_json()
    token = data['access_token']
    
    return {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

@pytest.fixture
def sample_note_data():
    """Sample note data for testing."""
    return {
        'title': 'Test Note',
        'content_md': '# Test Content\nThis is a test note.',
        'language': 'markdown',
        'favorite': False,
        'tags': ['test', 'sample']
    }
