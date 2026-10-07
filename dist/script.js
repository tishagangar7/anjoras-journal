const pages = [...document.querySelectorAll('.spread')];
const prev = document.querySelector('#prevBtn');
const next = document.querySelector('#nextBtn');
const dots = document.querySelector('#dots');
const counter = document.querySelector('#counter');
const progress = document.querySelector('#progressBar');
let current = 0;
let busy = false;

pages.forEach((page, index) => {
  const dot = document.createElement('button');
  dot.setAttribute('aria-label', `Open ${page.dataset.title}`);
  dot.addEventListener('click', () => show(index));
  dots.appendChild(dot);
});

function pauseHiddenMedia(activePage) {
  document.querySelectorAll('video').forEach(video => {
    if (!activePage.contains(video)) video.pause();
  });
}

function show(index, direction = index > current ? 1 : -1) {
  if (busy || index < 0 || index >= pages.length || index === current) return;
  busy = true;
  const old = pages[current];
  const incoming = pages[index];
  old.classList.add(direction > 0 ? 'turn-forward' : 'turn-back');
  incoming.classList.add('active', direction > 0 ? 'arrive-forward' : 'arrive-back');
  incoming.scrollTop = 0;
  current = index;
  update();
  pauseHiddenMedia(incoming);
  window.setTimeout(() => {
    pages.forEach((page, i) => {
      page.classList.toggle('active', i === current);
      page.classList.remove('turn-forward', 'turn-back', 'arrive-forward', 'arrive-back');
    });
    busy = false;
  }, 620);
}

function update() {
  const isCover = current === 0;
  counter.textContent = isCover ? 'cover' : `${current} / ${pages.length - 1}`;
  progress.style.width = `${(current / (pages.length - 1)) * 100}%`;
  prev.disabled = current === 0;
  next.disabled = current === pages.length - 1;
  [...dots.children].forEach((dot, i) => dot.classList.toggle('active', i === current));
  document.body.dataset.page = current;
}

prev.addEventListener('click', () => show(current - 1, -1));
next.addEventListener('click', () => show(current + 1, 1));
document.querySelectorAll('[data-next]').forEach(el => el.addEventListener('click', () => show(current + 1, 1)));
document.querySelectorAll('[data-go]').forEach(el => el.addEventListener('click', () => show(Number(el.dataset.go), -1)));

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'PageDown') show(current + 1, 1);
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') show(current - 1, -1);
});

let touchX = 0;
document.addEventListener('touchstart', event => { touchX = event.changedTouches[0].clientX; }, { passive: true });
document.addEventListener('touchend', event => {
  const delta = event.changedTouches[0].clientX - touchX;
  if (Math.abs(delta) > 70) show(current + (delta < 0 ? 1 : -1), delta < 0 ? 1 : -1);
}, { passive: true });

document.querySelectorAll('video').forEach(video => {
  video.addEventListener('play', () => {
    document.querySelectorAll('video').forEach(other => { if (other !== video) other.pause(); });
  });
});

update();
