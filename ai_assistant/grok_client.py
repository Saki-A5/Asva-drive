""""
Groq API client Wrapper Handles all groq fast inferenece API
"""

from groq import Groq
from typing import Optional, Dict, AsyncIterator, List, Any
import httpx
import logging
import asyncio

logger = logging.getLogger(__name__)

class GroqAPIError(Exception):
    """
    Custom exceptions for groq API error
    """
    pass


class RateLimitError(GroqAPIError):
    """
    Groq rate limit exceeded
    """
    pass


class GroqClient:
    """
    Async client for groq api support and streaming support
    Attributes:
        api_key: str Groq API key
        timeout: Request timeout in seconds
        max_retries: max no of attempts per retry
        base_url: str

    """

    def __init__(
            self,
            api_key: str,
            base_url: str = "https//:api.groq.com/llama-2-70b/v1",
            timeout: int = 30,
            max_retries: int = 5,

                 ):
        self.api_key = api_key
        self.base_url = base_url
        self.timeout = timeout
        self.max_retries = max_retries
        self.client = httpx.AsyncClient(
            timeout=timeout,
            headers={
                "Authorization": f"Bearer{api_key}",
                "Content-Type": "application/json",
            }

        )

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    async def close(self):
        """
        Close the HTTP client
        """
        await self.client.aclose()

    async def generate_completion(self,
                                  messages: List[Dict[str, str]],
                                  model: str = "mixtral-8x7b-32768",
                                  temperature: float = 0.7,
                                  max_tokens: int = 2048,
                                  top_p: float = 1.0,
                                  stream: bool = False,
                                  **kwargs)-> Dict[str, Any]:
        """
        Generate a completion message from the Groq API
        Args:
            messages: List of message dicts with the 'role' and 'content'
            model: Model identifier llama model
            temperature: Sampling temperature(0.0, 2.0)
            max_tokens: Maximum no of tokens to generate
            top_p: Nucleus sampling parameter
            stream: Whether to stream the response or not
            **kwargs: Additional parameters

        Returns:
            Dict of the completion result
        Raises:
            GroqAPIError: If the API call fails
            RateLimitError: If rate limit is exceeded + any issue with the rate limit
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
                    retry_after = int(response.headers.get("Retry After", 5))
                    logger.warning(f"Rate limit hit retrying after {retry_after}s")
                    await asyncio.sleep(retry_after)
                    continue
                response.raise_for_status()
                return response.json

            except httpx.HTTPStatusError as e:
                if e.response.status_code == 429:
                    if attempt == self.max_retries - 1:
                        raise RateLimitError("Rate limit exceeded after retries")
                    await asyncio.sleep(2 ** attempt)
                    continue
                error_detail = self._extract_error_detail(e.response)
                logger.error("GRoq API Error:",error_detail)
                raise GroqAPIError(f"API request failed:", error_detail)


            except httpx.HTTPRequestError as e:
                logger.error("Request Error: ", str(e))
                if attempt == self.max_retries - 1:
                    raise GroqAPIError(f"Request failed after {self.max_retries} attempts")
                await asyncio.sleep(2 ** attempt)

            except Exception as e:
                logger.exception("Unexpected error in Groq API call")
                raise GroqAPIError("Unexpected error: ", str(e))

        async def generate_streming(
                self, messages: List[Dict[str, str]], model:str = "llama"
        )->AsyncIterator[Dict[str, Any]]:
            """
            Generate a streaming support from the groq API
            Args:
                messages:
                model:

            """



