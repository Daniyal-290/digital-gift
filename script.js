/* ============================================
   DIGITAL GIFT — SCRIPT v3
   Fixed: hearts, canvas petals, 3D lid opening
   ============================================ */
(function () {
  "use strict";
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => [...(c || document).querySelectorAll(s)];
  const rand = (a, b) => Math.random() * (b - a) + a;

  /* ---- Scene transitions ---- */
  function goToScene(id) {
    const cur = $(".scene.active");
    const nxt = document.getElementById(id);
    if (!nxt || nxt === cur) return;
    const tl = gsap.timeline();
    tl.to(cur, {
      opacity: 0, duration: 0.5, ease: "power2.in",
      onComplete() { cur.classList.remove("active"); }
    });
    tl.set(nxt, { opacity: 0 });
    tl.add(() => nxt.classList.add("active"));
    tl.to(nxt, { opacity: 1, duration: 0.6, ease: "power2.out" });
    tl.add(() => {
      if (id === "scene-cake") initCake();
      if (id === "scene-gallery") initGallery();
      if (id === "scene-bouquet") initBouquet();
    });
  }

  /* ---- Ambient sparkles on gift scene ---- */
  (function () {
    const box = $("#sparkles");
    if (!box) return;
    function dot() {
      const d = document.createElement("div");
      const s = rand(2, 5);
      Object.assign(d.style, {
        position: "absolute", width: s + "px", height: s + "px", borderRadius: "50%",
        left: rand(5, 95) + "%", top: rand(5, 95) + "%", pointerEvents: "none",
        background: "radial-gradient(circle,rgba(255,224,138," + rand(.5, .9) + "),transparent)",
        boxShadow: "0 0 " + s * 3 + "px rgba(255,224,138,.4)"
      });
      box.appendChild(d);
      gsap.fromTo(d, { opacity: 0, scale: 0 },
        {
          opacity: 1, scale: 1, duration: rand(.6, 1.2), ease: "power2.out",
          onComplete() {
            gsap.to(d, {
              opacity: 0, scale: 0, duration: rand(.6, 1.2), delay: rand(.3, 1.5),
              onComplete() { d.remove(); }
            });
          }
        });
    }
    setInterval(dot, 500);
  })();

  /* ============================================
     SECTION 1 — GIFT BOX OPEN
     ============================================ */
  const giftBox = $("#giftBox");
  let opened = false;

  giftBox.addEventListener("click", openGift);
  giftBox.addEventListener("keydown", e => { if (e.key === "Enter") openGift(); });

  function openGift() {
    if (opened) return;
    opened = true;
    const hint = $("#giftHint");
    if (hint) hint.style.display = "none";

    gsap.killTweensOf(giftBox);
    gsap.set(giftBox, { animation: "none" });

    const closed = $("#giftClosed");
    const open = $("#giftOpen");
    const tl = gsap.timeline();

    // 1. Crossfade from closed to open box image (faster)
    tl.to(closed, { opacity: 0, duration: 0.4, ease: "power2.inOut" });
    tl.to(open, { opacity: 1, duration: 0.4, ease: "power2.inOut" }, "-=0.4");
    tl.set(closed, { className: "-=active" });
    tl.set(open, { className: "+=active" });

    // 2. Confetti + hearts burst (minimal count for performance)
    tl.add(() => {
      burstConfetti(35);
      burstHearts(12);
    }, "-=0.15");

    // 3. Brief pause (shortened)
    tl.to({}, { duration: 0.8 });

    // 4. Screen goes dark (faster transition)
    tl.to("#blackOverlay", {
      opacity: 1, duration: 0.8, ease: "power3.in"
    });

    // 5. Switch to cake scene while black
    tl.add(() => goToScene("scene-cake"));

    // 6. Fade out black to reveal cake
    tl.to("#blackOverlay", {
      opacity: 0, duration: 1, delay: 0.15, ease: "power2.out"
    });
  }

  /* ---- CONFETTI ---- */
  function burstConfetti(n) {
    const c = $("#confettiLayer");
    const cols = ["#ff6b81", "#feca57", "#48dbfb", "#ff9ff3", "#54a0ff", "#F0C675"];
    for (let i = 0; i < n; i++) {
      const el = document.createElement("div");
      const w = rand(6, 10), h = rand(w * .4, w * 1.5);
      Object.assign(el.style, {
        position: "absolute", width: w + "px", height: h + "px",
        background: cols[~~rand(0, cols.length)],
        borderRadius: "50%",
        left: "50%", top: "42%", opacity: "1",
        willChange: "transform"
      });
      c.appendChild(el);
      gsap.to(el, {
        x: rand(-300, 300), y: rand(-350, 200),
        rotation: rand(-360, 360), opacity: 0,
        duration: rand(1, 1.8), ease: "power1.out",
        onComplete() { el.remove(); }
      });
    }
  }

  /* ---- FALLING HEARTS ---- */
  function burstHearts(n) {
    const c = $("#heartsLayer");
    const hearts = ["❤️", "💖", "💕"];
    for (let i = 0; i < n; i++) {
      const el = document.createElement("div");
      el.textContent = hearts[~~rand(0, hearts.length)];
      Object.assign(el.style, {
        position: "absolute",
        left: rand(10, 90) + "%",
        top: "-40px",
        fontSize: rand(18, 28) + "px",
        opacity: String(rand(0.7, 0.95)),
        pointerEvents: "none",
        zIndex: "25",
        willChange: "transform"
      });
      c.appendChild(el);

      // Hearts fall from top to bottom with gentle sway
      gsap.to(el, {
        y: window.innerHeight + 60,
        x: rand(-50, 50),
        rotation: rand(-60, 60),
        duration: rand(1.8, 2.8),
        delay: rand(0, 0.6),
        ease: "linear",
        onComplete() { el.remove(); }
      });
    }
  }

  /* ============================================
     SECTION 2 — CAKE
     ============================================ */
  let candlesOut = 0;

  function initCake() {
    gsap.fromTo("#cakeTitle", { y: -40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 0.4, ease: "back.out(1.5)" });
    gsap.fromTo(".cake", { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.8, delay: 0.7, ease: "elastic.out(1,0.55)" });
    gsap.fromTo("#blowHint", { opacity: 0 }, { opacity: 1, delay: 1.5, duration: 0.5 });

    $$(".candle").forEach(c => {
      c.addEventListener("click", () => blowCandle(c));
    });
  }

  function blowCandle(candle) {
    const fw = $(".flame-w", candle);
    const sm = $(".smoke-w", candle);
    if (fw.classList.contains("out")) return;
    fw.classList.add("out");

    // Smoke animation
    gsap.to(sm, {
      height: 30, opacity: 0.6, y: -10, duration: 0.3, ease: "power1.out",
      onComplete() {
        gsap.to(sm, { height: 60, opacity: 0, y: -55, duration: 1.8, ease: "power1.out" });
      }
    });

    candlesOut++;
    if (candlesOut >= 5) setTimeout(allBlown, 700);
  }

  function allBlown() {
    $("#scene-cake").classList.add("celebrate");
    const h = $("#blowHint");
    h.textContent = "🎉 You did it! Make a wish! 🎉";
    gsap.fromTo(h, { scale: 0.8 }, { scale: 1, duration: 0.5, ease: "back.out(2)" });

    const btn = $("#keepGoingBtn");
    btn.classList.remove("hidden");
    gsap.fromTo(btn, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.5, ease: "back.out(1.5)" });
    btn.onclick = () => goToScene("scene-gallery");
  }

  /* ============================================
     SECTION 3 — GALLERY
     ============================================ */
  function initGallery() {
    const pols = $$(".polaroid");
    pols.forEach((p, i) => {
      gsap.fromTo(p, { opacity: 0, y: 100, rotation: rand(-20, 20) },
        { opacity: 1, y: 0, duration: 0.6, delay: i * 0.12, ease: "back.out(1.4)" });
      // Gentle floating
      gsap.to(p, {
        y: "+=" + rand(-10, 10), x: "+=" + rand(-6, 6), rotation: "+=" + rand(-2, 2),
        duration: rand(3, 5), yoyo: true, repeat: -1, ease: "sine.inOut", delay: rand(0, 2)
      });
    });

    const btn = $("#toBouquetBtn");
    btn.classList.remove("hidden");
    gsap.fromTo(btn, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 1, ease: "back.out(1.5)" });
    btn.onclick = () => goToScene("scene-bouquet");

    enableDrag(pols);
    enableOverlay(pols);
  }

  function enableDrag(items) {
    items.forEach(el => {
      let on = false, moved = false, sx, sy;
      el.addEventListener("pointerdown", e => {
        on = true; moved = false; el.classList.add("drag");
        el.setPointerCapture(e.pointerId);
        sx = e.clientX; sy = e.clientY;
        gsap.killTweensOf(el);
      });
      el.addEventListener("pointermove", e => {
        if (!on) return;
        if (Math.abs(e.clientX - sx) > 4 || Math.abs(e.clientY - sy) > 4) moved = true;
        gsap.set(el, { x: "+=" + (e.movementX || 0), y: "+=" + (e.movementY || 0) });
      });
      el.addEventListener("pointerup", () => {
        on = false; el.classList.remove("drag");
        if (!moved) el.dispatchEvent(new Event("tap"));
      });
    });
  }

  function enableOverlay(items) {
    const ov = $("#photoOverlay");
    items.forEach(el => {
      el.addEventListener("tap", () => {
        $(".ov-img", ov).style.background = $(".pol-img", el).style.background;
        $(".ov-cap", ov).textContent = el.dataset.caption;
        $(".ov-date", ov).textContent = el.dataset.date;
        ov.classList.remove("hidden");
        gsap.fromTo(".ov-card", { scale: 0.7, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.8)" });
      });
    });
    $(".ov-close", ov).onclick = () => ov.classList.add("hidden");
    ov.onclick = e => { if (e.target === ov) ov.classList.add("hidden"); };
  }

  /* ============================================
     SECTION 4 — BOUQUET + CANVAS PETALS
     ============================================ */
  const fEmoji = { rose: "🌹", tulip: "🌷", lily: "🌸", sunflower: "🌻" };
  let petalsOn = false;

  function initBouquet() {
    $$(".flower").forEach((f, i) => {
      gsap.fromTo(f, { y: 60, opacity: 0, scale: 0.6 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, delay: i * 0.18, ease: "back.out(1.6)" });
      f.addEventListener("click", () => pluck(f));
    });
    startPetals();
  }

  function pluck(f) {
    gsap.to(f, {
      y: -25, scale: 1.1, duration: 0.25, ease: "power2.out",
      onComplete() { gsap.to(f, { y: 0, scale: 1, duration: 0.5, delay: 0.6, ease: "back.out(1.4)" }); }
    });
    const m = $("#flowerModal");

    // Clone the flower and display it in the modal
    const flowerVisual = $("#modalFlowerVisual", m);
    flowerVisual.innerHTML = ""; // Clear previous flower

    // Create a bouquet of 3 flowers of the same type
    for (let i = 0; i < 3; i++) {
      const clone = f.cloneNode(true);
      clone.style.cssText = `
        transform: scale(0.7) rotate(${(i - 1) * 10}deg);
        margin: 0 -15px;
        filter: none;
        pointer-events: none;
      `;
      const label = clone.querySelector('.f-lbl');
      if (label) label.style.display = 'none'; // Hide the label
      flowerVisual.appendChild(clone);
    }

    $(".modal-icon", m).textContent = fEmoji[f.dataset.flower] || "🌼";
    $(".modal-msg", m).textContent = f.dataset.message;
    m.classList.remove("hidden");
    gsap.fromTo(".modal-card", { scale: 0.5, opacity: 0, rotation: -5 },
      { scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: "back.out(1.8)" });

    const close = () => {
      gsap.to(".modal-card", {
        scale: 0.8, opacity: 0, duration: 0.25,
        onComplete() { m.classList.add("hidden"); }
      });
    };
    $(".modal-close", m).onclick = close;
    m.onclick = e => { if (e.target === m) close(); };
  }

  /* ---- CANVAS FALLING PETALS (GPU, zero DOM lag) ---- */
  function startPetals() {
    if (petalsOn) return;
    petalsOn = true;

    const cvs = document.getElementById("petalCanvas");
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    let W, H;

    function resize() {
      W = cvs.width = cvs.offsetWidth;
      H = cvs.height = cvs.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const MAX = 40;
    const pool = [];

    const colors = [
      [255, 182, 193],  // light pink
      [255, 160, 180],  // pink
      [248, 200, 220],  // pastel pink
      [255, 220, 230],  // blush
      [240, 198, 117],  // gold
      [255, 150, 160],  // rose
    ];

    function makePetal(startY) {
      return {
        x: rand(0, W),
        y: startY !== undefined ? startY : -20,
        size: rand(4, 11),
        vy: rand(0.3, 1.2),
        vx: rand(-0.3, 0.3),
        wobbleAmp: rand(0.4, 1.8),
        wobbleFreq: rand(0.01, 0.03),
        angle: rand(0, Math.PI * 2),
        spin: rand(-0.02, 0.02),
        color: colors[~~rand(0, colors.length)],
        alpha: rand(0.25, 0.6),
        phase: rand(0, Math.PI * 2)
      };
    }

    // Seed some petals across the screen
    for (let i = 0; i < 18; i++) pool.push(makePetal(rand(0, H)));

    let frame = 0;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      frame++;

      // Add new petals periodically
      if (pool.length < MAX && frame % 25 === 0) pool.push(makePetal());

      for (let i = pool.length - 1; i >= 0; i--) {
        const p = pool[i];
        p.y += p.vy;
        p.x += Math.sin(p.phase + frame * p.wobbleFreq) * p.wobbleAmp * 0.3 + p.vx;
        p.angle += p.spin;

        if (p.y > H + 20) { pool.splice(i, 1); continue; }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.alpha;

        // Draw petal shape (ellipse with a notch for realism)
        const [r, g, b] = p.color;
        ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.globalAlpha = p.alpha * 0.3;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(-p.size * 0.2, -p.size * 0.1, p.size * 0.35, p.size * 0.2, -0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ---- INIT ---- */
  gsap.set("#scene-gift", { opacity: 1, scale: 1 });

})();
