import path from "path";
import { fileURLToPath } from "url";
import { type Express } from "express";
import { type Server } from "http";
import runApp from "./app";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setupProd(app: Express, server: Server) {
  // Serve static files from the dist/public directory
  const staticPath = path.resolve(__dirname, "../public");
  app.use(express.static(staticPath));

  // Catch-all route to serve index.html for client-side routing
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(staticPath, "index.html"));
  });
}

(async () => {
  await runApp(setupProd);
})();
