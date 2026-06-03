from typing import List, Dict, Optional


CHAT_SYSTEM_PROMPT = """You are a helpful assistant.
Answer the user's questions clearly and concisely."""

RAG_SYSTEM_PROMPT = """You are a helpful assistant with access to a knowledge base.
Use the provided context to answer the user's question.
If the answer is not in the context, say you don't know.
Do not make up information.

Context:
{context}"""


def build_messages(
    history: List,
    user_message: str,
    context: Optional[str] = None,
    file_base64: Optional[str] = None,
    file_mime_type: Optional[str] = None
) -> List[Dict]:

    if context:
        system_prompt = RAG_SYSTEM_PROMPT.format(context=context)
    else:
        system_prompt = CHAT_SYSTEM_PROMPT

    messages = [{"role": "system", "content": system_prompt}]

    # Add conversation history
    for msg in history:
        messages.append({
            "role": msg.role,
            "content": msg.content
        })

    # Build current user message
    if file_base64 and file_mime_type:
        # Multimodal message
        content = [
            {"type": "text", "text": user_message},
            {"type": "file", "base64": file_base64, "mime_type": file_mime_type}
        ]
    else:
        content = user_message

    messages.append({"role": "user", "content": content})

    return messages