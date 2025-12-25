import httpx
import asyncio
from typing import Optional, List, AsyncIterator, Dict
import logging

logger = logging.getLogger(__name__)


class GroqAPIError(Exception):
    """
    Custom exception for API error
    """
    pass


class RateLimitError(GroqAPIError):
    """
    Rate limit exceeded
    """
    pass


class GroqClient:
    """
    Async client for Groq API with retry logic and streaming support
    Attributes:
        api_key: Groq API key
        base_url: groq base url
        timeout: time out after max no of retries in seconds
        max_retries: maximum no of retries
    """

    def __init__(self, api_key: str, base_url: str = "https://api.groq.com/openai/v1", timeout: int = 30,
                 max_retries: int = 5):
        self.api_key = api_key
        self.base_url = base_url
        self.timeout = timeout
        self.max_retries = max_retries
        self.client = httpx.AsyncClient(
            timeout=timeout,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
        )

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    async def close(self):
        """Close the http client"""
        self.client.aclose(
            async def generate_completion(self, messages:List[Dict[str, str]], model: str = settings.Groq):
        )
