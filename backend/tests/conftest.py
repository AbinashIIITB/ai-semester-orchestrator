import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from typing import AsyncGenerator
from unittest.mock import AsyncMock, MagicMock, patch

from app.main import app
from app.database import get_db

# --- Database Mocking ---

@pytest_asyncio.fixture
async def mock_db_session() -> AsyncGenerator[AsyncMock, None]:
    """Provides a mocked AsyncSession to prevent real DB writes during testing."""
    session = AsyncMock()
    # Basic mock setup for execute() and scalars() chain if needed
    mock_result = AsyncMock()
    mock_result.scalars.return_value.first.return_value = None
    mock_result.scalars.return_value.all.return_value = []
    session.execute.return_value = mock_result
    yield session

@pytest_asyncio.fixture(autouse=True)
def override_get_db(mock_db_session: AsyncMock) -> None:
    """Automatically overrides the FastAPI dependency to use the mock session."""
    async def _override_get_db():
        yield mock_db_session
    app.dependency_overrides[get_db] = _override_get_db
    yield
    app.dependency_overrides.clear()

# --- HTTP Client ---

@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Test client for FastAPI endpoints."""
    # Ensure ASGITransport is used for async httpx requests to ASGI apps
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

# --- OpenAI / LLM Mocking ---

@pytest.fixture(autouse=True)
def mock_openai_llm() -> MagicMock:
    """Mocks the LLM ainvoke method to prevent real OpenAI API calls."""
    with patch("app.services.llm.ChatOpenAI.ainvoke", new_callable=AsyncMock) as mock_ainvoke:
        # Default mock response - tests can override this later
        mock_msg = MagicMock()
        mock_msg.content = "Mocked LLM response"
        mock_ainvoke.return_value = mock_msg
        
        # We also need to mock with_structured_output since our agents use it
        with patch("app.services.llm.ChatOpenAI.with_structured_output") as mock_with_structured_output:
            mock_structured_llm = AsyncMock()
            mock_with_structured_output.return_value = mock_structured_llm
            
            # The structured LLM is used in a chain (prompt | structured_llm)
            # which we invoke via chain.ainvoke. Mocking the final ainvoke of the chain
            # is complex because it's a RunnableSequence. 
            # A cleaner way is to patch the agent nodes directly for agent logic tests,
            # but for API tests, we can mock the entire graph execution.
            yield mock_ainvoke

@pytest.fixture(autouse=True)
def mock_openai_embeddings() -> AsyncMock:
    """Mocks the embeddings generation to prevent real OpenAI API calls."""
    with patch("app.services.embeddings.AsyncOpenAIEmbeddings.aembed_documents", new_callable=AsyncMock) as mock_aembed:
        # Return a list of fake embeddings matching the length of the input
        mock_aembed.side_effect = lambda texts: [[0.1] * 1536 for _ in texts]
        yield mock_aembed

@pytest.fixture(autouse=True)
def mock_pdf_parser() -> MagicMock:
    """Mocks PyMuPDF extraction to avoid needing real PDFs."""
    with patch("app.services.pdf_parser.extract_text_from_pdf") as mock_extract:
        mock_extract.return_value = "Mocked PDF text content"
        yield mock_extract
