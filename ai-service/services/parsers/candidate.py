from models.schemas import Candidate

from services.parsers.utils import (
    find_email,
    find_phone,
    find_github,
    find_linkedin,
    find_name,
    find_location,
)


def extract_candidate(text: str) -> Candidate:

    return Candidate(
        name=find_name(text),
        email=find_email(text),
        phone=find_phone(text),
        github=find_github(text),
        linkedin=find_linkedin(text),
        location=find_location(text),
    )