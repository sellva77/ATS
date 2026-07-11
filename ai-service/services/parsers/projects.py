import re


SECTION_HEADERS = [
    "EXPERIENCE",
    "WORK EXPERIENCE",
    "PROFESSIONAL EXPERIENCE",
    "EDUCATION",
    "TECHNICAL SKILLS",
    "SKILLS",
    "CERTIFICATIONS",
    "ACHIEVEMENTS",
]


BULLET_MARKERS = ("•", "▪", "●", "-")


def extract_projects_section(text: str) -> str | None:
    match = re.search(
        r"(?m)^\s*(?:PROJECTS|PERSONAL PROJECTS|ACADEMIC PROJECTS)\s*$",
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


def merge_wrapped_lines(section: str) -> list[str]:
    raw_lines = [
        line.strip()
        for line in section.splitlines()
        if line.strip()
    ]

    merged = []

    for line in raw_lines:
        if line.startswith(BULLET_MARKERS):
            merged.append(line)
            continue

        if merged and merged[-1].startswith(BULLET_MARKERS):
            merged[-1] += " " + line
            continue

        merged.append(line)

    return merged


def is_project_header(line: str) -> bool:
    return "|" in line and not line.startswith(BULLET_MARKERS)


def parse_project_header(line: str) -> tuple[str, list[str]]:
    name, technologies_text = line.split("|", 1)

    technologies = [
        technology.strip()
        for technology in technologies_text.split(",")
        if technology.strip()
    ]

    return name.strip(), technologies


def parse_projects(text: str) -> list[dict]:
    section = extract_projects_section(text)

    if not section:
        return []

    lines = merge_wrapped_lines(section)

    projects = []
    current_project = None

    for line in lines:
        if is_project_header(line):
            if current_project:
                projects.append(current_project)

            name, technologies = parse_project_header(line)

            current_project = {
                "name": name,
                "technologies": technologies,
                "description": [],
            }

            continue

        if current_project and line.startswith(BULLET_MARKERS):
            current_project["description"].append(
                line.lstrip("•▪●- ").strip()
            )

    if current_project:
        projects.append(current_project)

    return projects