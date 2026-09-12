from langchain_openai import ChatOpenAI
from ..config import settings

def get_llm(temperature: float = 0.0, model: str = None) -> ChatOpenAI:
    """Get an OpenAI Chat model instance."""
    return ChatOpenAI(
        model=model or settings.OPENAI_MODEL,
        api_key=settings.OPENAI_API_KEY,
        temperature=temperature,
        max_retries=3,
    )
