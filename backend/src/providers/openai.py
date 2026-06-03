from openai import OpenAI
from typing import List, Dict
from src.providers.base import BaseLLMProvider


class OpenAIProvider(BaseLLMProvider):

    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)

    def _build_content(self, content):
        if isinstance(content, str):
            return content
        parts = []
        for item in content:
            if item["type"] == "text":
                parts.append({"type": "text", "text": item["text"]})
            elif item["type"] == "file":
                parts.append({
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{item['mime_type']};base64,{item['base64']}"
                    }
                })
        return parts

    def chat(self, messages: List[Dict], model: str) -> str:
        formatted = []
        for msg in messages:
            formatted.append({
                "role": msg["role"],
                "content": self._build_content(msg["content"])
            })
        response = self.client.chat.completions.create(
            model=model,
            messages=formatted
        )
        return response.choices[0].message.content