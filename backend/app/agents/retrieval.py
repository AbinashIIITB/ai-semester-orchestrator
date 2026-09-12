from typing import List, Dict, Any
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from .state import AgentState
from ..services.embeddings import get_embeddings_client
from ..config import settings

# This function would normally take the db session via LangGraph's config or a closure
# For this architecture, we assume the session is passed or managed via context variables
# Here we'll design the logic to be decoupled and pure async.

async def perform_vector_search(query: str, course_id: str, db: AsyncSession, top_k: int = settings.RETRIEVAL_TOP_K) -> List[str]:
    """Execute cosine similarity search using pgvector."""
    
    embeddings_client = get_embeddings_client()
    query_embedding = await embeddings_client.aembed_query(query)
    
    # We use raw SQL for pgvector similarity search to leverage the index properly
    sql = text("""
        SELECT chunk_text, 1 - (embedding <=> :embedding) AS similarity
        FROM notes_embeddings
        WHERE course_id = :course_id
        ORDER BY embedding <=> :embedding
        LIMIT :limit
    """)
    
    # Convert embedding list to string format required by pgvector '[0.1, 0.2, ...]'
    embedding_str = f"[{','.join(map(str, query_embedding))}]"
    
    result = await db.execute(
        sql, 
        {"embedding": embedding_str, "course_id": course_id, "limit": top_k}
    )
    
    chunks = []
    for row in result:
        # row is a tuple (chunk_text, similarity)
        # We can enforce a similarity threshold here if desired, e.g., if row[1] > 0.7
        chunks.append(row[0])
        
    return chunks

async def retrieval_node(state: AgentState, db: AsyncSession = None) -> AgentState:
    """
    RAG Retrieval Agent.
    Identifies topics for the target week and retrieves relevant context from pgvector.
    """
    course_id = state.get("course_id")
    target_week = state.get("target_week")
    roadmap = state.get("roadmap")
    attempts = state.get("retrieval_attempts", 0)
    
    if not course_id or not target_week or not roadmap:
         return {**state, "error": "Missing course_id, target_week, or roadmap for retrieval"}
         
    # Find topics for the target week
    week_data = next((w for w in roadmap if w.get("week") == target_week), None)
    if not week_data or not week_data.get("topics"):
        return {**state, "error": f"No topics found for week {target_week}"}
        
    topics = week_data["topics"]
    
    # Formulate query
    # On retry, we could append qc_feedback to refine the query.
    # For now, simple concatenation of topics.
    base_query = " ".join(topics)
    if attempts > 0 and state.get("qc_feedback"):
        query = f"{base_query} {state['qc_feedback']}"
    else:
        query = base_query
        
    try:
        # In a real deployed LangGraph, the DB session needs to be injected.
        # Since this is the logical implementation, we assume `db` is available.
        # If db is None (e.g. testing), we return mocked text.
        if db:
            # Increase top_k slightly on retries
            k = settings.RETRIEVAL_TOP_K + (attempts * 5)
            retrieved_chunks = await perform_vector_search(query, course_id, db, top_k=k)
        else:
            retrieved_chunks = ["Mocked retrieved context regarding " + query]
            
        return {
            **state,
            "retrieval_query": query,
            "retrieved_chunks": retrieved_chunks,
            "retrieval_attempts": attempts + 1,
            "error": None
        }
    except Exception as e:
        return {**state, "error": f"Retrieval failed: {str(e)}"}
