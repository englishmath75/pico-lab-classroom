'use strict';
const $=id=>document.getElementById(id);
const lessons={
1:{title:'초음파센서와 부저',desc:'실제 거리가 20cm 미만이면 부저가 울립니다. 밝기는 부저에 영향을 주지 않습니다.',name:'STEP 1 · 초음파센서와 부저',url:'h4ANNRDybN4-newstep1',pins:[['TRIG','D7'],['ECHO','D8'],['부저 +','D2'],['전원','5V / GND']],principles:['D7에서 초음파 발신 신호를 보냅니다.','D8에서 돌아온 신호로 거리를 계산합니다.','dist < 20이면 tone(2,1000), 그 외에는 noTone(2)입니다.'],question:'19cm이면 부저가 울릴까요? 20cm일 때는요?'},
2:{title:'조도·가변저항과 빨강·초록 LED',desc:'CDS가 어두워지면 빨간 LED가 켜지고, 가변저항은 초록 LED 밝기만 바꿉니다.',name:'STEP 2 · 조도·가변저항·LED',url:'icXpmxWfLZp-newstep2led',pins:[['CDS 분압점','A0'],['가변저항 가운데','A1'],['빨간 LED','D9'],['초록 LED PWM','D10'],['전원','5V / GND']],principles:['cds = analogRead(A0)로 조도를 읽습니다.','cds < 400이면 빨간 LED D9가 켜집니다.','pot = analogRead(A1)로 읽고 map()으로 0~255로 바꿔 초록 LED D10에 출력합니다.'],question:'CDS를 가리기만 하면 초록 LED의 밝기도 바뀔까요?'},
3:{title:'전체 통합 · 세 출력 독립 제어',desc:'초음파는 부저, CDS는 빨간 LED, 가변저항은 초록 LED만 각각 제어합니다.',name:'STEP 3 · 통합 독립 제어',url:'7DmFxG3ZbXv-newstep3',pins:[['초음파 TRIG / ECHO','D7 / D8'],['CDS 분압점','A0'],['가변저항 가운데','A1'],['빨간 LED','D9'],['초록 LED PWM','D10'],['부저 +','D2']],principles:['거리가 20cm 미만이면 부저만 울립니다.','CDS 값이 400 미만이면 빨간 LED가 켜집니다.','가변저항 값만으로 초록 LED PWM 0~255가 결정됩니다. 세 조건은 서로 독립적입니다.'],question:'멀리 떨어져 있어도 어두우면 빨간 LED는 켜질까요?' }
};
let step=1;const notes={1:'',2:'',3:''};
function update(){const d=Number($('distance').value),l=Number($('light').value),p=Number($('pot').value),red=l<400,green=Math.floor(p*255/1023),buzz=d<20;
$('distance-value').textContent=d+' cm';$('light-value').textContent=l;$('pot-value').textContent=p;
$('red-status').textContent=red?'켜짐':'꺼짐';$('red-led').style.background=red?'#ef4444':'#cbd5e1';$('red-led').style.boxShadow=red?'0 0 18px #ef44448a':'none';
$('green-status').textContent=green;$('green-led').style.background=green?'#22c55e':'#cbd5e1';$('green-led').style.opacity=String(green?Math.max(.25,green/255):1);$('green-led').style.boxShadow=green?'0 0 '+(4+green/15)+'px #22c55e8a':'none';
$('buzz').textContent=buzz?'울림':'정지';$('buzzer').classList.toggle('on',buzz);
$('reason').textContent=step===1?(buzz?'20cm 미만 → 부저 울림':'20cm 이상 → 부저 정지'):step===2?'CDS → 빨간 LED, 가변저항 → 초록 LED. 서로 독립.':'부저(거리), 빨강(조도), 초록(가변저항)은 각각 독립 제어';
$('serial').textContent=(step===1?'dist='+d:(step===2?'cds='+l+' pot='+p+' led='+green:'cds='+l+' pot='+p+' led='+green+' dist='+d));
}
function select(n){notes[step]=$('reflection').value;step=n;const v=lessons[n];
document.querySelectorAll('[data-step]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.step)===n)));
$('step-label').textContent='STEP 0'+n;$('lesson-title').textContent=v.title;$('lesson-desc').textContent=v.desc;$('saved-name').textContent=v.name;
$('tinkercad-link').href='https://www.tinkercad.com/things/'+v.url+'/editel';$('tinkercad-link').textContent='STEP '+n+' Tinkercad 열기 ↗';
$('pin-list').replaceChildren(...v.pins.map(([a,b])=>{const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=a;dd.textContent=b;row.append(dt,dd);return row}));
$('principles').replaceChildren(...v.principles.map(s=>{const e=document.createElement('li');e.textContent=s;return e}));
$('question').textContent=v.question;$('reflection').value=notes[n];
$('distance-control').hidden=n===2;$('light-control').hidden=n===1;$('pot-control').hidden=n===1;
$('red-output').hidden=n===1;$('green-output').hidden=n===1;$('buzzer-output').hidden=n===2;document.querySelector('.presets').hidden=n!==3;update();
}
document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>select(Number(b.dataset.step))));
['distance','light','pot'].forEach(id=>$(id).addEventListener('input',update));
document.querySelectorAll('[data-case]').forEach(b=>b.addEventListener('click',()=>{$('distance').value=b.dataset.case.startsWith('near')?15:35;$('light').value=b.dataset.case.endsWith('dark')?54:974;update()}));
select(1);
