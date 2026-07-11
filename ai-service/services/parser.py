from services.storage import download_pdf
from services.extractor import extract_text

from services.parsers.candidate import extract_candidate
from services.parsers.skills import extract_skills
from services.parsers.education import extract_education
from services.parsers.experience import extract_experience


# def parse_resume(object_key: str):
#     pdf_bytes = download_pdf(object_key)

#     text = extract_text(pdf_bytes)

#     return {
#         "candidate": extract_candidate(text),
#         "skills": extract_skills(text),
#         "education": extract_education(text),
#         "experience": extract_experience(text),
#         "rawText": text,
#     }


def parse_resume(object_key: str):

    pdf_bytes = download_pdf(object_key)

    text = extract_text(pdf_bytes)

    candidate = extract_candidate(text)

    return {
        "candidate": candidate,
        "rawText": text,
    }