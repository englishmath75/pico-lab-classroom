/**
 * MK 06 · 리스트 뒤집기 비교 실험실.
 * A deterministic educational visualization; the existing Python workbench
 * below the lesson is the actual interpreter. No student data is collected here.
 */
const FIRST = Object.freeze([10, 20, 30, 40, 50]);
const REVERSED = Object.freeze([50, 40, 30, 20, 10]);

export const reverseExamples = Object.freeze({
  slice: 'a = [10, 20, 30, 40, 50]\nresult = a[::-1]\nprint(result)\nprint(a)',
  method: 'a = [10, 20, 30, 40, 50]\nresult = a.reverse()\nprint(result)\nprint(a)',
});

const phaseNames = [
  '1 / 4 · 뒤집기 전, 두 리스트의 출발은 같습니다.',
  '2 / 4 · 슬라이싱은 새 리스트를 만들고, reverse()는 원본을 바꿉니다.',
  '3 / 4 · 출력값을 확인하세요. reverse()의 반환값은 None입니다.',
  '4 / 4 · 메모리와 원본 보존 여부를 비교해 보세요.',
];

let autoplayTimer = null;

export function comparisonStage(requested) {
  const step = Math.max(0, Math.min(3, Math.trunc(Number(requested) || 0)));
  return {
    step,
    slice: {
      original: [...FIRST],
      result: step ? [...REVERSED] : null,
      output: step >= 2 ? '[50, 40, 30, 20, 10]\n[10, 20, 30, 40, 50]' : '',
      memory: step ? 'a → 리스트 A / result → 새 리스트 B' : 'a → 리스트 A',
    },
    method: {
      original: step ? [...REVERSED] : [...FIRST],
      result: step ? 'None' : null,
      output: step >= 2 ? 'None\n[50, 40, 30, 20, 10]' : '',
      memory: step ? 'a → 리스트 A (원본을 제자리에서 변경) / result → None' : 'a → 리스트 A',
    },
  };
}

const escapeCode = value => String(value).replace(/[&<>"]/g, ch => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
}[ch]));

function codeMarkup(text) {
  return text.split('\n').map((line, index) =>
    '<span class="reverse-code-line" data-reverse-code-line="' + index + '">' +
    escapeCode(line) + '</span>'
  ).join('\n');
}

function methodCard(kind, title, eyebrow, code, description) {
  return [
    '<article class="reverse-method reverse-method--' + kind + '" aria-label="' + title + '">',
    '<div class="reverse-method-header"><span class="reverse-method-tag">' + eyebrow + '</span><h4>' + title + '</h4></div>',
    '<pre class="reverse-code" aria-label="' + title + ' Python 코드"><code>' + codeMarkup(code) + '</code></pre>',
    '<p class="reverse-line-label">a · 원본 리스트 <span data-reverse-source-label="' + kind + '">처음 상태</span></p>',
    '<div class="reverse-chips" role="list" aria-label="' + title + ' 원본 리스트" data-reverse-list="' + kind + '-original"></div>',
    '<p class="reverse-line-label">result · 반환받은 값 <span data-reverse-result-label="' + kind + '">아직 실행 전</span></p>',
    '<div class="reverse-chips" role="list" aria-label="' + title + ' 반환값" data-reverse-list="' + kind + '-result"></div>',
    '<div class="reverse-memory" data-reverse-memory="' + kind + '"></div>',
    '<div class="reverse-console"><strong>출력 콘솔</strong><pre data-reverse-output="' + kind + '">실행 후 표시됩니다.</pre></div>',
    '<p class="reverse-card-description">' + description + '</p>',
    '<button type="button" class="reverse-apply" data-reverse-apply="' + kind + '">예제 코드를 Python 편집기에 넣기 →</button>',
    '</article>',
  ].join('');
}

export function reverseCompareMarkup() {
  return [
    '<section class="reverse-lab" id="reverse-compare" aria-labelledby="reverse-compare-heading" data-reverse-step="0">',
    '<div class="reverse-lab-intro"><div><span class="eyebrow">06 / LIST EXPERIMENT</span>',
    '<h3 id="reverse-compare-heading">리스트 뒤집기 비교 실험실</h3>',
    '<p>두 코드는 모두 거꾸로 보이지만 <strong>원본 리스트</strong>와 <strong>반환값</strong>이 다릅니다. 한 단계씩 관찰해 보세요.</p></div>',
    '<span class="reverse-lab-icon" aria-hidden="true">⇄</span></div>',
    '<div class="reverse-controls" aria-label="비교 실험 단계 제어">',
    '<button type="button" data-reverse-control="reset">↺ 처음</button>',
    '<button type="button" data-reverse-control="previous">← 이전</button>',
    '<button type="button" class="primary" data-reverse-control="next">다음 단계 →</button>',
    '<button type="button" data-reverse-control="auto">▶ 자동 재생</button>',
    '<span class="reverse-stage-label" data-reverse-phase role="status" aria-live="polite"></span></div>',
    '<div class="reverse-progress" aria-hidden="true"><i data-reverse-progress></i></div>',
    '<div class="reverse-comparison-grid">',
    methodCard('slice', 'a[::-1]', '① 새로운 리스트 만들기', reverseExamples.slice,
      '<strong>원본 보존:</strong> 슬라이싱은 역순으로 된 새 리스트를 반환합니다. 새로운 리스트 공간이 필요합니다.'),
    methodCard('method', 'a.reverse()', '② 원본 자체 뒤집기', reverseExamples.method,
      '<strong>원본 변경:</strong> reverse()는 기존 리스트의 순서를 제자리에서 바꾸고 None을 반환합니다.'),
    '</div>',
    '<div class="reverse-summary" data-reverse-summary hidden>',
    '<h4>결론 · 두 가지 뒤집기의 차이</h4>',
    '<div class="table-scroll"><table><thead><tr><th>비교</th><th>a[::-1]</th><th>a.reverse()</th></tr></thead>',
    '<tbody><tr><th>원본 a</th><td>그대로 유지</td><td>역순으로 변경</td></tr>',
    '<tr><th>result 값</th><td>새 리스트</td><td>None</td></tr>',
    '<tr><th>추가 공간</th><td>원소 개수에 비례하는 새 리스트 공간</td><td>제자리 변경 · 추가 공간이 작음</td></tr></tbody></table></div>',
    '<p><strong>주의:</strong> <code>result = a.reverse()</code>에서 result는 역순 리스트가 아니라 <code>None</code>입니다.</p>',
    '<p class="hint">참고: <code>reversed(a)</code>는 역순 반복자를 반환합니다. <code>list(reversed(a))</code>로 새 리스트를 만들 수 있습니다.</p></div>',
    '<p class="reverse-live-status" data-reverse-live-status role="status" aria-live="polite">위 비교는 이해를 돕는 시각화입니다. 실제 코드는 아래 Python 편집기에서 실행할 수 있습니다.</p>',
    '</section>',
  ].join('');
}

export function stopReverseCompare() {
  if (autoplayTimer !== null) clearInterval(autoplayTimer);
  autoplayTimer = null;
}

export function wireReverseCompare(room) {
  stopReverseCompare();
  const root = document.getElementById('reverse-compare');
  if (!root) return;
  const within = selector => root.querySelector(selector);
  let step = 0;
  const arrays = ['slice-original', 'slice-result', 'method-original', 'method-result'];

  function drawList(name, value, appearance) {
    const target = within('[data-reverse-list="' + name + '"]');
    target.replaceChildren();
    if (value === null) {
      const mark = document.createElement('span');
      mark.className = 'reverse-placeholder';
      mark.textContent = '아직 실행하지 않았습니다';
      target.append(mark);
      return;
    }
    if (typeof value === 'string') {
      const mark = document.createElement('span');
      mark.className = 'reverse-none';
      mark.textContent = value;
      target.append(mark);
      return;
    }
    value.forEach((number, index) => {
      const chip = document.createElement('span');
      chip.setAttribute('role', 'listitem');
      chip.className = 'reverse-chip reverse-chip--' + appearance;
      chip.style.setProperty('--reverse-delay', String(index * 60) + 'ms');
      chip.textContent = String(number);
      target.append(chip);
    });
  }

  function render(targetStep) {
    step = Math.max(0, Math.min(3, targetStep));
    const state = comparisonStage(step);
    root.dataset.reverseStep = String(step);
    within('[data-reverse-phase]').textContent = phaseNames[step];
    within('[data-reverse-progress]').style.width = String((step + 1) * 25) + '%';
    within('[data-reverse-control="previous"]').disabled = step === 0;
    within('[data-reverse-control="next"]').disabled = step === 3;
    within('[data-reverse-summary]').hidden = step !== 3;

    drawList(arrays[0], state.slice.original, 'original');
    drawList(arrays[1], state.slice.result, 'new');
    drawList(arrays[2], state.method.original, step ? 'mutated' : 'original');
    drawList(arrays[3], state.method.result, 'none');
    within('[data-reverse-source-label="slice"]').textContent = step ? '원본 유지' : '처음 상태';
    within('[data-reverse-source-label="method"]').textContent = step ? '원본 역순 변경' : '처음 상태';
    within('[data-reverse-result-label="slice"]').textContent = step ? '새 리스트 생성' : '아직 실행 전';
    within('[data-reverse-result-label="method"]').textContent = step ? '반환값 None' : '아직 실행 전';
    within('[data-reverse-memory="slice"]').textContent = state.slice.memory;
    within('[data-reverse-memory="method"]').textContent = state.method.memory;
    within('[data-reverse-output="slice"]').textContent = step >= 2 ? state.slice.output : '출력 전';
    within('[data-reverse-output="method"]').textContent = step >= 2 ? state.method.output : '출력 전';

    root.querySelectorAll('[data-reverse-code-line]').forEach(node => {
      const index = Number(node.dataset.reverseCodeLine);
      node.classList.toggle('is-active',
        (step === 0 && index === 0) ||
        (step === 1 && index === 1) ||
        (step === 2 && index >= 2)
      );
    });
  }

  for (const button of root.querySelectorAll('[data-reverse-control]')) {
    button.addEventListener('click', () => {
      const action = button.dataset.reverseControl;
      stopReverseCompare();
      if (action === 'reset') render(0);
      if (action === 'previous') render(step - 1);
      if (action === 'next') render(step + 1);
      if (action === 'auto') {
        render(0);
        autoplayTimer = setInterval(() => {
          if (!root.isConnected) { stopReverseCompare(); return; }
          render(step + 1);
          if (step === 3) stopReverseCompare();
        }, 950);
      }
    });
  }
  root.querySelectorAll('[data-reverse-apply]').forEach(button => {
    button.addEventListener('click', async () => {
      stopReverseCompare();
      const target = button.dataset.reverseApply;
      const status = within('[data-reverse-live-status]');
      if (!Object.prototype.hasOwnProperty.call(reverseExamples, target)) return;
      if (room.isLoading()) {
        status.textContent = '이전 학습 기록을 불러오는 중입니다. 불러온 뒤 다시 눌러 주세요.';
        return;
      }
      if (!await room.guard()) {
        status.textContent = '현재 작성 중인 코드를 보관한 뒤 다시 시도해 주세요.';
        return;
      }
      if (!root.isConnected) return;
      room.setText(reverseExamples[target]);
      status.textContent = (target === 'slice' ? '슬라이싱' : 'reverse()') + ' 예제를 아래 Python 편집기에 넣었습니다. 직접 실행 버튼을 눌러 보세요.';
      document.getElementById('editor')?.scrollIntoView({behavior:'smooth', block:'center'});
    });
  });
  render(0);
}
