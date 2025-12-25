"""
Groq API Client Wrapper
Handles all interactions with Groq's fast inference API
"""

import asyncio
import httpx
from typing import Optional, Dict, Any, AsyncIterator, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class GroqAPIError(Exception):
    """Custom exception for Groq API errors"""
    pass


class RateLimitError(GroqAPIError):
    """Rate limit exceeded"""
    pass


class GroqClient:
    """
    Async client for Groq API with retry logic and streaming support.

    Attributes:
        api_key: Groq API key
        base_url: Groq API base URL
        timeout: Request timeout in seconds
        max_retries: Maximum number of retry attempts
    """

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.groq.com/openai/v1",
        timeout: int = 30,
        max_retries: int = 3
    ):
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
        """Close the HTTP client"""
        await self.client.aclose()

    async def generate_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "llama-3.3-70b-versatile",
        temperature: float = 0.7,
        max_tokens: int = 2048,
        top_p: float = 1.0,
        stream: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate a completion from the Groq API.

        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model identifier
            temperature: Sampling temperature (0.0 to 2.0)
            max_tokens: Maximum tokens to generate
            top_p: Nucleus sampling parameter
            stream: Whether to stream the response
            **kwargs: Additional parameters

        Returns:
            Dict containing the completion response

        Raises:
            GroqAPIError: If the API call fails
            RateLimitError: If rate limit is exceeded
        """
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "top_p": top_p,
            "stream": stream,
            **kwargs
        }

        for attempt in range(self.max_retries):
            try:
                response = await self.client.post(
                    f"{self.base_url}/chat/completions",
                    json=payload
                )

                if response.status_code == 429:
                    retry_after = int(response.headers.get("Retry-After", 5))
                    logger.warning(f"Rate limit hit, retrying after {retry_after}s")
                    await asyncio.sleep(retry_after)
                    continue

                response.raise_for_status()
                return response.json()

            except httpx.HTTPStatusError as e:
                if e.response.status_code == 429:
                    if attempt == self.max_retries - 1:
                        raise RateLimitError("Rate limit exceeded after retries")
                    await asyncio.sleep(2 ** attempt)
                    continue

                error_detail = self._extract_error_detail(e.response)
                logger.error(f"Groq API error: {error_detail}")
                raise GroqAPIError(f"API request failed: {error_detail}")

            except httpx.RequestError as e:
                logger.error(f"Request error: {str(e)}")
                if attempt == self.max_retries - 1:
                    raise GroqAPIError(f"Request failed after {self.max_retries} attempts")
                await asyncio.sleep(2 ** attempt)

            except Exception as e:
                logger.exception("Unexpected error in Groq API call")
                raise GroqAPIError(f"Unexpected error: {str(e)}")

    async def generate_streaming(
        self,
        messages: List[Dict[str, str]],
        model: str = "llama-3.3-70b-versatile",
        temperature: float = 0.7,
        max_tokens: int = 2048,
        **kwargs
    ) -> AsyncIterator[Dict[str, Any]]:
        """
        Generate a streaming completion from the Groq API.

        Args:
            messages: List of message dicts
            model: Model identifier
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            **kwargs: Additional parameters

        Yields:
            Dict containing each chunk of the response

        Raises:
            GroqAPIError: If the streaming fails
        """
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
            **kwargs
        }

        try:
            async with self.client.stream(
                "POST",
                f"{self.base_url}/chat/completions",
                json=payload
            ) as response:
                response.raise_for_status()

                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]  # Remove "data: " prefix

                        if data.strip() == "[DONE]":
                            break

                        try:
                            import json
                            chunk = json.loads(data)
                            yield chunk
                        except json.JSONDecodeError:
                            logger.warning(f"Failed to parse streaming chunk: {data}")
                            continue

        except httpx.HTTPStatusError as e:
            error_detail = self._extract_error_detail(e.response)
            raise GroqAPIError(f"Streaming failed: {error_detail}")
        except Exception as e:
            logger.exception("Error in streaming generation")
            raise GroqAPIError(f"Streaming error: {str(e)}")

    async def count_tokens(self, text: str, model: str = "llama-3.3-70b-versatile") -> int:
        """
        Estimate token count for a given text.

        Note: This is an approximation. Actual token count may vary.

        Args:
            text: Text to count tokens for
            model: Model to use for tokenization

        Returns:
            Estimated token count
        """
        # Rough approximation: 1 token ≈ 4 characters
        # For more accurate counting, integrate tiktoken or similar
        return len(text) // 4

    def get_available_models(self) -> List[Dict[str, Any]]:
        """
        Get list of available Groq models.

        Returns:
            List of model information dicts
        """
        return [
            {
                "id": "llama-3.3-70b-versatile",
                "name": "Mixtral 8x7B",
                "context_window": 32768,
                "description": "Fast, balanced model for general use"
            },
            {
                "id": "llama3-70b-8192",
                "name": "LLaMA 3 70B",
                "context_window": 8192,
                "description": "High reasoning capability"
            },
            {
                "id": "llama3-8b-8192",
                "name": "LLaMA 3 8B",
                "context_window": 8192,
                "description": "Fast responses, good for quick tasks"
            },
            {
                "id": "gemma2-9b-it",
                "name": "Gemma 2 9B",
                "context_window": 8192,
                "description": "Efficient and capable"
            }
        ]

    def _extract_error_detail(self, response: httpx.Response) -> str:
        """Extract error details from API response"""
        try:
            error_data = response.json()
            if "error" in error_data:
                return error_data["error"].get("message", str(error_data))
            return str(error_data)
        except Exception:
            return response.text

    async def health_check(self) -> bool:
        """
        Check if the Groq API is accessible.

        Returns:
            True if API is healthy, False otherwise
        """
        try:
            # Make a minimal request to check connectivity
            response = await self.generate_completion(
                messages=[{"role": "user", "content": "hi"}],
                max_tokens=5
            )
            return "choices" in response
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return False