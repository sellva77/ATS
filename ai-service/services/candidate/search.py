from services.embedding import generate_embedding
from services.vector_store import client, COLLECTION_NAME


def search_candidates(
    jd_text: str,
    limit: int = 10,
):
    jd_embedding = generate_embedding(jd_text)

    result = client.query_points(
        collection_name=COLLECTION_NAME,
        query=jd_embedding,
        limit=limit,
        with_payload=True,
    )

    return [
        {
            "candidateId": str(point.id),
            "score": point.score,
            "metadata": point.payload,
        }
        for point in result.points
    ]
