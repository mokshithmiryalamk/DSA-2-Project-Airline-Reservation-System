import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import esbuild from 'esbuild';

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (specifier.startsWith('.') || specifier.startsWith('/')) {
      const parentDir = context.parentURL ? path.dirname(fileURLToPath(context.parentURL)) : process.cwd();
      const resolvedBase = path.resolve(parentDir, specifier);
      const candidates = [
        resolvedBase + '.jsx',
        resolvedBase + '.js',
        path.join(resolvedBase, 'index.jsx'),
        path.join(resolvedBase, 'index.js'),
      ];
      for (const cand of candidates) {
        if (fs.existsSync(cand)) {
          return {
            format: 'module',
            shortCircuit: true,
            url: pathToFileURL(cand).href,
          };
        }
      }
    }
    throw err;
  }
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.css')) {
    return {
      format: 'module',
      shortCircuit: true,
      source: 'export default {};',
    };
  }

  if (url.endsWith('.jsx')) {
    const filePath = fileURLToPath(url);
    const raw = fs.readFileSync(filePath, 'utf8');
    const { code } = esbuild.transformSync(raw, {
      loader: 'jsx',
      format: 'esm',
      sourcefile: filePath,
    });
    return {
      format: 'module',
      shortCircuit: true,
      source: code,
    };
  }

  return nextLoad(url, context);
}
