from google import genai
from google.genai import types
from typing import List, Dict
from src.providers.base import BaseLLMProvider


class GeminiProvider(BaseLLMProvider):

    def __init__(self, api_key: str):
        self.client = genai.Client(api_key=api_key)

    def _build_parts(self, content):
        parts = []
        if isinstance(content, str):
            parts.append(types.Part(text=content))
        elif isinstance(content, list):
            for item in content:
                if item["type"] == "text":
                    parts.append(types.Part(text=item["text"]))
                elif item["type"] == "file":
                    parts.append(types.Part(
                        inline_data=types.Blob(
                            mime_type=item["mime_type"],
                            data=item["base64"]
                        )
                    ))
        return parts

    def chat(self, messages: List[Dict], model: str) -> str:
        contents = []
        for msg in messages:
            if msg["role"] == "system":
                continue  # handled separately
            role = "user" if msg["role"] == "user" else "model"
            parts = self._build_parts(msg["content"])
            contents.append(types.Content(role=role, parts=parts))

        # Extract system prompt
        system_prompt = next(
            (m["content"] for m in messages if m["role"] == "system"), None
        )

        config = types.GenerateContentConfig(
            system_instruction=system_prompt
        ) if system_prompt else None

        response = self.client.models.generate_content(
            model=model,
            contents=contents,
            config=config
        )
        return response.text