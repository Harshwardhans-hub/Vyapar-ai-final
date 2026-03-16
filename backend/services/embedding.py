from google import genai
from google.genai import types
import numpy as np
from config import Config


class EmbeddingService:
    """Generate embeddings via Google Gemini API."""

    def __init__(self):
        self.client = genai.Client(api_key=Config.GEMINI_API_KEY)
        self.model = Config.GEMINI_EMBEDDING_MODEL
        self.embed_config = types.EmbedContentConfig(
            output_dimensionality=Config.EMBEDDING_DIM
        )

    def get_embedding(self, text: str) -> list:
        """
        Get embedding vector for a single text string using Gemini.
        Returns a list of floats (768 dimensions).
        """
        try:
            response = self.client.models.embed_content(
                model=self.model,
                contents=text,
                config=self.embed_config,
            )
            return response.embeddings[0].values

        except Exception as e:
            print(f"❌ Embedding error: {e}")
            # Return zero vector as fallback
            return [0.0] * Config.EMBEDDING_DIM

    def get_embeddings_batch(self, texts: list) -> list:
        """
        Get embeddings for a batch of texts using Gemini.
        Returns a list of embedding vectors.
        """
        try:
            response = self.client.models.embed_content(
                model=self.model,
                contents=texts,
                config=self.embed_config,
            )
            return [e.values for e in response.embeddings]

        except Exception as e:
            print(f"❌ Batch embedding error: {e}")
            return [[0.0] * Config.EMBEDDING_DIM] * len(texts)

    def cosine_similarity(self, vec_a: list, vec_b: list) -> float:
        """Calculate cosine similarity between two vectors."""
        a = np.array(vec_a)
        b = np.array(vec_b)
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-10))
