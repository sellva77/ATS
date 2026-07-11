import re


# ============================================================================
#                                skill parser 
# ============================================================================


SKILLS = {
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "python": "Python",
    "java": "Java",
    "go": "Go",

    "react": "React",
    "react.js": "React",
    "reactjs": "React",
    "react native": "React Native",

    "node": "Node.js",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "express": "Express.js",
    "express.js": "Express.js",

    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "mysql": "MySQL",
    "mongodb": "MongoDB",
    "redis": "Redis",

    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "aws": "AWS",
    "git": "Git",
    "github": "GitHub",

    "prisma": "Prisma",
    "fastapi": "FastAPI",
}


def find_skills(text: str) -> list[str]:
    found_skills = set()

    normalized_text = text.lower()

    for keyword, skill_name in SKILLS.items():
        pattern = rf"(?<!\w){re.escape(keyword)}(?!\w)"

        if re.search(pattern, normalized_text):
            found_skills.add(skill_name)

    return sorted(found_skills)



