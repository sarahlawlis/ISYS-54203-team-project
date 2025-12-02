import { GoogleGenAI } from '@google/genai';
import type { Attribute } from '@shared/schema';

// Initialize Gemini AI client
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Model for embeddings
const EMBEDDING_MODEL = 'text-embedding-004';

// Similarity threshold for detecting similar attributes (60% - catches typos and variations)
const SIMILARITY_THRESHOLD = 0.60;

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
 * Generate AI-powered attribute suggestions for form building
 * Uses Gemini text generation to recommend relevant attributes
 * @param formType - Type of form being built (e.g., 'project', 'task')
 * @param currentAttributeIds - IDs of attributes already added to the form
 * @param allAttributes - Complete list of available attributes
 * @returns Array of suggested attribute IDs
 */
export async function suggestFormAttributes(
  formType: string,
  currentAttributeIds: string[],
  allAttributes: Attribute[]
): Promise<string[]> {
  try {
    // Build context for AI
    const currentAttributes = allAttributes.filter(a => currentAttributeIds.includes(a.id));
    const availableAttributes = allAttributes.filter(a => !currentAttributeIds.includes(a.id));

    // If no attributes available to suggest, return empty array
    if (availableAttributes.length === 0) {
      return [];
    }

    // Construct prompt for Gemini
    const currentAttrsText = currentAttributes.length > 0
      ? currentAttributes.map(a => `- ${a.name} (${a.type}): ${a.description || 'No description'}`).join('\n')
      : '(None yet)';

    const availableAttrsText = availableAttributes
      .map(a => `- ${a.name} (${a.type}): ${a.description || 'No description'}`)
      .join('\n');

    const prompt = `You are helping a user build a form for a ${formType} management system.

Current form attributes:
${currentAttrsText}

Available attributes to suggest from:
${availableAttrsText}

Task: Suggest 3-5 attributes from the available list that would be most useful for this ${formType} form, considering:
1. Essential fields typically needed for ${formType} management
2. Attributes that complement what's already added
3. Common industry practices for ${formType} forms

Return ONLY the attribute names, one per line, no explanations or numbering.`;

    // Call Gemini API (using stable 1.5 Flash for reliability and higher rate limits)
    const result = await genAI.models.generateContent({
      model: 'gemini-1.5-flash-latest',
      contents: { parts: [{ text: prompt }] }
    });

    if (!result.text) {
      throw new Error('No suggestions generated');
    }

    // Parse response - extract attribute names
    const suggestedNames = result.text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('-') && !line.match(/^\d+\./))
      .slice(0, 5); // Max 5 suggestions

    // Map back to attribute IDs
    const suggestedIds = suggestedNames
      .map(name => {
        const attr = availableAttributes.find(a =>
          a.name.toLowerCase() === name.toLowerCase() ||
          a.name.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(a.name.toLowerCase())
        );
        return attr?.id;
      })
      .filter((id): id is string => id !== undefined);

    return suggestedIds;
  } catch (error) {
    console.error('Error generating attribute suggestions:', error);
    // Return empty array on error for graceful degradation
    return [];
  }
}

/**
 * Check if Gemini API is configured
 */
export function isAIConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}
