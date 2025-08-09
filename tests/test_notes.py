# tests/test_notes.py

def test_list_notes_empty(client, auth_headers):
    """Test listing notes when no notes exist."""
    response = client.get('/api/notes', headers=auth_headers)
    
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) == 0

def test_list_notes_unauthorized(client):
    """Test listing notes without authorization."""
    response = client.get('/api/notes')
    
    assert response.status_code == 401

def test_create_note_success(client, auth_headers, sample_note_data):
    """Test successful note creation."""
    response = client.post('/api/notes', 
                          json=sample_note_data,
                          headers=auth_headers)
    
    assert response.status_code == 201
    data = response.get_json()
    assert 'id' in data
    assert isinstance(data['id'], int)

def test_create_note_unauthorized(client, sample_note_data):
    """Test note creation without authorization."""
    response = client.post('/api/notes', json=sample_note_data)
    
    assert response.status_code == 401

def test_create_note_minimal_data(client, auth_headers):
    """Test note creation with minimal data."""
    minimal_data = {}
    
    response = client.post('/api/notes', 
                          json=minimal_data,
                          headers=auth_headers)
    
    assert response.status_code == 201
    data = response.get_json()
    assert 'id' in data

def test_create_note_with_tags(client, auth_headers):
    """Test note creation with tags."""
    note_data = {
        'title': 'Tagged Note',
        'content_md': 'Content with tags',
        'tags': ['important', 'work', 'urgent']
    }
    
    response = client.post('/api/notes', 
                          json=note_data,
                          headers=auth_headers)
    
    assert response.status_code == 201
    data = response.get_json()
    assert 'id' in data

def test_list_notes_with_data(client, auth_headers, sample_note_data):
    """Test listing notes when notes exist."""
    # Create a note first
    create_response = client.post('/api/notes', 
                                 json=sample_note_data,
                                 headers=auth_headers)
    assert create_response.status_code == 201
    
    # Now list notes
    response = client.get('/api/notes', headers=auth_headers)
    
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) == 1
    
    note = data[0]
    assert note['title'] == sample_note_data['title']
    assert note['content_md'] == sample_note_data['content_md']
    assert note['language'] == sample_note_data['language']
    assert note['favorite'] == sample_note_data['favorite']
    assert set(note['tags']) == set(sample_note_data['tags'])
    assert 'id' in note
    assert 'created_at' in note
    assert 'updated_at' in note

def test_update_note_success(client, auth_headers, sample_note_data):
    """Test successful note update."""
    # Create a note first
    create_response = client.post('/api/notes', 
                                 json=sample_note_data,
                                 headers=auth_headers)
    assert create_response.status_code == 201
    note_id = create_response.get_json()['id']
    
    # Update the note
    update_data = {
        'title': 'Updated Title',
        'content_md': '# Updated Content\nThis is updated.',
        'language': 'html',
        'favorite': True,
        'tags': ['updated', 'modified']
    }
    
    response = client.put(f'/api/notes/{note_id}', 
                         json=update_data,
                         headers=auth_headers)
    
    assert response.status_code == 200
    data = response.get_json()
    assert data['msg'] == 'Updated'

def test_update_note_unauthorized(client, auth_headers, sample_note_data):
    """Test note update without authorization."""
    # Create a note first
    create_response = client.post('/api/notes', 
                                 json=sample_note_data,
                                 headers=auth_headers)
    assert create_response.status_code == 201
    note_id = create_response.get_json()['id']
    
    # Try to update without auth
    update_data = {'title': 'Unauthorized Update'}
    response = client.put(f'/api/notes/{note_id}', json=update_data)
    
    assert response.status_code == 401

def test_update_nonexistent_note(client, auth_headers):
    """Test updating a note that doesn't exist."""
    update_data = {'title': 'Non-existent Note'}
    
    response = client.put('/api/notes/99999', 
                         json=update_data,
                         headers=auth_headers)
    
    assert response.status_code == 404

def test_update_note_different_user(client):
    """Test updating a note from a different user."""
    # Create two users
    user1_response = client.post('/api/auth/register', json={
        'email': 'user1@example.com',
        'password': 'Password123'
    })
    assert user1_response.status_code == 201
    user1_token = user1_response.get_json()['access_token']
    user1_headers = {'Authorization': f'Bearer {user1_token}'}
    
    user2_response = client.post('/api/auth/register', json={
        'email': 'user2@example.com',
        'password': 'Password123'
    })
    assert user2_response.status_code == 201
    user2_token = user2_response.get_json()['access_token']
    user2_headers = {'Authorization': f'Bearer {user2_token}'}
    
    # User1 creates a note
    note_response = client.post('/api/notes', 
                               json={'title': 'User1 Note'},
                               headers=user1_headers)
    assert note_response.status_code == 201
    note_id = note_response.get_json()['id']
    
    # User2 tries to update User1's note
    response = client.put(f'/api/notes/{note_id}', 
                         json={'title': 'Hijacked Note'},
                         headers=user2_headers)
    
    assert response.status_code == 403
    data = response.get_json()
    assert data['msg'] == 'Forbidden'

def test_delete_note_success(client, auth_headers, sample_note_data):
    """Test successful note deletion."""
    # Create a note first
    create_response = client.post('/api/notes', 
                                 json=sample_note_data,
                                 headers=auth_headers)
    assert create_response.status_code == 201
    note_id = create_response.get_json()['id']
    
    # Delete the note
    response = client.delete(f'/api/notes/{note_id}', headers=auth_headers)
    
    assert response.status_code == 200
    data = response.get_json()
    assert data['msg'] == 'Deleted'
    
    # Verify note is deleted by trying to list notes
    list_response = client.get('/api/notes', headers=auth_headers)
    assert list_response.status_code == 200
    notes = list_response.get_json()
    assert len(notes) == 0

def test_delete_note_unauthorized(client, auth_headers, sample_note_data):
    """Test note deletion without authorization."""
    # Create a note first
    create_response = client.post('/api/notes', 
                                 json=sample_note_data,
                                 headers=auth_headers)
    assert create_response.status_code == 201
    note_id = create_response.get_json()['id']
    
    # Try to delete without auth
    response = client.delete(f'/api/notes/{note_id}')
    
    assert response.status_code == 401

def test_delete_nonexistent_note(client, auth_headers):
    """Test deleting a note that doesn't exist."""
    response = client.delete('/api/notes/99999', headers=auth_headers)
    
    assert response.status_code == 404

def test_delete_note_different_user(client):
    """Test deleting a note from a different user."""
    # Create two users
    user1_response = client.post('/api/auth/register', json={
        'email': 'delete1@example.com',
        'password': 'Password123'
    })
    assert user1_response.status_code == 201
    user1_token = user1_response.get_json()['access_token']
    user1_headers = {'Authorization': f'Bearer {user1_token}'}
    
    user2_response = client.post('/api/auth/register', json={
        'email': 'delete2@example.com',
        'password': 'Password123'
    })
    assert user2_response.status_code == 201
    user2_token = user2_response.get_json()['access_token']
    user2_headers = {'Authorization': f'Bearer {user2_token}'}
    
    # User1 creates a note
    note_response = client.post('/api/notes', 
                               json={'title': 'User1 Note'},
                               headers=user1_headers)
    assert note_response.status_code == 201
    note_id = note_response.get_json()['id']
    
    # User2 tries to delete User1's note
    response = client.delete(f'/api/notes/{note_id}', headers=user2_headers)
    
    assert response.status_code == 403
    data = response.get_json()
    assert data['msg'] == 'Forbidden'

def test_notes_ordering(client, auth_headers):
    """Test that notes are ordered by updated_at descending."""
    import time
    
    # Create multiple notes with slight delays
    note1_response = client.post('/api/notes', 
                                json={'title': 'First Note'},
                                headers=auth_headers)
    assert note1_response.status_code == 201
    
    time.sleep(0.1)  # Small delay to ensure different timestamps
    
    note2_response = client.post('/api/notes', 
                                json={'title': 'Second Note'},
                                headers=auth_headers)
    assert note2_response.status_code == 201
    
    time.sleep(0.1)
    
    note3_response = client.post('/api/notes', 
                                json={'title': 'Third Note'},
                                headers=auth_headers)
    assert note3_response.status_code == 201
    
    # List notes and check ordering
    response = client.get('/api/notes', headers=auth_headers)
    assert response.status_code == 200
    notes = response.get_json()
    
    assert len(notes) == 3
    assert notes[0]['title'] == 'Third Note'  # Most recent first
    assert notes[1]['title'] == 'Second Note'
    assert notes[2]['title'] == 'First Note'
