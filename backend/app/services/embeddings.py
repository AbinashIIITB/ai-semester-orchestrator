from typing import List
import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from langchain_openai import OpenAIEmbeddings

from .pdf_parser import DocumentChunk
from ..models.embedding import NotesEmbedding
from ..config import settings

def get_embeddings_client() -> OpenAIEmbeddings:
    return OpenAIEmbeddings(
        model=settings.OPENAI_EMBEDDING_MODEL,
        api_key=settings.OPENAI_API_KEY
    )

async def embed_and_store_chunks(
    chunks: List[DocumentChunk], 
    course_id: uuid.UUID, 
    session: AsyncSession
) -> int:
    """Embed chunks and store them in the notes_embeddings table."""
    if not chunks:
        return 0

    client = get_embeddings_client()
    texts = [chunk.text for chunk in chunks]
    
    # Generate embeddings in bulk
    embeddings = await client.aembed_documents(texts)
    
    # Prepare ORM objects
    db_embeddings = [
        NotesEmbedding(
            course_id=course_id,
            chunk_text=chunk.text,
            embedding=emb,
            meta_data=chunk.metadata
        )
        for chunk, emb in zip(chunks, embeddings)
    ]
    
    # Bulk insert
    session.add_all(db_embeddings)
    await session.commit()
    
    return len(db_embeddings)
