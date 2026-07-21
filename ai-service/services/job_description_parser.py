from parsers.rule_parser import extract_skills
from parsers.gemini_parser import parse_job_description
from models.search_query import SearchQuery

async def parse(text: str) -> SearchQuery:
    rule_skills = extract_skills(text)
    llm = await parse_job_description(text)
    
    merged = sorted(set(rule_skills + llm.skills))
    llm.skills = merged
    
    return llm
