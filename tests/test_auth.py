# tests/test_auth.py

import json

def test_ping_endpoint(client):
    """Test the ping health check endpoint."""
    response = client.get('/api/ping')
    assert response.status_code == 200
    data = response.get_json()
    assert data['message'] == 'pong from DevPad!'

def test_user_registration_success(client):
    """Test successful user registration."""
    user_data = {
        'email': 'newuser@example.com',
        'password': 'SecurePassword123'
    }
    
    response = client.post('/api/auth/register', 
                          json=user_data,
                          headers={'Content-Type': 'application/json'})
    
    assert response.status_code == 201
    data = response.get_json()
    assert 'access_token' in data
    assert len(data['access_token']) > 0

def test_user_registration_missing_email(client):
    """Test user registration with missing email."""
    user_data = {
        'password': 'SecurePassword123'
    }
    
    response = client.post('/api/auth/register', 
                          json=user_data,
                          headers={'Content-Type': 'application/json'})
    
    assert response.status_code == 400
    data = response.get_json()
    assert data['msg'] == 'Email and password required'

def test_user_registration_missing_password(client):
    """Test user registration with missing password."""
    user_data = {
        'email': 'test@example.com'
    }
    
    response = client.post('/api/auth/register', 
                          json=user_data,
                          headers={'Content-Type': 'application/json'})
    
    assert response.status_code == 400
    data = response.get_json()
    assert data['msg'] == 'Email and password required'

def test_user_registration_empty_data(client):
    """Test user registration with empty data."""
    response = client.post('/api/auth/register', 
                          json={},
                          headers={'Content-Type': 'application/json'})
    
    assert response.status_code == 400
    data = response.get_json()
    assert data['msg'] == 'Email and password required'

def test_user_registration_duplicate_email(client):
    """Test user registration with duplicate email."""
    user_data = {
        'email': 'duplicate@example.com',
        'password': 'SecurePassword123'
    }
    
    # Register user first time
    response1 = client.post('/api/auth/register', 
                           json=user_data,
                           headers={'Content-Type': 'application/json'})
    assert response1.status_code == 201
    
    # Try to register same user again
    response2 = client.post('/api/auth/register', 
                           json=user_data,
                           headers={'Content-Type': 'application/json'})
    
    assert response2.status_code == 409
    data = response2.get_json()
    assert data['msg'] == 'User already exists'

def test_user_registration_no_json_content_type(client):
    """Test user registration without proper content type."""
    user_data = {
        'email': 'test@example.com',
        'password': 'SecurePassword123'
    }
    
    response = client.post('/api/auth/register', 
                          data=json.dumps(user_data))
    
    # Flask returns 415 when content-type is not application/json
    assert response.status_code == 415
