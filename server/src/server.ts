import { app } from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";

async function start(): Promise<void> {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`[server] listening on port ${env.port}`);
  });
}

start().catch((err) => {
  console.error("[server] failed to start", err);
  process.exit(1);
});
