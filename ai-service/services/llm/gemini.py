import os

from google import genai
# pyrefly: ignore [missing-import]
from google.genai.errors import ClientError


class GeminiProvider:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError("GEMINI_API_KEY is not configured")

        self.client = genai.Client(api_key=api_key)

    async def generate(self, prompt: str) -> str:
        try:
            response = await self.client.aio.models.generate_content(
                model="gemini-flash-latest",
                contents=prompt,
            )
        except ClientError as exc:
            raise RuntimeError(
                f"Gemini API request failed: {exc}. Verify GEMINI_API_KEY access and project permissions."
            ) from exc

        return response.text
