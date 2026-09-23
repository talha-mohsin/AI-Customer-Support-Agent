import { ingestDocuments } from "../services/rag/ragService";

ingestDocuments()
  .then(({ files, chunks }) => {
    console.log(`[ingest] embedded ${chunks} chunks from ${files} knowledge-base files`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("[ingest] failed", err);
    process.exit(1);
  });
