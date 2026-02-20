"""
usage_example.py - Example usage of GroqClient
"""
import asyncio
from groq_client import GroqClient
from config.settings import settings

"""
usage_example.py - Example usage of GroqClient
"""


async def basic_completion_example():
    """Basic chat completion example"""
    async with GroqClient(api_key=settings.GROQ_API_KEY) as client:
        messages = [
            {"role": "user", "content": "Explain quantum computing in simple terms"}
        ]

        response = await client.generate_completion(
            messages=messages,
            model="meta-llama/llama-4-maverick-17b-128e-instruct",
            temperature=0.7,
            max_tokens=500
        )

        print("Response:", response["choices"][0]["message"]["content"])


async def streaming_example():
    """Streaming response example"""
    async with GroqClient(api_key=settings.GROQ_API_KEY) as client:
        messages = [
            {"role": "user", "content": "Write a short story about a robot"}
        ]

        print("Streaming response:")
        async for chunk in client.generate_streaming(
                messages=messages,
                model="meta-llama/llama-4-maverick-17b-128e-instruct",
                temperature=0.8
        ):
            if "choices" in chunk and len(chunk["choices"]) > 0:
                delta = chunk["choices"][0].get("delta", {})
                if "content" in delta:
                    print(delta["content"], end="", flush=True)
        print("\n")


async def conversation_example():
    """Multi-turn conversation example"""
    async with GroqClient(api_key=settings.GROQ_API_KEY) as client:
        conversation = [
            {"role": "user", "content": "What is the capital of France?"}
        ]

        # First response
        response = await client.generate_completion(messages=conversation)
        assistant_message = response["choices"][0]["message"]["content"]
        print(f"Assistant: {assistant_message}")

        # Add to conversation history
        conversation.append({"role": "assistant", "content": assistant_message})
        conversation.append({"role": "user", "content": "What's the population?"})

        # Second response
        response = await client.generate_completion(messages=conversation)
        print(f"Assistant: {response['choices'][0]['message']['content']}")


async def model_info_example():
    """List available models"""
    client = GroqClient(api_key=settings.GROQ_API_KEY)
    models = client.get_available_models()

    print("Available models:")
    for model in models:
        print(f"- {model['name']} ({model['id']})")
        print(f"  Context: {model['context_window']} tokens")
        print(f"  Description: {model['description']}\n")


async def health_check_example():
    """Check API health"""
    async with GroqClient(api_key=settings.GROQ_API_KEY) as client:
        is_healthy = await client.health_check()
        print(f"API Health: {'✓ Healthy' if is_healthy else '✗ Unhealthy'}")


async def token_counting_example():
    """Estimate tokens for text"""
    async with GroqClient(api_key=settings.GROQ_API_KEY) as client:
        text = "This is a sample text for token counting."
        tokens = await client.count_tokens(text)
        print(f"Text: '{text}'")
        print(f"Estimated tokens: {tokens}")


async def error_handling_example():
    """Demonstrate error handling"""
    async with GroqClient(api_key=settings.GROQ_API_KEY, max_retries=3) as client:
        try:
            response = await client.generate_completion(
                messages=[{"role": "user", "content": "Hello!"}],
                model="invalid-model"  # This will cause an error
            )
        except Exception as e:
            print(f"Error caught: {type(e).__name__}: {e}")


async def main():
    """Run all examples"""
    print("=" * 60)
    print("GROQ CLIENT USAGE EXAMPLES")
    print("=" * 60)

    # Basic completion
    print("\n1. Basic Completion")
    print("-" * 60)
    await basic_completion_example()

    # Streaming
    print("\n2. Streaming Response")
    print("-" * 60)
    await streaming_example()

    # Conversation
    print("\n3. Multi-turn Conversation")
    print("-" * 60)
    await conversation_example()

    # Model info
    print("\n4. Available Models")
    print("-" * 60)
    await model_info_example()

    # Health check
    print("\n5. Health Check")
    print("-" * 60)
    await health_check_example()

    # Token counting
    print("\n6. Token Counting")
    print("-" * 60)
    await token_counting_example()

    # Error handling
    print("\n7. Error Handling")
    print("-" * 60)
    await error_handling_example()


if __name__ == "__main__":
    asyncio.run(main())