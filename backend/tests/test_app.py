import pytest
import os
import tempfile
from app import app, db

@pytest.fixture
def client():
    # Use an in-memory SQLite database for tests
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['TESTING'] = True
    app.config['JWT_SECRET_KEY'] = 'test_secret_key'

    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client

def test_health_check(client):
    response = client.get('/api/health')
    assert response.status_code == 200
    assert b'healthy' in response.data

def test_register_user(client):
    response = client.post('/api/register', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    assert response.status_code == 201
    assert b'User created successfully' in response.data

def test_register_duplicate_email(client):
    client.post('/api/register', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    response = client.post('/api/register', json={
        'email': 'test@example.com',
        'password': 'password456'
    })
    assert response.status_code == 400
    assert b'already registered' in response.data

def test_login_success(client):
    client.post('/api/register', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    response = client.post('/api/login', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    assert response.status_code == 200
    assert 'access_token' in response.get_json()

def test_login_invalid_credentials(client):
    response = client.post('/api/login', json={
        'email': 'wrong@example.com',
        'password': 'wrongpass'
    })
    assert response.status_code == 401
    assert b'Invalid credentials' in response.data

def test_get_expenses_unauthenticated(client):
    response = client.get('/api/expenses')
    assert response.status_code == 401

def test_add_expense_authenticated(client):
    # Register and login
    client.post('/api/register', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    login_response = client.post('/api/login', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    token = login_response.get_json()['access_token']

    # Add expense
    response = client.post('/api/expenses', json={
        'amount': 50.0,
        'category': 'Food',
        'date': '2023-10-01'
    }, headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 201
    assert b'Expense added successfully' in response.data

def test_get_expenses_authenticated(client):
    # Register and login
    client.post('/api/register', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    login_response = client.post('/api/login', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    token = login_response.get_json()['access_token']

    # Add expense
    client.post('/api/expenses', json={
        'amount': 50.0,
        'category': 'Food',
        'date': '2023-10-01'
    }, headers={'Authorization': f'Bearer {token}'})

    # Get expenses
    response = client.get('/api/expenses', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    expenses = response.get_json()
    assert len(expenses) == 1
    assert expenses[0]['amount'] == 50.0

def test_export_csv_authenticated(client):
    # Register and login
    client.post('/api/register', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    login_response = client.post('/api/login', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    token = login_response.get_json()['access_token']

    # Add expense
    client.post('/api/expenses', json={
        'amount': 50.0,
        'category': 'Food',
        'date': '2023-10-01'
    }, headers={'Authorization': f'Bearer {token}'})

    # Export CSV
    response = client.get('/api/export', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    assert 'text/csv' in response.headers['Content-Type']
    assert b'Amount,Category,Date' in response.data
    assert b'50.0,Food,2023-10-01' in response.data
