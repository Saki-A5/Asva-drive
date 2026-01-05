"""
Interactive CLI to test ModeHandler with GroqClient
"""

import asyncio
import logging
from typing import List, Dict

from mode_handler import (
    ModeHandler,
    LearningMode,
    ComplexityLevel,
    ProjectType
)
from groq_client import GroqClient
from config.settings import settings

logging.basicConfig(level=logging.INFO)


def choose_enum(enum_cls):
    """
    Utility to let user select an Enum value from CLI
    """
    values = list(enum_cls)
    for i, val in enumerate(values, start=1):
        print(f"{i}. {val.value}")

    while True:
        choice = input("Select option number (or press Enter to skip): ").strip()
        if choice == "":
            return None
        if choice.isdigit() and 1 <= int(choice) <= len(values):
            return values[int(choice) - 1]
        print("Invalid choice, try again.")


async def main():
    print("\n=== ModeHandler Interactive Tester ===\n")

    # --- Initialize core components ---
    mode_handler = ModeHandler()
    groq_client = GroqClient(api_key=settings.GROQ_API_KEY)

    conversation_history: List[Dict[str, str]] = []

    # --- Select mode ---
    print("Choose Learning Mode:")
    mode = choose_enum(LearningMode) or LearningMode.DEFAULT

    complexity_level = None
    project_type = None

    # --- Mode-specific configuration ---
    if mode == LearningMode.EXPLAINER:
        print("\nChoose Complexity Level:")
        complexity_level = choose_enum(ComplexityLevel)

    if mode == LearningMode.INVENTOR:
        print("\nChoose Project Type:")
        project_type = choose_enum(ProjectType)

    print(f"\nMode selected: {mode.value}")
    if complexity_level:
        print(f"Complexity level: {complexity_level.value}")
    if project_type:
        print(f"Project type: {project_type.value}")

    print("\nType your prompts below.")
    print("Type ':exit' to quit, ':reset' to clear history.\n")

    # --- Chat loop ---
    try:
        while True:
            user_input = input("You: ").strip()

            if not user_input:
                continue

            if user_input == ":exit":
                print("\nExiting tester.")
                break

            if user_input == ":reset":
                conversation_history.clear()
                print("Conversation history cleared.\n")
                continue

            result = await mode_handler.process_query(
                query=user_input,
                mode=mode,
                conversation_history=conversation_history,
                complexity_level=complexity_level,
                project_type=project_type,
                groq_client=groq_client
            )

            assistant_reply = result["response"]

            print("\nAssistant:")
            print(assistant_reply)

            if result["suggestions"]:
                print("\nSuggestions:")
                for s in result["suggestions"]:
                    print(f"- {s}")

            # --- Update conversation history ---
            conversation_history.append({"role": "user", "content": user_input})
            conversation_history.append({"role": "assistant", "content": assistant_reply})

            print("\n" + "-" * 60 + "\n")

    finally:
        await groq_client.close()


if __name__ == "__main__":
    asyncio.run(main())
