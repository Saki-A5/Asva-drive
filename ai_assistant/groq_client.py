""""
Groq API client Wrapper Handles all groq fast inferenece API
"""

from groq import Groq
from typing import Optional, Dict, AsyncIterator, List, Any
import httpx
import logging
import asyncio
import json

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
            base_url: str = "https://api.groq.com/openai/v1",  # <- no space,

            timeout: int = 30,
            max_retries: int = 5,

    ):
        self.api_key = api_key
        self.base_url = base_url.strip()
        self.timeout = timeout
        self.max_retries = max_retries
        self.client = httpx.AsyncClient(
            timeout=timeout,
            headers={
                "Authorization": f"Bearer {api_key}",
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
                                  model: str = "meta-llama/llama-4-maverick-17b-128e-instruct",
                                  temperature: float = 0.7,
                                  max_tokens: int = 2048,
                                  top_p: float = 1.0,
                                  stream: bool = False,
                                  **kwargs) -> Dict[str, Any]:
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
                return response.json()

            except httpx.HTTPStatusError as e:
                if e.response.status_code == 429:
                    if attempt == self.max_retries - 1:
                        raise RateLimitError("Rate limit exceeded after retries")
                    await asyncio.sleep(2 ** attempt)
                    continue
                error_detail = self._extract_error_detail(e.response)
                logger.error(f"Request Error: {str(e)}")
                raise GroqAPIError(f"API request failed: {error_detail}")


            except httpx.RequestError as e:
                logger.error("Request Error: ", str(e))
                if attempt == self.max_retries - 1:
                    raise GroqAPIError(f"Request failed after {self.max_retries} attempts")
                await asyncio.sleep(2 ** attempt)

            except Exception as e:
                logger.exception("Unexpected error in Groq API call")
                raise GroqAPIError("Unexpected error: ", str(e))

    async def generate_streaming(
            self,
            messages: List[Dict[str, str]],
            model: str = "meta-llama/llama-4-maverick-17b-128e-instruct",
            temperature: float = 0.7,
            max_tokens: int = 2048,
            **kwargs

    ) -> AsyncIterator[Dict[str, Any]]:
        """
        Generate a streaming support from the groq API
        Args:
            messages: List of messages dict
            model: str model identifier
            temperature: float Sampling temperature
            max_tokens: maximum no of tokens to generate
            **kwargs: for additional parameters
        Returns:
            A dict containing each group of responses
        Raises:
            GroqAPIError when streaming fails
        """
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            # "top_p": top_p,
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
                async for lines in response.aiter_lines():
                    if lines.startswith("data: "):
                        data = lines[6:]
                        if data.strip() == "DONE":
                            break
                        try:
                            chunk = json.loads(data)
                            yield chunk
                        except json.JSONDecodeError:
                            logger.warning(f"Failed to parse streaming chunk: {data}")
                            continue
        except httpx.HTTPStatusError as e:
            raise GroqAPIError(f"Streaming failed: {e.response.status_code} {e.response.reason_phrase}")

    async def count_tokens(self, text: str, model: str = "meta-llama/llama-4-maverick-17b-128e-instruct"):
        """
        Estimate no of tokens for a particular text
        Args:
            text: Text to counts the tokens for
            model: model to use for tokenization
        Returns:
            Estimated no of tokens
        """
        # assumption 1 token = 4 characters
        # later use tiktoken or something more robust
        return len(text) // 4

    def get_available_models(self) -> List[Dict[str, Any]]:
        """
        Get list of available models
        Returns:
            List of available groq models in dict format
        """
        return [
            {
                "id": "meta-llama/llama-4-maverick-17b-128e-instruct",
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

    def _extract_error_detail(self, response: httpx.Response):
        """
        Extract error detail from the API response
        """
        try:
            error_detail = response.json()
            if "error" in error_detail:
                return error_detail['error'].get("message", str(error_detail))
            return str(error_detail)
        except Exception:
            return response.text

    async def health_check(self) -> bool:
        """
        Check if the groq API is accessible. Make a minimal request
        Returns:
            if API is healthy return true else false
        """
        try:
            response = await self.generate_completion(messages=[{"role": "user", "content": "hi"}], max_tokens=5)
            return "choices" in response
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return False







