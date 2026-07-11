import re


SECTION_HEADERS = [
    "EXPERIENCE",
    "WORK EXPERIENCE",
    "PROFESSIONAL EXPERIENCE",
    "PROJECTS",
    "TECHNICAL SKILLS",
    "SKILLS",
    "CERTIFICATIONS",
    "ACHIEVEMENTS",
]


EDUCATION_DATE_PATTERN = re.compile(
    r"""
    (?P<start>\d{4})
    \s*
    [–—-]
    \s*
    (?P<end>
        \d{4}
        |
        Present
        |
        Current
    )
    """,
    re.IGNORECASE | re.VERBOSE,
)


def extract_education_section(text: str) -> str | None:
    match = re.search(
        r"(?m)^\s*(?:EDUCATION|ACADEMIC BACKGROUND|ACADEMIC QUALIFICATIONS?)\s*$",
        text,
        re.IGNORECASE,
    )

    if not match:
        return None

    remaining_text = text[match.end():]

    end_positions = []

    for header in SECTION_HEADERS:
        header_match = re.search(
            rf"(?m)^\s*{re.escape(header)}\s*$",
            remaining_text,
            re.IGNORECASE,
        )

        if header_match:
            end_positions.append(header_match.start())

    end = min(end_positions) if end_positions else len(remaining_text)

    return remaining_text[:end].strip()


def find_education_date_range(line: str):
    match = EDUCATION_DATE_PATTERN.search(line)

    if not match:
        return None

    return {
        "startDate": match.group("start").strip(),
        "endDate": match.group("end").strip(),
    }


def parse_education(text: str) -> list[dict]:
    section = extract_education_section(text)

    if not section:
        return []

    lines = [
        line.strip()
        for line in section.splitlines()
        if line.strip()
    ]

    education = []

    for index, line in enumerate(lines):
        date_range = find_education_date_range(line)

        if not date_range:
            continue

        institution = lines[index - 1] if index >= 1 else None
        degree = lines[index + 1] if index + 1 < len(lines) else None
        location = lines[index + 2] if index + 2 < len(lines) else None

        education.append({
            "institution": institution,
            "degree": degree,
            "location": location,
            "startDate": date_range["startDate"],
            "endDate": date_range["endDate"],
        })

    return education