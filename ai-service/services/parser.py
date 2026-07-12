from services.parsers import skills
from services.storage import download_pdf
from services.extractor import extract_text

# from services.parsers.candidate import extract_candidate
# from services.parsers.skills import find_skills
# from services.parsers.experience import parse_experience
# from services.parsers.projects import parse_projects
# from services.parsers.education import parse_education
from services.llm_profiler import profile_resume

async def parse_resume(object_key: str):

    pdf_bytes = download_pdf(object_key)

    text = extract_text(pdf_bytes)

    # candidate = extract_candidate(text)
    # skills = find_skills(text)
    # experience = parse_experience(text)
    # projects = parse_projects(text)
    # education = parse_education(text)

    profile =await profile_resume(text)

    return {
        "profile": profile,
        "rawText": text,
    }