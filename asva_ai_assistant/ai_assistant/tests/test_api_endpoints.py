"""
API Endpoint Tests
Example tests for the API endpoints
"""

import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_root_endpoint():
    """Test root endpoint returns API info"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "version" in data
    assert data["name"] == "ASVAB AI Assistant"


def test_health_endpoint():
    """Test health check endpoint"""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "version" in data
    assert "groq_api_status" in data


def test_models_endpoint():
    """Test models listing endpoint"""
    response = client.get("/api/v1/models")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    assert "default_model" in data
    assert len(data["models"]) > 0


def test_modes_endpoint():
    """Test learning modes endpoint"""
    response = client.get("/api/v1/modes")
    assert response.status_code == 200
    data = response.json()
    assert "modes" in data
    assert len(data["modes"]) == 4  # socratic, inventor, explainer, default


def test_chat_endpoint_validation():
    """Test chat endpoint input validation"""
    # Test with empty message
    response = client.post(
        "/api/v1/chat",
        json={
            "session_id": "test-session",
            "message": "",
            "mode": "default"
        }
    )
    assert response.status_code == 422


def test_chat_endpoint_invalid_mode():
    """Test chat endpoint with invalid mode"""
    response = client.post(
        "/api/v1/chat",
        json={
            "session_id": "test-session",
            "message": "Hello",
            "mode": "invalid_mode"
        }
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_session_not_found():
    """Test getting non-existent session"""
    response = client.get("/api/v1/sessions/nonexistent-session-id")
    assert response.status_code == 404


def test_ping_endpoint():
    """Test simple ping endpoint"""
    response = client.get("/api/v1/ping")
    assert response.status_code == 200
    data = response.json()
    assert "ping" in data
    assert data["ping"] == "pong"