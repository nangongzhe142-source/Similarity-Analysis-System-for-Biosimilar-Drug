import { readFile } from "node:fs/promises";
import path from "node:path";
import catalogJson from "@/data/figure-library-catalog.json";
import { figureLibraryEntryByFileName } from "@/data/figure-library-catalog";

function contentTypeForFileName(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".png")) {
    return "image/png";
  }
  if (lower.endsWith(".webp")) {
    return "image/webp";
  }
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  return "application/octet-stream";
}

export async function GET(request: Request): Promise<Response> {
  const fileName = new URL(request.url).searchParams.get("file");
  if (
    fileName === null ||
    fileName === "" ||
    fileName.includes("/") ||
    fileName.includes("\\") ||
    fileName.includes("..")
  ) {
    return new Response("Bad request", { status: 400 });
  }

  const entry = figureLibraryEntryByFileName(fileName);
  if (entry === undefined) {
    return new Response("Not in catalog", { status: 404 });
  }

  const libraryRoot = path.resolve(catalogJson.libraryRoot);
  const filePath = path.resolve(libraryRoot, fileName);
  const relative = path.relative(libraryRoot, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const bytes = await readFile(filePath);
    return new Response(bytes, {
      headers: {
        "Content-Type": contentTypeForFileName(fileName),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new Response("File not on disk", { status: 404 });
  }
}
