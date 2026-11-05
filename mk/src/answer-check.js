const codeQuestions = new Set(['q02', 'q04', 'q06', 'q14', 'q22', 'q27', 'q30', 'q32', 'q36', 'q39']);
const listQuestions = new Set(['q05', 'q07', 'q08', 'q09', 'q10', 'q12', 'q23']);
const spacedOutputs = new Set(['q19', 'q29', 'q38']);

// Compare these short, single-line model answers without executing student input.
// Token boundaries and spaces INSIDE strings carry meaning; formatting spaces
// between tokens and a choice of single/double quote delimiters do not.
function tokens(source) {
  const result = [];
  let rest = source.trim();
  while (rest) {
    const space = /^[ \t]+/.exec(rest);
    if (space) { rest = rest.slice(space[0].length); continue; }
    const string = /^(f|r|u|b|fr|rf|br|rb)?("(?:\\[^\r\n]|[^"\\\r\n])*"|'(?:\\[^\r\n]|[^'\\\r\n])*')/i.exec(rest);
    if (string) {
      result.push(['string', (string[1] || '').toLowerCase(), string[2].slice(1, -1)]);
      rest = rest.slice(string[0].length); continue;
    }
    const token = /^(?:[A-Za-z_][A-Za-z_0-9]*|[0-9]+(?:\.[0-9]+)?|\+=|-=|\*=|\/=|==|!=|<=|>=|\/\/|\*\*|[()[\]{},.:+*\/%=<>-])/.exec(rest);
    if (!token) return null;
    result.push(['token', token[0]]); rest = rest.slice(token[0].length);
  }
  return result;
}

export function answerMatches(question, answer) {
  if (question.mode === 'self' || typeof answer !== 'string') return false;
  const expected = question.expected.trim(), supplied = answer.trim();
  if (codeQuestions.has(question.id) || listQuestions.has(question.id)) {
    const actualTokens = tokens(supplied), expectedTokens = tokens(expected);
    return actualTokens !== null && expectedTokens !== null && JSON.stringify(actualTokens) === JSON.stringify(expectedTokens);
  }
  if (spacedOutputs.has(question.id)) return supplied.replace(/\s+/g, ' ') === expected;
  if (question.id === 'q31') return supplied.split('/').map(value => value.trim()).join('/') === expected;
  return supplied === expected;
}
