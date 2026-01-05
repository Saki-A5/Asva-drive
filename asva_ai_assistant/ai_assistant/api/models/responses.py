"""
API Response Models
Pydantic models for API responses
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class ResponseMetadata(BaseModel):
    """Metadata about the response"""

    tokens_used: int = Field(description="Total tokens used")
    model: str = Field(description="Model used for generation")
    processing_time_ms: Optional[int] = Field(
        default=None,
        description="Processing time in milliseconds"
    )
    complexity_level: Optional[str] = Field(
        default=None,
        description="Complexity level used"
    )
    project_type: Optional[str] = Field(
        default=None,
        description="Project type for Inventor mode"
    )


class ChatResponse(BaseModel):
    """Response model for chat endpoint"""

    session_id: str = Field(description="Session identifier")
    response: str = Field(description="AI generated response")
    mode: str = Field(description="Learning mode used")
    metadata: ResponseMetadata = Field(description="Response metadata")
    suggestions: List[str] = Field(
        default_factory=list,
        description="Suggested follow-up actions"
    )
    sources: List[str] = Field(
        default_factory=list,
        description="Referenced sources (if any)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "550e8400-e29b-41d4-a716-446655440000",
                "response": "Quantum entanglement is a phenomenon where...",
                "mode": "explainer",
                "metadata": {
                    "tokens_used": 1234,
                    "model": "mixtral-8x7b-32768",
                    "processing_time_ms": 450,
                    "complexity_level": "intermediate"
                },
                "suggestions": [
                    "Ask for a simpler explanation",
                    "Request more advanced details",
                    "Explore related quantum concepts"
                ],
                "sources": []
            }
        }


class StreamChunk(BaseModel):
    """Single chunk in streaming response"""

    type: str = Field(description="Chunk type: start, token, end")
    content: Optional[str] = Field(default=None, description="Token content")
    session_id: Optional[str] = Field(default=None, description="Session ID")
    metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Metadata (for end chunks)"
    )


class ErrorDetail(BaseModel):
    """Error detail information"""

    code: str = Field(description="Error code")
    message: str = Field(description="Human-readable error message")
    details: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional error details"
    )
    request_id: Optional[str] = Field(
        default=None,
        description="Request identifier for tracking"
    )


class ErrorResponse(BaseModel):
    """Error response model"""

    error: ErrorDetail = Field(description="Error information")

    class Config:
        json_schema_extra = {
            "example": {
                "error": {
                    "code": "INVALID_REQUEST",
                    "message": "Message cannot be empty",
                    "details": {"field": "message"},
                    "request_id": "req_12345"
                }
            }
        }


class SessionInfo(BaseModel):
    """Session information"""

    session_id: str = Field(description="Session identifier")
    created_at: datetime = Field(description="Session creation time")
    last_active: datetime = Field(description="Last activity time")
    message_count: int = Field(description="Number of messages")
    total_tokens: int = Field(description="Total tokens used")
    mode_history: List[str] = Field(
        default_factory=list,
        description="History of modes used"
    )


class SessionResponse(BaseModel):
    """Response for session queries"""

    session: SessionInfo = Field(description="Session information")

    class Config:
        json_schema_extra = {
            "example": {
                "session": {
                    "session_id": "550e8400-e29b-41d4-a716-446655440000",
                    "created_at": "2024-01-15T10:30:00Z",
                    "last_active": "2024-01-15T11:45:00Z",
                    "message_count": 15,
                    "total_tokens": 12450,
                    "mode_history": ["default", "explainer", "socratic"]
                }
            }
        }


class SuccessResponse(BaseModel):
    """Generic success response"""

    success: bool = Field(default=True, description="Operation success status")
    message: str = Field(description="Success message")
    data: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional data"
    )


class HealthResponse(BaseModel):
    """Health check response"""

    status: str = Field(description="Service status")
    version: str = Field(description="API version")
    groq_api_status: str = Field(description="Groq API status")
    timestamp: datetime = Field(description="Check timestamp")

    class Config:
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "version": "1.0.0",
                "groq_api_status": "connected",
                "timestamp": "2024-01-15T12:00:00Z"
            }
        }


class ModelInfo(BaseModel):
    """Information about an available model"""

    id: str = Field(description="Model identifier")
    name: str = Field(description="Model display name")
    context_window: int = Field(description="Maximum context window size")
    description: str = Field(description="Model description")


class ModelsResponse(BaseModel):
    """Response listing available models"""

    models: List[ModelInfo] = Field(description="Available models")
    default_model: str = Field(description="Default model ID")


class DocumentAnalysisResponse(BaseModel):
    """Response for document analysis"""

    session_id: str = Field(description="Session identifier")
    document_id: str = Field(description="Document ID")
    action: str = Field(description="Analysis action performed")
    result: str = Field(description="Analysis result")
    metadata: ResponseMetadata = Field(description="Response metadata")

    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "550e8400-e29b-41d4-a716-446655440000",
                "document_id": "drive_doc_12345",
                "action": "summarize",
                "result": "This document covers the fundamentals of...",
                "metadata": {
                    "tokens_used": 856,
                    "model": "mixtral-8x7b-32768",
                    "processing_time_ms": 320
                }
            }
        }


class ModeInfo(BaseModel):
    """Information about a learning mode"""

    id: str = Field(description="Mode identifier")
    name: str = Field(description="Mode display name")
    description: str = Field(description="Mode description")
    best_for: str = Field(description="What this mode is best for")
    approach: str = Field(description="Teaching approach")


class ModesResponse(BaseModel):
    """Response listing available learning modes"""

    modes: List[ModeInfo] = Field(description="Available modes")

    class Config:
        json_schema_extra = {
            "example": {
                "modes": [
                    {
                        "id": "socratic",
                        "name": "Socratic Mode",
                        "description": "Learn through guided questions",
                        "best_for": "Developing critical thinking",
                        "approach": "Questions and discovery"
                    }
                ]
            }
        }