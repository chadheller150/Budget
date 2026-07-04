// Sparkle background animation — shared across all pages
(function(){
  const canvas = document.createElement('canvas');
  canvas.id = 'sparkleCanvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
  document.body.prepend(canvas);
  // Ensure body content is above sparkles
  document.querySelectorAll('body > *:not(#sparkleCanvas)').forEach(el => { if(el.style) el.style.position = el.style.position || 'relative'; el.style.zIndex = el.style.zIndex || '1'; });

  const ctx = canvas.getContext('2d');
  let sparkles = [];
  const colors = ['#e863a5','#a78bfa','#60a5fa','#4ecdc4','#f59e0b','#f472b6','#34d399'];

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  function createSparkle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speedY: Math.random() * 0.3 + 0.1,
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.7 + 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01
    };
  }

  for (let i = 0; i < 50; i++) sparkles.push(createSparkle());

  function drawSparkle(s) {
    const currentOpacity = s.opacity * (0.5 + 0.5 * Math.sin(s.pulse));
    ctx.save();
    ctx.globalAlpha = currentOpacity;
    ctx.fillStyle = s.color;
    ctx.shadowColor = s.color;
    ctx.shadowBlur = s.size * 3;
    ctx.beginPath();
    const spikes = 4, outerR = s.size * 2, innerR = s.size * 0.8;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const px = s.x + Math.cos(angle) * r;
      const py = s.y + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sparkles.forEach(s => {
      s.y -= s.speedY;
      s.x += s.speedX;
      s.pulse += s.pulseSpeed;
      if (s.y < -10) { s.y = canvas.height + 10; s.x = Math.random() * canvas.width; }
      if (s.x < -10) s.x = canvas.width + 10;
      if (s.x > canvas.width + 10) s.x = -10;
      drawSparkle(s);
    });
    requestAnimationFrame(animate);
  }
  animate();
})();
