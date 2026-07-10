from fastapi import FastAPI

app = FastAPI(title="ATS AI Service")

@app.get("/health")
def health():
    return {
        "status": "ok"
    }