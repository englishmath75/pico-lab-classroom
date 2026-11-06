// The classroom owns authentication. The experience receives no account data
// and keeps its Python runner in the existing opaque, camera-free sandbox.
let activeView = null;

export function avatarMarkup() {
  return `<div class="page-heading avatar-heading"><span class="eyebrow">추가 체험 / 표정과 조건문</span><h1 tabindex="-1">AI 표정 아바타 실험실</h1><p>MK의 로그인 상태를 유지하며 동물 친구와 Python 조건문을 체험하세요.</p></div>
<section class="avatar-session-note" aria-label="아바타 체험 안내"><strong>계정에 저장하지 않는 체험입니다.</strong><p>아바타 선택·표정 값·미션 결과·이 체험의 Python 코드는 임시값입니다. 다른 페이지로 이동하거나 학습을 마치면 지워집니다. 얼굴 영상과 점수는 내 PC 안에서만 처리합니다.</p></section>
<section id="avatar-view" aria-label="AI 표정 아바타 체험"><div class="avatar-view-controls"><p id="avatar-view-status" class="hint" role="status" aria-live="polite">체험을 불러오고 있습니다. 카메라는 시작 버튼을 눌러야 켜집니다.</p><button id="avatar-restart" hidden>체험 다시 열기</button></div><div id="avatar-frame-host"></div></section>`;
}

export function mountAvatarView({ onActivity = () => {}, onNavigate = () => {} } = {}) {
  activeView?.detach();
  const host = document.getElementById('avatar-frame-host');
  const status = document.getElementById('avatar-view-status');
  const restart = document.getElementById('avatar-restart');
  if (!host || !status || !restart) {
    activeView = null;
    return;
  }

  let frame = null;
  let readyTimer = null;
  let receive = null;

  function stop() {
    clearTimeout(readyTimer);
    readyTimer = null;
    if (receive) removeEventListener('message', receive);
    receive = null;
    if (frame) {
      // Synchronous, same-origin teardown stops tracks and pending model work
      // before removing the browsing context and its nested Python worker.
      try {
        frame.contentWindow?.dispatchEvent(new frame.contentWindow.Event('mk-avatar-dispose'));
      } catch {
        // Removing the context also releases its media/worker resources if
        // loading failed or the browser has already detached the document.
      }
      frame.remove();
      frame = null;
    }
    if (host.isConnected) {
      status.classList.remove('error');
      status.textContent = '체험을 종료하고 카메라와 임시값을 지웠습니다. 다시 열면 처음부터 체험합니다.';
      restart.hidden = false;
    }
  }

  function start() {
    stop();
    if (!host.isConnected) return;
    restart.hidden = true;
    status.classList.remove('error');
    status.textContent = '체험을 불러오고 있습니다. 카메라는 시작 버튼을 눌러야 켜집니다.';
    const current = document.createElement('iframe');
    current.id = 'avatar-experience-frame';
    current.className = 'avatar-experience-frame';
    current.title = 'AI 표정 아바타 · 계정에 저장하지 않는 임시 체험';
    current.setAttribute('allow', "camera 'self'; microphone 'none'");
    current.setAttribute('referrerpolicy', 'no-referrer');
    current.src = new URL('./ai-avatar-experience.html?embedded=1', import.meta.url).href;
    frame = current;

    receive = event => {
      if (frame !== current || event.source !== current.contentWindow || event.origin !== location.origin) return;
      const message = event.data;
      if (!message || message.type !== 'mk-avatar') return;
      if (message.event === 'ready') {
        clearTimeout(readyTimer);
        readyTimer = null;
        status.classList.remove('error');
        status.textContent = '체험 준비 완료 · 카메라는 시작 버튼을 눌러야 켜집니다.';
        restart.hidden = true;
      } else if (message.event === 'resize' && Number.isFinite(message.height)) {
        current.style.height = Math.max(400, Math.min(30000, Math.ceil(message.height))) + 'px';
      } else if (message.event === 'notices') {
        onNavigate();
      } else if (message.event === 'activity') {
        // Only trusted input inside this frame sends this signal; animation,
        // face tracking, resize messages and Python output never renew login.
        onActivity();
      }
    };
    addEventListener('message', receive);
    readyTimer = setTimeout(() => {
      if (frame !== current || !host.isConnected) return;
      status.textContent = '체험 화면을 준비하지 못했습니다. 인터넷 연결을 확인한 뒤 다시 열어 주세요.';
      status.classList.add('error');
      restart.hidden = false;
    }, 20000);
    host.replaceChildren(current);
  }

  restart.onclick = () => { onActivity(); start(); };
  activeView = {
    stop,
    detach() {
      stop();
      restart.onclick = null;
    },
  };
  start();
}

export function stopAvatarView() {
  activeView?.stop();
}
