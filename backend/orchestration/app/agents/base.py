from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
import os
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic

class BaseAgent(ABC):
    def __init__(self, agent_id: str, name: str):
        self.agent_id = agent_id
        self.name = name
        self.openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.anthropic_client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    @abstractmethod
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the agent's main task"""
        pass

    async def call_openai(self, prompt: str, model: str = "gpt-4-turbo-preview", max_tokens: int = 4000) -> str:
        """Helper to call OpenAI API"""
        try:
            response = await self.openai_client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                temperature=0.7,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI API error: {e}")
            return f"Error calling AI: {str(e)}"

    async def call_anthropic(self, prompt: str, model: str = "claude-opus-4-20250514", max_tokens: int = 4000) -> str:
        """Helper to call Anthropic Claude API"""
        try:
            response = await self.anthropic_client.messages.create(
                model=model,
                max_tokens=max_tokens,
                messages=[{"role": "user", "content": prompt}],
            )
            return response.content[0].text
        except Exception as e:
            print(f"Anthropic API error: {e}")
            return f"Error calling AI: {str(e)}"
