"""
Chat Routes
Endpoints for AI chat interactions
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from typing import AsyncIterator
import time
import logging

from ...api.models.requests import ChatRequest, StreamChatRequest
from ...api.models.responses import ChatResponse, StreamChunk, ResponseMetadata
from api.dependencies import (
    get_groq_client,
    get_context_manager,
    get_mode_handler
)
from ....ai_assistant import GroqClient, ContextManager, ModeHandler, LearningMode
from ....ai_assistant.mode_handler import ComplexityLevel, ProjectType

router = APIRouter(prefix="/chat", tags=["Chat"])
logger = logging.getLogger(__name__)


@router.post("", response_model=ChatResponse)
async def chat(
        request: ChatRequest,
        groq_client: GroqClient = Depends(get_groq_client),
        context_manager: ContextManager = Depends(get_context_manager),
        mode_handler: ModeHandler = Depends(get_mode_handler)
):
    """
    Send a message and get an AI response.

    This endpoint processes user messages in the specified learning mode
    and returns a complete response with suggestions and metadata.
    """
    start_time = time.time()

    try:
        # Add user message to context
        await context_manager.add_message(
            session_id=request.session_id,
            role="user",
            content=request.message
        )

        # Get conversation history
        conversation = await context_manager.get_conversation(
            session_id=request.session_id
        )

        # Parse mode and parameters
        mode = LearningMode(request.mode)
        complexity_level = None
        project_type = None

        if request.parameters:
            if request.parameters.complexity_level:
                complexity_level = ComplexityLevel(request.parameters.complexity_level)
            if request.parameters.project_type:
                project_type = ProjectType(request.parameters.project_type)

        # Process query with mode handler
        result = await mode_handler.process_query(
            query=request.message,
            mode=mode,
            conversation_history=conversation,
            complexity_level=complexity_level,
            project_type=project_type,
            groq_client=groq_client
        )

        # Add assistant response to context
        await context_manager.add_message(
            session_id=request.session_id,
            role="assistant",
            content=result["response"],
            metadata=result["metadata"]
        )

        # Update session mode history
        session = context_manager.get_session(request.session_id)
        if session and mode.value not in session.mode_history:
            session.mode_history.append(mode.value)

        # Calculate processing time
        processing_time = int((time.time() - start_time) * 1000)

        # Build response
        metadata = ResponseMetadata(
            tokens_used=result["metadata"]["tokens_used"],
            model=result["metadata"]["model"],
            processing_time_ms=processing_time,
            complexity_level=result["metadata"].get("complexity_level"),
            project_type=result["metadata"].get("project_type")
        )

        response = ChatResponse(
            session_id=request.session_id,
            response=result["response"],
            mode=result["mode"],
            metadata=metadata,
            suggestions=result["suggestions"],
            sources=[]
        )

        logger.info(
            f"Chat request processed: session={request.session_id}, "
            f"mode={mode.value}, tokens={metadata.tokens_used}, "
            f"time={processing_time}ms"
        )

        return response

    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "code": "PROCESSING_ERROR",
                "message": "Failed to process chat request",
                "details": {"error": str(e)}
            }
        )


@router.post("/stream")
async def stream_chat(
        request: StreamChatRequest,
        groq_client: GroqClient = Depends(get_groq_client),
        context_manager: ContextManager = Depends(get_context_manager),
        mode_handler: ModeHandler = Depends(get_mode_handler)
):
    """
    Send a message and receive a streaming AI response.

    This endpoint returns Server-Sent Events (SSE) for real-time streaming.
    """

    async def generate() -> AsyncIterator[str]:
        """Generate streaming response"""
        try:
            # Add user message to context
            await context_manager.add_message(
                session_id=request.session_id,
                role="user",
                content=request.message
            )

            # Get conversation history
            conversation = await context_manager.get_conversation(
                session_id=request.session_id
            )

            # Parse mode and get system prompt
            mode = LearningMode(request.mode)
            complexity_level = None
            project_type = None

            if request.parameters:
                if request.parameters.complexity_level:
                    complexity_level = ComplexityLevel(request.parameters.complexity_level)
                if request.parameters.project_type:
                    project_type = ProjectType(request.parameters.project_type)

            system_prompt = mode_handler.get_system_prompt(
                mode, complexity_level, project_type
            )

            # Prepare messages
            messages = [{"role": "system", "content": system_prompt}]
            messages.extend(conversation)
            messages.append({"role": "user", "content": request.message})

            # Send start event
            start_chunk = StreamChunk(
                type="start",
                session_id=request.session_id
            )
            yield f"data: {start_chunk.model_dump_json()}\n\n"

            # Stream response
            full_response = ""
            total_tokens = 0

            async for chunk in groq_client.generate_streaming(
                    messages=messages,
                    model=request.parameters.model if request.parameters else "mixtral-8x7b-32768",
                    temperature=mode_handler._get_temperature_for_mode(mode),
                    max_tokens=request.parameters.max_tokens if request.parameters else 2048
            ):
                if "choices" in chunk and len(chunk["choices"]) > 0:
                    delta = chunk["choices"][0].get("delta", {})
                    content = delta.get("content", "")

                    if content:
                        full_response += content
                        token_chunk = StreamChunk(
                            type="token",
                            content=content
                        )
                        yield f"data: {token_chunk.model_dump_json()}\n\n"

                # Track token usage
                if "usage" in chunk:
                    total_tokens = chunk["usage"].get("total_tokens", 0)

            # Add response to context
            await context_manager.add_message(
                session_id=request.session_id,
                role="assistant",
                content=full_response
            )

            # Send end event with metadata
            suggestions = mode_handler._generate_suggestions(
                mode, request.message, full_response
            )

            end_chunk = StreamChunk(
                type="end",
                metadata={
                    "tokens_used": total_tokens,
                    "mode": mode.value,
                    "suggestions": suggestions
                }
            )
            yield f"data: {end_chunk.model_dump_json()}\n\n"

        except Exception as e:
            logger.error(f"Error in streaming: {str(e)}", exc_info=True)
            error_chunk = StreamChunk(
                type="error",
                content=str(e)
            )
            yield f"data: {error_chunk.model_dump_json()}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )