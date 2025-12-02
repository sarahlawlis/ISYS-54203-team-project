/**
 * Backfill embeddings for existing attributes
 * This script generates embeddings for all attributes that don't have one
 */

import { db } from '../server/db';
import { attributes } from '../shared/schema';
import { generateAttributeEmbedding, serializeEmbedding } from '../server/ai-service';
import { eq } from 'drizzle-orm';

async function backfillEmbeddings() {
  console.log('🚀 Starting embedding backfill...\n');

  // Get all attributes without embeddings
  const allAttributes = await db.select().from(attributes);
  const attributesWithoutEmbeddings = allAttributes.filter(attr => !attr.embedding);

  console.log(`Found ${attributesWithoutEmbeddings.length} attributes without embeddings\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const attr of attributesWithoutEmbeddings) {
    try {
      console.log(`Generating embedding for: ${attr.name} (${attr.type})`);

      // Generate embedding
      const embedding = await generateAttributeEmbedding(
        attr.name,
        attr.type,
        attr.description
      );

      // Update attribute with embedding
      await db
        .update(attributes)
        .set({
          embedding: serializeEmbedding(embedding),
          embeddingUpdatedAt: new Date().toISOString(),
        })
        .where(eq(attributes.id, attr.id));

      console.log(`✅ Success: ${attr.name}\n`);
      successCount++;

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Error for ${attr.name}:`, error);
      errorCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully generated: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📝 Total processed: ${attributesWithoutEmbeddings.length}`);

  process.exit(0);
}

backfillEmbeddings().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
