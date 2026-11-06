import {readFile,writeFile,mkdir} from 'node:fs/promises';
await mkdir('public/downloads',{recursive:true});
await writeFile('public/downloads/arduino-foundations.docx',Buffer.from(await readFile('public/downloads/arduino-foundations.docx.b64','utf8'),'base64'));
