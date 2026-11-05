const names=['activities','lessons','codeup','questions','codeup-candidates'];
const values=await Promise.all(names.map(async name=>{const r=await fetch('./content/'+name+'.json');if(!r.ok)throw Error('수업 자료를 읽지 못했습니다: '+name);return r.json();}));
export const [activities,lessons,codeup,questions,candidates]=values;
export const activityById=new Map(activities.map(a=>[a.id,a]));
