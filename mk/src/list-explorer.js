export const LIST_OPERATIONS = Object.freeze([
  '처음', 'a[3]="테스트"', 'append(60)', 'insert(1,15)', 'remove(20)',
  'del a[0]', 'a[1:3]', 'a[:3]', 'a[2:]', 'a[::2]', 'a[::-1]',
]);
export const initialList = () => [10, 20, 30, 40, 50];
export const formatList = values => '[' + values.map(value => JSON.stringify(value)).join(', ') + ']';

// One click is one Python operation on the current list. Returned snapshots
// never share a mutable array, so slicing cannot replace a or rewrite history.
export function applyListOperation(values, operation) {
  const before = [...values];
  let current = [...values], output, explanation, error = null, sliced = false;
  const fail = (kind, message) => { error = kind; explanation = `${kind}: ${message} 리스트는 바뀌지 않았습니다.`; };
  switch (operation) {
    case '처음':
      current = initialList();
      explanation = '처음 리스트로 되돌렸습니다. 인덱스는 0부터 시작합니다.';
      break;
    case 'a[3]="테스트"':
      if (current.length < 4) fail('IndexError', '인덱스 3이 없습니다.');
      else { current[3] = '테스트'; explanation = '인덱스 3의 값만 수정했습니다. 길이와 다른 값은 그대로입니다.'; }
      break;
    case 'append(60)':
      current.push(60);
      explanation = `끝에 60을 추가했습니다. 새 값의 인덱스는 ${before.length}입니다. 앞의 값은 그대로입니다.`;
      break;
    case 'insert(1,15)': {
      const index = Math.min(1, current.length);
      current.splice(index, 0, 15);
      explanation = `인덱스 ${index}에 15를 삽입했습니다. 그 자리부터의 값들은 한 칸씩 뒤로 이동합니다.`;
      break;
    }
    case 'remove(20)': {
      const index = current.indexOf(20);
      if (index < 0) fail('ValueError', '현재 리스트에 값 20이 없습니다.');
      else { current.splice(index, 1); explanation = `처음 만난 값 20(인덱스 ${index})을 삭제했습니다. 뒤의 값들이 한 칸씩 앞으로 이동합니다.`; }
      break;
    }
    case 'del a[0]':
      if (!current.length) fail('IndexError', '빈 리스트에는 인덱스 0이 없습니다.');
      else {
        const removed = current.shift();
        explanation = `인덱스 0의 값 ${JSON.stringify(removed)}을 삭제했습니다. ` +
          (current.length ? `${JSON.stringify(current[0])}이 새 0번 값입니다.` : '이제 빈 리스트입니다.');
      }
      break;
    case 'a[1:3]': output = current.slice(1, 3); sliced = true; break;
    case 'a[:3]': output = current.slice(0, 3); sliced = true; break;
    case 'a[2:]': output = current.slice(2); sliced = true; break;
    case 'a[::2]': output = current.filter((_, index) => index % 2 === 0); sliced = true; break;
    case 'a[::-1]': output = [...current].reverse(); sliced = true; break;
    default: throw new RangeError('알 수 없는 리스트 명령입니다.');
  }
  if (sliced) explanation = '현재 a에서 만든 새 리스트입니다. 결과의 인덱스는 0부터 시작하며, a는 바뀌지 않았습니다.';
  return { before, current, output: output ?? [...current], explanation, error, sliced };
}

// Retain the existing green/red/yellow/purple meaning for the actual current list.
export function listHighlights(result, operation) {
  const before = result.before.map(() => ''), after = result.output.map(() => '');
  if (result.error || operation === '처음') return {before, after};
  if (result.sliced) {
    let indexes = result.before.map((_, index) => index);
    if (operation === 'a[1:3]') indexes = indexes.slice(1, 3);
    if (operation === 'a[:3]') indexes = indexes.slice(0, 3);
    if (operation === 'a[2:]') indexes = indexes.slice(2);
    if (operation === 'a[::2]') indexes = indexes.filter(index => index % 2 === 0);
    if (operation === 'a[::-1]') indexes.reverse();
    indexes.forEach(index => { before[index] = 'selected'; });
    after.fill('selected');
  } else if (operation === 'a[3]="테스트"') {
    before[3] = 'removed'; after[3] = 'added';
  } else if (operation === 'append(60)') {
    after[after.length - 1] = 'added';
  } else if (operation === 'insert(1,15)') {
    const index = Math.min(1, result.before.length);
    after[index] = 'added'; after.fill('moved', index + 1);
  } else {
    const index = operation === 'remove(20)' ? result.before.indexOf(20) : 0;
    before[index] = 'removed'; after.fill('moved', index);
  }
  return {before, after};
}

export function mountListExplorer(root) {
  let current = initialList();
  const find = id => root.querySelector('#' + id);
  const captions = {added:'추가·수정', removed:'삭제·이전 값', moved:'인덱스 이동', selected:'선택된 값'};
  const draw = (element, values, marks) => {
    element.replaceChildren();
    if (!values.length) {
      const empty = document.createElement('p');
      empty.className = 'hint'; empty.textContent = '[] · 빈 리스트'; element.append(empty);
    }
    values.forEach((value, index) => {
      const cell = document.createElement('div'), label = document.createElement('small'), text = document.createElement('strong');
      const mark = marks[index], caption = captions[mark];
      cell.className = 'list-cell' + (mark ? ` list-cell--${mark}` : '');
      cell.setAttribute('aria-label', `인덱스 ${index}, 값 ${value}` + (caption ? `, ${caption}` : ''));
      label.textContent = `인덱스 ${index}`; text.textContent = String(value);
      cell.append(label, text);
      if (caption) {
        const tag = document.createElement('span'); tag.className = 'list-cell-tag'; tag.textContent = caption; cell.append(tag);
      }
      element.append(cell);
    });
  };
  const run = operation => {
    const result = applyListOperation(current, operation);
    current = result.current;
    const marks = listHighlights(result, operation);
    draw(find('list-before'), result.before, marks.before); draw(find('list-after'), result.output, marks.after);
    find('list-after-label').textContent = result.sliced ? '슬라이싱 결과 · 새 리스트' : '실행 후 a';
    find('list-operation').textContent = `${operation} → ${result.explanation}`;
    find('list-operation').classList.toggle('error', !!result.error);
    find('list-current').textContent = '현재 a = ' + formatList(current);
    root.querySelectorAll('[data-list-op]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.listOp === operation)));
  };
  root.querySelectorAll('[data-list-op]').forEach(button => { button.onclick = () => run(button.dataset.listOp); });
  run('처음');
}
