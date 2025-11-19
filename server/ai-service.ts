import { GoogleGenAI } from '@google/genai';
import type { Attribute } from '@shared/schema';

// Initialize Gemini AI client
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Model for embeddings
const EMBEDDING_MODEL = 'text-embedding-004';

// Similarity threshold for detecting similar attributes (80%)
const SIMILARITY_THRESHOLD = 0.80;

/**
 * Generate embedding vector for an attribute
 * Combines name, type, and description for semantic understanding
 */
export async function generateAttributeEmbedding(
  name: string,
  type: string,
  description?: string | null
): Promise<number[]> {
  try {
    // Combine attribute properties into a single text for embedding
    const text = [
      name,
      type,
      description || ''
    ].filter(Boolean).join(' ');

    const result = await genAI.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: { parts: [{ text }] }
    });

    if (!result.embeddings?.[0]?.values) {
      throw new Error('No embedding values returned');
    }

    return result.embeddings[0].values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Calculate cosine similarity between two embedding vectors
 * Returns a value between 0 and 1 (1 = identical, 0 = completely different)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Find similar attributes based on embedding similarity
 * Returns attributes above the similarity threshold, sorted by similarity
 */
export async function findSimilarAttributes(
  newAttribute: { name: string; type: string; description?: string | null },
  existingAttributes: Attribute[]
): Promise<Array<Attribute & { similarity: number }>> {
  try {
    // Generate embedding for the new attribute
    const newEmbedding = await generateAttributeEmbedding(
      newAttribute.name,
      newAttribute.type,
      newAttribute.description
    );

    // Filter attributes that have embeddings
    const attributesWithEmbeddings = existingAttributes.filter(
      attr => attr.embedding != null
    );

    // Calculate similarities
    const similarities = attributesWithEmbeddings.map(attr => {
      const existingEmbedding = JSON.parse(attr.embedding!) as number[];
      const similarity = cosineSimilarity(newEmbedding, existingEmbedding);

      return {
        ...attr,
        similarity
      };
    });

    // Filter by threshold and sort by similarity (highest first)
    return similarities
      .filter(item => item.similarity >= SIMILARITY_THRESHOLD)
      .sort((a, b) => b.similarity - a.similarity);
  } catch (error) {
    console.error('Error finding similar attributes:', error);
    // Return empty array on error to allow graceful degradation
    return [];
  }
}

/**
 * Serialize embedding vector to JSON string for database storage
 */
export function serializeEmbedding(embedding: number[]): string {
  return JSON.stringify(embedding);
}

/**
 * Deserialize embedding vector from JSON string
 */
export function deserializeEmbedding(embeddingJson: string): number[] {
  return JSON.parse(embeddingJson) as number[];
}

/**
 * Check if Gemini API is configured
 */
export function isAIConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}
