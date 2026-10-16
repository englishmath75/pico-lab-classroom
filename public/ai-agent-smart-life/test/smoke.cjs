/* GitHub Actions browser smoke test. Uses mock Pyodide to test UI wiring without paid APIs. */
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const assert = require("node:assert/strict");
const { chromium } = require("playwright");

async function main() {
  const root = path.resolve(process.cwd(),"dist");
  const mime = {".js":"application/javascript;charset=utf-8",".html":"text/html;charset=utf-8",".css":"text/css",".csv":"text/csv",".py":"text/plain",".md":"text/markdown"};
  const server = http.createServer((req,res)=>{
    const pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
    const local=path.resolve(root,"."+pathname);
    if(!local.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    fs.readFile(local,(err,bytes)=>{
      if(err){res.writeHead(404);res.end("Not found");return;}
      res.writeHead(200,{"content-type":mime[path.extname(local)]||"application/octet-stream"});
      res.end(bytes);
    });
  });
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  const url="http://127.0.0.1:"+server.address().port+"/ai-agent-smart-life/";
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({acceptDownloads:true});
  try {
    await page.route("**/pyodide/v0.27.7/full/pyodide.js",route=>route.fulfill({
      status:200,contentType:"application/javascript",body:"window.loadPyodide = async ()=>({loadPackage: async()=>{},runPythonAsync:async()=>{},globals:{get:()=>JSON.stringify({text:'브라우저 파이썬 연결 확인',error:'',plot:''})}});"
    }));
    await page.goto(url+"index.html",{waitUntil:"domcontentloaded"});
    await page.locator("#lesson-nav [data-lesson]").first().waitFor();
    assert.equal(await page.locator("#lesson-nav [data-lesson]").count(),12,"12 navigation items");
    assert.equal(await page.locator(".quiz-question").count(),5,"5 questions per lesson");
    assert.ok((await page.locator("#lesson-content").innerText()).includes("생각을 여는 질문"),"enrichment is rendered");

    await page.locator("#run-code").click();
    await page.getByText("브라우저 파이썬 연결 확인").waitFor();
    for(let i=0;i<5;i++)await page.locator('input[name="quiz-'+i+'"]').first().check();
    await page.locator("#grade-quiz").click();
    assert.ok((await page.locator("#quiz-score").innerText()).includes("5문항"));
    await page.locator("#mark-complete").click();
    assert.ok((await page.locator("#stat-complete").innerText()).includes("1 / 12"));
    await page.reload({waitUntil:"domcontentloaded"});
    assert.ok((await page.locator("#stat-complete").innerText()).includes("1 / 12"),"progress survives reload");

    await page.locator("#lesson-nav [data-lesson='9']").click();
    await page.locator("#agent-run").click();
    assert.ok((await page.locator("#agent-steps").innerText()).includes("분석 도구 선택"));
    await page.locator("#agent-task").selectOption("plan");
    await page.locator("#agent-run").click();
    assert.equal(await page.locator("#agent-export").isVisible(),true,"CSV export visible");

    await page.goto(url+"teacher.html",{waitUntil:"domcontentloaded"});
    assert.equal(await page.locator("article").count(),12,"teacher lesson guides");

    await page.goto(url+"exam.html",{waitUntil:"domcontentloaded"});
    assert.equal(await page.locator("#multiple .q").count(),20,"20 multiple choice");
    assert.equal(await page.locator("#short .q").count(),8,"8 short answers");
    for(let i=0;i<20;i++)await page.locator('input[name="mc-'+i+'"]').first().check();
    await page.locator("#grade").click();
    assert.ok((await page.locator("#summary").innerText()).includes("28 문항"));

    for(const file of ["project/study_agent.py","project/study_scores.csv","project/README.md"]) {
      const result=await page.request.get(url+file);
      assert.equal(result.status(),200,"download "+file);
    }
    console.log("Browser smoke OK: 12 lessons, 5 quizzes, progress persistence, agent demo, 12 teacher guides, exam, downloads.");
  } finally {
    await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
}
main().catch(err=>{console.error(err);process.exit(1);});
