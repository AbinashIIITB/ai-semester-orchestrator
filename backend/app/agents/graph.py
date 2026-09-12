from langgraph.graph import StateGraph, END
from typing import Literal

from .state import AgentState
from .extraction import extraction_node
from .scheduler import scheduler_node
from .retrieval import retrieval_node
from .generator import generator_node
from .quality_control import qc_node

# --- Routing Logic ---

def route_by_request_type(state: AgentState) -> str:
    """Route from START based on the incoming request type."""
    req_type = state.get("request_type")
    if req_type == "extract":
        return "extraction"
    elif req_type == "schedule":
        return "scheduler"
    elif req_type == "weekly_prep":
        return "retrieval"
    else:
        # Default fallback, should be caught by validation
        return END

def route_after_qc(state: AgentState) -> Literal["retrieval", "end"]:
    """Conditional edge logic after Quality Control."""
    if state.get("qc_passed"):
        return "end"
    
    if state.get("retrieval_attempts", 0) >= 3:
        # Max retries reached, return best effort
        return "end"
        
    # Cycle back to retrieval with feedback
    return "retrieval"

# --- Graph Definition ---

def build_graph() -> StateGraph:
    """Constructs the LangGraph StateGraph."""
    graph = StateGraph(AgentState)
    
    # Add Nodes
    graph.add_node("extraction", extraction_node)
    graph.add_node("scheduler", scheduler_node)
    graph.add_node("retrieval", retrieval_node)
    graph.add_node("generator", generator_node)
    graph.add_node("quality_control", qc_node)
    
    # Entry Point Conditional Routing
    graph.add_conditional_edges(
        "__start__",
        route_by_request_type,
        {
            "extraction": "extraction",
            "scheduler": "scheduler",
            "retrieval": "retrieval",
            END: END
        }
    )
    
    # Linear Paths
    graph.add_edge("extraction", END)
    graph.add_edge("scheduler", END)
    graph.add_edge("retrieval", "generator")
    graph.add_edge("generator", "quality_control")
    
    # Cyclic Path (Supervisor)
    graph.add_conditional_edges(
        "quality_control",
        route_after_qc,
        {
            "retrieval": "retrieval",
            "end": END
        }
    )
    
    return graph.compile()

# Singleton instance
app = build_graph()
