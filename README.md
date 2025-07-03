# Vector DB Data Indexing Project

This project provides a script to index JSON data into a Pinecone vector database using Node.js. It includes local embedding generation with the `@xenova/transformers` library and demonstrates how to create a serverless index in Pinecone.

## Prerequisites

- Node.js and npm
- A Pinecone account and API key

## Setup Instructions

Follow these steps to set up and run the project.

### 1. Install Dependencies

Navigate to the project directory and run the following command to install the required packages:

```bash
npm install
```

This will install:
- `@pinecone-database/pinecone`: The official Pinecone client for JavaScript.
- `dotenv`: A library to load environment variables from a `.env` file.
- `@xenova/transformers`: A library to run AI models like text embedders directly in Node.js.

### 2. Configure Environment Variables

Create a file named `.env` in the root of the project directory. This file will securely store your Pinecone API key.

```
.env
```

Add your Pinecone API key to the `.env` file as follows:

```
PINECONE_API_KEY=your_pinecone_api_key_here
```

**Note:** The `.gitignore` file is already configured to exclude the `.env` file from version control, ensuring your credentials remain private.

## Running the Indexing Script

Once the setup is complete, you can index your data by running the main script.

### 1. Execute the Script

Run the following command from the project's root directory:

```bash
node index.js
```

### 2. Script Workflow

The `index.js` script performs the following actions:

1.  **Connects to Pinecone**: It uses the `PINECONE_API_KEY` from your `.env` file to initialize the Pinecone client.
2.  **Recreates the Index**: It checks for an index named `developer-quickstart-js`. To ensure the configuration is correct, it **deletes the index if it already exists** and creates a new one.
3.  **Creates a Serverless Index**: The new index is configured as a serverless index running on `aws` in the `us-east-1` region, with a vector dimension of `384` to match the embedding model.
4.  **Processes JSON Data**: It reads and parses the `bannerJSON_ai_generated.json` file.
5.  **Generates Embeddings**: Using the `Xenova/all-MiniLM-L6-v2` model, it generates a vector embedding for each item in the JSON data.
6.  **Upserts Data**: It uploads the records, along with their newly generated vector embeddings, into the Pinecone index.

You will see log messages in your terminal tracking the script's progress. A final success message will appear upon completion.
