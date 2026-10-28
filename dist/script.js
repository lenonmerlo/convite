const noButton = document.querySelector('#noButton');
const yesButton = document.querySelector('#yesButton');
const actions = document.querySelector('#actions');
const inviteCard = document.querySelector('#inviteCard');
const successCard = document.querySelector('#successCard');
const toast = document.querySelector('#toast');

const excuses = [
  'Tem certeza? 🤨',
  'Pensa no petisco…',
  'O Vasco precisa de você',
  'Essa opção está lesionada',
  'VAR anulou o não',
  'Errou o botão, Matheus',
  'Quase! 😏',
  'Nem o Flamengo corre tanto',
  'Insiste não, vai…',
  'Última chance (mentira)'
];

let attempts = 0;
let lastDodgeAt = 0;
let yesUnlockTimer;
const escapeRoute = [
  [0.92, 0.10],
  [0.08, 0.86],
  [0.08, 0.12],
  [0.90, 0.52],
  [0.88, 0.88],
  [0.08, 0.48],
  [0.52, 0.08],
  [0.48, 0.90]
];

function dodge(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const now = performance.now();
  if (now - lastDodgeAt < 130) return;
  lastDodgeAt = now;
  yesButton.disabled = true;
  clearTimeout(yesUnlockTimer);
  yesUnlockTimer = setTimeout(() => { yesButton.disabled = false; }, 550);
  attempts += 1;

  if (attempts > escapeRoute.length) {
    noButton.classList.add('vanishing');
    toast.textContent = 'Tá bom… o “não” desistiu de competir 😌';
    toast.classList.add('show');
    setTimeout(() => {
      noButton.hidden = true;
      toast.classList.remove('show');
    }, 650);
    return;
  }

  noButton.textContent = excuses[(attempts - 1) % excuses.length];
  if (!noButton.classList.contains('wandering')) {
    document.body.appendChild(noButton);
    noButton.classList.add('wandering');
  }

  const [xRatio, yRatio] = escapeRoute[attempts - 1];
  const button = noButton.getBoundingClientRect();
  const margin = 18;
  const maxX = Math.max(margin, window.innerWidth - button.width - margin);
  const maxY = Math.max(margin, window.innerHeight - button.height - margin);
  const nextX = Math.min(maxX, Math.max(margin, xRatio * window.innerWidth - button.width / 2));
  let nextY = Math.min(maxY, Math.max(margin, yRatio * window.innerHeight - button.height / 2));

  const yesRect = yesButton.getBoundingClientRect();
  const wouldOverlapYes = nextX < yesRect.right + 18
    && nextX + button.width > yesRect.left - 18
    && nextY < yesRect.bottom + 18
    && nextY + button.height > yesRect.top - 18;
  if (wouldOverlapYes) {
    nextY = yesRect.top > window.innerHeight / 2 ? margin : maxY;
  }

  noButton.style.left = `${nextX}px`;
  noButton.style.top = `${nextY}px`;

  if (navigator.vibrate) navigator.vibrate(20);
  if (attempts === 3 || attempts === 7) {
    toast.textContent = attempts === 3 ? 'O botão “não” entrou em modo contra-ataque ⚽' : 'Persistente, hein? O “sim” continua ali 👆';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  }
}

noButton.addEventListener('pointerenter', dodge);
noButton.addEventListener('pointerdown', dodge);
noButton.addEventListener('click', dodge);
noButton.addEventListener('focus', dodge);

document.addEventListener('pointermove', (event) => {
  if (event.pointerType !== 'mouse' || noButton.hidden) return;
  const button = noButton.getBoundingClientRect();
  const centerX = button.left + button.width / 2;
  const centerY = button.top + button.height / 2;
  const dangerRadius = Math.max(145, button.width + 70);
  if (Math.hypot(event.clientX - centerX, event.clientY - centerY) < dangerRadius) {
    dodge(event);
  }
}, { passive: false });

yesButton.addEventListener('click', (event) => {
  if (performance.now() - lastDodgeAt < 550) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  inviteCard.hidden = true;
  successCard.classList.add('visible');
  successCard.setAttribute('aria-hidden', 'false');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (navigator.vibrate) navigator.vibrate([45, 35, 80]);
});
