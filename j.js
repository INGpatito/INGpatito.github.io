document.addEventListener('click', emitBurst);
function emitBurst() {
  const COUNT = 40;
  for (let i = 0; i < COUNT; i++) {
    const wrapper = document.createElement('div');
    wrapper.className = 'heart-wrapper';

    const angle = Math.random() * Math.PI - Math.PI / 2;
    const speed = 120 + Math.random() * 140;
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed - (100 + Math.random() * 60);
    const scale = 0.8 + Math.random() * 0.6;
    const duration = 800 + Math.random() * 600;

    wrapper.style.setProperty('--dx', `${dx}px`);
    wrapper.style.setProperty('--dy', `${dy}px`);
    wrapper.style.setProperty('--s', scale);
    wrapper.style.setProperty('--dur', `${duration}ms`);

    wrapper.innerHTML = `
      <svg viewBox="0 0 360 360" class="heart-svg">
        <g>
          <path class="heart-left" d="M180 300 C 130 270, 70 230, 70 170 C 70 130, 100 100, 140 100 C 160 100, 175 110, 180 120 L 180 300 Z"/>
          <path class="heart-right" d="M180 300 C 230 270, 290 230, 290 170 C 290 130, 260 100, 220 100 C 200 100, 185 110, 180 120 L 180 300 Z"/>
          <path class="heart-gloss" d="M110 150 q40 -36 80 -18 q-36 6 -62 34 q-10 10 -18 24 q-8 -18 0 -40z"/>
        </g>
      </svg>
    `;

    burst.appendChild(wrapper);
    setTimeout(() => wrapper.remove(), duration + 300);
  }
}