# ASVA AI learning Assistant an almost complete technical specification

## 1. Executive Summary
This document outlines the full-blown technical specification for an AI learning assistant for ABUAD students powered by
GROQ fast inference API and with modes such as inventor, explainer, and socratic with Notebook LM like features.

## 1. System Architecture

### 1.1 High level system architecture

---
```
┌─────────────────────────────────────────────────────────────┐ 
│                    Client Applications                      │
│              (Web, Mobile)                                  │ 
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Gateway                          │
│           (Request Routing & Validation)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│                  AI Assistant Core                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Groq       │  │   Context    │  │   Mode       │      │
│  │   Client     │  │   Manager    │  │   Handler    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Prompt      │  │   Response   │  │   Memory     │      │
│  │  Builder     │  │   Parser     │  │   Store      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              External Services                              │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │   Groq API   │  │  ASVA Drive │ (Auth handled externally)│
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘

```
### 1.2 Component Responsibility

| Component | Responsibilities                                                       
|---------|------------------------------------------------------------------------|
|**Fast API Gateway** | HTTP routing, requuest validation, response formating, error handling  |
|**GROQ client** | API wrapper for groq, error handling                                   |
|**Context manager**| Session management, conversation history, context window optimization  |
|**Mode handler**| switch between socratic mode, inventor mode and explainer mode         |
|**Prompt Builder**| Construct the different system prompt needed for each mode of thinking |
|**Response Parser**| Extracts and format AI responses for different modes                   |
|**Memory Store**| Storage of conversation in memory(Redis suitable for production)       |
---

## 2. Technology Stack
### 2.1 Core Technologies

| Layer                    | Technology                  | Version | Reason                                           
|--------------------------|-----------------------------|---------|--------------------------------------------------|
| **API Framework**        | **Fast API**                | 0.11.5  | Async support, automatic docs, type validation   |
| **AI Provider**          | **GROQ cloud API**          | latest  | Fast, reliable and very good pricing when scaling |
| **Programming Language** | **Python**                  | 3.13.3  | async support, very good AI / ML ecosystem       |
| **HTTP client**          | **httpx**                   | 0.28.1  | Async HTTP client for Groq API                   |
| **Validation**           | **pydantic**                | 2.12,<3 | Data Validation, settings management             |
| **ASGI server**          | **uvicorn[standard]**       | 0.32    | High performance async server                    |
| **Memory Storage** | **Redis**                   | =>5.0.1 | High performance memory storage                  |
| **Testing** | **Pytest and Pytest async** | >=7.4.3 | Async testing works well with FAST API |


### Other supporting libraries
```
# 1. Upgrade pip & friends first
python -m pip install -U pip wheel setuptools

# 2. Core async web stack
python -m pip install "fastapi[standard]==0.115.5"   # note: 0.11.5 is 5 y-old
python -m pip install "uvicorn[standard]==0.32.0"

# 3. AI provider
python -m pip install groq                          # latest ≥ 0.13

# 4. HTTP client
python -m pip install httpx==0.28.1

# 5. Validation & settings
python -m pip install "pydantic>=2.12,<3" pydantic-settings

# 6. Memory store (needs Redis server installed separately)
python -m pip install redis>=5.0.1

# 7. Testing
python -m pip install "pytest>=7.4.3" pytest-asyncio

# 8. Small helpers
python -m pip install python-dotenv==1.0.0
python -m pip install python-multipart==0.0.6
```

---

## 3. Detailed component Specification
### 3.1 AI learning assistant core module
#### 3.1.1 Groq client (`groq_client.py`)
**Purpose**: API wrapper for Groq fast inference 
**Key Features**: 
- Async api call for non-blocking operations
- Streaming support for real time responses
- Automatic retry logic  with exponential backoff
- Error handling and rate limiting management
- Token usage tracking

**Methods**: 
```python
- async def generate_completion(prompt, model, temp, max_tokens, stream)
- async def generate_stream(prompt, model, temp, max_tokens)
- async def count_tokens(text)
- def get_available_models()
- def error_handling()
````

#### 3.1.2 Context Manager (`context_manager.py`)
**Purpose**: Manages memory history and context windows
**Key Features**:
- Session-based conversation tracking
- Context window optimization(within token limit)
- Message history pruning strategies
- Multi user session isolation
- Context summarization for long conversations
```python
- async def add_message(session_id, role, context)
- async def get_conversation(session_id, max_tokens)
- async def clear_session(session_id)
- async def summarize_history(session_id)
- def optimize_context(messages, max_tokens)
```

#### 3.1.3 Mode handler (`mode_handler.py`)
**Purpose**: Implements specialized learning modes
**Key features**:
- Socratic modes, inventor mode and explainer mode
  1. **Socratic mode**:
     - Asks guided questions instead of direct answers
     - Builds on previous responses to deepen knowledge
     - Encourages critical thinking and self-discovery
  2. **Inventor Mode**:
        - Transforms concepts into practical projects
        - Generate step-by-step implementation plan
        - Suggests tools, technologies and resources
  3. **Explainer Mode**:
        - Multi-level explanations (Eli5, intermediate, advanced)
        - Uses analogies and real world examples
        - Breaks complex tasks into digestible parts

**Methods**:
```python
- async def process_inventor(concept, context, project_type)
- async def process_explainer(topic, context, complexity_level)
- async def process_socratic(query, context, depth_level)
- def get_mode_specific_prompt(mode, query, context)
```

#### 3.1.4 Prompt Builder(`prompt_builder.py`)
**Purpose**: Builds optimized mode specific prompts
**Key features**:
- Mode specific system prompts
- Context injection strategies
- Few shot example management
- Dynamic prompt templates

**Methods**:
```python
- async def build_socratic_prompt()
- async def build_explainer_prompt()
- async def build_inventor_prompt()
- def get_mode_specific_prompt()
```

#### 3.1.5 Response Parser(`response_parser.py`)
**Purpose**: Extracts the AI responses and formats it
**Key Features**:
- Citation extraction 
- Code block parsing
- Markdown formatting
- Metadata extraction (confidence, sources, etc)

**Methods**:
```python
- async def extract_citation(response)
- async def block_code(response)
- async def mark_down(response)
- async def extract_metadata(response)
```

##### 3.1.6 Memory Store (`memory_store.py`)
**Purpose**: Stores conversation history and session data
**Storage**:
- In memory dict(development)
- Redis (production)
- Database (for persistence)
---

