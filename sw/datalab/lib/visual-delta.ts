export interface OriginItem {originId:string;value:unknown}
export function listDelta(before:OriginItem[],after:OriginItem[]) {
 if(new Set(before.map(v=>v.originId)).size!==before.length||new Set(after.map(v=>v.originId)).size!==after.length)throw Error('origin ID must be unique');
 return {removed:before.filter(a=>!after.some(b=>b.originId===a.originId)),after:after.map((item,index)=>{const old=before.findIndex(v=>v.originId===item.originId);return {...item,state:old<0?'added':JSON.stringify(before[old].value)!==JSON.stringify(item.value)?'modified':old!==index?'moved':'unchanged',previous:old};})};
}
