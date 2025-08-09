# tests/test_integration.py

def test_full_user_workflow(client):
    """Test a complete user workflow: register, create notes, update, delete."""
    
    # 1. Register a user
    register_response = client.post('/api/auth/register', json={
        'email': 'workflow@example.com',
        'password': 'WorkflowPassword123'
    })
    assert register_response.status_code == 201
    token = register_response.get_json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    
    # 2. Verify empty notes list
    notes_response = client.get('/api/notes', headers=headers)
    assert notes_response.status_code == 200
    assert len(notes_response.get_json()) == 0
    
    # 3. Create first note
    note1_data = {
        'title': 'My First Note',
        'content_md': '# Getting Started\nThis is my first note!',
        'language': 'markdown',
        'favorite': False,
        'tags': ['personal', 'getting-started']
    }
    
    create1_response = client.post('/api/notes', json=note1_data, headers=headers)
    assert create1_response.status_code == 201
    note1_id = create1_response.get_json()['id']
    
    # 4. Create second note
    note2_data = {
        'title': 'Work Notes',
        'content_md': '## Project Tasks\n- [ ] Task 1\n- [ ] Task 2',
        'language': 'markdown',
        'favorite': True,
        'tags': ['work', 'tasks']
    }
    
    create2_response = client.post('/api/notes', json=note2_data, headers=headers)
    assert create2_response.status_code == 201
    note2_id = create2_response.get_json()['id']
    
    # 5. List notes and verify both exist
    notes_response = client.get('/api/notes', headers=headers)
    assert notes_response.status_code == 200
    notes = notes_response.get_json()
    assert len(notes) == 2
    
    # Verify notes are ordered by updated_at (most recent first)
    assert notes[0]['title'] == 'Work Notes'  # Created second, so most recent
    assert notes[1]['title'] == 'My First Note'
    
    # 6. Update the first note
    update_data = {
        'title': 'My Updated First Note',
        'content_md': '# Getting Started (Updated)\nThis note has been updated!',
        'language': 'markdown',
        'favorite': True,
        'tags': ['personal', 'updated']
    }
    
    update_response = client.put(f'/api/notes/{note1_id}', json=update_data, headers=headers)
    assert update_response.status_code == 200
    
    # 7. Verify the update
    notes_response = client.get('/api/notes', headers=headers)
    notes = notes_response.get_json()
    
    # After update, the first note should now be at the top (most recently updated)
    updated_note = next((n for n in notes if n['id'] == note1_id), None)
    assert updated_note is not None
    assert updated_note['title'] == 'My Updated First Note'
    assert updated_note['favorite'] is True
    assert set(updated_note['tags']) == {'personal', 'updated'}
    
    # 8. Delete the second note
    delete_response = client.delete(f'/api/notes/{note2_id}', headers=headers)
    assert delete_response.status_code == 200
    
    # 9. Verify only one note remains
    notes_response = client.get('/api/notes', headers=headers)
    notes = notes_response.get_json()
    assert len(notes) == 1
    assert notes[0]['id'] == note1_id
    assert notes[0]['title'] == 'My Updated First Note'

def test_multiple_users_isolation(client):
    """Test that users can only access their own notes."""
    
    # Create two users
    user1_response = client.post('/api/auth/register', json={
        'email': 'user1@isolation.com',
        'password': 'Password123'
    })
    assert user1_response.status_code == 201
    user1_token = user1_response.get_json()['access_token']
    user1_headers = {'Authorization': f'Bearer {user1_token}'}
    
    user2_response = client.post('/api/auth/register', json={
        'email': 'user2@isolation.com',
        'password': 'Password123'
    })
    assert user2_response.status_code == 201
    user2_token = user2_response.get_json()['access_token']
    user2_headers = {'Authorization': f'Bearer {user2_token}'}
    
    # User1 creates notes
    user1_note1 = client.post('/api/notes', json={
        'title': 'User1 Note 1',
        'content_md': 'Private content for user 1'
    }, headers=user1_headers)
    assert user1_note1.status_code == 201
    
    user1_note2 = client.post('/api/notes', json={
        'title': 'User1 Note 2',
        'content_md': 'Another private note for user 1'
    }, headers=user1_headers)
    assert user1_note2.status_code == 201
    
    # User2 creates notes
    user2_note1 = client.post('/api/notes', json={
        'title': 'User2 Note 1',
        'content_md': 'Private content for user 2'
    }, headers=user2_headers)
    assert user2_note1.status_code == 201
    
    # Verify isolation: User1 can only see their notes
    user1_notes_response = client.get('/api/notes', headers=user1_headers)
    assert user1_notes_response.status_code == 200
    user1_notes = user1_notes_response.get_json()
    assert len(user1_notes) == 2
    assert all('User1' in note['title'] for note in user1_notes)
    
    # Verify isolation: User2 can only see their notes
    user2_notes_response = client.get('/api/notes', headers=user2_headers)
    assert user2_notes_response.status_code == 200
    user2_notes = user2_notes_response.get_json()
    assert len(user2_notes) == 1
    assert 'User2' in user2_notes[0]['title']

def test_tag_reuse_across_notes(client, auth_headers):
    """Test that tags can be reused across different notes."""
    
    # Create first note with tags
    note1_response = client.post('/api/notes', json={
        'title': 'Python Tutorial',
        'content_md': 'Learning Python basics',
        'tags': ['python', 'tutorial', 'programming']
    }, headers=auth_headers)
    assert note1_response.status_code == 201
    
    # Create second note reusing some tags
    note2_response = client.post('/api/notes', json={
        'title': 'Flask API Guide',
        'content_md': 'Building APIs with Flask',
        'tags': ['python', 'flask', 'api', 'programming']
    }, headers=auth_headers)
    assert note2_response.status_code == 201
    
    # Create third note with completely new tags
    note3_response = client.post('/api/notes', json={
        'title': 'JavaScript Basics',
        'content_md': 'Learning JavaScript',
        'tags': ['javascript', 'frontend', 'tutorial']
    }, headers=auth_headers)
    assert note3_response.status_code == 201
    
    # Verify all notes exist with correct tags
    notes_response = client.get('/api/notes', headers=auth_headers)
    assert notes_response.status_code == 200
    notes = notes_response.get_json()
    assert len(notes) == 3
    
    # Check that common tags appear in multiple notes
    all_tags = []
    for note in notes:
        all_tags.extend(note['tags'])
    
    # 'python', 'tutorial', and 'programming' should appear multiple times
    assert all_tags.count('python') == 2
    assert all_tags.count('tutorial') == 2
    assert all_tags.count('programming') == 2
    
    # Other tags should appear once
    assert all_tags.count('flask') == 1
    assert all_tags.count('api') == 1
    assert all_tags.count('javascript') == 1
    assert all_tags.count('frontend') == 1

def test_error_handling_edge_cases(client, auth_headers):
    """Test various error handling scenarios."""
    
    # Test updating with invalid JSON
    response = client.put('/api/notes/1', 
                         data='invalid json',
                         headers=auth_headers)
    # Should handle gracefully (depending on Flask's JSON handling)
    
    # Test with very long content
    very_long_content = 'A' * 10000  # 10KB of content
    long_note_response = client.post('/api/notes', json={
        'title': 'Very Long Note',
        'content_md': very_long_content
    }, headers=auth_headers)
    assert long_note_response.status_code == 201
    
    # Test with special characters in title and content
    special_chars_response = client.post('/api/notes', json={
        'title': 'Special Chars: @#$%^&*()_+{}|:"<>?[]\\;\',./',
        'content_md': '# Unicode: 🚀 📝 ✅ 🎯\n\nEmojis and symbols work!'
    }, headers=auth_headers)
    assert special_chars_response.status_code == 201
    
    # Test with empty strings
    empty_strings_response = client.post('/api/notes', json={
        'title': '',
        'content_md': '',
        'language': '',
        'tags': ['']
    }, headers=auth_headers)
    assert empty_strings_response.status_code == 201
