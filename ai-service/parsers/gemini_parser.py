import json
import logging
from services.llm.gemini import GeminiProvider
from models.search_query import SearchQuery

logger = logging.getLogger(__name__)

async def parse_job_description(text: str) -> SearchQuery:
    gemini = GeminiProvider()
    
    prompt = f"""
Extract the following from this Job Description.
Return ONLY valid JSON.

{{
"title":"",
"domain":"",
"skills":[],
"experience":null,
"education":"",
"certifications":[],
"employment_type":"",
"location":""
}}

Job Description:
{text}
"""
    
    try:
        response_text = await gemini.generate_json(prompt)
        data = json.loads(response_text)
        return SearchQuery(**data)
    except Exception as e:
        logger.error(f"Failed to parse JD with Gemini: {e}")
        return SearchQuery()
