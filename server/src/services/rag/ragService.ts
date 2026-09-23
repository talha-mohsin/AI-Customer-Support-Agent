import fs from "fs/promises";
import path from "path";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PineconeStore } from "@langchain/pinecone";
import { Document } from "@langchain/core/documents";
import { createEmbeddings, EMBEDDING_DIMENSIONS, getPineconeClient } from "../../config/ai";
import { env } from "../../config/env";

const KNOWLEDGE_BASE_DIR = path.resolve(process.cwd(), "../knowledge-base");

export interface KnowledgeChunk {
  text: string;
  source: string;
  score: number;
}

async function ensureIndexExists(): Promise<void> {
  const pinecone = getPineconeClient();
  const { indexes } = await pinecone.listIndexes();
  const exists = indexes?.some((i) => i.name === env.vectorDbIndex);

  if (!exists) {
    await pinecone.createIndex({
      name: env.vectorDbIndex,
      dimension: EMBEDDING_DIMENSIONS,
      metric: "cosine",
      spec: { serverless: { cloud: "aws", region: "us-east-1" } },
      waitUntilReady: true,
    });
  }
}

async function loadKnowledgeBaseDocuments(): Promise<Document[]> {
  const files = await fs.readdir(KNOWLEDGE_BASE_DIR);
  const markdownFiles = files.filter((f) => f.endsWith(".md"));

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 100,
    separators: ["\n## ", "\n### ", "\n\n", "\n", " ", ""],
  });

  const documents: Document[] = [];

  for (const file of markdownFiles) {
    const content = await fs.readFile(path.join(KNOWLEDGE_BASE_DIR, file), "utf-8");
    const chunks = await splitter.splitText(content);

    chunks.forEach((chunk, index) => {
      documents.push(
        new Document({
          pageContent: chunk,
          metadata: { source: file, chunkIndex: index },
        })
      );
    });
  }

  return documents;
}

export async function ingestDocuments(): Promise<{ files: number; chunks: number }> {
  await ensureIndexExists();

  const documents = await loadKnowledgeBaseDocuments();
  const pinecone = getPineconeClient();
  const index = pinecone.index(env.vectorDbIndex);

  await index.deleteAll().catch(() => {
    // Nothing to delete on a fresh index.
  });

  const vectorStore = await PineconeStore.fromExistingIndex(createEmbeddings(), { pineconeIndex: index });
  await vectorStore.addDocuments(documents);

  const files = new Set(documents.map((d) => d.metadata.source)).size;
  return { files, chunks: documents.length };
}

export async function searchKnowledgeBase(query: string, topK = 4): Promise<KnowledgeChunk[]> {
  const pinecone = getPineconeClient();
  const index = pinecone.index(env.vectorDbIndex);
  const vectorStore = await PineconeStore.fromExistingIndex(createEmbeddings(), { pineconeIndex: index });

  const results = await vectorStore.similaritySearchWithScore(query, topK);

  return results.map(([doc, score]) => ({
    text: doc.pageContent,
    source: String(doc.metadata.source ?? "unknown"),
    score,
  }));
}
