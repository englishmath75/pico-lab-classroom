// These slots are already permitted by the shared production Firestore rules.
export const scratchIds=Array.from({length:10},(_,i)=>`scratch-${String(i+1).padStart(2,'0')}`);
export function occupiedScratch(items,records,excluded=[]) {
  return new Set([...items.map(item=>item.workspaceId),...excluded,
    ...[...records].filter(([,record])=>record.version>0||record.isDirty()).map(([id])=>id)
  ].filter(id=>scratchIds.includes(id)));
}
export function nextScratch(items,records,excluded=[]) {
  const occupied=occupiedScratch(items,records,excluded);
  const id=scratchIds.find(id=>!occupied.has(id));
  if(!id)throw Error('자유 코드를 10개 모두 사용 중입니다. 내 코드 보관함에서 필요한 코드를 .py로 내려받고, 사용하지 않는 저장본을 삭제한 뒤 새 코드를 만드세요. 기존 코드는 덮어쓰지 않았습니다.');
  return id;
}
