import { useEffect, useRef } from 'react';
import { KbdRoot } from './styles';

/**
 * 인터랙티브 3D 키보드 (CSS 3D) — 원본 HTML/JS 를 스코프된 React 컴포넌트로 포팅.
 *  - 마우스 드래그로 키판 전체 회전(orbit)
 *  - 키캡 클릭 = 한 번에 눌림 + 청축(기계식) 사운드 (Web Audio)
 *  - 물리 키보드: R/S/K/O/N/H/Enter/Space
 *  - 키: Curriculum / Campus Tour / Alumni / Support / S K O N
 * 모든 DOM/스타일/사운드는 KbdRoot 스코프 안으로 격리되어 전역 충돌이 없다.
 */
const KEYS = [
  { id: 'resume', cls: 'k-yellow', x: 16, y: 16, w: 192, d: 92, code: 'KeyR', html: '<span class="lbl">Curriculum</span>' },
  { id: 'hire', cls: 'k-blue', x: 216, y: 16, w: 192, d: 92, code: 'KeyH', html: '<span class="lbl">Campus<br>Tour</span>' },
  { id: 'menu', cls: 'k-purple', x: 16, y: 116, w: 92, d: 92, code: 'KeyS', html: '<span class="lbl letter">S</span>' },
  { id: 'i', cls: 'k-white', x: 116, y: 116, w: 92, d: 92, code: 'KeyK', html: '<span class="lbl letter">K</span>' },
  { id: 'u2', cls: 'k-white', x: 216, y: 116, w: 92, d: 92, code: 'KeyO', html: '<span class="lbl letter">O</span>' },
  { id: 'support', cls: 'k-green', x: 316, y: 116, w: 92, d: 192, code: 'Space', html: '<span class="lbl">Support</span>' },
  { id: 'works', cls: 'k-navy', x: 16, y: 216, w: 192, d: 92, code: 'Enter', html: '<span class="lbl">Alumni</span>' },
  { id: 'x', cls: 'k-white', x: 216, y: 216, w: 92, d: 92, code: 'KeyN', html: '<span class="lbl letter">N</span>' },
];

export default function MainKeyboard({ onAlumni }) {
  const rootRef = useRef(null);
  const sceneRef = useRef(null);
  const boardRef = useRef(null);
  const soundRef = useRef(null);
  // 한 번만 도는 useEffect 안에서 항상 최신 콜백을 부르도록 ref 로 보관
  const onAlumniRef = useRef(onAlumni);
  useEffect(() => {
    onAlumniRef.current = onAlumni;
  }, [onAlumni]);

  useEffect(() => {
    const root = rootRef.current;
    const scene = sceneRef.current;
    const board = boardRef.current;
    const btnSound = soundRef.current;
    if (!root || !scene || !board) return;

    // 재마운트(StrictMode) 시 중복 방지
    board.innerHTML = '';
    const keysRoot = document.createElement('div');
    keysRoot.className = 'keys';

    const rootCS = getComputedStyle(root);
    const KEYH = parseFloat(rootCS.getPropertyValue('--key-h')) || 60;
    const CASEH = parseFloat(rootCS.getPropertyValue('--case-h')) || 52;
    const BOARDW = parseFloat(rootCS.getPropertyValue('--board-w')) || 424;
    const BOARDH = parseFloat(rootCS.getPropertyValue('--board-h')) || 324;

    const hexToRgb = (h) => {
      h = h.replace('#', '');
      if (h.length === 3) h = h.split('').map((c) => c + c).join('');
      const n = parseInt(h, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const lerpHex = (a, b, t) => {
      const A = hexToRgb(a);
      const B = hexToRgb(b);
      return `rgb(${Math.round(A[0] + (B[0] - A[0]) * t)},${Math.round(A[1] + (B[1] - A[1]) * t)},${Math.round(A[2] + (B[2] - A[2]) * t)})`;
    };

    function buildLayers(host, o) {
      const { w, d, h } = o;
      const R = o.radius ?? 20;
      const topR = o.topR ?? 11;
      const botR = o.botR ?? 8;
      const step = o.step ?? 1.5;
      const frag = document.createDocumentFragment();
      let last = null;
      for (let z = 0; z <= h + 0.0001; z += step) {
        const zz = Math.min(z, h);
        let inset = 0;
        if (zz < botR) {
          const t = botR - zz;
          inset = Math.max(inset, botR - Math.sqrt(Math.max(0, botR * botR - t * t)));
        }
        if (zz > h - topR) {
          const t = zz - (h - topR);
          inset = Math.max(inset, topR - Math.sqrt(Math.max(0, topR * topR - t * t)));
        }
        const layer = document.createElement('span');
        layer.className = 'layer';
        layer.style.width = w - 2 * inset + 'px';
        layer.style.height = d - 2 * inset + 'px';
        layer.style.left = inset + 'px';
        layer.style.top = inset + 'px';
        layer.style.transform = `translateZ(${zz}px)`;
        layer.style.borderRadius = R + 'px';
        const inDome = zz > h - topR - 0.001;
        layer.style.background = inDome ? o.topColor : o.sideColorFn ? o.sideColorFn(zz, h) : o.sideColor;
        frag.appendChild(layer);
        last = layer;
      }
      if (last) {
        last.classList.add('cap');
        if (o.label) last.innerHTML = o.label;
      }
      host.appendChild(frag);
    }

    // 금속 베이스
    const caseEl = document.createElement('div');
    caseEl.className = 'block metal';
    caseEl.style.setProperty('--txt', '#fff');
    buildLayers(caseEl, {
      w: BOARDW, d: BOARDH, h: CASEH, radius: 36, topR: 13, botR: 16, step: 2,
      topColor: 'linear-gradient(132deg, #6b7180 0%, #3b3e47 38%, #1c1d24 72%, #101117 100%)',
      sideColorFn: (z, h) => lerpHex('#0a0b0f', '#565b66', Math.pow(z / h, 0.62)),
    });
    board.appendChild(caseEl);
    board.appendChild(keysRoot);

    const codeMap = {};
    const elById = {};

    KEYS.forEach((k) => {
      const btn = document.createElement('button');
      btn.className = `key ${k.cls}`;
      btn.style.setProperty('--x', k.x + 'px');
      btn.style.setProperty('--y', k.y + 'px');
      btn.style.setProperty('--w', k.w + 'px');
      btn.style.setProperty('--d', k.d + 'px');
      btn.setAttribute('aria-label', k.id);
      btn.dataset.keyid = k.id;
      keysRoot.appendChild(btn);

      const cs = getComputedStyle(btn);
      const topC = cs.getPropertyValue('--top').trim();
      const sideC = cs.getPropertyValue('--side').trim();
      buildLayers(btn, { w: k.w, d: k.d, h: KEYH, radius: 21, topR: 4, botR: 9, step: 1.5, topColor: topC, sideColor: sideC, label: k.html });

      codeMap[k.code] = k.id;
      elById[k.id] = btn;
    });

    const press = (id) => {
      const el = elById[id];
      if (!el || el.classList.contains('pressed')) return;
      el.classList.add('pressed');
    };
    const release = (id) => {
      const el = elById[id];
      if (el) el.classList.remove('pressed');
    };

    // ----- sound (Web Audio) -----
    let soundOn = true;
    let actx = null;
    function clack() {
      if (!soundOn) return;
      try {
        actx = actx || new (window.AudioContext || window.webkitAudioContext)();
        if (actx.state === 'suspended') actx.resume();
        const t = actx.currentTime;
        const burst = (start, freq, hp, peak, dur) => {
          const buf = actx.createBuffer(1, Math.max(1, Math.ceil(actx.sampleRate * dur)), actx.sampleRate);
          const d = buf.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
          const src = actx.createBufferSource();
          src.buffer = buf;
          const bp = actx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.value = freq;
          bp.Q.value = 1.3;
          const hpf = actx.createBiquadFilter();
          hpf.type = 'highpass';
          hpf.frequency.value = hp;
          const g = actx.createGain();
          g.gain.setValueAtTime(0.0001, start);
          g.gain.exponentialRampToValueAtTime(peak, start + 0.0012);
          g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
          src.connect(bp);
          bp.connect(hpf);
          hpf.connect(g);
          g.connect(actx.destination);
          src.start(start);
          src.stop(start + dur + 0.01);
        };
        burst(t, 3800, 2200, 0.55, 0.026);
        burst(t + 0.006, 5400, 3600, 0.3, 0.014);
        const osc = actx.createOscillator();
        const og = actx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(165, t + 0.004);
        osc.frequency.exponentialRampToValueAtTime(85, t + 0.06);
        og.gain.setValueAtTime(0.0001, t + 0.004);
        og.gain.exponentialRampToValueAtTime(0.13, t + 0.009);
        og.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
        osc.connect(og);
        og.connect(actx.destination);
        osc.start(t + 0.004);
        osc.stop(t + 0.08);
      } catch {
        /* noop */
      }
    }

    const onSoundToggle = () => {
      soundOn = !soundOn;
      btnSound.setAttribute('aria-pressed', String(soundOn));
      btnSound.textContent = soundOn ? '🔊 소리 켜짐' : '🔇 소리 꺼짐';
    };
    btnSound?.addEventListener('click', onSoundToggle);

    // ----- physical keyboard -----
    const onKeyDown = (e) => {
      const id = codeMap[e.code];
      if (id) {
        e.preventDefault();
        if (!e.repeat) {
          press(id);
          clack();
        }
      }
    };
    const onKeyUp = (e) => {
      const id = codeMap[e.code];
      if (id) {
        e.preventDefault();
        release(id);
        // 물리 Enter(=Alumni 키)를 떼면 교수진 캐러셀 열기
        if (id === 'works') onAlumniRef.current?.();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // ----- drag to orbit -----
    let rotX = 54;
    let rotZ = -46;
    const applyRot = () => {
      board.style.transform = `rotateX(${rotX}deg) rotateZ(${rotZ}deg)`;
    };
    applyRot();

    let dragging = false;
    let maybeDrag = false;
    let downX = 0;
    let downY = 0;
    let startX = 54;
    let startZ = -46;
    let activeId = null;

    const onPointerDown = (e) => {
      maybeDrag = true;
      dragging = false;
      downX = e.clientX;
      downY = e.clientY;
      startX = rotX;
      startZ = rotZ;
      const btn = e.target && e.target.closest ? e.target.closest('.key') : null;
      activeId = btn ? btn.dataset.keyid : null;
      if (activeId) press(activeId);
      try {
        scene.setPointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    };
    const onPointerMove = (e) => {
      if (!maybeDrag) return;
      const dx = e.clientX - downX;
      const dy = e.clientY - downY;
      if (!dragging && Math.hypot(dx, dy) > 6) {
        dragging = true;
        scene.classList.add('dragging');
        if (activeId) {
          release(activeId);
          activeId = null;
        }
      }
      if (dragging) {
        rotZ = startZ + dx * 0.45;
        rotX = Math.max(16, Math.min(72, startX - dy * 0.45));
        applyRot();
      }
    };
    const onPointerUp = () => {
      if (activeId) {
        if (!dragging) {
          clack();
          // Alumni 키캡을 "클릭"(드래그 아님)하면 교수진 캐러셀 열기
          if (activeId === 'works') onAlumniRef.current?.();
        }
        release(activeId);
        activeId = null;
      }
      maybeDrag = false;
      scene.classList.remove('dragging');
      setTimeout(() => {
        dragging = false;
      }, 0);
    };
    scene.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      scene.removeEventListener('pointerdown', onPointerDown);
      btnSound?.removeEventListener('click', onSoundToggle);
      if (actx && actx.close) actx.close();
      board.innerHTML = '';
    };
  }, []);

  return (
    <KbdRoot ref={rootRef}>
      <div className="stage">
        <div className="scene" ref={sceneRef}>
          <div className="board-wrap">
            <div className="floor-shadow" />
            <div className="board" ref={boardRef} />
          </div>
        </div>
        <div className="hint">
          키를 클릭하거나 <kbd>R</kbd> <kbd>S</kbd> <kbd>K</kbd> <kbd>O</kbd> <kbd>N</kbd>{' '}
          <kbd>H</kbd> <kbd>Enter</kbd> <kbd>Space</kbd> 를 눌러보세요
        </div>
        <div className="controls">
          <button className="toggle" ref={soundRef} aria-pressed="true">
            🔊 소리 켜짐
          </button>
        </div>
      </div>
    </KbdRoot>
  );
}
