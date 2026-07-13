from storage import download_pdf
from services.resume.extractor import extract_text
from services.resume.profiler import profile_resume


async def parse_resume(object_key: str):
    pdf_bytes = download_pdf(object_key)

    text = extract_text(pdf_bytes)

    profile = await profile_resume(text)

    return {
        "profile": profile,
        "rawText": text,
    }
