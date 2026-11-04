import { build } from 'esbuild';
await build({entryPoints:['public/pandas-data-lab/student-cloud.js'],outfile:'public/pandas-data-lab/student-cloud.bundle.js',bundle:true,minify:true,format:'esm',platform:'browser',target:['es2022'],legalComments:'eof'});
