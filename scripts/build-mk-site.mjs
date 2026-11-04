// Build a byte-faithful first-grade classroom copy from the proven 2nd-grade course.
// Large existing learning videos remain served through sw.englishmath.kr via Vercel rewrites.
// The original second-grade code, database and sw publisher are never changed.
import { mkdir, readdir, readFile, rm, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';

const source = path.resolve('public/pandas-data-lab');
const target = path.resolve('mk-dist');
const textTypes = new Set(['.html','.js','.css','.json','.txt','.md','.py','.vtt','.svg','.xml']);
await rm(target, { recursive: true, force: true });
let count = 0;
async function copyDirectory(from, to, relative = '') {
  await mkdir(to, { recursive: true });
  for (const entry of await readdir(from, { withFileTypes: true })) {
    const rel = path.posix.join(relative, entry.name);
    // Avoid duplicating ~404 MB of video files; Vercel proxies these exact URLs
    // to the public second-grade video host, preserving video playback.
    if (rel === 'videos' || rel === 'learning-videos') continue;
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) { await copyDirectory(src, dest, rel); continue; }
    if (!entry.isFile()) continue;
    if (textTypes.has(path.extname(entry.name))) {
      let text = await readFile(src, 'utf8');
      text = text.replaceAll('../learning-videos/', '/learning-videos/');
      text = text.replaceAll('/pico-lab-classroom/pandas-data-lab/', '/');
      text = text.replaceAll('/sw/pandas-data-lab/', '/');
      await writeFile(dest, text, 'utf8');
    } else {
      await copyFile(src, dest);
    }
    count++;
  }
}
await copyDirectory(source, target);
for (const needed of ['index.html','student-room.html','student-cloud.bundle.js','student-config.json','student-room.js']) {
  await readFile(path.join(target, needed));
}
await writeFile(path.join(target, 'mk-build-info.json'), JSON.stringify({
  site:'mk.englishmath.kr', from:'englishmath75/pico-lab-classroom',
  base:'public/pandas-data-lab', grade:'copy-before-curriculum-revision',
  sharedFirebaseProject:'englishmath-python-classroom', videoOrigin:'sw.englishmath.kr'
},null,2));
console.log('MK student classroom staged, '+count+' site files');
