// Membership changes never delete learning documents or alter another academic space.
export const MEMBERSHIP_LABELS = { request:'정보 변경 요청', approve:'정보 변경 승인', reject:'정보 변경 반려', withdraw:'변경 요청 취소', cancel:'등록 취소', reapply:'학급 재신청', status:'승인 상태 변경' };
export function membershipPatch(before, action, input, now) {
  const next = { ...before, membershipVersion:(before.membershipVersion || 0)+1, updatedAt:now };
  const validate = () => {
    const name=String(input.displayName || '').trim(), classId=String(input.classId || '');
    if(!name || name.length>80 || !/^class-[12]-([1-9]|1[0-2])$/.test(classId)) throw Error('이름과 학급을 확인해 주세요.');
    if(classId.split('-')[1]!==before.classId.split('-')[1]) throw Error('다른 학년은 학습 공간에서 선택해 별도로 등록해 주세요.');
    return {displayName:name,classId};
  };
  if(action==='request') {
    if(!['pending','approved'].includes(before.status)) throw Error('등록 상태를 확인해 주세요.');
    if(before.changeRequest?.status==='pending') throw Error('이미 처리 중인 변경 요청이 있습니다.');
    const fields=validate();
    if(fields.displayName===before.displayName&&fields.classId===before.classId) throw Error('변경할 내용을 입력해 주세요.');
    next.changeRequest={...fields,status:'pending',requestedAt:now};
  } else if(['approve','reject','withdraw'].includes(action)) {
    if(before.changeRequest?.status!=='pending'||!['pending','approved'].includes(before.status)) throw Error('처리할 변경 요청이 없습니다. 새로고침해 주세요.');
    next.changeRequest={...before.changeRequest,status:action==='approve'?'approved':action==='reject'?'rejected':'withdrawn',reviewedAt:now,reviewedBy:input.actorUid,note:String(input.note||'').trim().slice(0,300)};
    if(action==='approve') Object.assign(next,{displayName:before.changeRequest.displayName,classId:before.changeRequest.classId});
  } else if(action==='reapply') {
    if(before.status!=='cancelled') throw Error('등록 취소 상태에서만 재신청할 수 있습니다.');
    Object.assign(next,validate(),{status:'pending',changeRequest:null});
  } else if(action==='cancel'||action==='status') {
    const status=action==='cancel'?'cancelled':input.status;
    if(!['pending','approved','blocked','cancelled'].includes(status)||status===before.status) throw Error('변경할 승인 상태를 확인해 주세요.');
    Object.assign(next,{status,changeRequest:null});
  } else throw Error('지원하지 않는 회원 처리입니다.');
  return next;
}
