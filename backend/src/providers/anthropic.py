import anthropic
from typing import List, Dict
from src.providers.base import BaseLLMProvider


class AnthropicProvider(BaseLLMProvider):

    def __init__(self, api_key: str):
        self.client = anthropic.Anthropic(api_key=api_key)

    def _build_content(self, content):
        if isinstance(content, str):
            return [{"type": "text", "text": content}]
        parts = []
        for item in content:
            if item["type"] == "text":
                parts.append({"type": "text", "text": item["text"]})
            elif item["type"] == "file":
                parts.append({
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": item["mime_type"],
                        "data": item["base64"]
                    }
                })
        return parts

    def chat(self, messages: List[Dict], model: str) -> str:
        system_prompt = next(
            (m["content"] for m in messages if m["role"] == "system"), None
        )
        filtered = [m for m in messages if m["role"] != "system"]
        formatted = []
        for msg in filtered:
            formatted.append({
                "role": msg["role"],
                "content": self._build_content(msg["content"])
            })
        response = self.client.messages.create(
            model=model,
            max_tokens=1024,
            system=system_prompt or "",
            messages=formatted
        )
        return response.content[0].text