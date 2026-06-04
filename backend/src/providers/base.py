from abc import ABC, abstractmethod
from typing import List, Dict

class BaseLLMProvider(ABC):
    SUPPORTED_MODELS: dict = {}

    @abstractmethod
    def chat(self, messages: List[Dict], model: str) -> str:
        """
        Send messages to LLM and return response.
        Each message can be:
        - Text only: {"role": "user", "content": "text"}
        - Multimodal: {"role": "user", "content": [
            {"type": "text", "text": "..."},
            {"type": "file", "base64": "...", "mime_type": "image/png"}
          ]}
        """
        pass