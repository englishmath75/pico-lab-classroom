/**
 * The first SW DataFrame lesson intentionally uses only pandas.
 * No fake data.csv path is introduced: the small authored table becomes
 * a literal DataFrame. Later lessons retain real CSV parsing through StringIO.
 */
export function buildDataLabProgram(csv: string, operation: string, lessonId: string): string {
  if (lessonId !== "SW01") {
    return `import pandas as pd
from io import StringIO
csv_text = ${JSON.stringify(csv)}
df = pd.read_csv(StringIO(csv_text))
${operation}`;
  }

  const lines = csv.trim().split(/\r?\n/).map((line) => line.split(",").map((cell) => cell.trim()));
  const [columns, ...rows] = lines;
  if (!columns || columns.length !== 2 || rows.length === 0 ||
      rows.some((row) => row.length !== 2) || columns.some((name) => !name)) {
    throw new Error("첫 수업의 2열 예제 자료가 올바르지 않습니다.");
  }
  const cellToPython = (cell: string) =>
    /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?$/.test(cell) ? cell : JSON.stringify(cell);
  const columnLiteral = columns.map((column, i) => {
    const values = rows.map((row) => cellToPython(row[i]));
    return `    ${JSON.stringify(column)}: [${values.join(", ")}]`;
  }).join(",\n");
  return `import pandas as pd

# 첫 수업: 상품과 판매량을 직접 표로 만들기
df = pd.DataFrame({
${columnLiteral}
})
${operation}`;
}
