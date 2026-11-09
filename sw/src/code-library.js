export const scratchIds=Array.from({length:10},(_,i)=>'scratch-'+String(i+1).padStart(2,'0'));
export function occupiedScratch(items,drafts,excluded=[]){return new Set([...items.map(x=>x.workspaceId),...excluded,...[...drafts.values()].filter(d=>d.version>0||d.dirty).map(d=>d.id)].filter(id=>scratchIds.includes(id)));}
export function nextScratch(items,drafts,excluded=[]){
 const used=occupiedScratch(items,drafts,excluded),id=scratchIds.find(id=>!used.has(id));
 if(!id)throw Error('자유 코드 10개를 모두 사용 중입니다. 내 학습 보관함에서 필요한 코드를 내려받고 사용하지 않는 코드를 삭제해 주세요. 기존 코드는 덮어쓰지 않았습니다.');
 return id;
}
