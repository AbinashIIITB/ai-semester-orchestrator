import pytest
from unittest.mock import patch, MagicMock

from app.agents.state import AgentState
from app.agents.quality_control import qc_node
from app.agents.graph import route_after_qc

@pytest.mark.asyncio
async def test_qc_agent_pass_routing():
    """
    Test Case A: Mock an LLM response where QC passes.
    Asserts state update and routing to END.
    """
    initial_state: AgentState = {
        "course_id": "test_course",
        "semester_id": "test_sem",
        "request_type": "weekly_prep",
        "target_week": 1,
        "quiz": [{"question": "Test?"}],
        "retrieved_chunks": ["Context test"],
        "retrieval_attempts": 1,
        "messages": [],
        "error": None
    }
    
    # Create a mock for the structured output that returns a passing QCResult
    mock_qc_result = MagicMock()
    mock_qc_result.passed = True
    mock_qc_result.failed_questions = []
    mock_qc_result.feedback = ""
    mock_qc_result.confidence = 0.95
    
    # We patch the specific chain.ainvoke call inside qc_node
    # Actually, the easiest way to mock LangChain runnables inside a function
    # is to patch the LLM's with_structured_output behavior
    
    with patch("app.agents.quality_control.get_llm") as mock_get_llm:
        # Setup mock chain
        mock_chain = MagicMock()
        # Ensure it acts as an awaitable
        import asyncio
        future = asyncio.Future()
        future.set_result(mock_qc_result)
        mock_chain.ainvoke.return_value = future
        
        # Setup structured LLM to return our mock chain when piped with the prompt
        mock_structured_llm = MagicMock()
        mock_structured_llm.__ror__.return_value = mock_chain # Handles prompt | structured_llm
        
        mock_get_llm.return_value.with_structured_output.return_value = mock_structured_llm
        
        # Execute Node
        new_state = await qc_node(initial_state)
        
        # Assert State Updates
        assert new_state["qc_passed"] is True
        assert new_state["qc_feedback"] is None
        assert new_state["error"] is None
        
        # Assert Routing Logic
        next_node = route_after_qc(new_state)
        assert next_node == "end"


@pytest.mark.asyncio
async def test_qc_agent_fail_routing():
    """
    Test Case B: Mock an LLM response where QC fails (hallucination).
    Asserts state update and routing back to retrieval.
    """
    initial_state: AgentState = {
        "course_id": "test_course",
        "semester_id": "test_sem",
        "request_type": "weekly_prep",
        "target_week": 1,
        "quiz": [{"question": "Test hallucination?"}],
        "retrieved_chunks": ["Context test"],
        "retrieval_attempts": 1,
        "messages": [],
        "error": None
    }
    
    # Create a mock for the structured output that returns a failing QCResult
    mock_qc_result = MagicMock()
    mock_qc_result.passed = False
    mock_qc_result.failed_questions = [0]
    mock_qc_result.feedback = "Question 1 refers to material not in context."
    mock_qc_result.confidence = 0.95
    
    with patch("app.agents.quality_control.get_llm") as mock_get_llm:
        mock_chain = MagicMock()
        import asyncio
        future = asyncio.Future()
        future.set_result(mock_qc_result)
        mock_chain.ainvoke.return_value = future
        
        mock_structured_llm = MagicMock()
        mock_structured_llm.__ror__.return_value = mock_chain 
        
        mock_get_llm.return_value.with_structured_output.return_value = mock_structured_llm
        
        # Execute Node
        new_state = await qc_node(initial_state)
        
        # Assert State Updates
        assert new_state["qc_passed"] is False
        assert new_state["qc_feedback"] == "Question 1 refers to material not in context."
        
        # Assert Routing Logic
        next_node = route_after_qc(new_state)
        assert next_node == "retrieval" # Loops back

@pytest.mark.asyncio
async def test_qc_agent_max_retries():
    """Test routing breaks the cycle if attempts >= 3."""
    state = {
        "qc_passed": False,
        "retrieval_attempts": 3
    }
    next_node = route_after_qc(state)
    assert next_node == "end" # Escapes loop
