(function () {
  window.handleLogoFallback = handleLogoFallback;
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }
  if (!document.getElementById('hero')) return;
    function handleLogoFallback(img) {
      const step = parseInt(img.dataset.fb || '0', 10);
      img.dataset.fb = String(step + 1);
      if (step === 0) img.src = '/icon-512.png';
      else if (step === 1) img.src = '/apple-touch-icon.png';
      else if (step === 2) img.src = '/logo.png';
    }

    function roundedRect(w, h, r) {
      const s = new THREE.Shape();
      const x = -w / 2, y = -h / 2;
      s.moveTo(x + r, y);
      s.lineTo(x + w - r, y);
      s.quadraticCurveTo(x + w, y, x + w, y + r);
      s.lineTo(x + w, y + h - r);
      s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      s.lineTo(x + r, y + h);
      s.quadraticCurveTo(x, y + h, x, y + h - r);
      s.lineTo(x, y + r);
      s.quadraticCurveTo(x, y, x + r, y);
      return s;
    }

    function attachOrbit(canvas, group, initY = 0.4, initX = 0.1) {
      const st = { enabled: true, drag: false, px: 0, py: 0, ry: initY, rx: initX, try: initY, trx: initX };
      const down = (x, y) => { if (!st.enabled) return; st.drag = true; st.px = x; st.py = y; };
      const move = (x, y) => {
        if (!st.enabled || !st.drag) return;
        st.try += (x - st.px) * 0.011;
        st.trx = Math.max(-0.85, Math.min(0.85, st.trx + (y - st.py) * 0.008));
        st.px = x; st.py = y;
      };
      const up = () => { st.drag = false; };
      canvas.addEventListener('mousedown', (e) => down(e.clientX, e.clientY));
      window.addEventListener('mousemove', (e) => move(e.clientX, e.clientY));
      window.addEventListener('mouseup', up);
      canvas.addEventListener('touchstart', (e) => { if (e.touches.length === 1) down(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
      canvas.addEventListener('touchmove', (e) => { if (st.enabled && st.drag && e.touches.length === 1) move(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
      canvas.addEventListener('touchend', up);
      return {
        st,
        reset() { st.try = initY; st.trx = initX; },
        update(spin = 0.004) {
          if (!st.drag) st.try += spin;
          st.ry += (st.try - st.ry) * 0.1;
          st.rx += (st.trx - st.rx) * 0.1;
          group.rotation.y = st.ry;
          group.rotation.x = st.rx;
        }
      };
    }

    let deferredPwaPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPwaPrompt = e;
    });

    window.onload = function () {
      // PWA Install Modal & Native Prompt Hook
      const pwaModal = document.getElementById('pwa-modal');
      const openPwa = () => { if (pwaModal) { pwaModal.classList.remove('hidden'); pwaModal.classList.add('flex'); } };
      const closePwa = () => { if (pwaModal) { pwaModal.classList.add('hidden'); pwaModal.classList.remove('flex'); } };
      const btnPwa = document.getElementById('btn-pwa-install');
      if (btnPwa) btnPwa.addEventListener('click', openPwa);
      const btnClosePwa = document.getElementById('btn-close-pwa');
      if (btnClosePwa) btnClosePwa.addEventListener('click', closePwa);
      const btnTriggerPwa = document.getElementById('btn-trigger-pwa');
      if (btnTriggerPwa) {
        btnTriggerPwa.addEventListener('click', async () => {
          if (deferredPwaPrompt) {
            deferredPwaPrompt.prompt();
            await deferredPwaPrompt.userChoice;
            deferredPwaPrompt = null;
          }
          closePwa();
        });
      }

      // AI Bench Drawer Logic (Surprise #4)
      const aiDrawer = document.getElementById('ai-drawer');
      const aiMsgs = document.getElementById('ai-messages');
      const btnOpenAi = document.getElementById('btn-open-ai');
      const btnCloseAi = document.getElementById('btn-close-ai');
      if (btnOpenAi && aiDrawer) {
        btnOpenAi.addEventListener('click', () => {
          const isOpen = !aiDrawer.classList.contains('hidden');
          aiDrawer.classList.toggle('hidden', isOpen);
          aiDrawer.classList.toggle('flex', !isOpen);
        });
      }
      if (btnCloseAi && aiDrawer) {
        btnCloseAi.addEventListener('click', () => { aiDrawer.classList.add('hidden'); aiDrawer.classList.remove('flex'); });
      }
      const aiAnswers = {
        glass: 'Front Glass Restoration (keep your original OLED + True Tone) starts at ₹2,500 up to ₹18,500 depending on iPhone model — done in-house on our TBK OCA & 90L bubble lab with a 6-month warranty.',
        warranty: 'Every display, glass, battery, and part replacement includes a written 6-Month Hardware Warranty tracked in our CRM invoice (motherboard repairs excluded).',
        pickup: 'We offer Free 24/7 Insured Doorstep Pickup & Drop across Bengaluru. Your device stays locked (Zero-Password Policy) and you receive WhatsApp photo updates at every stage.'
      };
      document.querySelectorAll('.ai-q').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (!aiMsgs) return;
          const qText = btn.textContent;
          const ans = aiAnswers[btn.dataset.aiq] || 'Tap Get Quote for an instant fixed estimate!';
          aiMsgs.innerHTML += `<div class="ml-auto max-w-[85%] rounded-2xl rounded-tr-none bg-violet-600 px-3 py-2 font-medium text-white">${qText}</div>`;
          aiMsgs.innerHTML += `<div class="max-w-[90%] rounded-2xl rounded-tl-none border border-zinc-200 bg-white p-2.5 text-zinc-700">${ans}</div>`;
          aiMsgs.scrollTop = aiMsgs.scrollHeight;
        });
      });

      // Live Bengaluru Zone & ETA Checker (Surprise #5)
      document.querySelectorAll('.zone-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          document.querySelectorAll('.zone-chip').forEach((c) => {
            c.className = 'zone-chip rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 font-semibold text-zinc-700';
          });
          chip.className = 'zone-chip rounded-full bg-emerald-600 px-3 py-1 font-bold text-white';
          const badge = document.getElementById('eta-badge');
          if (badge) badge.textContent = `${chip.dataset.zone} · Free Pickup · ${chip.dataset.eta}`;
        });
      });

      // Left-Side Breathing Section Tracker
      const railItems = document.querySelectorAll('.rail-item');
      if (typeof IntersectionObserver !== 'undefined') {
        const secIO = new IntersectionObserver((entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            railItems.forEach((item) => {
              const active = item.dataset.rail === en.target.id;
              item.classList.toggle('text-white', active);
              item.classList.toggle('text-zinc-400', !active);
              const dot = item.querySelector('.rail-dot');
              if (dot) dot.classList.toggle('rail-dot-active', active);
            });
          });
        }, { threshold: 0.2 });
        ['hero', 'real-shop', 'estimate', 'paired-crm', 'oled-restore', 'tbk-lab', 'ecosystem', 'reviews', 'halasuru-map'].forEach((id) => {
          const el = document.getElementById(id);
          if (el) secIO.observe(el);
        });
      }

      // 36-Model iPhone Catalog
      const fullIphonePrices = [
        ['iPhone 18 Pro Max', 18500], ['iPhone 18 Pro', 16500], ['iPhone 18 Plus', 15500], ['iPhone 18', 14500],
        ['iPhone 17 Pro Max', 16500], ['iPhone 17 Pro', 15500], ['iPhone 17 Plus', 13500], ['iPhone 17', 12500],
        ['iPhone 16 Pro Max', 14500], ['iPhone 16 Pro', 12500], ['iPhone 16 Plus', 11500], ['iPhone 16', 10500],
        ['iPhone 15 Pro Max', 11500], ['iPhone 15 Pro', 10500], ['iPhone 15 Plus', 8500], ['iPhone 15', 7500],
        ['iPhone 14 Pro Max', 8500], ['iPhone 14 Pro', 7500], ['iPhone 14 Plus', 6500], ['iPhone 14', 5500],
        ['iPhone 13 Pro Max', 6500], ['iPhone 13 Pro', 5800], ['iPhone 13', 4800], ['iPhone 13 mini', 4500],
        ['iPhone 12 Pro Max', 5200], ['iPhone 12 Pro', 4500], ['iPhone 12', 4200], ['iPhone 12 mini', 3900],
        ['iPhone 11 Pro Max', 4200], ['iPhone 11 Pro', 3800], ['iPhone 11', 3200], ['iPhone XS Max', 3800],
        ['iPhone XS', 3500], ['iPhone XR', 3000], ['iPhone X', 3200], ['iPhone 8 / 7 / 6s', 2500]
      ];

      const glassSel = document.getElementById('glass-model-sel');
      if (glassSel) {
        glassSel.innerHTML = fullIphonePrices.map(([m, p]) =>
          `<option value="${p}" data-name="${m}" ${m === 'iPhone 17 Pro Max' ? 'selected' : ''}>${m} — ₹${p.toLocaleString('en-IN')}</option>`
        ).join('');
      }
      const syncGlassCard = () => {
        if (!glassSel) return;
        const opt = glassSel.options[glassSel.selectedIndex];
        document.getElementById('glass-price-big').textContent = `₹${parseInt(opt.value, 10).toLocaleString('en-IN')}`;
        document.getElementById('glass-price-sub').textContent = `${opt.dataset.name} — front glass restoration only`;
      };
      if (glassSel) glassSel.addEventListener('change', syncGlassCard);

      // Smart Estimate + Exact Owner WhatsApp Format + Final Gift Copy Slip
      const modelCatalog = {
        iPhone: fullIphonePrices.slice(0, 12).map(([m]) => m),
        iPad: ['iPad Pro 13" M4', 'iPad Pro 12.9"', 'iPad Air M2', 'iPad 10th Gen', 'iPad mini 6/7', 'iPad 9th Gen'],
        MacBook: ['MacBook Pro 16" M3/M4', 'MacBook Pro 14"', 'MacBook Air 15" M3', 'MacBook Air 13" M2', 'iMac 24"', 'Mac Studio / mini'],
        Watch: ['Apple Watch Ultra 2/3', 'Series 10', 'Series 9', 'Series 8', 'Watch SE'],
        AirPods: ['AirPods Pro (2nd Gen)', 'AirPods Pro (1st Gen)', 'AirPods 4', 'AirPods 3', 'AirPods Max']
      };
      let selDev = 'iPhone', selModel = 'iPhone 17 Pro Max', latestWaPayload = '';
      const modelGrid = document.getElementById('model-grid');
      const estIssue = document.getElementById('est-issue');

      function refreshEst() {
        if (!estIssue) return;
        const opt = estIssue.options[estIssue.selectedIndex];
        const repair = opt.value;
        const price = opt.dataset.p || 'Quote';
        const cond = document.getElementById('est-cond').value.trim() || 'Not specified';
        const wrong = document.getElementById('est-wrong').value.trim() || 'Needs bench inspection';
        const mode = document.getElementById('est-mode').value;
        const when = document.getElementById('est-when').value.trim() || 'Earliest available slot';
        const urgency = document.getElementById('est-urgency').value;
        const name = document.getElementById('est-name').value.trim() || 'Customer';
        const phone = document.getElementById('est-phone').value.trim() || 'Not provided';
        const email = document.getElementById('est-email').value.trim() || 'Not provided';

        document.getElementById('est-summary').textContent = `${selModel} · ${repair}`;
        document.getElementById('est-price-line').textContent = `Indicative: ${price} · 6-Month Warranty`;

        latestWaPayload =
`RED APPLE MOBILE REPAIR
Where Repair Meets Connectivity

NEW REPAIR REQUEST
━━━━━━━━━━━━━━━━━━━━

DEVICE
- Type  :  ${selDev}
- Model :  ${selModel}
- Repair:  ${repair}
- Condition:  ${cond}

WHAT IS WRONG
${wrong}

SERVICE PREFERENCE
- Mode :  ${mode}
- When :  ${when}
- Urgency :  ${urgency}

CUSTOMER
- Name :  ${name}
- Phone :  ${phone}
- Email :  ${email}

━━━━━━━━━━━━━━━━━━━━
Please confirm the exact price and the earliest slot. Thank you.`;

        document.getElementById('est-wa-link').href = `https://wa.me/918660663776?text=${encodeURIComponent(latestWaPayload)}`;
      }

      const btnCopySlip = document.getElementById('btn-copy-slip');
      if (btnCopySlip) {
        btnCopySlip.addEventListener('click', () => {
          if (navigator.clipboard && latestWaPayload) {
            navigator.clipboard.writeText(latestWaPayload).catch(() => {});
          }
          btnCopySlip.textContent = '✓ Estimate Slip Copied!';
          setTimeout(() => { btnCopySlip.textContent = '📋 Copy Estimate Slip'; }, 2200);
        });
      }

      function renderModels() {
        if (!modelGrid) return;
        const list = modelCatalog[selDev];
        if (!list.includes(selModel)) selModel = list[0];
        modelGrid.innerHTML = list.map((m) =>
          `<button type="button" data-m="${m}" class="m-btn rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${m === selModel ? 'border-red-600 bg-red-600 text-white' : 'border-zinc-200 bg-zinc-50 text-zinc-800 hover:border-red-400'}">${m}</button>`
        ).join('');
        modelGrid.querySelectorAll('.m-btn').forEach((b) => {
          b.addEventListener('click', () => { selModel = b.dataset.m; renderModels(); refreshEst(); });
        });
      }
      document.querySelectorAll('.dev-tab').forEach((t) => {
        t.addEventListener('click', () => {
          document.querySelectorAll('.dev-tab').forEach((x) => { x.className = 'dev-tab rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 font-semibold text-zinc-700'; });
          t.className = 'dev-tab rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white';
          selDev = t.dataset.dev;
          renderModels(); refreshEst();
        });
      });
      ['est-issue', 'est-cond', 'est-wrong', 'est-mode', 'est-when', 'est-urgency', 'est-name', 'est-phone', 'est-email'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) { el.addEventListener('input', refreshEst); el.addEventListener('change', refreshEst); }
      });
      renderModels(); refreshEst();

      // CRM Tracker
      const btnTrack = document.getElementById('btn-track');
      if (btnTrack) {
        btnTrack.addEventListener('click', () => {
          const id = (document.getElementById('crm-input').value || 'RA-2048').trim().toUpperCase();
          document.getElementById('crm-out').innerHTML =
            `Job <strong class="text-zinc-950">${id}</strong> · Live Supabase bridge ready via <code class="text-red-600">/api/repair-status</code> · <strong class="text-emerald-700">Halasuru Bench Active</strong>.`;
        });
      }

      // Pickup WhatsApp
      let pkDev = 'iPhone';
      document.querySelectorAll('.pk-dev').forEach((b) => {
        b.addEventListener('click', () => {
          document.querySelectorAll('.pk-dev').forEach((x) => { x.className = 'pk-dev rounded-xl bg-zinc-100 py-2 font-semibold text-zinc-700'; });
          b.className = 'pk-dev rounded-xl bg-red-600 py-2 font-bold text-white';
          pkDev = b.dataset.pdev;
        });
      });
      const btnBookPickup = document.getElementById('btn-book-pickup');
      if (btnBookPickup) {
        btnBookPickup.addEventListener('click', () => {
          const addr = document.getElementById('pk-addr').value || 'Bengaluru';
          const pin = document.getElementById('pk-pin').value || '';
          const msg = `Hi Red Apple, please book a Free 24/7 Doorstep Pickup:\nDevice: ${pkDev}\nAddress: ${addr} ${pin}`;
          window.open(`https://wa.me/918660663776?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
        });
      }

      // Before/After Slider
      const baFrame = document.getElementById('ba-frame');
      const baBefore = document.getElementById('ba-before');
      const baDiv = document.getElementById('ba-divider');
      const baKnob = document.getElementById('ba-knob');
      let baDrag = false;
      const moveBA = (e) => {
        const r = baFrame.getBoundingClientRect();
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const pct = Math.max(5, Math.min(95, ((cx - r.left) / r.width) * 100));
        baBefore.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
        baDiv.style.left = `${pct}%`;
        baKnob.style.left = `${pct}%`;
      };
      if (baFrame) {
        baFrame.addEventListener('pointerdown', (e) => { baDrag = true; baFrame.setPointerCapture(e.pointerId); moveBA(e); });
        baFrame.addEventListener('pointermove', (e) => { if (baDrag) moveBA(e); });
        baFrame.addEventListener('pointerup', () => { baDrag = false; });
      }

      // Savings Calculator
      const calcTiers = [
        { name: 'iPhone 13 Pro Max', n: '₹1,09,900', f: '₹6,500', s: '₹1,03,400' },
        { name: 'iPhone 14 Pro Max', n: '₹1,24,900', f: '₹8,500', s: '₹1,16,400' },
        { name: 'iPhone 15 Pro Max', n: '₹1,34,900', f: '₹11,500', s: '₹1,23,400' },
        { name: 'iPhone 16 Pro Max', n: '₹1,44,900', f: '₹14,500', s: '₹1,30,400' },
        { name: 'iPhone 17 Pro Max', n: '₹1,54,900', f: '₹16,500', s: '₹1,38,400' },
        { name: 'iPhone 18 Pro Max', n: '₹1,64,900', f: '₹18,500', s: '₹1,46,400' }
      ];
      const inSavings = document.getElementById('in-savings');
      if (inSavings) {
        inSavings.addEventListener('input', (e) => {
          const c = calcTiers[parseInt(e.target.value, 10)] || calcTiers[3];
          document.getElementById('calc-model-lbl').textContent = c.name;
          document.getElementById('calc-new').textContent = c.n;
          document.getElementById('calc-fix').textContent = c.f;
          document.getElementById('calc-save').textContent = c.s;
        });
      }

      // Full 36-Model Zero-Jitter Price List
      let showAllPrices = false;
      const priceGrid = document.getElementById('price-grid');
      const priceSearch = document.getElementById('price-search');
      const btnTogglePrices = document.getElementById('btn-toggle-prices');
      function renderPriceGrid() {
        if (!priceGrid || !priceSearch) return;
        const q = (priceSearch.value || '').trim().toLowerCase();
        const filtered = q ? fullIphonePrices.filter(([m]) => m.toLowerCase().includes(q)) : (showAllPrices ? fullIphonePrices : fullIphonePrices.slice(0, 16));
        priceGrid.innerHTML = filtered.map(([m, p]) =>
          `<button type="button" data-pick="${m}" class="pick-m flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 px-3 py-2 text-left text-xs transition hover:border-red-500 hover:bg-white">
            <span class="font-semibold text-zinc-900">${m}</span>
            <span class="font-mono-num font-bold text-red-600">₹${p.toLocaleString('en-IN')}</span>
          </button>`
        ).join('');
        priceGrid.querySelectorAll('.pick-m').forEach((btn) => {
          btn.addEventListener('click', () => {
            if (!glassSel) return;
            for (let i = 0; i < glassSel.options.length; i++) {
              if (glassSel.options[i].dataset.name === btn.dataset.pick) {
                glassSel.selectedIndex = i; syncGlassCard();
                document.getElementById('oled-restore').scrollIntoView({ behavior: 'smooth' });
                break;
              }
            }
          });
        });
        if (btnTogglePrices) btnTogglePrices.textContent = showAllPrices ? 'Show Compact View' : `Show All (${fullIphonePrices.length} Models)`;
      }
      if (priceSearch) priceSearch.addEventListener('input', renderPriceGrid);
      if (btnTogglePrices) btnTogglePrices.addEventListener('click', () => { showAllPrices = !showAllPrices; renderPriceGrid(); });
      renderPriceGrid();

      // 10s Auto-Dismiss Toast
      const toastEl = document.getElementById('concierge-toast');
      const toastCount = document.getElementById('toast-countdown');
      let toastInt = null;
      const closeToast = () => {
        if (!toastEl) return;
        toastEl.classList.add('hidden'); toastEl.classList.remove('flex');
        if (toastInt) clearInterval(toastInt);
      };
      const btnTestConcierge = document.getElementById('btn-test-concierge');
      if (btnTestConcierge) {
        btnTestConcierge.addEventListener('click', () => {
          closeToast();
          let left = 10;
          toastEl.classList.remove('hidden'); toastEl.classList.add('flex');
          toastCount.textContent = `Auto-dismisses in ${left}s...`;
          toastInt = setInterval(() => {
            left -= 1;
            if (left <= 0) closeToast(); else toastCount.textContent = `Auto-dismisses in ${left}s...`;
          }, 1000);
        });
      }
      const btnCloseToast = document.getElementById('btn-close-toast');
      if (btnCloseToast) btnCloseToast.addEventListener('click', closeToast);

      // Live IST Clock, 32-Point QC Inspector & 3D Holographic Card Tilt
      try {
        const istEl = document.getElementById('live-ist-clock');
        if (istEl) {
          const istTime = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
          istEl.textContent = `Bengaluru ${istTime} IST · Open 10 AM – 12 AM`;
        }
        const qcChips = document.querySelectorAll('.qc-chip');
        const btnRunQc = document.getElementById('btn-run-qc');
        if (btnRunQc && qcChips.length) {
          btnRunQc.addEventListener('click', () => {
            const scoreEl = document.getElementById('qc-score');
            const statusEl = document.getElementById('qc-status-text');
            qcChips.forEach((c) => { c.className = 'qc-chip rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-400 transition'; });
            scoreEl.textContent = 'SCANNING...';
            statusEl.textContent = 'Running Apple Diagnostic Mode hardware verification...';
            qcChips.forEach((c, idx) => {
              setTimeout(() => {
                c.className = 'qc-chip rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 font-bold text-emerald-800 transition';
                if (idx === qcChips.length - 1) {
                  scoreEl.textContent = '32 / 32 PASS';
                  statusEl.textContent = 'All 32 hardware checkpoints passed · Ready for CRM invoice handover.';
                }
              }, (idx + 1) * 140);
            });
          });
        }
        const holoCard = document.getElementById('holo-card');
        if (holoCard) {
          holoCard.addEventListener('mousemove', (e) => {
            const r = holoCard.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            holoCard.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 16}deg) rotateY(${(px - 0.5) * 18}deg)`;
            holoCard.style.setProperty('--mx', `${px * 100}%`);
            holoCard.style.setProperty('--my', `${py * 100}%`);
          });
          holoCard.addEventListener('mouseleave', () => { holoCard.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)'; });
        }
      } catch (_e) {}

      // SINGLE SHARED WEBGL ENGINE FOR ALL 11 LIVE 3D CANVASES
      if (typeof THREE === 'undefined') return;
      try {
        const sharedRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        sharedRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        sharedRenderer.setClearColor(0x000000, 0);
        sharedRenderer.shadowMap.enabled = true;
        sharedRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

        const burgundyMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, metalness: 0.8, roughness: 0.22 });
        const burgundyDark = new THREE.MeshStandardMaterial({ color: 0x450a0a, metalness: 0.84, roughness: 0.18 });
        const titaniumSilver = new THREE.MeshStandardMaterial({ color: 0xe4e4e7, metalness: 0.88, roughness: 0.18 });
        const glassDark = new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.92, roughness: 0.08 });
        const screenGlow = new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x2563eb, emissiveIntensity: 0.4, roughness: 0.12 });
        const redGlow = new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0xdc2626, emissiveIntensity: 0.65 });
        const appleWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.12, roughness: 0.15 });
        const siliconeTipMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.02, roughness: 0.45, transparent: true, opacity: 0.92 });
        const slateMat = new THREE.MeshStandardMaterial({ color: 0x71717a, metalness: 0.7, roughness: 0.25 });
        const obsidianMat = new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.72, roughness: 0.26 });
        const uvMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 1.0, transparent: true, opacity: 0.92 });
        const greenLed = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 1.0 });
        const pcbMat = new THREE.MeshStandardMaterial({ color: 0x14532d, metalness: 0.35, roughness: 0.42 });
        const copperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.22 });
        const acrylicMat = new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.32, roughness: 0.1 });

        const slots = [];
        function registerSlot(canvasId, camPos, buildFn, initY = -0.45, initX = 0.1) {
          const canvas = document.getElementById(canvasId);
          if (!canvas) return null;
          const ctx = canvas.getContext('2d');
          if (!ctx) return null;

          const scene = new THREE.Scene();
          scene.add(new THREE.AmbientLight(0xffffff, 0.95));
          const key = new THREE.DirectionalLight(0xffffff, 1.25); key.position.set(3.5, 6.2, 4.8); scene.add(key);
          const rim = new THREE.PointLight(0xdc2626, 1.35, 14); rim.position.set(-2.6, 1.5, 2.8); scene.add(rim);
          const fill = new THREE.DirectionalLight(0xfed7aa, 0.45); fill.position.set(3.5, -2.0, -3.0); scene.add(fill);

          const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
          camera.position.set(camPos[0], camPos[1], camPos[2]);
          camera.lookAt(0, 0, 0);

          const group = new THREE.Group();
          scene.add(group);
          const onTick = buildFn(scene, group);
          const orbit = attachOrbit(canvas, group, initY, initX);

          const slot = { canvas, ctx, scene, camera, group, orbit, onTick, visible: true };
          slots.push(slot);
          return slot;
        }

        let heroAmbient = false;
        const heroSlot = registerSlot('canvas-hero', [0.25, 0.45, 5.1], (scene, group) => {
          const contact = new THREE.Mesh(new THREE.CircleGeometry(1.18, 36), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45, depthWrite: false }));
          contact.rotation.x = -Math.PI / 2; contact.position.y = -1.84; scene.add(contact);
          const bGeo = new THREE.ExtrudeGeometry(roundedRect(1.56, 3.12, 0.24), { depth: 0.14, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 4 });
          bGeo.center(); group.add(new THREE.Mesh(bGeo, burgundyMat));
          const fScr = new THREE.Mesh(new THREE.PlaneGeometry(1.44, 2.98), screenGlow); fScr.position.z = 0.098;
          const di = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.075, 0.01), glassDark); di.position.set(0, 1.32, 0.104);
          const bar = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.56, 0.075), burgundyDark); bar.position.set(0, 1.08, -0.11);
          group.add(fScr, di, bar);
          const lGeo = new THREE.CylinderGeometry(0.115, 0.115, 0.06, 22);
          [[-0.44, 1.19], [-0.44, 0.96], [-0.18, 1.08]].forEach(([lx, ly]) => {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.015, 10, 22), titaniumSilver); ring.position.set(lx, ly, -0.16);
            const lens = new THREE.Mesh(lGeo, glassDark); lens.rotation.x = Math.PI / 2; lens.position.set(lx, ly, -0.15);
            group.add(ring, lens);
          });
          const mag = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.024, 12, 44), redGlow); mag.position.set(0, -0.08, -0.105);
          group.add(mag); group.scale.setScalar(1.06);
          return (t) => { const fy = Math.sin(t * 1.15) * 0.1; group.position.y = 0.06 + fy; contact.scale.setScalar(1.0 - fy * 0.42); };
        }, -0.45, 0.1);

        const btnHeroOrbit = document.getElementById('btn-hero-orbit');
        if (btnHeroOrbit) {
          btnHeroOrbit.addEventListener('click', (e) => {
            heroAmbient = !heroAmbient;
            if (heroSlot) { heroSlot.orbit.st.enabled = !heroAmbient; heroSlot.canvas.classList.toggle('scroll-safe', heroAmbient); }
            e.target.textContent = heroAmbient ? 'Enable 360° Orbit' : 'Switch to Scroll-Safe BG';
          });
        }
        const btnHeroReset = document.getElementById('btn-hero-reset');
        if (btnHeroReset) btnHeroReset.addEventListener('click', () => { if (heroSlot) heroSlot.orbit.reset(); });

        registerSlot('canvas-posthero', [0.25, 0.7, 4.3], (_s, g) => {
          const outer = new THREE.Mesh(new THREE.TorusGeometry(1.12, 0.055, 16, 48), copperMat);
          const inner = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.04, 14, 42), redGlow);
          const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), titaniumSilver);
          const dot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 14), uvMat);
          g.add(outer, inner, core, dot);
          return (t) => {
            outer.rotation.x = t * 0.65; outer.rotation.y = t * 0.4;
            inner.rotation.x = -t * 0.85; inner.rotation.z = t * 0.55;
            core.rotation.y = t * 1.1;
            dot.position.set(Math.cos(t * 2.2) * 1.12, Math.sin(t * 2.2) * 0.45, Math.sin(t * 2.2) * 0.9);
          };
        }, 0.2, 0.15);

        registerSlot('canvas-oca', [0.3, 1.1, 4.9], (_s, g) => {
          g.position.y = -0.15;
          const pb = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.9, 1.8), appleWhite); pb.position.y = -0.8;
          const pt = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.28, 1.8), slateMat); pt.position.y = 1.0;
          const pc = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.55, 18), obsidianMat); pc.position.y = 1.4;
          const pw = new THREE.Mesh(new THREE.BoxGeometry(1.95, 1.15, 1.5), acrylicMat); pw.position.y = 0.2;
          const pl = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.14, 1.2), titaniumSilver); pl.position.y = 0.45;
          g.add(pb, pt, pc, pw, pl);
          return (t) => { pl.position.y = 0.52 - ((Math.sin(t * 1.6) + 1) * 0.5) * 0.68; };
        });

        registerSlot('canvas-bubble', [0.3, 1.0, 4.9], (_s, g) => {
          const tb = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 2.0), obsidianMat); tb.position.y = -1.1;
          const tk = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 2.0, 28), slateMat); tk.rotation.x = Math.PI / 2;
          const dp = new THREE.Group(); dp.position.set(-0.95, 0, 1.02);
          const ha = new THREE.Mesh(new THREE.CylinderGeometry(0.93, 0.93, 0.14, 28), appleWhite); ha.rotation.x = Math.PI / 2; ha.position.x = 0.95;
          const wh = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.05, 10, 24), obsidianMat); wh.position.set(0.95, 0, 0.14);
          const hb = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.15, 14), redGlow); hb.rotation.x = Math.PI / 2; hb.position.set(0.95, 0, 0.14);
          dp.add(ha, wh, hb); g.add(tb, tk, dp);
          return (t) => { dp.rotation.y = -Math.max(0, Math.sin(t * 0.8)) * 0.65; };
        });

        registerSlot('canvas-tbk958', [0.3, 1.1, 4.9], (_s, g) => {
          g.position.y = -0.2;
          const b1 = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.38, 2.1), appleWhite); b1.position.y = -1.0;
          const bed = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.08, 1.45), obsidianMat); bed.position.set(0, -0.78, 0.2);
          const ph = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.06, 1.2), burgundyMat); ph.position.set(0, -0.71, 0.2);
          const tw = new THREE.Mesh(new THREE.BoxGeometry(0.56, 2.1, 0.5), appleWhite); tw.position.set(0, 0.18, -0.72);
          const ar = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.42, 1.3), appleWhite); ar.position.set(0, 1.02, -0.15);
          const bm = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.03, 1.48, 12), uvMat); bm.position.set(0, -0.02, 0.2);
          const sp = new THREE.Mesh(new THREE.RingGeometry(0.04, 0.11, 18), uvMat); sp.rotation.x = -Math.PI / 2; sp.position.set(0, -0.67, 0.2);
          g.add(b1, bed, ph, tw, ar, bm, sp);
          return (t) => {
            const sx = Math.sin(t * 3.0) * 0.24, sz = 0.2 + Math.cos(t * 1.4) * 0.4;
            sp.position.set(sx, -0.67, sz);
            bm.position.set(sx * 0.5, -0.02, 0.2 + (sz - 0.2) * 0.5);
            bm.rotation.z = sx * 0.3;
          };
        });

        let fInternals = 0.72;
        const slInternals = document.getElementById('sl-internals');
        if (slInternals) slInternals.addEventListener('input', (e) => { fInternals = parseFloat(e.target.value) / 100; });
        registerSlot('canvas-internals', [0.3, 0.6, 5.0], (_s, g) => {
          const l0 = new THREE.Mesh(new THREE.BoxGeometry(1.42, 2.85, 0.05), obsidianMat);
          const l1 = new THREE.Mesh(new THREE.BoxGeometry(1.44, 2.88, 0.08), slateMat);
          const l2 = new THREE.Group();
          const batt = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.5, 0.09), obsidianMat); batt.position.set(-0.25, -0.18, 0);
          const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.46, 1.12, 0.06), pcbMat); pcb.position.set(0.35, 0.24, 0.02);
          const soc = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.08), redGlow); soc.position.set(0.35, 0.34, 0.05);
          const vap = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.92, 0.025), copperMat); vap.position.set(-0.23, -0.14, 0.07);
          l2.add(batt, pcb, soc, vap);
          const l3 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.82, 0.04), new THREE.MeshStandardMaterial({ color: 0x2563eb, transparent: true, opacity: 0.45 }));
          g.add(l0, l1, l2, l3);
          return () => { const sp = 0.08 + fInternals * 0.58; l0.position.z = -sp * 1.5; l1.position.z = -sp * 0.5; l2.position.z = sp * 0.5; l3.position.z = sp * 1.5; };
        });

        let fAirpods = 0.75;
        const slAirpods = document.getElementById('sl-airpods');
        if (slAirpods) slAirpods.addEventListener('input', (e) => { fAirpods = parseFloat(e.target.value) / 100; });
        registerSlot('canvas-airpods', [0.15, 0.95, 4.9], (_s, g) => {
          const baseGeo = new THREE.ExtrudeGeometry(roundedRect(2.05, 1.1, 0.38), { depth: 0.62, bevelEnabled: true, bevelThickness: 0.16, bevelSize: 0.14, bevelSegments: 5 });
          baseGeo.center();
          const cb = new THREE.Mesh(baseGeo, appleWhite); cb.position.y = -0.52;
          const led = new THREE.Mesh(new THREE.SphereGeometry(0.036, 14, 14), greenLed); led.position.set(0, -0.22, 0.48);
          const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.12, 0.08), titaniumSilver); hinge.position.set(0, 0.05, -0.47);
          const lid = new THREE.Group(); lid.position.set(0, 0.14, -0.44);
          const lidGeo = new THREE.ExtrudeGeometry(roundedRect(2.05, 0.44, 0.22), { depth: 0.62, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.14, bevelSegments: 5 });
          lidGeo.center();
          const lm = new THREE.Mesh(lidGeo, appleWhite); lm.position.set(0, 0.34, 0.44); lid.add(lm);
          const mkProBud = (s) => {
            const b = new THREE.Group();
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 20), appleWhite); head.scale.set(1.15, 0.95, 0.92);
            const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.04, 16), glassDark); vent.rotation.z = Math.PI / 2; vent.position.set(s * 0.30, 0.02, 0.02);
            const tipGrp = new THREE.Group(); tipGrp.position.set(-s * 0.26, 0.02, 0.09); tipGrp.rotation.z = s * 0.45; tipGrp.rotation.y = s * 0.28;
            const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.125, 0.14, 18), glassDark); nozzle.rotation.z = Math.PI / 2;
            const cup = new THREE.Mesh(new THREE.SphereGeometry(0.195, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.56), siliconeTipMat); cup.rotation.z = s * (Math.PI / 2); cup.position.x = -s * 0.13;
            tipGrp.add(nozzle, cup);
            const stemGrp = new THREE.Group(); stemGrp.position.set(s * 0.11, -0.44, -0.02); stemGrp.rotation.z = -s * 0.14;
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.056, 0.68, 18), appleWhite);
            const cap = new THREE.Mesh(new THREE.SphereGeometry(0.056, 14, 12), titaniumSilver); cap.position.y = -0.34;
            stemGrp.add(stem, cap); b.add(head, vent, tipGrp, stemGrp); return b;
          };
          const lb = mkProBud(-1), rb = mkProBud(1);
          g.add(cb, led, hinge, lid, lb, rb);
          return (t) => {
            lid.rotation.x = -fAirpods * 1.8;
            const fl = Math.sin(t * 1.5) * 0.05 * fAirpods;
            lb.position.set(-0.42 - fAirpods * 0.48, 0.05 + fAirpods * 1.05 + fl, 0.08);
            rb.position.set(0.42 + fAirpods * 0.48, 0.05 + fAirpods * 1.05 - fl, 0.08);
          };
        }, 0.3, 0.15);

        registerSlot('canvas-iphone17', [0.2, 0.5, 4.9], (_s, g) => {
          const geo = new THREE.ExtrudeGeometry(roundedRect(1.48, 2.96, 0.22), { depth: 0.14, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 });
          geo.center(); g.add(new THREE.Mesh(geo, slateMat));
          const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.36, 2.82), screenGlow); scr.position.z = 0.095;
          const bar = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.56, 0.07), obsidianMat); bar.position.set(0, 1.02, -0.11);
          const mag = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.022, 12, 36), redGlow); mag.position.set(0, -0.08, -0.1);
          const las = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.025, 0.3), redGlow);
          g.add(scr, bar, mag, las);
          return (t) => { las.position.y = Math.sin(t * 1.5) * 1.25; };
        }, 2.6, 0.08);

        registerSlot('canvas-ipad', [0.2, 0.5, 5.2], (_s, g) => {
          g.add(new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.9, 0.08), titaniumSilver));
          const scr = new THREE.Mesh(new THREE.PlaneGeometry(2.15, 2.75), screenGlow); scr.position.z = 0.045;
          const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.9, 14), appleWhite); pen.rotation.z = Math.PI / 2; pen.position.y = 1.68;
          g.add(scr, pen); g.scale.setScalar(0.84);
          return (t) => { pen.position.y = 1.68 + Math.sin(t * 1.4) * 0.12; };
        });

        registerSlot('canvas-watch', [0.2, 0.5, 4.6], (_s, g) => {
          g.add(new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.38, 0.28), slateMat));
          const fc = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.18, 0.04), glassDark); fc.position.z = 0.16;
          const rg = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.032, 12, 30), redGlow); rg.position.z = 0.19;
          const wt = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.95, 0.08), obsidianMat); wt.position.set(0, 1.18, -0.04);
          const wb = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.95, 0.08), obsidianMat); wb.position.set(0, -1.18, -0.04);
          g.add(fc, rg, wt, wb);
          return (t) => { rg.scale.setScalar(0.96 + Math.sin(t * 2) * 0.05); };
        });

        let fMac = 0.76;
        const slMacbook = document.getElementById('sl-macbook');
        if (slMacbook) slMacbook.addEventListener('input', (e) => { fMac = parseFloat(e.target.value) / 100; });
        registerSlot('canvas-macbook', [0.3, 1.1, 5.2], (_s, g) => {
          g.position.y = -0.45;
          g.add(new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.12, 2.05), obsidianMat));
          const lid = new THREE.Group(); lid.position.set(0, 0.06, -1.02);
          const sh = new THREE.Mesh(new THREE.BoxGeometry(2.98, 1.95, 0.06), obsidianMat); sh.position.y = 0.98;
          const sc = new THREE.Mesh(new THREE.PlaneGeometry(2.82, 1.78), screenGlow); sc.position.set(0, 0.98, 0.036);
          lid.add(sh, sc); g.add(lid);
          return () => { lid.rotation.x = Math.PI / 2 - fMac * 1.9; };
        });

        if (typeof IntersectionObserver !== 'undefined') {
          const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
              const s = slots.find((x) => x.canvas === en.target);
              if (s) s.visible = en.isIntersecting;
            });
          }, { threshold: 0.02 });
          slots.forEach((s) => io.observe(s.canvas));
        }

        let t = 0, lastW = 0, lastH = 0;
        function animate() {
          requestAnimationFrame(animate);
          t += 0.015;
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          for (let i = 0; i < slots.length; i++) {
            const s = slots[i];
            if (!s.visible) continue;
            const cw = s.canvas.clientWidth, ch = s.canvas.clientHeight;
            if (!cw || !ch) continue;
            const pw = Math.round(cw * dpr), ph = Math.round(ch * dpr);
            if (s.canvas.width !== pw || s.canvas.height !== ph) { s.canvas.width = pw; s.canvas.height = ph; }
            if (lastW !== cw || lastH !== ch) { sharedRenderer.setSize(cw, ch, false); lastW = cw; lastH = ch; }
            s.camera.aspect = cw / ch;
            s.camera.updateProjectionMatrix();
            s.orbit.update(s === heroSlot && heroAmbient ? 0.008 : 0.0038);
            if (s.onTick) s.onTick(t);
            sharedRenderer.render(s.scene, s.camera);
            s.ctx.clearRect(0, 0, pw, ph);
            s.ctx.drawImage(sharedRenderer.domElement, 0, 0, pw, ph);
          }
        }
        animate();
      } catch (err) {
        console.error('3D engine fallback:', err);
      }
    };
  if (document.readyState === 'complete' && typeof window.onload === 'function') {
    window.onload();
  }
})();