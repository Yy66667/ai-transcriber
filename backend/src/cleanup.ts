import { promises as fs } from "fs";
import path from "path";

const transcriptsDir = path.join(__dirname, "..", "downloads");
const MAX_FILE_AGE_MS = 3 * 60 * 60 * 1000; // 3 hours

async function cleanupOldFiles() {
  try {
    // Check if directory exists
    await fs.access(transcriptsDir);

    const files = await fs.readdir(transcriptsDir);
    const now = Date.now();

    for (const file of files) {
      try {
        const filePath = path.join(transcriptsDir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtimeMs > MAX_FILE_AGE_MS) {
          await fs.unlink(filePath);
          console.log(`Deleted old transcript file: ${file}`);
        }
      } catch (err) {
        console.error(`Error processing file ${file}:`, err);
        // Continue with next file even if current one fails
      }
    }
  } catch (err) {
    console.error("Error accessing transcripts directory:", err);
  }
}

// Run cleanup every hour
setInterval(() => {
  cleanupOldFiles().catch((err) => {
    console.error("Cleanup task failed:", err);
  });
}, 60 * 60 * 1000);

// Initial run
cleanupOldFiles().catch((err) => {
  console.error("Initial cleanup failed:", err);
});
