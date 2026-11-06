/** Ignore spacing around tuple/list punctuation, never inside a token. */
export function normalizePrediction(text:string){return text.trim().replace(/\s*([()[\],])\s*/g,'$1');}
