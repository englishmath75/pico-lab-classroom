// Pure signal functions: no storage, network, camera or student identity.
export const animals = [
 ['cat','고양이','별이','#e7b8ff','#875ca8'],['rabbit','토끼','모모','#f6c7da','#b86789'],
 ['dog','강아지','콩이','#eac392','#976a42'],['fox','여우','루미','#f4a86e','#ad572a'],
 ['bear','곰','두리','#bc947c','#715144'],['panda','판다','보리','#f4f3ea','#354656'],
 ['owl','부엉이','누리','#aabfe8','#4b6088'],['frog','개구리','초롱','#addb91','#518453']
];
export const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,Number.isFinite(v)?v:0));
export function extractSignals(result,width=640,height=480){
 const face=result.faceLandmarks?.[0], categories=result.faceBlendshapes?.[0]?.categories;
 if(!face||!categories?.length||!face[33]||!face[263])return null;
 const score=Object.fromEntries(categories.map(x=>[x.categoryName,x.score]));
 const a=face[33],b=face[263];
 // Normalize left-to-right in source image, then invert for mirrored display.
 const dx=Math.abs(b.x-a.x)*width,dy=(b.x>=a.x?b.y-a.y:a.y-b.y)*height;
 return {smile:clamp(((score.mouthSmileLeft||0)+(score.mouthSmileRight||0))/2),
 blink:clamp(((score.eyeBlinkLeft||0)+(score.eyeBlinkRight||0))/2),
 tilt:clamp(-Math.atan2(dy,dx)*180/Math.PI,-30,30)};
}
export function smooth(previous,next,alpha=.4){return {smile:previous.smile+(next.smile-previous.smile)*alpha,blink:next.blink,tilt:previous.tilt+(next.tilt-previous.tilt)*alpha};}
export function classify(s,t={smile:.7,blink:.6,tilt:12},previous={}){
 const gate=(v,limit,active,margin)=>v>=limit-(active?margin:0);
 return {smile:gate(s.smile,t.smile,previous.smile,.05),blink:gate(s.blink,t.blink,previous.blink,.08),tilt:gate(Math.abs(s.tilt),t.tilt,previous.tilt,2)};
}
export function defaultCode(t={smile:.7,blink:.6,tilt:12}){return `# 현재 값 보내기로 위의 세 변수를 갱신하세요.\nif smile_score >= ${t.smile.toFixed(2)}:\n    reaction = "HAPPY"\n    print("활짝 웃기 😄")\nelif smile_score >= 0.4:\n    reaction = "SMILE"\n    print("살짝 웃기 🙂")\nelse:\n    reaction = "NEUTRAL"\n    print("무표정 😐")\n\nif blink_score >= ${t.blink.toFixed(2)}:\n    print("눈이 감겼어요!")\nif abs(head_tilt_deg) >= ${t.tilt}:\n    print("고개가 기울었어요!")\nprint("반응:", reaction)\n`;}
export function snapshotCode(s){return `smile_score = ${s.smile.toFixed(3)}\nblink_score = ${s.blink.toFixed(3)}\nhead_tilt_deg = ${s.tilt.toFixed(1)}\n`;}
export function avatarSVG(kind,small=false){
 const animal=animals.find(a=>a[0]===kind)||animals[0], [,name,,fur,dark]=animal;
 const ear=kind==='rabbit'?`<ellipse cx="111" cy="69" rx="23" ry="60" fill="${fur}"/><ellipse cx="209" cy="69" rx="23" ry="60" fill="${fur}"/><path d="M111 33v57M209 33v57" stroke="#e994b7" stroke-width="13" stroke-linecap="round"/>`:
 ['cat','fox','owl'].includes(kind)?`<path d="M65 139L63 45L133 92M187 92L257 45L255 139" fill="${fur}" stroke="${dark}" stroke-width="5"/><path d="M78 105L78 65L112 92M208 92L242 65L242 105" fill="#efbdc5"/>`:
 kind==='dog'?`<ellipse cx="70" cy="145" rx="31" ry="70" fill="${dark}" transform="rotate(15 70 145)"/><ellipse cx="250" cy="145" rx="31" ry="70" fill="${dark}" transform="rotate(-15 250 145)"/>`:
 `<circle cx="91" cy="96" r="34" fill="${kind==='panda'?dark:fur}"/><circle cx="229" cy="96" r="34" fill="${kind==='panda'?dark:fur}"/>`;
 const patches=kind==='panda'?`<ellipse cx="116" cy="157" rx="30" ry="38" fill="${dark}"/><ellipse cx="204" cy="157" rx="30" ry="38" fill="${dark}"/>`:
 kind==='owl'?'<circle cx="114" cy="155" r="43" fill="#f9f5e7"/><circle cx="206" cy="155" r="43" fill="#f9f5e7"/>':
 kind==='fox'?'<path d="M64 168Q100 257 160 247Q222 257 256 168L198 184L160 225L122 184Z" fill="#fff6df"/>':
 kind==='frog'?'<ellipse cx="160" cy="205" rx="65" ry="36" fill="#dff1b9"/>':'';
 return `<svg viewBox="0 0 320 320" role="img" aria-label="${name} 아바타" xmlns="http://www.w3.org/2000/svg"><ellipse cx="160" cy="293" rx="98" ry="13" fill="#183e5020"/><path d="M98 299Q93 237 160 236Q227 237 222 299" fill="${dark}"/><path d="M143 260L160 279L177 260" fill="#ffe193"/><g class="animal-head">${ear}<ellipse cx="160" cy="168" rx="100" ry="91" fill="${fur}" stroke="${dark}" stroke-width="4"/>${patches}<g class="eyes"><ellipse cx="117" cy="156" rx="10" ry="15" fill="${kind==='panda'?'#fff':dark}"/><ellipse cx="203" cy="156" rx="10" ry="15" fill="${kind==='panda'?'#fff':dark}"/><circle cx="120" cy="152" r="3" fill="white"/><circle cx="206" cy="152" r="3" fill="white"/></g><ellipse cx="92" cy="189" rx="16" ry="9" fill="#e58d9a" opacity=".65"/><ellipse cx="228" cy="189" rx="16" ry="9" fill="#e58d9a" opacity=".65"/>${kind==='owl'?'<path d="M150 180L160 197L170 180Z" fill="#e9a138"/>':`<path d="M151 180Q160 174 169 180L160 189Z" fill="${dark}"/>`}<path class="mouth" d="M133 207Q160 214 187 207" fill="none" stroke="${dark}" stroke-width="6" stroke-linecap="round"/>${kind==='cat'?`<path d="M51 181L83 188M49 204L83 199M237 188L269 181M237 199L271 204" stroke="${dark}" stroke-width="3"/>`:''}</g></svg>`;
}
