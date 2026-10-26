import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('content/works');
const files = (await readdir(root)).filter(name => name.endsWith('.md'));
const required = ['id', 'title', 'author', 'kind', 'published', 'tags', 'summary', 'status'];
let failed = false;

if (!files.length) {
  console.error('❌ content/works 中没有 Markdown 作品文件。');
  process.exit(1);
}

for (const file of files) {
  const fullPath = path.join(root, file);
  const text = await readFile(fullPath, 'utf8');
  const match = text.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) {
    console.error(`❌ ${file}: 缺少 YAML front matter（文件开头的 --- 区块）。`);
    failed = true;
    continue;
  }
  const meta = match[1];
  const missing = required.filter(key => !new RegExp(`^${key}:\\s*.+`, 'm').test(meta));
  if (missing.length) {
    console.error(`❌ ${file}: 缺少字段 ${missing.join(', ')}`);
    failed = true;
  }
  if (!/^kind:\s*(image|text)\s*$/m.test(meta)) {
    console.error(`❌ ${file}: kind 必须为 image 或 text。`);
    failed = true;
  }
  if (!/^status:\s*(draft|published)\s*$/m.test(meta)) {
    console.error(`❌ ${file}: status 必须为 draft 或 published。`);
    failed = true;
  }
  if (!/^published:\s*\d{4}-\d{2}-\d{2}\s*$/m.test(meta)) {
    console.error(`❌ ${file}: published 必须使用 YYYY-MM-DD 日期格式。`);
    failed = true;
  }
  if (!failed) console.log(`✓ ${file}`);
}

if (failed) process.exit(1);
console.log(`\n✓ 内容检查通过：${files.length} 个作品文件。`);
