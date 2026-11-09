import {enrollmentInput} from './enrollment.js';
export const memberLabels={request:'정보 변경 요청',approve:'정보 변경 승인',reject:'정보 변경 반려',withdraw:'변경 요청 취소',cancel:'등록 취소',reapply:'학급 재신청',status:'승인 상태 변경'};
export const statusLabels={pending:'승인 대기',approved:'승인됨',blocked:'이용 중지',cancelled:'등록 취소'};
export function membershipPatch(before,action,input,now,catalog){
 const next={...before,membershipVersion:(before.membershipVersion||0)+1,updatedAt:now};
 const fields=()=>enrollmentInput(catalog,before.email,{...input,confirmed:true});
 if(action==='request'){
  if(!['pending','approved'].includes(before.status))throw Error('등록 상태를 확인해 주세요.');
  if(before.changeRequest?.status==='pending')throw Error('이미 처리 중인 변경 요청이 있습니다.');
  const data=fields();
  if(data.displayName===before.displayName&&JSON.stringify(data.enrollment)===JSON.stringify(before.enrollment))throw Error('변경할 내용을 입력해 주세요.');
  next.changeRequest={...data,status:'pending',requestedAt:now};
 }else if(['approve','reject','withdraw'].includes(action)){
  if(before.changeRequest?.status!=='pending'||!['pending','approved'].includes(before.status))throw Error('처리할 변경 요청이 없습니다. 새로고침해 주세요.');
  next.changeRequest={...before.changeRequest,status:action==='approve'?'approved':action==='reject'?'rejected':'withdrawn',reviewedAt:now,reviewedBy:input.actorUid,note:String(input.note||'').trim().slice(0,300)};
  if(action==='approve')Object.assign(next,{displayName:before.changeRequest.displayName,classId:before.changeRequest.classId,enrollment:before.changeRequest.enrollment});
 }else if(action==='reapply'){
  if(before.status!=='cancelled')throw Error('등록 취소 상태에서만 재신청할 수 있습니다.');
  Object.assign(next,fields(),{status:'pending',changeRequest:null});
 }else if(action==='status'||action==='cancel'){
  const status=action==='cancel'?'cancelled':input.status;
  const allowed={pending:['approved','cancelled'],approved:['blocked','cancelled'],blocked:['approved','cancelled'],cancelled:['pending']};
  if(!allowed[before.status]?.includes(status))throw Error('허용되지 않은 상태 변경입니다.');
  Object.assign(next,{status,changeRequest:null});
 }else throw Error('지원하지 않는 회원 처리입니다.');
 return next;
}
