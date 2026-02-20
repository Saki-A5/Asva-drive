"""
AI Assistant Package
Core AI functionality for ASVAB Learning Assistant
"""

from .groq_client import GroqClient, GroqAPIError, RateLimitError
from .context_manager import ContextManager, Message, Session
from .mode_handler import (
    ModeHandler,
    LearningMode,
    ComplexityLevel,
    ProjectType
)

__version__ = "1.0.0"

__all__ = [
    "GroqClient",
    "GroqAPIError",
    "RateLimitError",
    "ContextManager",
    "Message",
    "Session",
    "ModeHandler",
    "LearningMode",
    "ComplexityLevel",
    "ProjectType",
]