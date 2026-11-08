// Student affiliation is independent of the existing SW course roster classId.
// The server-owned catalog routes requests to an existing teacher roster.
export function schoolsFor(config, email) {
  const domain = String(email || '').split('@')[1];
  if (!config?.enabled || !Number.isInteger(config.academicYear)) return [];
  return Object.entries(config.schools || {}).filter(([, s]) => s.active === true && s.emailDomain === domain)
    .map(([id, s]) => ({ ...s, id }));
}

export function enrollmentInput(config, email, fields) {
  const school = schoolsFor(config, email).find(s => s.id === fields.schoolId);
  if (!school) throw Error('학교를 선택해 주세요. 학교 계정의 소속 학교만 신청할 수 있습니다.');
  const grade = Number(fields.grade), classNumber = Number(fields.classNumber);
  if (!fields.grade || !school.grades?.includes(grade)) throw Error('학년을 선택해 주세요.');
  if (!fields.classNumber || !school.classNumbers?.includes(classNumber)) throw Error('반을 선택해 주세요.');
  const displayName = String(fields.displayName || '').trim();
  if (!displayName || displayName.length > 40 || /[\u0000-\u001f<>]/.test(displayName)) throw Error('실제 학생 이름을 1~40자로 입력해 주세요.');
  if (fields.confirmed !== true) throw Error('입력한 학교·학년·반·이름을 확인해 주세요.');
  if (!school.approvalClassId) throw Error('학교의 승인 담당 수업이 아직 설정되지 않았습니다.');
  return {displayName, classId: school.approvalClassId, enrollment: {
    schoolId: school.id, schoolName: school.name, academicYear: config.academicYear, grade, classNumber
  }};
}

export function affiliation(profile) {
  const e = profile?.enrollment;
  return e ? `${e.schoolName} · ${e.academicYear}학년도 ${e.grade}학년 ${e.classNumber}반` : '';
}

export function approvedStudent(profile) { return profile?.status === 'approved' && !!profile.enrollment; }

export function registrationMode(profile, staff) {
  if (staff || (profile?.enrollment && ['approved', 'blocked'].includes(profile.status))) return 'hidden';
  return profile?.status === 'pending' && profile.enrollment ? 'pending' : 'form';
}
