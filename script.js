document.addEventListener('DOMContentLoaded', () => {
  const menuWrapper = document.getElementById('menu-wrapper');
  const menu = document.getElementById('menu');
  const ring = document.getElementById('ring');
  const sectors = Array.from(document.querySelectorAll('.sector'));
  const labels = Array.from(document.querySelectorAll('.label'));
  const videos = [
    document.getElementById('video-0'),
    document.getElementById('video-1'),
    document.getElementById('video-2'),
    document.getElementById('video-3'),
  ];

  const N = 4;
  const stepAngle = 360 / N;
  let rotation = 0;             // grados actuales (0,90,180,270...)
  let animating = false;
  let pointerOverMenu = false;

  // PRELOAD y autoplay tentativa
  videos.forEach(v => {
    try {
      v.muted = true; v.loop = true; v.playsInline = true;
      v.play().catch(()=>{ /* autoplay bloqueado hasta interacción */ });
    } catch (err) {}
  });

  // Mostrar video instantáneo por índice (cambia clase visible)
  function showVideo(idx) {
    videos.forEach((v,i)=> {
      if(i===idx) {
        v.classList.add('visible');
        v.play().catch(()=>{});
      } else {
        v.classList.remove('visible');
      }
    });
  }

  // Colocar labels alrededor y mantener legibles (contra-rotación)
  function setupLabels() {
    const rect = menu.getBoundingClientRect();
    const radius = Math.round(Math.min(rect.width, rect.height) * 0.38);
    labels.forEach(label => {
      const idx = Number(label.dataset.index);
      const baseAngle = idx * stepAngle + stepAngle/2;
      label.dataset.baseAngle = baseAngle;
      // set initial transform
      label.style.transform = `rotate(${baseAngle}deg) translateY(-${radius}px) rotate(0deg)`;
    });
  }
  setupLabels();
  window.addEventListener('resize', setupLabels);

  function updateLabels(rotDeg) {
    const rect = menu.getBoundingClientRect();
    const radius = Math.round(Math.min(rect.width, rect.height) * 0.38);
    labels.forEach(label => {
      const base = Number(label.dataset.baseAngle);
      const angle = base + rotDeg;
      label.style.transform = `rotate(${angle}deg) translateY(-${radius}px) rotate(${-rotDeg}deg)`;
    });
  }

  // Aplicar rotación (visual) y activar aura
  function applyRotation(newDeg) {
    rotation = ((newDeg % 360) + 360) % 360;
    menu.style.transform = `rotate(${rotation}deg)`;
    updateLabels(rotation);
    ring.style.setProperty('--active-angle', `${rotation}deg`);
    ring.classList.add('active');
    clearTimeout(ring._t);
    ring._t = setTimeout(()=> ring.classList.remove('active'), 700);
  }

  // Girar n pasos (n entero, positivo o negativo)
  function rotateSteps(n) {
    if (animating) return;
    animating = true;
    rotation += n * stepAngle;
    applyRotation(rotation);
    // actualizar video al sector que quedó "arriba" (opcional: si quieres solo hover, comenta línea siguiente)
    const indexUp = ((Math.round(((rotation % 360) / stepAngle)) % N) + N) % N;
    showVideo(indexUp);
    setTimeout(()=> animating = false, 500);
  }

  // WHEEL: sólo cuando el puntero esté sobre el menuWrapper
  menuWrapper.addEventListener('pointerenter', () => pointerOverMenu = true);
  menuWrapper.addEventListener('pointerleave', () => pointerOverMenu = false);

  let lastWheel = 0;
  menuWrapper.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (!pointerOverMenu) return;
    const now = Date.now();
    if (now - lastWheel < 80) return; // pequeño throttle para evitar micro pasos
    lastWheel = now;

    // Determinar pasos: usamos deltaY y escalamos a pasos de 90°
    const dy = e.deltaY;
    // normalizar grandes valores (ej: touchpads) => cada 150px => 1 paso
    const rawSteps = Math.round(dy / 150) || (dy > 0 ? 1 : -1);
    // limitar steps
    const steps = Math.max(-3, Math.min(3, rawSteps));
    rotateSteps(steps);
  }, { passive: false });

  // HOVER / POINTER: mostrar video inmediatamente
  sectors.forEach(btn => {
    const idx = Number(btn.dataset.index);
    const vindex = Number(btn.dataset.video);
    // pointerenter es más confiable en manos que mouseenter (soporta touch/pointer)
    btn.addEventListener('pointerenter', (ev) => {
      showVideo(vindex);
      ring.classList.add('active');
      ring.style.setProperty('--active-angle', `${idx * stepAngle}deg`);
    });

    // pointerup/click -> navegar a link
    btn.addEventListener('pointerup', (ev) => {
      // nota: pointerup se dispara en click táctil y mouse; evita problemas con focus
      const link = btn.dataset.link;
      // navegación normal
      if (!link) return;
      // si quieres abrir en nueva pestaña: window.open(link,'_blank')
      window.location.href = link;
    });

    // keyboard accessibility: Enter/Space
    btn.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        const link = btn.dataset.link;
        if (link) window.location.href = link;
      }
    });
  });

  // Desbloquear reproducción de videos al primer gesto del usuario (por políticas de autoplay)
  function unlockPlaybackOnce() {
    videos.forEach(v => {
      try { v.play().catch(()=>{}); } catch(e){}
    });
    document.removeEventListener('pointerdown', unlockPlaybackOnce);
    document.removeEventListener('keydown', unlockPlaybackOnce);
  }
  document.addEventListener('pointerdown', unlockPlaybackOnce);
  document.addEventListener('keydown', unlockPlaybackOnce);

  // Inicializar
  applyRotation(0);
  showVideo(0);

  // Atajos para pruebas
  window.addEventListener('keydown', (e) => {
    if (e.key === 'r') { rotation = 0; applyRotation(0); showVideo(0); }
  });
});
