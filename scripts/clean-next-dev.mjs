import { rmSync } from "node:fs";
import { join } from "node:path";

const nextDir = join(process.cwd(), ".next");

try {
  rmSync(nextDir, { recursive: true, force: true });
  console.log("Removed .next — restart a single dev server (npm run dev or npm run dev:stable).");
} catch (err) {
  console.error("Could not remove .next:", err);
  process.exit(1);
}
