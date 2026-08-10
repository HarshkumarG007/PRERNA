import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('RAG Corpus Manifest Check (TN-1)', () => {
  it('ensures all markdown documents are registered in the corpus-manifest.json', () => {
    const basePath = path.join(process.cwd(), 'src', 'ai', 'rag');
    const manifestPath = path.join(basePath, 'corpus-manifest.json');
    const manifestRaw = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestRaw);

    const registeredPaths = manifest.documents.map((doc: { path: string }) => doc.path);

    const dirsToCheck = ['teen-development', 'parenting-guidance'];
    const foundMdFiles: string[] = [];

    for (const dir of dirsToCheck) {
      const dirPath = path.join(basePath, dir);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          if (file.endsWith('.md')) {
            foundMdFiles.push(`${dir}/${file}`);
          }
        }
      }
    }

    for (const file of foundMdFiles) {
      expect(registeredPaths).toContain(file);
    }
  });
});
