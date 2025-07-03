require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');
const fs = require('fs');
const path = require('path');
const main = async () => {
  try {
    const { pipeline } = await import('@xenova/transformers');
    // Configure the embedding pipeline
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const pinecone = new Pinecone();

    const indexName = 'developer-quickstart-js';
    const modelDimension = 384; // Dimension for 'Xenova/all-MiniLM-L6-v2'

    console.log(`Checking if index '${indexName}' exists...`);
    const existingIndexes = await pinecone.listIndexes();
    const indexExists = existingIndexes.indexes && existingIndexes.indexes.some(index => index.name === indexName);

    if (indexExists) {
        console.log(`Deleting existing index '${indexName}' to ensure correct configuration.`);
        await pinecone.deleteIndex(indexName);
    }

    console.log(`Creating new index '${indexName}' with dimension ${modelDimension}...`);
    await pinecone.createIndex({
        name: indexName,
        dimension: modelDimension,
        metric: 'cosine',
        spec: {
            serverless: {
                cloud: 'aws',
                region: 'us-east-1'
            }
        },
        waitUntilReady: true,
    });
    console.log(`Index '${indexName}' created and ready.`);

    const index = pinecone.index(indexName);

    // Read and process the JSON file
    const filePath = path.join(__dirname, 'bannerJSON_ai_generated.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    if (!data.design || !Array.isArray(data.design)) {
        throw new Error("JSON file does not have a 'design' array property.");
    }
    const designElements = data.design;

    // Prepare records for upserting
    const records = [];
    for (const element of designElements) {
        if (!element.id) {
            console.warn("Found an element without an 'id', skipping it.", element);
            continue;
        }
        const text = JSON.stringify(element);
        const embedding = await extractor(text, { pooling: 'mean', normalize: true });

        records.push({
            id: element.id,
            values: Array.from(embedding.data),
            metadata: { content: text },
        });
    }

    if (records.length === 0) {
        console.log("No valid records with IDs found to upsert.");
        return;
    }

    console.log(`Preparing to upsert ${records.length} records into the index...`);
    
    // Upsert the data in batches
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        await index.upsert(batch);
        console.log(`Upserted batch ${Math.floor(i / batchSize) + 1}`);
    }

    console.log('Successfully indexed all data from bannerJSON_ai_generated.json.');

  } catch (error) {
    console.error('An error occurred during the indexing process:', error);
  }
};

main();
