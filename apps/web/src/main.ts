import 'galmuri/dist/galmuri.css';
import './styles.css';
import { api, setToken, User } from './api/client';
import { initAuth } from './ui/auth';
import { showPanel } from './ui/screens';
import { startGame } from './game/game';
import { setLeft, setRight, queueBurst } from './game/virtualInput';
import type { DifficultyKey, GameResult } from './game/types';

let currentUser: User | null = null;

const resultSummary = document.getElementById('result-summary');
const resultStats = document.getElementById('result-stats');
const leaderboard = document.getElementById('leaderboard');
const retryButton = document.getElementById('retry-button');
const retrySameButton = document.getElementById('retry-same-button');
const exitButton = document.getElementById('exit-button');
const menuExitButton = document.getElementById('menu-exit-button');
const mobileControls = document.getElementById('mobile-controls');
const padControl = document.getElementById('control-pad') as HTMLDivElement | null;
const padThumb = document.getElementById('pad-thumb') as HTMLDivElement | null;
const boostControl = document.getElementById('control-boost');

const isMobile =
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  window.matchMedia('(pointer: coarse)').matches;

document.body.classList.toggle('is-mobile', isMobile);
if (mobileControls) {
  mobileControls.setAttribute('aria-hidden', String(!isMobile));
}

const resetPad = () => {
  setLeft(false);
  setRight(false);
  if (padThumb) {
    padThumb.style.transform = 'translateX(0px)';
  }
};

const updatePad = (clientX: number) => {
  if (!padControl) return;
  const rect = padControl.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const dx = clientX - centerX;
  const deadZone = rect.width * 0.12;
  const maxShift = rect.width * 0.28;
  const clamped = Math.max(-maxShift, Math.min(maxShift, dx));

  if (padThumb) {
    padThumb.style.transform = `translateX(${clamped}px)`;
  }

  if (dx < -deadZone) {
    setLeft(true);
    setRight(false);
  } else if (dx > deadZone) {
    setRight(true);
    setLeft(false);
  } else {
    setLeft(false);
    setRight(false);
  }
};

if (padControl) {
  let activePointerId: number | null = null;

  const handleDown = (event: PointerEvent) => {
    event.preventDefault();
    activePointerId = event.pointerId;
    padControl.setPointerCapture(event.pointerId);
    updatePad(event.clientX);
  };

  const handleMove = (event: PointerEvent) => {
    if (activePointerId !== event.pointerId) return;
    updatePad(event.clientX);
  };

  const handleUp = (event: PointerEvent) => {
    if (activePointerId !== event.pointerId) return;
    activePointerId = null;
    resetPad();
  };

  padControl.addEventListener('pointerdown', handleDown);
  padControl.addEventListener('pointermove', handleMove);
  padControl.addEventListener('pointerup', handleUp);
  padControl.addEventListener('pointerleave', handleUp);
  padControl.addEventListener('pointercancel', handleUp);
}

resetPad();
if (boostControl) {
  boostControl.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    queueBurst();
  });
}

const setResultSummary = (text: string) => {
  if (resultSummary) {
    resultSummary.textContent = text;
  }
};

const setStats = (lines: string[]) => {
  if (!resultStats) return;
  resultStats.innerHTML = lines.map((line) => `<div>${line}</div>`).join('');
};

const setLeaderboard = (entries: Array<{ displayName: string; score: number; height: number }>) => {
  if (!leaderboard) return;
  const rows = entries.length
    ? entries.map((entry, index) =>
        `<div class="leaderboard-item"><span>${index + 1}. ${entry.displayName}</span><span>${entry.score}점</span></div>`
      )
    : ['<div class="leaderboard-item"><span>이번 주 기록이 아직 없습니다.</span><span>-</span></div>'];
  leaderboard.innerHTML = [
    '<h3>이번 주 랭킹 Top 5</h3>',
    ...rows
  ].join('');
};

let lastDifficulty: DifficultyKey = 'easy';

const startRun = (difficulty: DifficultyKey) => {
  lastDifficulty = difficulty;
  showPanel(null);

  startGame({
    difficulty,
    onGameOver: async (result: GameResult) => {
      showPanel('result');
      setResultSummary(`${difficulty.toUpperCase()} 모드 도전 종료!`);
      setStats([
        `점수: ${result.score}`,
        `최대 높이: ${result.height}m`,
        `피한 장애물: ${result.obstaclesAvoided}개`,
        `플레이 타임: ${(result.durationMs / 1000).toFixed(1)}초`
      ]);
      setLeaderboard([]);

      try {
        await api.saveRun({
          difficulty,
          score: result.score,
          height: result.height,
          durationMs: result.durationMs,
          obstaclesAvoided: result.obstaclesAvoided
        });
      } catch (_error) {
        // Keep going so the leaderboard can still load.
      }

      try {
        const board = await api.leaderboard(difficulty, 5);
        setLeaderboard(Array.isArray(board.leaderboard) ? board.leaderboard : []);
      } catch (_error) {
        setLeaderboard([]);
      }
    }
  });
};

initAuth(async (user) => {
  currentUser = user;
});

const difficultyButtons = document.querySelectorAll<HTMLButtonElement>('.difficulty');
difficultyButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const difficulty = (button.dataset.difficulty ?? 'easy') as DifficultyKey;
    startRun(difficulty);
  });
});

retryButton?.addEventListener('click', () => {
  showPanel('menu');
});

retrySameButton?.addEventListener('click', () => {
  startRun(lastDifficulty);
});

exitButton?.addEventListener('click', () => {
  currentUser = null;
  setToken('');
  showPanel('auth');
});

menuExitButton?.addEventListener('click', () => {
  currentUser = null;
  setToken('');
  showPanel('auth');
});

const token = localStorage.getItem('mongbori_token');
if (token) {
  setToken(token);
  api.me()
    .then((result) => {
      currentUser = result.user;
      showPanel('menu');
    })
    .catch(() => {
      showPanel('auth');
    });
} else {
  showPanel('auth');
}
