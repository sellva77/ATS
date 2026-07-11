import re

from services.parsers.utils import DATE_RANGE_PATTERN

SECTION_HEADERS = [
    "PROJECTS",
    "EDUCATION",
    "TECHNICAL SKILLS",
    "SKILLS",
    "CERTIFICATIONS",
    "ACHIEVEMENTS",
]


def extract_experience_section(text: str) -> str | None:
    pattern = r"\b(?:EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EMPLOYMENT HISTORY)\b"

    match = re.search(
        pattern,
        text,
        re.IGNORECASE,
    )

    if not match:
        return None

    start = match.end()

    remaining_text = text[start:]

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


def find_date_range(line: str) -> dict | None:
    match = DATE_RANGE_PATTERN.search(line)

    if not match:
        return None

    return {
        "startDate": match.group("start").strip(),
        "endDate": match.group("end").strip(),
    }



def merge_wrapped_lines(section: str) -> list[str]:
    raw_lines = [
        line.strip()
        for line in section.splitlines()
        if line.strip()
    ]

    merged = []

    for line in raw_lines:
        if line.startswith(("•", "▪", "●", "-")):
            merged.append(line)
            continue

        if merged and merged[-1].startswith(("•", "▪", "●", "-")):
            merged[-1] += " " + line
            continue

        merged.append(line)

    return merged


def parse_experience(text: str) -> list[dict]:
    section = extract_experience_section(text)

    if not section:
        return []

    # IMPORTANT: use merged lines here
    lines = merge_wrapped_lines(section)

    experiences = []

    for index, line in enumerate(lines):
        date_range = find_date_range(line)

        if not date_range:
            continue

        title = lines[index - 1] if index >= 1 else None
        company = lines[index + 1] if index + 1 < len(lines) else None
        location = lines[index + 2] if index + 2 < len(lines) else None

        description = []
        cursor = index + 3

        while cursor < len(lines):
            current_line = lines[cursor]

            if find_date_range(current_line):
                break

            if current_line.startswith(("•", "▪", "●", "-")):
                description.append(
                    current_line.lstrip("•▪●- ").strip()
                )

            cursor += 1

        experiences.append({
            "title": title,
            "company": company,
            "location": location,
            "startDate": date_range["startDate"],
            "endDate": date_range["endDate"],
            "description": description,
        })

    return experiences