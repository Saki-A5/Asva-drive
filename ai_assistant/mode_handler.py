"""
Mode Handler
Implements specialized learning modes: Socratic, Inventor, and Explainer
"""

from typing import Dict, Any, List, Optional
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class LearningMode(str, Enum):
    """Available learning modes"""
    SOCRATIC = "socratic"
    INVENTOR = "inventor"
    EXPLAINER = "explainer"
    DEFAULT = "default"


class ComplexityLevel(str, Enum):
    """Complexity levels for explanations"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class ProjectType(str, Enum):
    """Types of projects for Inventor mode"""
    WEB = "web"
    MOBILE = "mobile"
    DATA = "data"
    HARDWARE = "hardware"
    AI_ML = "ai_ml"
    GENERAL = "general"


class ModeHandler:
    """
    Handles different learning modes and generates appropriate prompts.

    Each mode has a specific pedagogical approach:
    - Socratic: Questions and guided discovery
    - Inventor: Project-based practical application
    - Explainer: Multi-level conceptual breakdown
    """

    def __init__(self):
        self.mode_prompts = self._initialize_prompts()

    def _initialize_prompts(self) -> Dict[str, str]:
        """Initialize system prompts for each mode"""
        return {
            LearningMode.SOCRATIC: """You are a Socratic tutor focused on developing critical thinking through guided questioning. 

Your approach:
1. Never give direct answers - instead, ask questions that lead to discovery
2. Build on the student's responses to deepen understanding
3. Use analogies and thought experiments
4. Challenge assumptions gently
5. Help students arrive at insights themselves
6. Adjust question complexity based on responses

Guidelines:
- Ask one question at a time
- Acknowledge good reasoning
- If student is stuck, provide a hint in question form
- Connect concepts to real-world scenarios
- Encourage metacognition (thinking about thinking)""",

            LearningMode.INVENTOR: """You are an innovation coach who transforms academic concepts into practical projects and prototypes.

Your approach:
1. Take theoretical concepts and show real-world applications
2. Break down projects into actionable steps
3. Suggest specific tools, technologies, and resources
4. Provide implementation strategies
5. Anticipate challenges and solutions
6. Scale ideas from simple prototypes to full applications

Guidelines:
- Be specific about technologies and tools
- Provide code snippets or pseudocode when helpful
- Consider feasibility and student skill level
- Suggest learning resources for new skills needed
- Think iteratively (MVP → full product)
- Connect to industry practices""",

            LearningMode.EXPLAINER: """You are an expert educator who makes complex topics accessible through clear, multi-level explanations.

Your approach:
1. Break concepts into fundamental components
2. Use analogies from everyday life
3. Provide examples at appropriate complexity
4. Build from simple to complex progressively
5. Highlight common misconceptions
6. Connect to prior knowledge

Guidelines:
- Start with the "big picture" before details
- Use visual descriptions when helpful
- Provide concrete examples
- Adjust depth based on complexity level
- Check for understanding with clarifying questions
- Make connections between related concepts""",

            LearningMode.DEFAULT: """You are a knowledgeable AI assistant for students at Afe Babalola University.

Your approach:
1. Provide clear, accurate information
2. Support learning with examples and explanations
3. Adapt to the student's needs
4. Encourage deeper exploration
5. Reference academic sources when appropriate

Guidelines:
- Be helpful and encouraging
- Provide structured responses
- Offer to explain further or try different modes
- Support academic integrity
- Be concise unless detail is requested"""
        }

    def get_system_prompt(
            self,
            mode: LearningMode,
            complexity_level: Optional[ComplexityLevel] = None,
            project_type: Optional[ProjectType] = None,
            additional_context: Optional[str] = None
    ) -> str:
        """
        Get the system prompt for a specific mode with customizations.

        Args:
            mode: Learning mode to use
            complexity_level: For Explainer mode
            project_type: For Inventor mode
            additional_context: Extra context to add

        Returns:
            Complete system prompt
        """
        base_prompt = self.mode_prompts.get(mode, self.mode_prompts[LearningMode.DEFAULT])

        # Add mode-specific customizations
        if mode == LearningMode.EXPLAINER and complexity_level:
            base_prompt += f"\n\nCurrent complexity level: {complexity_level.value}"
            base_prompt += self._get_complexity_guidance(complexity_level)

        if mode == LearningMode.INVENTOR and project_type:
            base_prompt += f"\n\nProject type focus: {project_type.value}"
            base_prompt += self._get_project_type_guidance(project_type)

        if additional_context:
            base_prompt += f"\n\nAdditional context: {additional_context}"

        return base_prompt

    def _get_complexity_guidance(self, level: ComplexityLevel) -> str:
        """Get guidance for specific complexity levels"""
        guidance = {
            ComplexityLevel.BEGINNER: """
- Use simple language and avoid jargon
- Provide lots of analogies and examples
- Focus on intuition over technical details
- Break down into very small steps
- Repeat key concepts
- Use everyday scenarios""",

            ComplexityLevel.INTERMEDIATE: """
- Introduce some technical terminology with explanations
- Balance intuition with technical accuracy
- Provide more complex examples
- Connect to broader theoretical frameworks
- Assume basic foundational knowledge""",

            ComplexityLevel.ADVANCED: """
- Use technical terminology appropriately
- Discuss edge cases and nuances
- Reference academic literature
- Explore theoretical foundations
- Discuss current research and debates
- Assume strong foundational knowledge"""
        }
        return guidance.get(level, "")

    def _get_project_type_guidance(self, project_type: ProjectType) -> str:
        """Get guidance for specific project types"""
        guidance = {
            ProjectType.WEB: """
Focus on: HTML/CSS/JavaScript, frameworks (React, Vue), backend (Node.js, Python/Flask/FastAPI), databases, APIs, deployment""",

            ProjectType.MOBILE: """
Focus on: React Native, Flutter, native development (Swift/Kotlin), mobile UI/UX, app stores, cross-platform considerations""",

            ProjectType.DATA: """
Focus on: Python (pandas, numpy), data visualization, SQL/NoSQL, data cleaning, analysis techniques, reporting""",

            ProjectType.HARDWARE: """
Focus on: Arduino, Raspberry Pi, sensors, circuits, embedded systems, IoT, prototyping""",

            ProjectType.AI_ML: """
Focus on: Python (TensorFlow, PyTorch, scikit-learn), data preprocessing, model training, evaluation, deployment""",

            ProjectType.GENERAL: """
Consider multiple domains and suggest the most appropriate technologies for the concept"""
        }
        return guidance.get(project_type, "")

    async def process_query(
            self,
            query: str,
            mode: LearningMode,
            conversation_history: List[Dict[str, str]],
            complexity_level: Optional[ComplexityLevel] = None,
            project_type: Optional[ProjectType] = None,
            groq_client=None
    ) -> Dict[str, Any]:
        """
        Process a query in the specified mode.

        Args:
            query: User's question or message
            mode: Learning mode to use
            conversation_history: Previous messages
            complexity_level: For Explainer mode
            project_type: For Inventor mode
            groq_client: GroqClient instance

        Returns:
            Dict with response and metadata
        """
        # Get system prompt
        system_prompt = self.get_system_prompt(mode, complexity_level, project_type)

        # Prepare messages
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(conversation_history)
        messages.append({"role": "user", "content": query})

        # Generate response
        try:
            response = await groq_client.generate_completion(
                messages=messages,
                temperature=self._get_temperature_for_mode(mode),
                max_tokens=2048
            )

            content = response["choices"][0]["message"]["content"]

            # Extract suggestions based on mode
            suggestions = self._generate_suggestions(mode, query, content)

            return {
                "response": content,
                "mode": mode.value,
                "suggestions": suggestions,
                "metadata": {
                    "tokens_used": response.get("usage", {}).get("total_tokens", 0),
                    "model": response.get("model", "unknown"),
                    "complexity_level": complexity_level.value if complexity_level else None,
                    "project_type": project_type.value if project_type else None
                }
            }

        except Exception as e:
            logger.error(f"Error processing query in {mode} mode: {str(e)}")
            raise

    def _get_temperature_for_mode(self, mode: LearningMode) -> float:
        """Get appropriate temperature setting for each mode"""
        temperatures = {
            LearningMode.SOCRATIC: 0.8,  # More creative for varied questions
            LearningMode.INVENTOR: 0.9,  # Most creative for novel ideas
            LearningMode.EXPLAINER: 0.6,  # More focused for clear explanations
            LearningMode.DEFAULT: 0.7  # Balanced
        }
        return temperatures.get(mode, 0.7)

    def _generate_suggestions(
            self,
            mode: LearningMode,
            query: str,
            response: str
    ) -> List[str]:
        """
        Generate follow-up suggestions based on mode and interaction.

        Returns:
            List of suggested follow-up actions/questions
        """
        suggestions = []

        if mode == LearningMode.SOCRATIC:
            suggestions = [
                "Reflect on the question and share your thoughts",
                "Try to answer the question step by step",
                "Ask for clarification if you're unsure",
                "Request a hint if you're stuck"
            ]

        elif mode == LearningMode.INVENTOR:
            suggestions = [
                "Ask for a more detailed implementation plan",
                "Request specific code examples",
                "Explore alternative technologies",
                "Discuss scaling and deployment strategies",
                "Ask about potential challenges"
            ]

        elif mode == LearningMode.EXPLAINER:
            suggestions = [
                "Ask for a simpler explanation",
                "Request more advanced details",
                "Ask for real-world examples",
                "Explore related concepts",
                "Request visual aids or diagrams"
            ]

        else:  # DEFAULT
            suggestions = [
                "Ask for more details",
                "Try a different learning mode",
                "Request examples",
                "Explore related topics"
            ]

        return suggestions[:3]  # Return top 3 suggestions

    def get_mode_description(self, mode: LearningMode) -> Dict[str, str]:
        """Get user-friendly description of a mode"""
        descriptions = {
            LearningMode.SOCRATIC: {
                "name": "Socratic Mode",
                "description": "Learn through guided questions and discovery",
                "best_for": "Developing critical thinking and deep understanding",
                "approach": "Questions and self-discovery instead of direct answers"
            },
            LearningMode.INVENTOR: {
                "name": "Inventor Mode",
                "description": "Transform ideas into practical projects",
                "best_for": "Building real-world applications and prototypes",
                "approach": "Step-by-step project planning with specific technologies"
            },
            LearningMode.EXPLAINER: {
                "name": "Explainer Mode",
                "description": "Clear explanations at multiple levels",
                "best_for": "Understanding complex concepts thoroughly",
                "approach": "Multi-level breakdowns with analogies and examples"
            },
            LearningMode.DEFAULT: {
                "name": "Default Mode",
                "description": "General-purpose AI assistance",
                "best_for": "Quick answers and general help",
                "approach": "Direct, helpful responses to your questions"
            }
        }
        return descriptions.get(mode, descriptions[LearningMode.DEFAULT])