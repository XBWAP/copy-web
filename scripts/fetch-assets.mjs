#!/usr/bin/env node
/**
 * 按资源清单把站点静态资源下载到 <outputDir>/scan/assets/。
 * 仅使用 Node 内置模块，需要 Node.js >= 20（global fetch / AbortSignal.timeout）。
 *
 * 用法：node scripts/fetch-assets.mjs <manifest.json>
 * 清单：{
 *   "outputDir": "./copy-web-out",
 *   "assets": [
 *     { "url": "https://example.com/logo.png", "path": "logo.png", "type": "image" }
 *   ]
 * }
 * path 相对于 scan/assets/；若以 scan/assets/ 开头会自动去掉前缀。
 * 结果写入 <outputDir>/scan/fetch-result.json；存在失败项时退出码为 1。
 */

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const TIMEOUT_MS = 20000;
const EXT_BY_TYPE = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'image/x-icon': '.ico',
  'image/vnd.microsoft.icon': '.ico',
  'text/css': '.css',
  'font/woff2': '.woff2',
  'font/woff': '.woff',
  'font/ttf': '.ttf',
  'application/font-woff2': '.woff2',
  'application/javascript': '.js',
  'text/javascript': '.js',
  'application/json': '.json',
};

function extensionFor(contentType) {
  const base = String(contentType || '').split(';')[0].trim().toLowerCase();
  return EXT_BY_TYPE[base] || '.bin';
}

function normalizeRelativePath(item) {
  let rel = String(item?.path || '').replace(/\\/g, '/').trim();
  if (!rel) {
    try {
      rel = decodeURIComponent(new URL(item.url).pathname).split('/').filter(Boolean).pop() || 'asset';
    } catch {
      rel = 'asset';
    }
  }
  if (rel.startsWith('scan/assets/')) rel = rel.slice('scan/assets/'.length);
  const parts = rel.split('/').filter(Boolean);
  if (!parts.length || path.isAbsolute(rel) || parts.includes('..') || parts.includes('.')) {
    throw new Error(`非法的资源路径: ${rel}`);
  }
  return parts.join('/');
}

async function main() {
  const manifestPath = process.argv[2];
  if (!manifestPath) {
    console.error('用法: node scripts/fetch-assets.mjs <manifest.json>');
    process.exit(2);
  }

  let manifest;
  try {
    const raw = await readFile(manifestPath, 'utf8');
    manifest = JSON.parse(raw.replace(/^\uFEFF/, ''));
  } catch (err) {
    console.error(`无法读取资源清单 ${manifestPath}: ${err.message}`);
    process.exit(2);
  }

  const outputDir = path.resolve(manifest.outputDir || './copy-web-out');
  const assetsRoot = path.join(outputDir, 'scan', 'assets');
  const scanRoot = path.join(outputDir, 'scan');
  await mkdir(assetsRoot, { recursive: true });

  const downloaded = [];
  const failed = [];

  for (const item of manifest.assets || []) {
    try {
      if (!item?.url) throw new Error('缺少 url');
      const response = await fetch(item.url, {
        headers: { 'User-Agent': 'copy-web/web-scan asset fetcher' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const contentType = response.headers.get('content-type') || '';
      let rel = normalizeRelativePath(item);
      if (!path.extname(rel)) rel = rel.replace(/\/+$/, '') + extensionFor(contentType);
      const buffer = Buffer.from(await response.arrayBuffer());
      const destination = path.join(assetsRoot, rel);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, buffer);

      downloaded.push({
        url: item.url,
        path: `scan/assets/${rel}`,
        bytes: buffer.length,
        type: item.type || contentType.split(';')[0],
      });
    } catch (err) {
      failed.push({
        url: item?.url ?? null,
        path: item?.path ?? null,
        error: String(err?.message || err),
      });
    }
  }

  const resultPath = path.join(scanRoot, 'fetch-result.json');
  await writeFile(
    resultPath,
    JSON.stringify({ manifest: path.resolve(manifestPath), assetsRoot, downloaded, failed }, null, 2) + '\n',
    'utf8',
  );

  console.log(`下载成功 ${downloaded.length} 项，失败 ${failed.length} 项；结果: ${resultPath}`);
  for (const item of failed) console.error(`  [失败] ${item.url} -> ${item.error}`);
  if (failed.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(`执行失败: ${err.message}`);
  process.exit(2);
});
