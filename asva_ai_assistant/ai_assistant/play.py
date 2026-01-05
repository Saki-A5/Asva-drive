from typing import Optional, List, Dict, Any


def _initialize_prompts() -> Dict[str, str]:
    prompts: Dict[str, str] = {
        "mode": "explainer",
        "level": "beginner"
    }
    prompts["count"] = 4
    return prompts


if __name__ == "__main__":
    print(_initialize_prompts())
