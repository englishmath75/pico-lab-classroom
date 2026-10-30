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

    assert.equal(await page.locator(".challenge-input").count(),2,"two Python fill-in exercises");
    await page.locator("#challenge-input-0").fill("min");
    await page.locator("#challenge-input-1").fill("weak");
    await page.locator("#check-challenge").click();
    assert.ok((await page.locator("#challenge-score").innerText()).includes("2 / 2"),"code challenge grading");
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

    // Regression: spreadsheet formula-like subject labels must export as inert text.
    await page.locator("#csv-data").fill("subject,score\n=2+2,40\n+A1,60\n@SUM,65\nNormal,70");
    await page.locator("#agent-run").click();
    const safeCsvDownload=page.waitForEvent("download");
    await page.locator("#agent-export").click();
    const safeCsv=fs.readFileSync(await (await safeCsvDownload).path(),"utf8").replace(/^\uFEFF/,"");
    assert.ok(safeCsv.includes("\"'=2+2\""),"equals-prefixed subject guarded in CSV");
    assert.ok(safeCsv.includes("\"'+A1\""),"plus-prefixed formula guarded in CSV");
    assert.ok(safeCsv.includes("\"'@SUM\""),"at-prefixed formula guarded in CSV");
    assert.ok(safeCsv.includes("\"Normal\""),"regular subject preserved in CSV");


    await page.goto(url+"teacher.html",{waitUntil:"domcontentloaded"});
    assert.equal(await page.locator("article").count(),12,"teacher lesson guides");

    await page.goto(url+"exam.html",{waitUntil:"domcontentloaded"});
    assert.equal(await page.locator("#multiple .q").count(),20,"20 multiple choice");
    assert.equal(await page.locator("#short .q").count(),8,"8 short answers");
    for(let i=0;i<20;i++)await page.locator('input[name="mc-'+i+'"]').first().check();
    await page.locator("#grade").click();
    assert.ok((await page.locator("#summary").innerText()).includes("28 문항"));
    // Public practice only: prove shuffled option labels still grade against the original answer text.
    await page.locator("#refresh").click();
    const remapResults = await page.evaluate(() => {
      const bank = window.AASL_LESSONS.flatMap((lesson, i) =>
        lesson.questions.concat(((window.AASL_DEEP_DIVE[i] || {}).extraQuestions) || []));
      return [...document.querySelectorAll("#multiple .q")].map(card => {
        const prompt = card.querySelector("h3").textContent.replace(/^객관식 \d+\.\s*/, "");
        const source = bank.find(question => question[0] === prompt);
        if (!source) return { found: false, matched: false };
        const originalCorrectText = source[1][source[2]];
        const labels = [...card.querySelectorAll(".options label")];
        const answerIndex = labels.findIndex(label =>
          label.querySelector("span").textContent.replace(/^[①②③④]\s*/, "") === originalCorrectText);
        if (answerIndex >= 0) labels[answerIndex].querySelector("input").checked = true;
        return { found: true, matched: answerIndex >= 0 };
      });
    });
    assert.equal(remapResults.length, 20, "20 shuffled questions");
    assert.ok(remapResults.every(result => result.found && result.matched),
      "the original correct text is visible in each shuffled question");
    await page.locator("#grade").click();
    assert.ok((await page.locator("#summary").innerText()).includes("객관식 20/20"),
      "all original correct options must score 20/20 after remapping");

    // A new public practice attempt must not carry over selected answers or a previous score.
    await page.locator("#refresh").click();
    assert.equal(await page.locator('#multiple input[type="radio"]:checked').count(),0,
      "refresh starts with no previously selected answers");
    assert.equal((await page.locator("#summary").innerText()).trim(),"",
      "refresh clears the score from the previous attempt");
    assert.equal(await page.locator("#multiple .q").count(),20,
      "refresh keeps 20 publicly sampled practice questions");
    await page.locator("#grade").click();
    assert.ok((await page.locator("#summary").innerText()).includes("객관식 0/20"),
      "unanswered fresh attempt must score 0/20");

    for(const file of ["project/study_agent.py","project/study_scores.csv","project/README.md"]) {
      const result=await page.request.get(url+file);
      assert.equal(result.status(),200,"download "+file);
    }
    await page.goto(url+"agent-studio.html",{waitUntil:"domcontentloaded"});
    await page.locator("#agent-execute").click();
    assert.ok((await page.locator("#agent-trace").innerText()).includes("verify"),"trace contains verification");
    assert.equal(await page.locator("#export-plan").isEnabled(),true,"validated plan available");
    assert.ok((await page.locator("#agent-output").innerText()).includes("복습 우선순위"),"plan output");
    await page.locator("#tool-verify").uncheck();
    await page.locator("#agent-execute").click();
    assert.equal(await page.locator("#export-plan").isDisabled(),true,"unverified plan cannot download");
    await page.locator("#tool-read").uncheck();
    await page.locator("#agent-execute").click();
    assert.ok((await page.locator("#agent-trace").innerText()).includes("읽기 도구"),"missing tool rejection");
    page.once("dialog",dialog=>dialog.accept());
    await page.locator("#agent-reset").click();
    // Restore manually as the preceding action can depend on native-dialog timing.
    await page.locator("#tool-read").check();
    await page.locator("#tool-verify").check();
    await page.locator("#agent-execute").click();
    assert.equal(await page.locator("#export-trace").isEnabled(),true,"trace report is available");
    await page.goto(url+"teacher-dashboard.html",{waitUntil:"domcontentloaded"});
    const sampleProgress=(code,completed,score)=>({
      version:1,year:2026,studentCode:code,completed,
      quizzes:{"0":{score}},notes:{},updatedAt:"2026-10-17T02:00:00.000Z"
    });
    await page.locator("#files").setInputFiles([
      {name:"A01-progress.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(sampleProgress("A01",[0,1],1)))},
      {name:"B02-progress.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(sampleProgress("B02",[0,1,2],0.5)))}
    ]);
    await page.locator("#analyze").click();
    await page.waitForFunction(() => document.getElementById("total").textContent === "2명", {timeout:12000});
    assert.equal(await page.locator("#total").innerText(),"2명","aggregate two anonymized files");
    assert.equal(await page.locator("#bars .bar").count(),12,"12 lesson completion bars");
    assert.equal(await page.locator("#rows tr").count(),2,"two student codes");
    assert.equal(await page.locator("#average").innerText(),"75%","quiz aggregate");
    const csvDownload=page.waitForEvent("download");
    await page.locator("#download-csv").click();
    assert.ok((await csvDownload).suggestedFilename().endsWith("_progress.csv"));

    await page.goto(url+"index.html",{waitUntil:"domcontentloaded"});
    await page.locator("#student-code").fill("A01");
    const recordDownload=page.waitForEvent("download");
    await page.locator("#export-progress").click();
    const exportedDownload=await recordDownload;
    assert.ok(exportedDownload.suggestedFilename().includes("A01"),"coded progress export");
    const backupBytes=fs.readFileSync(await exportedDownload.path());
    const backup=JSON.parse(backupBytes.toString("utf8"));
    assert.equal(backup.version,1,"backup format version");
    assert.equal(backup.year,2026,"backup academic year");
    assert.equal(backup.studentCode,"A01","anonymous code in export");
    assert.deepEqual(backup.completed,[0],"completed lesson in export");
    assert.ok(Number.isFinite(backup.quizzes["0"].score),"quiz score included in backup");

    // A fresh browser session must be able to restore an exported record without network or student identity.
    await page.evaluate(()=>localStorage.removeItem("aasl-progress-v1-2026"));
    await page.reload({waitUntil:"domcontentloaded"});
    assert.ok((await page.locator("#stat-complete").innerText()).includes("0 / 12"),"fresh session starts empty");
    page.once("dialog",dialog=>dialog.accept());
    await page.locator("#import-file").setInputFiles({
      name:"A01-progress.json",mimeType:"application/json",buffer:backupBytes
    });
    await page.waitForFunction(()=>document.getElementById("stat-complete").textContent.includes("1 / 12"));
    assert.equal(await page.locator("#student-code").inputValue(),"A01","anonymous code restored");
    const restored=await page.evaluate(()=>JSON.parse(localStorage.getItem("aasl-progress-v1-2026")));
    assert.deepEqual(restored.completed,[0],"completed lessons restored");
    assert.equal(restored.quizzes["0"].score,backup.quizzes["0"].score,"quiz score restored");

    // Wrong-year and invalid-lesson backups must be rejected without overwriting the valid local record.
    for(const invalidBackup of [{...backup,year:2025},{...backup,completed:[99]}]) {
      await page.locator("#import-file").setInputFiles({
        name:"invalid-progress.json",mimeType:"application/json",
        buffer:Buffer.from(JSON.stringify(invalidBackup))
      });
      await page.getByText("가져오기 실패:",{exact:false}).waitFor();
      const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem("aasl-progress-v1-2026")));
      assert.deepEqual(saved.completed,[0],"invalid import cannot overwrite completed lessons");
      assert.equal(saved.quizzes["0"].score,backup.quizzes["0"].score,"invalid import cannot overwrite scores");
    }

    // Malformed progress backup must not overwrite previously restored learning data.
    await page.locator("#import-file").setInputFiles({
      name:"truncated-progress.json",mimeType:"application/json",
      buffer:Buffer.from('{"version":1,"year":2026,"completed":[')
    });
    await page.waitForFunction(()=>document.getElementById("import-file").value === "");
    await page.getByText("가져오기 실패:",{exact:false}).waitFor();
    const afterMalformed=await page.evaluate(()=>JSON.parse(localStorage.getItem("aasl-progress-v1-2026")));
    assert.deepEqual(afterMalformed.completed,restored.completed,
      "malformed JSON cannot destroy restored lesson progress");
    assert.deepEqual(afterMalformed.quizzes,restored.quizzes,
      "malformed JSON cannot destroy restored quiz results");

    const teacherFile=await page.request.get(url+"project/agent_live_teacher.py");
    assert.equal(teacherFile.status(),200,"real model teacher script exists");
        console.log("Browser smoke OK: 12 lessons, 5 quizzes, progress persistence, agent demo, 12 teacher guides, exam, Python challenges, Agent Studio, teacher LLM example and downloads.");
  } finally {
    await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
}
main().catch(err=>{console.error(err);process.exit(1);});
