// No code, identity, or Firebase token is persisted on a shared computer.
export function clearTemporaryLessons() {
  try {for(const key of Object.keys(sessionStorage))if(key.startsWith('englishmath-temporary:'))sessionStorage.removeItem(key);}catch{}
}
export class StudentSession {
  constructor() { this.generation = 0; this.uid = null; this.code = ''; this.version = 0; this.dirty = false; this.edit = 0; }
  change(uid) { this.generation++; this.uid = uid; this.code = ''; this.version = 0; this.dirty = false; this.edit = 0; return this.generation; }
  set(code) { this.code = code; this.dirty = true; this.edit++; }
  checkpoint() { return { generation: this.generation, uid: this.uid, edit: this.edit, code: this.code, version: this.version }; }
  current(snapshot) { return this.generation === snapshot.generation && this.uid === snapshot.uid; }
  saved(snapshot, version) {
    if (!this.current(snapshot)) return false;
    this.version = version;
    if (this.edit === snapshot.edit) this.dirty = false;
    return true;
  }
}
