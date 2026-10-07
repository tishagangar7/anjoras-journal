const pages = [...document.querySelectorAll('.sheet')];
const prev = document.querySelector('#prevBtn');
const next = document.querySelector('#nextBtn');
const dots = document.querySelector('#dots');
const counter = document.querySelector('#counter');
const progress = document.querySelector('#progressBar');
let current = 0;
let busy = false;

document.querySelectorAll('[data-cutout]').forEach((word, wordIndex) => {
  const text = word.dataset.cutout;
  word.textContent = '';
  [...text].forEach((letter, index) => {
    const piece = document.createElement('span');
    piece.textContent = letter === ' ' ? '·' : letter;
    piece.style.setProperty('--r', `${((index * 7 + wordIndex * 4) % 11) - 5}deg`);
    word.appendChild(piece);
  });
});

pages.forEach((page, index) => {
  const dot = document.createElement('button');
  dot.setAttribute('aria-label', `Open ${page.dataset.title}`);
  dot.addEventListener('click', () => show(index));
  dots.appendChild(dot);
});

function pauseOtherVideos(activePage) {
  document.querySelectorAll('video').forEach(video => {
    if (!activePage.contains(video)) video.pause();
  });
}

function update() {
  counter.textContent = current === 0 ? 'cover' : `${current} / ${pages.length - 1}`;
  progress.style.width = `${(current / (pages.length - 1)) * 100}%`;
  prev.disabled = current === 0;
  next.disabled = current === pages.length - 1;
  [...dots.children].forEach((dot, index) => dot.classList.toggle('active', index === current));
}

function show(index, direction = index > current ? 1 : -1) {
  if (busy || index < 0 || index >= pages.length || index === current) return;
  busy = true;
  const outgoing = pages[current];
  const incoming = pages[index];
  outgoing.classList.add(direction > 0 ? 'turn-forward' : 'turn-back');
  incoming.classList.add('active', direction > 0 ? 'arrive-forward' : 'arrive-back');
  current = index;
  update();
  pauseOtherVideos(incoming);
  window.setTimeout(() => {
    pages.forEach((page, pageIndex) => {
      page.classList.toggle('active', pageIndex === current);
      page.classList.remove('turn-forward', 'turn-back', 'arrive-forward', 'arrive-back');
    });
    busy = false;
  }, 680);
}

prev.addEventListener('click', () => show(current - 1, -1));
next.addEventListener('click', () => show(current + 1, 1));
document.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => show(current + 1, 1)));
document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => show(Number(button.dataset.go), -1)));

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') show(current + 1, 1);
  if (event.key === 'ArrowLeft') show(current - 1, -1);
});

let touchStartX = 0;
document.addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
document.addEventListener('touchend', event => {
  const distance = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(distance) > 70) show(current + (distance < 0 ? 1 : -1), distance < 0 ? 1 : -1);
}, { passive: true });

document.querySelectorAll('video').forEach(video => {
  video.addEventListener('play', () => {
    document.querySelectorAll('video').forEach(other => { if (other !== video) other.pause(); });
  });
});

update();
