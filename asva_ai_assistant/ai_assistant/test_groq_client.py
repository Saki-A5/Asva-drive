"""
Stand-alone test-suite for GroqClient – no third-party packages required.
Python ≥ 3.8
"""
import asyncio
import json
import unittest
from unittest.mock import patch, Mock, AsyncMock
import httpx  # only for spec / response shape
from groq_client import GroqClient, GroqAPIError, RateLimitError


# --------------------------------------------------------------------------- #
# helper – run async coro from sync test
# --------------------------------------------------------------------------- #
def _async(coro):
    return lambda self: asyncio.run(coro(self))


# --------------------------------------------------------------------------- #
# helpers that return *real* Response-like objects (not coroutines)
# --------------------------------------------------------------------------- #
def resp(status: int, *, json_data=None, headers=None):
    """Build a mock httpx.Response that behaves like the real thing."""
    m = Mock(spec=httpx.Response)
    m.status_code = status
    m.headers = headers or {}
    m.json.return_value = json_data or {}
    m.raise_for_status = Mock()
    m.text = json.dumps(json_data) if json_data else ""
    return m


class FakeStream:
    """Mimics `async with client.stream(...) as response:` plus `aiter_lines`."""

    def __init__(self, line_bytes):
        self._lines = line_bytes

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_t, exc_v, tb):
        pass

    async def aiter_lines(self):
        for b in self._lines:
            yield b.decode()


# --------------------------------------------------------------------------- #
# Tests
# --------------------------------------------------------------------------- #
class TestGroqClient(unittest.TestCase):

    # ------------------------------------------------------------------ #
    # constructor
    # ------------------------------------------------------------------ #
    def test_init_defaults(self):
        c = GroqClient("key")
        self.assertEqual(c.api_key, "key")
        self.assertEqual(c.timeout, 30)
        self.assertEqual(c.max_retries, 5)
        self.assertIn("https://api.groq.com/openai/v1", c.base_url)

    # ------------------------------------------------------------------ #
    # generate_completion
    # ------------------------------------------------------------------ #
    @_async
    async def test_generate_completion_success(self):
        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock:
            mock.return_value = resp(200, json_data={"choices": [{"message": {"content": "hi"}}]})
            async with GroqClient("key") as c:
                reply = await c.generate_completion([{"role": "user", "content": "hello"}])
            self.assertEqual(reply["choices"][0]["message"]["content"], "hi")

    @_async
    async def test_rate_limit_retry_then_ok(self):
        side_eff = [
            resp(429, headers={"Retry-After": "0"}),
            resp(200, json_data={"choices": [{"message": {"content": "ok"}}]}),
        ]
        with patch("httpx.AsyncClient.post", side_effect=side_eff, new_callable=AsyncMock):
            async with GroqClient("key") as c:
                reply = await c.generate_completion([{"role": "user", "content": "hi"}])
            self.assertEqual(reply["choices"][0]["message"]["content"], "ok")

    @_async
    async def test_rate_limit_exhausted(self):
        # 5 × 429 → final RateLimitError
        side_eff = [resp(429, headers={"Retry-After": "0"})] * 5
        with patch("httpx.AsyncClient.post", side_effect=side_eff, new_callable=AsyncMock):
            async with GroqClient("key") as c:
                with self.assertRaises(RateLimitError):
                    await c.generate_completion([{"role": "user", "content": "hi"}])

    # ------------------------------------------------------------------ #
    # generate_streaming
    # ------------------------------------------------------------------ #
    @_async
    async def test_stream_chunks(self):
        raw = [b"data: {\"chunk\":1}\n", b"data: {\"chunk\":2}\n", b"data: [DONE]\n"]
        with patch("httpx.AsyncClient.stream", return_value=FakeStream(raw), new_callable=AsyncMock):
            async with GroqClient("key") as c:
                chunks = [c async for c in c.generate_streaming([{"role": "user", "content": "hi"}])]
            self.assertEqual(len(chunks), 2)
            self.assertEqual(chunks[0], {"chunk": 1})

    # ------------------------------------------------------------------ #
    # token counting
    # ------------------------------------------------------------------ #
    @_async
    async def test_count_tokens(self):
        async with GroqClient("key") as c:
            self.assertEqual(await c.count_tokens("abcd"), 1)

    # ------------------------------------------------------------------ #
    # model catalogue
    # ------------------------------------------------------------------ #
    def test_get_available_models(self):
        c = GroqClient("key")
        models = c.get_available_models()
        self.assertEqual(len(models), 4)
        self.assertTrue(all("id" in m for m in models))

    # ------------------------------------------------------------------ #
    # health check
    # ------------------------------------------------------------------ #
    @_async
    async def test_health_check_healthy(self):
        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock:
            mock.return_value = resp(200, json_data={"choices": [{"message": {"content": "ok"}}]})
            async with GroqClient("key") as c:
                ok = await c.health_check()
            self.assertTrue(ok)

    @_async
    async def test_health_check_unhealthy(self):
        with patch("httpx.AsyncClient.post", side_effect=Exception("boom"), new_callable=AsyncMock):
            async with GroqClient("key") as c:
                ok = await c.health_check()
            self.assertFalse(ok)

    # ------------------------------------------------------------------ #
    # context manager
    # ------------------------------------------------------------------ #
    @_async
    async def test_context_manager_closes_client(self):
        async with GroqClient("key") as c:
            self.assertFalse(c.client.is_closed)
        self.assertTrue(c.client.is_closed)


# --------------------------------------------------------------------------- #
# Entry-point
# --------------------------------------------------------------------------- #
if __name__ == "__main__":
    unittest.main(verbosity=2)