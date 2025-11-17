const HF_ENDPOINT =
  process.env.HF_EMBEDDING_MODEL ??
  "https://api-inference.huggingface.co/pipeline/feature-extraction/intfloat/e5-small-v2";

const HF_API_KEY = process.env.HF_API_KEY;

const normalizeVector = (vector) => {
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  if (!norm) {
    return vector;
  }
  return vector.map((v) => v / norm);
};

export const generateEmbedding = async (inputText) => {
  if (!HF_API_KEY) {
    return null;
  }

  const response = await fetch(HF_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: inputText }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Embedding request failed: ${errorText}`);
  }

  const embedding = await response.json();
  if (!Array.isArray(embedding)) {
    return null;
  }

  // Hugging Face returns [1, dim]
  if (Array.isArray(embedding[0])) {
    return normalizeVector(embedding[0]);
  }
  return normalizeVector(embedding);
};

