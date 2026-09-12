import fitz  # PyMuPDF
from typing import Iterator
from pydantic import BaseModel
from langchain_text_splitters import RecursiveCharacterTextSplitter
from ..config import settings

class DocumentChunk(BaseModel):
    text: str
    metadata: dict

def extract_text_from_pdf(file_bytes: bytes, filename: str) -> str:
    """Extract raw text from PDF bytes."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text_content = []
    
    for page_num, page in enumerate(doc, start=1):
        # Extract text blocks
        blocks = page.get_text("blocks")
        
        # Sort blocks vertically then horizontally for natural reading order
        blocks.sort(key=lambda b: (b[1], b[0]))
        
        page_text = "\n".join(
            block[4].strip() 
            for block in blocks 
            if block[4].strip() and not block[4].strip().isdigit() # Basic header/footer filter
        )
        
        if page_text:
            text_content.append(f"--- Page {page_num} ---\n{page_text}")
            
    return "\n\n".join(text_content)

def get_text_splitter() -> RecursiveCharacterTextSplitter:
    return RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
        separators=["\n\n", "\n", " ", ""]
    )

def chunk_pdf(file_bytes: bytes, filename: str) -> list[DocumentChunk]:
    """Extract and chunk a PDF for embedding."""
    raw_text = extract_text_from_pdf(file_bytes, filename)
    splitter = get_text_splitter()
    
    # Simple chunking for now (metadata enrichment happens later if needed)
    texts = splitter.split_text(raw_text)
    
    return [
        DocumentChunk(
            text=text,
            metadata={"file_name": filename, "chunk_index": i}
        )
        for i, text in enumerate(texts)
    ]
