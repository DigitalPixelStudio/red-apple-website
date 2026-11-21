(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }
  if (!document.getElementById('hero')) return;
    window.onload = function () {
      // ============================================================
      // 1. LIVE BENGALURU IST BENCH CLOCK
      // ============================================================
      function updateISTClock() {
        const el = document.getElementById('live-ist-clock');
        if (!el) return;
        try {
          const now = new Date();
          const ist = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
          const hr = parseInt(now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false }), 10);
          const isOpen = hr >= 10;
          el.textContent = isOpen
            ? `Open now · ${ist} IST · 10 AM – 12 AM · Halasuru`
            : `Bench opens 10 AM · ${ist} IST · 24/7 Pickup Active`;
        } catch (_e) {}
      }
      updateISTClock();
      setInterval(updateISTClock, 30000);

      // ============================================================
      // 2. 30-SECOND SMART ESTIMATE (EXACT OWNER WHATSAPP FORMAT)
      // ============================================================
      const deviceModels = {
        'iPhone': ['iPhone 18 Pro Max','iPhone 18 Pro','iPhone 18','iPhone 17 Pro Max','iPhone 17 Pro','iPhone 17','iPhone 17 Slim/Air','iPhone 16 Pro Max','iPhone 16 Pro','iPhone 16 Plus','iPhone 16','iPhone 15 Pro Max','iPhone 15 Pro','iPhone 15 Plus','iPhone 15','iPhone 14 Pro Max','iPhone 14 Pro','iPhone 14 Plus','iPhone 14','iPhone 13 Pro Max','iPhone 13 Pro','iPhone 13 mini','iPhone 13','iPhone 12 Pro Max','iPhone 12 Pro','iPhone 12 mini','iPhone 12','iPhone 11 Pro Max','iPhone 11 Pro','iPhone 11','iPhone XS Max','iPhone XS','iPhone XR','iPhone X','iPhone SE (3rd G)','iPhone SE (2nd G)','iPhone 8 Plus','iPhone 8','iPhone 7 Plus','iPhone 7','iPhone 6s Plus','iPhone 6s','iPhone 6 Plus','iPhone 6'],
        'iPad': ['iPad Pro 13" M4','iPad Pro 12.9"','iPad Pro 11"','iPad Air M2','iPad Air','iPad 10th Gen','iPad 9th Gen','iPad mini 6/7','iPad Mini'],
        'MacBook': ['MacBook Pro M4/M3','MacBook Pro 16"','MacBook Pro 14"','MacBook Air M3/M2','MacBook Pro','MacBook Air','iMac / Mac mini'],
        'Apple Watch': ['Apple Watch Ultra 3','Apple Watch Ultra 2','Apple Watch Ultra','Watch Series 10','Watch Series 9','Watch Series 8','Watch Series 7','Watch SE (2nd Gen)'],
        'AirPods': ['AirPods Pro (2nd Gen)','AirPods Pro (1st Gen)','AirPods (4th/3rd Gen)','AirPods Max']
      };
      const estDeviceSel = document.getElementById('est-device');
      const estModelSel = document.getElementById('est-model');
      const estRepair = document.getElementById('est-repair');
      const estSummaryTitle = document.getElementById('est-summary-title');
      const estSummaryPrice = document.getElementById('est-summary-price');
      let selectedDev = 'iPhone';
      let selectedModel = 'iPhone 17 Pro Max';

      function syncEstimateSummary() {
        if (!estRepair) return;
        const opt = estRepair.options[estRepair.selectedIndex];
        const rep = opt ? opt.value : 'Front Display Replacement';
        const price = opt ? (opt.dataset.price || 'Quote') : 'Quote';
        if (estSummaryTitle) estSummaryTitle.textContent = `Ticket: ${selectedModel} · ${rep}`;
        if (estSummaryPrice) estSummaryPrice.textContent = `Indicative: ${price} · 6 Months Warranty`;
      }

      function renderEstimateModels() {
        if (!estModelSel) return;
        const list = deviceModels[selectedDev] || [];
        if (!list.includes(selectedModel)) selectedModel = list[0] || selectedDev;
        estModelSel.innerHTML = list.map((m) => `<option value="${m}" ${m === selectedModel ? 'selected' : ''}>${m}</option>`).join('');
        syncEstimateSummary();
      }
      estDeviceSel?.addEventListener('change', () => { selectedDev = estDeviceSel.value; renderEstimateModels(); });
      estModelSel?.addEventListener('change', () => { selectedModel = estModelSel.value; syncEstimateSummary(); });
      estRepair?.addEventListener('change', syncEstimateSummary);
      renderEstimateModels();

      function buildExactWhatsAppTicket() {
        const repair = estRepair ? estRepair.value : 'Front Display Replacement';
        const cond = (document.getElementById('est-condition')?.value || 'Not specified').trim();
        const wrong = (document.getElementById('est-wrong')?.value || 'Need bench inspection').trim();
        const mode = document.getElementById('est-mode')?.value || 'Walk-in at store';
        const when = (document.getElementById('est-when')?.value || 'Today').trim();
        const urgency = document.getElementById('est-urgency')?.value || 'Urgent — Need it fixed today';
        const name = (document.getElementById('est-name')?.value || 'Customer').trim();
        const phone = (document.getElementById('est-phone')?.value || 'Not provided').trim();
        const email = (document.getElementById('est-email')?.value || 'Not provided').trim();

        return [
          'RED APPLE MOBILE REPAIR',
          'Where Repair Meets Connectivity',
          '',
          'NEW REPAIR REQUEST',
          '━━━━━━━━━━━━━━━━━━━━',
          '',
          'DEVICE',
          `- Type  :  ${selectedDev}`,
          `- Model :  ${selectedModel}`,
          `- Repair:  ${repair}`,
          `- Condition:  ${cond}`,
          '',
          'WHAT IS WRONG',
          wrong,
          '',
          'SERVICE PREFERENCE',
          `- Mode :  ${mode}`,
          `- When :  ${when}`,
          `- Urgency :  ${urgency}`,
          '',
          'CUSTOMER',
          `- Name :  ${name}`,
          `- Phone :  ${phone}`,
          `- Email :  ${email}`,
          '',
          '━━━━━━━━━━━━━━━━━━━━',
          'Please confirm the exact price and the earliest slot. Thank you.'
        ].join('\n');
      }

      document.getElementById('btn-send-wa')?.addEventListener('click', () => {
        window.open('https://wa.me/918660663776?text=' + encodeURIComponent(buildExactWhatsAppTicket()), '_blank', 'noopener,noreferrer');
      });

      document.getElementById('btn-copy-slip')?.addEventListener('click', () => {
        const ta = document.createElement('textarea');
        ta.value = buildExactWhatsAppTicket();
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (_e) {}
        document.body.removeChild(ta);
        const msg = document.getElementById('copy-slip-msg');
        if (msg) {
          msg.classList.remove('hidden');
          setTimeout(() => msg.classList.add('hidden'), 3200);
        }
      });

      // ============================================================
      // 3. CRM TRACKER, PICKUP ETA, GLASS VISUALISER, 32-MODEL PRICING, SERVICES, TRIAGE & QC
      // ============================================================
      const crmSample = {
        'RA-2048': '<strong>RA-2048</strong> · iPhone 16 Pro Max Display · <span class="font-bold text-emerald-700">32-Point QC Passed</span> · Ready for Halasuru pickup.',
        'RA-2051': '<strong>RA-2051</strong> · iPhone 15 Pro Back Glass · <span class="font-bold text-orange-700">TBK-958 Cold UV Laser Bench</span> · Est. ready in 35 min.',
        'RA-2055': '<strong>RA-2055</strong> · MacBook Pro M3 Logic Board · <span class="font-bold text-red-700">Micro-Soldering Diagnostics</span> · Fixed quote approved.'
      };
      document.getElementById('btn-crm-lookup')?.addEventListener('click', () => {
        const id = (document.getElementById('crm-job-id')?.value || '').trim().toUpperCase();
        const out = document.getElementById('crm-lookup-res');
        if (out) {
          out.innerHTML = crmSample[id] || `<strong>${id || 'RA-XXXX'}</strong> · Live Supabase lookup ready via <code>/api/repair-status</code> (Try RA-2048, RA-2051, or RA-2055).`;
        }
      });

      let pickupDev = 'iPhone';
      document.querySelectorAll('.p-dev-btn').forEach((b) => {
        b.addEventListener('click', () => {
          pickupDev = b.dataset.pdev;
          document.querySelectorAll('.p-dev-btn').forEach((x) => {
            x.className = x === b
              ? 'p-dev-btn flex-1 rounded-xl bg-red-600 py-2 text-white'
              : 'p-dev-btn flex-1 rounded-xl bg-zinc-100 py-2 text-zinc-700';
          });
        });
      });
      document.getElementById('eta-zone')?.addEventListener('change', (e) => {
        const out = document.getElementById('eta-output');
        if (out) out.textContent = 'Rider dispatch ETA: ' + e.target.value;
      });
      document.getElementById('btn-book-pickup')?.addEventListener('click', () => {
        const flat = document.getElementById('pick-flat')?.value || '';
        const street = document.getElementById('pick-street')?.value || 'Bengaluru';
        const pin = document.getElementById('pick-pin')?.value || '560008';
        const txt = `Hi Red Apple, I want to book Free 24/7 Doorstep Pickup:\nDevice: ${pickupDev}\nAddress: ${flat} ${street}, Bengaluru ${pin}`;
        window.open('https://wa.me/918660663776?text=' + encodeURIComponent(txt), '_blank', 'noopener,noreferrer');
      });

      // Interactive Glass Restoration Visualiser Slider
      const baBox = document.getElementById('ba-slider-box');
      const baOverlay = document.getElementById('ba-overlay');
      const baLine = document.getElementById('ba-line');
      const baKnob = document.getElementById('ba-knob');
      const baPctLbl = document.getElementById('ba-pct-lbl');
      let baDragging = false;
      function setBaSplit(clientX) {
        if (!baBox) return;
        const r = baBox.getBoundingClientRect();
        const pct = Math.max(5, Math.min(95, ((clientX - r.left) / r.width) * 100));
        if (baOverlay) baOverlay.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
        if (baLine) baLine.style.left = pct + '%';
        if (baKnob) baKnob.style.left = pct + '%';
        if (baPctLbl) baPctLbl.textContent = `${Math.round(100 - pct)}% Restored`;
      }
      baBox?.addEventListener('pointerdown', (e) => { if (e.button !== undefined && e.button !== 0) return; baDragging = true; setBaSplit(e.clientX); });
      window.addEventListener('pointermove', (e) => { if (baDragging) setBaSplit(e.clientX); }, { passive: true });
      const stopBa = () => { baDragging = false; };
      window.addEventListener('pointerup', stopBa);
      window.addEventListener('pointercancel', stopBa);

      // All 32 Listed iPhone Front Glass Restoration Prices + Savings Calculator
      const fullPrices = [
        ['iPhone 18 Pro Max', 19500, 154900], ['iPhone 18 Pro', 18500, 134900], ['iPhone 18 Plus', 15500, 99900], ['iPhone 18', 14500, 89900],
        ['iPhone 17 Pro Max', 16500, 144900], ['iPhone 17 Pro', 15500, 119900], ['iPhone 17 Plus', 13000, 89900], ['iPhone 17', 12000, 79900],
        ['iPhone 16 Pro Max', 14500, 139900], ['iPhone 16 Pro', 13500, 114900], ['iPhone 16 Plus', 11000, 84900], ['iPhone 16', 10000, 74900],
        ['iPhone 15 Pro Max', 11500, 129900], ['iPhone 15 Pro', 10500, 109900], ['iPhone 15 Plus', 8500, 79900], ['iPhone 15', 7500, 69900],
        ['iPhone 14 Pro Max', 8500, 119900], ['iPhone 14 Pro', 7500, 99900], ['iPhone 14 Plus', 6500, 69900], ['iPhone 14', 5500, 59900],
        ['iPhone 13 Pro Max', 7000, 99900], ['iPhone 13 Pro', 6000, 89900], ['iPhone 13', 4500, 52900], ['iPhone 13 Mini', 4000, 49900],
        ['iPhone 12 Pro Max', 5500, 79900], ['iPhone 12 Pro', 4500, 69900], ['iPhone 12', 4000, 45900], ['iPhone 12 Mini', 3500, 42900],
        ['iPhone 11 Pro Max', 4000, 59900], ['iPhone 11 Pro / 11', 3500, 44900], ['iPhone X / XS / XR', 3000, 39900], ['iPhone 8 / SE (Gen 2/3)', 2500, 34900]
      ];
      const glassSel = document.getElementById('glass-model-select');
      const fullGrid = document.getElementById('full-price-grid');

      function selectGlassModel(idx) {
        const [m, p, np] = fullPrices[idx] || fullPrices[4];
        if (glassSel) glassSel.value = String(idx);
        const gp = document.getElementById('glass-price-display');
        const gs = document.getElementById('glass-model-sub');
        const gb = document.getElementById('btn-book-glass');
        const cm = document.getElementById('calc-model-name');
        const cn = document.getElementById('calc-new-price');
        const cr = document.getElementById('calc-restore-price');
        const cs = document.getElementById('calc-savings');
        if (gp) gp.textContent = '₹' + p.toLocaleString('en-IN');
        if (gs) gs.textContent = `${m} · front glass restoration only`;
        if (gb) gb.textContent = `Book ${m} glass restoration`;
        if (cm) cm.textContent = m;
        if (cn) cn.textContent = '₹' + np.toLocaleString('en-IN');
        if (cr) cr.textContent = '₹' + p.toLocaleString('en-IN');
        if (cs) cs.textContent = '₹' + (np - p).toLocaleString('en-IN');
      }

      if (glassSel) {
        glassSel.innerHTML = fullPrices.map(([m], i) => `<option value="${i}">${m}</option>`).join('');
        glassSel.addEventListener('change', () => selectGlassModel(parseInt(glassSel.value, 10)));
        selectGlassModel(4);
      }

      function renderPriceGrid(filter = '') {
        if (!fullGrid) return;
        const q = filter.trim().toLowerCase();
        fullGrid.innerHTML = fullPrices
          .map(([m, p], i) => ({ m, p, i }))
          .filter((x) => !q || x.m.toLowerCase().includes(q))
          .map(({ m, p, i }) => `
            <button type="button" data-pidx="${i}" class="price-pill flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-xs font-semibold text-zinc-800 transition hover:border-red-500 hover:bg-red-50/40">
              <span class="truncate pr-1">${m}</span>
              <span class="font-mono-num font-extrabold text-red-600">₹${p.toLocaleString('en-IN')}</span>
            </button>
          `).join('');
        fullGrid.querySelectorAll('.price-pill').forEach((btn) => {
          btn.addEventListener('click', () => {
            selectGlassModel(parseInt(btn.dataset.pidx, 10));
            document.getElementById('glass-lab')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        });
      }
      renderPriceGrid();
      document.getElementById('price-search')?.addEventListener('input', (e) => renderPriceGrid(e.target.value));

      // Interactive 32-Point QC Scanner
      document.getElementById('btn-run-qc')?.addEventListener('click', () => {
        const items = document.querySelectorAll('.qc-item');
        items.forEach((el) => {
          el.classList.remove('border-emerald-400', 'bg-emerald-50', 'text-emerald-900');
          el.classList.add('border-zinc-200', 'bg-zinc-50', 'text-zinc-700');
        });
        items.forEach((el, idx) => {
          setTimeout(() => {
            el.classList.remove('border-zinc-200', 'bg-zinc-50', 'text-zinc-700');
            el.classList.add('border-emerald-400', 'bg-emerald-50', 'text-emerald-900');
          }, idx * 140);
        });
      });

      // All 11 Repair Services Grid
      const servicesList = [
        ['Front Display Replacement', '~45 min', 'OEM-grade OLED panels with True Tone calibrated while you wait.', '6 Months Warranty'],
        ['Front Glass Restoration', 'Same day', 'Keep your original OLED panel using TBK OCA vacuum lamination.', '6 Months Warranty'],
        ['Back Glass Replacement', '~60 min', 'TBK-958 cold UV laser separation — MagSafe compatible finish.', '6 Months Warranty'],
        ['Battery Replacement', '~30 min', 'High-capacity tested cells with free health diagnostics report.', '6 Months Warranty'],
        ['Camera Repair', '~60 min', 'Rear & front modules, sapphire lens, and OIS calibration.', '6 Months Warranty'],
        ['Charging Port / Flex', '~40 min', 'Lightning / USB-C port, charging flex, and fast-charge restoration.', '6 Months Warranty'],
        ['Water Damage Revival', 'Same day', 'Ultrasonic cleaning and corrosion treatment at chip level.', '6 Months Warranty'],
        ['Motherboard / IC Repair', '1–2 days', 'Micro-soldering, PMIC, NAND & baseband diagnosis under microscope.', 'Excluded from standard cover'],
        ['Speaker / Mic / Haptics', '~40 min', 'Earpiece, loudspeaker, microphones, and Taptic Engine replacement.', '6 Months Warranty'],
        ['System Diagnostics & Signed Restore', '30–120 min', 'Signed iOS/iPadOS/macOS restore workflows & boot-loop diagnosis.', 'Zero-Passcode Workflow'],
        ['Board-Level Storage IC Repair', '1–3 days', 'Confidential hardware diagnosis when photos/files are inaccessible.', 'Assessed first']
      ];
      const servicesGrid = document.getElementById('services-grid');
      if (servicesGrid) {
        servicesGrid.innerHTML = servicesList.map(([title, time, desc, badge]) => `
          <div class="card-sheen flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div>
              <div class="flex items-center justify-between gap-2">
                <h3 class="font-display text-sm font-extrabold text-zinc-950">${title}</h3>
                <span class="shrink-0 rounded-full bg-zinc-100 px-2.5 py-0.5 font-mono-num text-[10px] font-bold text-zinc-700">${time}</span>
              </div>
              <p class="mt-1.5 text-xs leading-relaxed text-zinc-600">${desc}</p>
            </div>
            <div class="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2.5 text-[11px]">
              <span class="font-bold text-emerald-700">✓ ${badge}</span>
              <a href="#estimate" class="font-extrabold text-red-600 hover:underline">Get estimate →</a>
            </div>
          </div>
        `).join('');
      }

      // Interactive Repair Triage Symptoms (All 10 Symptoms + All 65+ Apple Models)
      const triageData = [
        ['Cracked Screen', 'Front Display Replacement', '₹11,600', 'Front Glass Restoration option available if OLED is intact'],
        ['Only Top Glass Cracked', 'Front Glass Restoration (TBK OCA)', '₹5,500', 'Keeps your original Apple OLED & True Tone'],
        ['Battery Drains Fast', 'Battery Replacement (~30 min)', '₹3,900', 'Includes free battery health & peak current check'],
        ['Cracked Back Glass', 'TBK-958 Cold UV Back Glass', '₹4,500', 'Zero-heat laser separation · MagSafe preserved'],
        ['Won\'t Charge', 'Charging Port / Flex Service', '₹2,800', 'Fast-charge & data sync tested before handover'],
        ['Water Damage / Dead', 'Motherboard / Ultrasonic Revival', '₹10,500 – ₹14,500', 'Free microscope diagnosis before any work starts'],
        ['Blurry Camera', 'Camera / OIS Module Repair', 'Quote', 'OEM sensor assembly with focus calibration'],
        ['Stuck on Apple Logo', 'System Diagnostics & Signed Restore', 'Quote', 'Zero-passcode firmware restore & boot-loop fix'],
        ['Lost Photos / Files', 'Board-Level Storage IC Diagnosis', 'Quote', 'Confidential hardware assessment before quoting'],
        ['No Sound or Mic', 'Speaker / Mic / Haptics Repair', 'Quote', 'Full audio path tested in Apple Diagnostic Mode']
      ];
      let activeTriageIdx = 0;
      const triageWrap = document.getElementById('triage-symptoms');
      const triageDevSel = document.getElementById('triage-device');

      function updateTriageOutput() {
        const [sym, srv, basePrice, baseAlt] = triageData[activeTriageIdx] || triageData[0];
        const dev = triageDevSel?.value || 'iPhone 14';
        const glassHit = fullPrices.find(([m]) => m.toLowerCase() === dev.toLowerCase());
        let displayPrice = basePrice;
        let displayAlt = baseAlt;
        if (glassHit && activeTriageIdx === 1) {
          displayPrice = '₹' + glassHit[1].toLocaleString('en-IN');
          displayAlt = `${dev} · Keeps your original Apple OLED & True Tone`;
        } else if (glassHit && activeTriageIdx === 0) {
          displayAlt = `Front Glass Restoration for ${dev}: ₹${glassHit[1].toLocaleString('en-IN')} if OLED is intact`;
        }
        const sEl = document.getElementById('triage-service');
        const pEl = document.getElementById('triage-price');
        const aEl = document.getElementById('triage-alt');
        const wEl = document.getElementById('triage-wa-btn');
        if (sEl) sEl.textContent = `${srv} (${dev})`;
        if (pEl) pEl.textContent = displayPrice;
        if (aEl) aEl.textContent = displayAlt;
        if (wEl) wEl.href = 'https://wa.me/918660663776?text=' + encodeURIComponent(`Hi Red Apple, Triage Check: ${dev} — ${sym} (${srv}, ${displayPrice})`);
      }

      if (triageWrap) {
        triageWrap.innerHTML = triageData.map(([sym], idx) => `
          <button type="button" data-tidx="${idx}" class="triage-btn rounded-xl border px-3 py-2 transition ${idx === 0 ? 'border-red-600 bg-red-600 text-white' : 'border-zinc-200 bg-zinc-50 text-zinc-800 hover:border-red-400'}">${sym}</button>
        `).join('');
        triageWrap.querySelectorAll('.triage-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            activeTriageIdx = parseInt(btn.dataset.tidx, 10);
            updateTriageOutput();
            triageWrap.querySelectorAll('.triage-btn').forEach((x) => {
              x.className = x === btn
                ? 'triage-btn rounded-xl border border-red-600 bg-red-600 px-3 py-2 text-white transition'
                : 'triage-btn rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-800 transition hover:border-red-400';
            });
          });
        });
        triageDevSel?.addEventListener('change', updateTriageOutput);
        updateTriageOutput();
      }

      // 3D-Tilt Holographic Warranty Card + Live Mouse Glare + Card Switcher
      const holo = document.getElementById('holo-warranty');
      holo?.addEventListener('pointermove', (e) => {
        const r = holo.getBoundingClientRect();
        const px = ((e.clientX - r.left) / r.width) * 100;
        const py = ((e.clientY - r.top) / r.height) * 100;
        const rx = (py / 100 - 0.5) * -16;
        const ry = (px / 100 - 0.5) * 16;
        holo.style.setProperty('--gx', px + '%');
        holo.style.setProperty('--gy', py + '%');
        holo.style.transform = `perspective(760px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      holo?.addEventListener('pointerleave', () => {
        holo.style.setProperty('--gx', '50%');
        holo.style.setProperty('--gy', '50%');
        holo.style.transform = 'perspective(760px) rotateX(0) rotateY(0)';
      });
      document.querySelectorAll('.wcard-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const [jid, desc] = (btn.dataset.wcard || '').split('|');
          const jEl = document.getElementById('holo-job-id');
          const dEl = document.getElementById('holo-device-line');
          if (jEl) jEl.textContent = 'JOB ID: ' + jid;
          if (dEl) dEl.textContent = desc + ' — Linked to your Halasuru CRM Job ID & serial-tracked part record.';
          document.querySelectorAll('.wcard-btn').forEach((x) => {
            x.className = x === btn
              ? 'wcard-btn rounded-full bg-zinc-900 px-2.5 py-1 font-bold text-white'
              : 'wcard-btn rounded-full border border-zinc-300 bg-white px-2.5 py-1 font-bold text-zinc-700';
          });
        });
      });

      // 10-Second Auto-Dismiss AI Concierge Toast
      const aiDrawer = document.getElementById('ai-drawer');
      const aiMsgs = document.getElementById('ai-messages');
      const aiToast = document.getElementById('ai-auto-toast');
      const toastCountEl = document.getElementById('toast-countdown');
      let toastTimer = null;

      function hideAiToast() {
        aiToast?.classList.add('hidden');
        if (toastTimer) { clearInterval(toastTimer); toastTimer = null; }
      }
      function showAiToast() {
        hideAiToast();
        if (!aiToast) return;
        let sec = 10;
        aiToast.classList.remove('hidden');
        if (toastCountEl) toastCountEl.textContent = `Auto-hides in ${sec}s`;
        toastTimer = setInterval(() => {
          sec -= 1;
          if (sec <= 0) hideAiToast();
          else if (toastCountEl) toastCountEl.textContent = `Auto-hides in ${sec}s`;
        }, 1000);
      }
      document.getElementById('btn-demo-toast')?.addEventListener('click', showAiToast);
      document.getElementById('btn-dismiss-toast')?.addEventListener('click', hideAiToast);
      document.getElementById('btn-toast-open-ai')?.addEventListener('click', () => {
        hideAiToast();
        aiDrawer?.classList.remove('hidden');
        aiDrawer?.classList.add('flex');
        setTimeout(() => aiInput?.focus(), 60);
      });
      setTimeout(() => {
        if (aiDrawer?.classList.contains('hidden')) showAiToast();
      }, 180000);

      // Scroll-Triggered Tabular Stat Roll-Up (Once-Only)
      const statBar = document.getElementById('stat-rollup-bar');
      if (statBar && typeof IntersectionObserver !== 'undefined') {
        const statIo = new IntersectionObserver((entries) => {
          if (!entries[0]?.isIntersecting) return;
          statIo.disconnect();
          const nums = statBar.querySelectorAll('.stat-counter');
          const start = performance.now();
          const dur = 950;
          function step(now) {
            const p = Math.min(1, (now - start) / dur);
            const ease = 1 - Math.pow(1 - p, 3);
            nums.forEach((el) => {
              const target = parseFloat(el.dataset.target || '0');
              const dec = parseInt(el.dataset.dec || '0', 10);
              const suf = el.dataset.suf || '';
              const v = target * ease;
              el.textContent = (dec > 0 ? v.toFixed(dec) : Math.round(v).toLocaleString('en-IN')) + suf;
            });
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        }, { threshold: 0.35 });
        statIo.observe(statBar);
      }

      // All 16 FAQs
      const faqs = [
        ['Which Apple Devices Do You Repair?', 'iPhone (all models), iPad, iPod touch, AirPods, Apple Watch, MacBook Pro/Air, Mac mini, iMac and Mac Studio.'],
        ['How Long Does a Typical Repair Take?', 'Displays and batteries take 30–45 minutes while you wait; back glass ~60 minutes; board-level work 1–3 days.'],
        ['Do You Give a Warranty?', 'Yes — a written 6 Months repair warranty on displays, front glass restoration, batteries, and standard parts (motherboard repairs excluded).'],
        ['How Do I Claim Under Warranty?', 'Simply bring your CRM invoice or Job ID — diagnosis and covered repair are handled on the same record.'],
        ['What Does the Warranty Not Cover?', 'Physical/accidental damage, liquid damage, repairs by another shop after us, normal wear, and motherboard repairs.'],
        ['Are Parts Precision-Tested?', 'We use OEM-grade, precision-tested components with full sourcing disclosure. Red Apple is an independent studio not affiliated with Apple Inc.'],
        ['Do I Need an Appointment?', 'No appointment needed — walk in anytime 10 AM – 12 AM midnight, all 7 days, or book 24/7 doorstep pickup.'],
        ['Can You Diagnose Inaccessible Photos or Files?', 'Yes, we perform board-level storage IC diagnosis confidentially. No data outcome is promised before assessment.'],
        ['Do You Offer Pickup and Delivery?', 'Yes — free insured 24/7 doorstep pickup and drop across Bengaluru.'],
        ['Where Are You Located?', 'Metro Pillar No 125, No.38, opposite Bhadra Landmark, Halasuru, Bengaluru 560008 (1 min from Halasuru Metro).'],
        ['Will My Data Stay Safe?', '100% — we follow a strict Zero-Password Policy and never ask for your passcode or Apple ID.'],
        ['What If You Can\'t Fix It?', 'Free diagnosis — if we cannot fix it or you decline our quote, you pay nothing.'],
        ['How Do I Track My Repair Status?', 'Enter your CRM Job ID right on this website or follow automated WhatsApp stage updates.'],
        ['Do You Repair MacBooks Too?', 'Yes — Retina screens, batteries, keyboards, USB-C ports, and component-level logic board repairs.'],
        ['What Is Front Glass Restoration?', 'Replacing only the cracked outer glass using TBK OCA vacuum lamination while keeping your original OLED & True Tone.'],
        ['How Much Does Front Glass Restoration Cost?', 'Published fixed rates from ₹2,500 (iPhone 8/SE) to ₹19,500 (iPhone 18 Pro Max), parts and labour included.']
      ];
      const faqList = document.getElementById('faq-list');
      if (faqList) {
        faqList.innerHTML = faqs.map(([q, a]) => `
          <details class="group rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
            <summary class="flex cursor-pointer list-none items-center justify-between text-xs font-extrabold text-zinc-950 sm:text-sm">
              <span>${q}</span><span class="text-red-600 transition group-open:rotate-45">+</span>
            </summary>
            <p class="mt-2 text-xs leading-relaxed text-zinc-600">${a}</p>
          </details>
        `).join('');
      }

      // ============================================================
      // 4. FULL MANUAL TEXT CHAT AI BENCH + PWA MODAL + SCROLL REVEAL
      // ============================================================
      document.getElementById('btn-open-ai')?.addEventListener('click', () => {
        if (!aiDrawer) return;
        const isOpen = !aiDrawer.classList.contains('hidden');
        aiDrawer.classList.toggle('hidden', isOpen);
        aiDrawer.classList.toggle('flex', !isOpen);
        if (!isOpen) setTimeout(() => aiInput?.focus(), 60);
      });
      document.getElementById('btn-close-ai')?.addEventListener('click', () => {
        aiDrawer?.classList.add('hidden');
        aiDrawer?.classList.remove('flex');
      });
      document.getElementById('btn-clear-ai')?.addEventListener('click', () => {
        if (aiMsgs) {
          aiMsgs.innerHTML = `<div class="rounded-2xl rounded-tl-sm border border-zinc-200 bg-white p-3 text-zinc-700 shadow-sm"><strong>Chat reset.</strong> Ask me about any Apple model, glass price, warranty, or 24/7 pickup!</div>`;
        }
      });

      const aiDevice = document.getElementById('ai-device');
      const aiModel = document.getElementById('ai-model');
      const aiIssue = document.getElementById('ai-issue');
      const MODEL_LISTS = {
        'iPad': ['iPad Pro 12.9', 'iPad Pro 11', 'iPad Air', 'iPad Mini', 'iPad 10th Gen', 'iPad 9th Gen'],
        'MacBook': ['MacBook Pro', 'MacBook Air', 'iMac', 'Mac Mini'],
        'Apple Watch': ['Apple Watch Ultra 2', 'Apple Watch Ultra', 'Series 9', 'Series 8', 'Series 7', 'Watch SE 2'],
        'AirPods': ['AirPods Pro', 'AirPods Max', 'AirPods 3', 'AirPods 2'],
      };
      function populateModels() {
        if (!aiModel || !aiDevice) return;
        const dev = aiDevice.value;
        const list = dev === 'iPhone' ? fullPrices.map((r) => r[0]) : (MODEL_LISTS[dev] || []);
        aiModel.innerHTML = '<option value="">Model</option>' + list.map((m) => '<option>' + m + '</option>').join('');
        aiModel.disabled = list.length === 0;
      }
      aiDevice?.addEventListener('change', () => { populateModels(); try { sessionStorage.setItem('ra-ai-dev', aiDevice.value); } catch(e){} });
      aiIssue?.addEventListener('change', () => { try { sessionStorage.setItem('ra-ai-issue', aiIssue.value); } catch(e){} });
      aiModel?.addEventListener('change', () => { try { sessionStorage.setItem('ra-ai-model', aiModel.value); } catch(e){} });
      try {
        const savedDev = sessionStorage.getItem('ra-ai-dev');
        if (savedDev && aiDevice && [...aiDevice.options].some(o => o.value === savedDev)) {
          aiDevice.value = savedDev; populateModels();
          const savedModel = sessionStorage.getItem('ra-ai-model');
          if (savedModel && aiModel && [...aiModel.options].some(o => o.value === savedModel)) aiModel.value = savedModel;
          const savedIssue = sessionStorage.getItem('ra-ai-issue');
          if (savedIssue && aiIssue) aiIssue.value = savedIssue;
        } else populateModels();
      } catch(e) { populateModels(); }


      // Page Plan — chapter links + "Start Tour" auto-scroll through the sections.
      const pagePlanLinks = document.getElementById('page-plan-links');
      const PLAN = [
        { id: '#hero', label: 'Hero' },
        { id: '#real-shop', label: 'Shop' },
        { id: '#tbk-machines', label: 'TBK' },
        { id: '#glass-lab', label: 'Glass' },
        { id: '#ecosystem-3d', label: 'Devices' },
        { id: '#paired-crm', label: 'Status' },
        { id: '#comparison', label: 'Compare' },
        { id: '#reviews', label: 'Reviews' },
        { id: '#halasuru-map', label: 'Visit' },
      ];
      if (pagePlanLinks) {
        pagePlanLinks.innerHTML = PLAN.map((p, i) => `<a href="${p.id}" data-go="${p.id}" class="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-red-700 transition-transform hover:scale-105"><span class="inline-block w-4 h-4 rounded-full bg-black/60 text-white text-[9px] text-center leading-4">${i + 1}</span> ${p.label}</a>`).join('');
        pagePlanLinks.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', (e) => {
          e.preventDefault();
          const el = document.querySelector(b.dataset.go);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }));
      }
      let tourTimeout = null;
      const startTour = () => {
        if (tourTimeout) { clearTimeout(tourTimeout); tourTimeout = null; return; }
        let i = 0;
        (function next() {
          if (i >= PLAN.length) return;
          const el = document.querySelector(PLAN[i].id);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          i++;
          tourTimeout = setTimeout(next, 2400);
        })();
      };
      document.getElementById('tour-start')?.addEventListener('click', () => {
        const btn = document.getElementById('tour-start');
        const done = document.getElementById('tour-done');
        if (btn && done) { btn.classList.add('active'); done.textContent = '✓ Tour complete — tap any chip to jump'; }
        startTour();
      });
      const _sd = () => { const b = document.getElementById('tour-start'); if (b) b.classList.remove('active'); const d=document.getElementById('tour-done'); if (d) d.textContent=''; };
      document.querySelectorAll('#page-plan-links [data-go]').forEach(b=>b.addEventListener('click',()=>setTimeout(_sd,300)));

      // Phase A2b: Global scroll pause (kills CSS animations in text zones — 120fps answer).
let scTimer=null;
const lockScroll=()=>{document.documentElement.classList.add('is-scrolling'); if(scTimer)clearTimeout(scTimer); scTimer=setTimeout(()=>document.documentElement.classList.remove('is-scrolling'),180);};
addEventListener('scroll',lockScroll,{passive:true});
addEventListener('scrollend',()=>document.documentElement.classList.remove('is-scrolling'));

// Gift: floating back-to-top (smooth transition, discovers for free)
      const backTop = document.getElementById('back-to-top');
      if (backTop) {
        backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        const ioBack = new IntersectionObserver((es) => { es.forEach((e) => backTop.classList.toggle('translate-y-8', e.isIntersecting)); }, { rootMargin: '0px -20px 0px 0px' });
        ioBack.observe(document.getElementById('footer-contact') || document.body);

      // Phase A2: 1px top sentinel toggles header shadow ONCE (no per-frame scroll JS)
      const hdrSentinel = document.createElement('div');
      hdrSentinel.className = 'h-px w-full';
      hdrSentinel.style.top = '44px';
      hdrSentinel.style.position = 'fixed';
      hdrSentinel.style.pointerEvents = 'none';
      hdrSentinel.style.zIndex = '-1';
      document.body.prepend(hdrSentinel);
      const hdr = document.querySelector('.site-header-120fps');
      if (hdr) new IntersectionObserver((es) => es.forEach((e) => hdr.classList.toggle('is-scrolled', !e.isIntersecting)), { rootMargin: '0px 0px -1px 0px' }).observe(hdrSentinel);
      }

      // Gift: dark/light theme toggle
      const themeToggle = document.getElementById('theme-toggle');
      const applyTheme = (mode) => { document.documentElement.dataset.theme = mode; };
      const detectTheme = () => {
        const saved = localStorage.getItem('ra-theme');
        if (saved) return saved;
        return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      };
      applyTheme(detectTheme());
      themeToggle?.addEventListener('click', () => {
        const now = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        applyTheme(now); localStorage.setItem('ra-theme', now);
        document.querySelectorAll('#theme-toggle [data-icon]').forEach(el => el.classList.add('hidden'));
        document.querySelector('#theme-toggle [data-icon="' + now + '"]')?.classList.remove('hidden');
      });
      // initial: reveal the correct theme icon
      document.querySelectorAll('#theme-toggle [data-icon]').forEach(el => el.classList.toggle('hidden', document.documentElement.dataset.theme === 'dark' ? false : true));

      // Reduced-motion toggle
      const rmToggle = document.getElementById('rm-toggle');
      const rmLabel = document.getElementById('rm-label');
      const updateRmLabel = () => { const on = document.documentElement.classList.contains('reduce-motion'); if (rmLabel) rmLabel.textContent = on ? 'Reduced' : 'Auto'; const t = rmToggle; if (t) t.classList.toggle('active', on); };
      rmToggle?.addEventListener('click', () => { document.documentElement.classList.toggle('reduce-motion'); updateRmLabel(); });
      updateRmLabel();
      // green check after tour
      const escHtml = (t) => String(t).replace(/</g, '&lt;').replace(/>/g, '&gt;');

      // Smooth dedicated chat entry: type a first message -> asks the bot directly
      const typingIn = document.getElementById('ai-typing-input');
      const typingSend = document.getElementById('ai-typing-send');
      if (typingIn && typingSend && !typingIn.dataset.bound) {
        typingIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') typingSend.click(); });
        typingSend.addEventListener('click', () => { const t = typingIn.value.trim(); typingIn.value = ''; if (t) replyToUser(t); });
      typingIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') typingSend.click(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && aiDrawer && !aiDrawer.classList.contains('hidden')) { aiDrawer.classList.add('hidden'); aiDrawer.classList.remove('flex'); } });
      document.querySelectorAll('#footer-contact li:has(button[id="copy-address"])')?.length;
      const copyBtn = document.getElementById('copy-address');
      if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
          await navigator.clipboard?.writeText('Metro Pillar No 125, No.38, opp. Bhadra Landmark, Halasuru, Bengaluru 560008');
          const lbl = document.getElementById('address-copied'); if (lbl) lbl.classList.remove('hidden');
          setTimeout(() => lbl?.classList.add('hidden'), 2500);
        });
      }
        typingIn.dataset.bound = '1';
      }
      function localBotAnswer(q) {
        const lower = q.toLowerCase();
        const matched = fullPrices.find(([m]) => lower.includes(m.toLowerCase().replace('iphone ', '')));
        if (matched) return '<strong>' + matched[0] + '</strong> Front Glass Restoration (Keep Original OLED) is <strong>₹' + matched[1].toLocaleString('en-IN') + '</strong> with 6 Months written CRM warranty.';
        if (lower.includes('motherboard') || lower.includes('board') || lower.includes('ic')) return '<strong>Motherboard / IC Repair:</strong> ₹10,500 – ₹14,500 after free microscope diagnosis. Motherboard work is excluded from the standard 6 Months warranty.';
        if (lower.includes('warranty')) return '<strong>6 Months Written Warranty</strong> covers displays, glass, batteries and standard repairs via your CRM invoice (motherboard work excluded).';
        if (lower.includes('pickup') || lower.includes('24')) return '<strong>Free 24/7 Doorstep Pickup</strong> across Bengaluru, insured and sealed, with zero-password privacy.';
        return 'Our Halasuru technicians repair iPhone, iPad, Apple Watch, AirPods and MacBook with free inspection and a fixed written CRM quote. Ask for a model to see its exact front-glass price.';
      }

      let aiHistory = [];
      async function replyToUser(rawText) {
        const q = (rawText || '').trim();
        if (!q || !aiMsgs) return;
        aiMsgs.innerHTML += '<div class="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-zinc-900 px-3 py-2 text-white shadow-sm">' + escHtml(q) + '</div>';
        const bid = 'ai-' + Date.now() + Math.random().toString(36).slice(2, 6);
        aiMsgs.innerHTML += '<div id="' + bid + '" class="max-w-[92%] rounded-2xl rounded-tl-sm border border-zinc-200 bg-white p-3 text-zinc-700 shadow-sm"><span class="text-zinc-400">Checking the bench prices…</span></div>';
        aiMsgs.scrollTop = aiMsgs.scrollHeight;
        const bubble = document.getElementById(bid);
        let full = '';
        try {
          const res = await fetch('/api/concierge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: q, history: aiHistory.slice(-6) })
          });
          if (!res.ok || !res.body) throw new Error('offline');
          const reader = res.body.getReader();
          const dec = new TextDecoder();
          for (;;) {
            const part = await reader.read();
            if (part.done) break;
            full += dec.decode(part.value, { stream: true });
            if (bubble) bubble.innerHTML = escHtml(full).replace(/\n/g, '<br>');
            aiMsgs.scrollTop = aiMsgs.scrollHeight;
          }
          const src = res.headers.get('X-Concierge-Source') || 'gemini';
          if (bubble) bubble.innerHTML = escHtml(full).replace(/\n/g, '<br>') +
            '<div class="mt-2 text-[9px] font-bold ' + (src === 'gemini' ? 'text-red-600' : 'text-emerald-700') + '">' +
            (src === 'gemini' ? '✦ Forge AI · live answer' : '● Verified local knowledge') + '</div>';
          aiHistory.push({ role: 'user', text: q }, { role: 'model', text: full });
        } catch (err) {
          full = localBotAnswer(q);
          if (bubble) bubble.innerHTML = full + '<div class="mt-2 text-[9px] font-bold text-emerald-700">● Verified local knowledge</div>';
        }
        const wa = 'https://wa.me/918660663776?text=' + encodeURIComponent('Hi Red Apple Bench, I asked AI Bench: ' + q);
        if (bubble) bubble.innerHTML += '<a href="' + wa + '" target="_blank" rel="noopener noreferrer" class="mt-2 inline-block rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold text-white">Continue on WhatsApp →</a>';
        const handoff = document.getElementById('ai-wa-handoff');
        if (handoff) handoff.href = wa;
        aiMsgs.scrollTop = aiMsgs.scrollHeight;
      }

      document.getElementById('btn-ai-price')?.addEventListener('click', () => {
        const parts = [aiDevice?.value, aiModel?.value, aiIssue?.value].filter(Boolean);
        replyToUser(parts.length ? parts.join(' · ') + ' — fixed price and turnaround please' : 'Show me your repair price list and warranty');
      });


      // PWA Modal
      const pwaModal = document.getElementById('pwa-modal');
      document.getElementById('btn-pwa-open')?.addEventListener('click', () => { pwaModal?.classList.remove('hidden'); pwaModal?.classList.add('flex'); });
      document.getElementById('btn-pwa-close')?.addEventListener('click', () => { pwaModal?.classList.add('hidden'); pwaModal?.classList.remove('flex'); });
      document.getElementById('btn-pwa-confirm')?.addEventListener('click', () => { document.getElementById('pwa-status')?.classList.remove('hidden'); });

      // Scroll Reveal + Left Page Rail Active Tracker
      if (typeof IntersectionObserver !== 'undefined') {
        const revIo = new IntersectionObserver((entries) => {
          entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); revIo.unobserve(en.target); } });
        }, { threshold: 0.08 });
        document.querySelectorAll('.reveal-up').forEach((el) => revIo.observe(el));

        const railDots = document.querySelectorAll('.page-rail-dot');
        const railLbl = document.getElementById('rail-label');
        const secIo = new IntersectionObserver((entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              const id = '#' + en.target.id;
              railDots.forEach((d) => {
                const match = d.getAttribute('href') === id;
                d.classList.toggle('is-active', match);
                if (match && railLbl) railLbl.textContent = d.dataset.rail || 'HERO';
              });
            }
          });
        }, { threshold: 0.25 });
        ['hero', 'real-shop', 'estimate', 'glass-lab', 'tbk-machines', 'ecosystem-3d', 'comparison', 'reviews', 'halasuru-map'].forEach((id) => {
          const el = document.getElementById(id);
          if (el) secIo.observe(el);
        });
      } else {
        document.querySelectorAll('.reveal-up').forEach((el) => el.classList.add('is-in'));
      }

      // ============================================================
      // 5. RAZOR-SHARP HiDPI SINGLE-CONTEXT WEBGL ENGINE (ALL 10 MODELS)
      // ============================================================
      if (typeof THREE === 'undefined') return;
      try {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        // Gift: adaptive resolution governor — lowers DPR only if real frame
        // times regress, then restores it when the device has headroom again.
        let adaptiveDpr = dpr, perfAcc = 0, perfFrames = 0;
        const MAX_W = 1280, MAX_H = 960;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' });
        renderer.setPixelRatio(1);
        renderer.setSize(MAX_W, MAX_H, false);
        renderer.setClearColor(0x000000, 0);
        renderer.setScissorTest(true);

        const slots = [];
        const io = typeof IntersectionObserver !== 'undefined'
          ? new IntersectionObserver((entries) => {
              entries.forEach((en) => {
                const s = slots.find((x) => x.canvas === en.target);
                if (s) s.visible = en.isIntersecting;
              });
            }, { threshold: 0.04 })
          : null;

        function roundedShape(w, h, r) {
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

        function addOrbit(canvas, group, initY = -0.4, initX = 0.12) {
          let drag = false, px = 0, py = 0, ry = initY, rx = initX, ty = initY, tx = initX;
          let enabled = true;
          canvas.addEventListener('pointerdown', (e) => { if (!enabled) return; drag = true; px = e.clientX; py = e.clientY; });
          window.addEventListener('pointermove', (e) => {
            if (!drag) return;
            ty += (e.clientX - px) * 0.011;
            tx = Math.max(-0.85, Math.min(0.85, tx + (e.clientY - py) * 0.009));
            px = e.clientX; py = e.clientY;
          });
          window.addEventListener('pointerup', () => { drag = false; });
          return {
            setEnabled(v) { enabled = v; },
            reset() { ty = initY; tx = initX; },
            update(autoSpeed) {
              if (!drag) ty += autoSpeed;
              ry += (ty - ry) * 0.1;
              rx += (tx - rx) * 0.1;
              group.rotation.y = ry;
              group.rotation.x = rx;
            }
          };
        }


        /**
         * Auto-frame a slot's model into the view so EVERY model (OCA press,
         * bubble chamber, 958 laser, devices, iPhone internals...) is drawn
         * uniformly — filling ~82% of the narrower visible axis at draw time,
         * recentered at origin so nothing is cropped by aspect or builder
         * offsets. Uses Box3 with precise=true so refined geometries fit tight.
         */
        function centerAndFitEdgeToEdge(camera, root, padding) {
          try {
            const scaleP = padding || 1.42;
            root.updateWorldMatrix(true, true);
            const rawBox = new THREE.Box3().setFromObject(root, true);
            const rawSphere = rawBox.getBoundingSphere(new THREE.Sphere());
            const normScale = rawSphere.radius > 0 ? (2.0 / rawSphere.radius) : 1.0;
            root.scale.multiplyScalar(normScale);
            root.position.set(0, 0, 0);
            root.updateWorldMatrix(true, true);
            const centeredBox = new THREE.Box3().setFromObject(root);
            const center = centeredBox.getCenter(new THREE.Vector3());
            root.position.sub(center);
            root.updateWorldMatrix(true, true);
            const sp = new THREE.Box3().setFromObject(root).getBoundingSphere(new THREE.Sphere());
            const r = sp.radius;
            const vFov = THREE.MathUtils.degToRad(camera.fov);
            const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
            const minFov = Math.min(vFov, hFov);
            const dist = (r / Math.sin(minFov / 2)) * scaleP;
            camera.near = Math.max(0.05, dist - r * 2.5);
            camera.far = dist + r * 3.5;
            camera.position.set(0, 0, dist);
            camera.lookAt(0, 0, 0);
            camera.updateProjectionMatrix();
            return { radius: r, distance: dist };
          } catch (e) { console.warn('centerAndFitEdgeToEdge skipped', e); }
        }

        function registerSlot(canvasId, camZ, buildFn, initY = -0.4, initX = 0.12) {
          const canvas = document.getElementById(canvasId);
          if (!canvas) return null;
          const ctx = canvas.getContext('2d');
          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(40, 4 / 3, 0.1, 100);
          camera.position.set(0, 0.42, camZ);
          camera.lookAt(0, 0, 0);
          scene.add(new THREE.AmbientLight(0xffffff, 0.95));
          const key = new THREE.DirectionalLight(0xffffff, 1.35); key.position.set(4, 6.5, 5.5); scene.add(key);
          const fill = new THREE.DirectionalLight(0xbfdbfe, 0.55); fill.position.set(-4, 2, -4); scene.add(fill);
          const rim = new THREE.PointLight(0xf97316, 1.75, 16); rim.position.set(-2.8, 1.8, 3.2); scene.add(rim);
          const root = new THREE.Group();
          scene.add(root);
          const onTick = buildFn(root);
          const orbit = addOrbit(canvas, root, initY, initX);
          const slot = { canvas, ctx, scene, camera, root, orbit, onTick, visible: true };
          slots.push(slot);
          if (io) io.observe(canvas);
          return slot;
        }

        // Crisp Studio PBR Materials
        const orangeTit = new THREE.MeshStandardMaterial({ color: 0xd9480f, metalness: 0.72, roughness: 0.22 });
        const darkObs = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.78, roughness: 0.2 });
        const silverMat = new THREE.MeshStandardMaterial({ color: 0xe4e4e7, metalness: 0.85, roughness: 0.18 });
        const slateMat = new THREE.MeshStandardMaterial({ color: 0x52525b, metalness: 0.76, roughness: 0.22 });
        const screenMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x2563eb, emissiveIntensity: 0.46, roughness: 0.1, metalness: 0.35 });
        const redGlow = new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0xdc2626, emissiveIntensity: 0.75 });
        const uvGlow = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 1.0, transparent: true, opacity: 0.9 });
        const copperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.88, roughness: 0.18 });
        const pcbMat = new THREE.MeshStandardMaterial({ color: 0x15803d, metalness: 0.35, roughness: 0.4 });
        const glassClear = new THREE.MeshStandardMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.32, roughness: 0.08 });

        function fillRoundedRect(g, x, y, w, h, r) {
          g.beginPath();
          g.moveTo(x + r, y);
          g.lineTo(x + w - r, y);
          g.quadraticCurveTo(x + w, y, x + w, y + r);
          g.lineTo(x + w, y + h - r);
          g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          g.lineTo(x + r, y + h);
          g.quadraticCurveTo(x, y + h, x, y + h - r);
          g.lineTo(x, y + r);
          g.quadraticCurveTo(x, y, x + r, y);
          g.closePath();
          g.fill();
        }

        function makeLockScreenTexture() {
          const c = document.createElement('canvas');
          c.width = 512; c.height = 1024;
          const g = c.getContext('2d');
          const bg = g.createLinearGradient(0, 0, 512, 1024);
          bg.addColorStop(0, '#1c0a04');
          bg.addColorStop(0.32, '#7c2d12');
          bg.addColorStop(0.58, '#ea580c');
          bg.addColorStop(0.84, '#991b1b');
          bg.addColorStop(1, '#09090b');
          g.fillStyle = bg;
          g.fillRect(0, 0, 512, 1024);

          g.strokeStyle = 'rgba(255, 237, 213, 0.25)';
          g.lineWidth = 4;
          for (let i = 0; i < 4; i++) {
            g.beginPath();
            g.arc(256, 560 + i * 38, 210 + i * 28, Math.PI * 1.05, Math.PI * 1.95);
            g.stroke();
          }

          g.fillStyle = 'rgba(255,255,255,0.88)';
          g.font = '600 26px Inter, sans-serif';
          g.textAlign = 'center';
          g.fillText('Friday, 20 November', 256, 178);
          g.font = '800 132px Inter, sans-serif';
          g.fillStyle = '#ffffff';
          g.fillText('9:41', 256, 306);

          g.fillStyle = 'rgba(9, 9, 11, 0.62)';
          fillRoundedRect(g, 76, 800, 360, 86, 26);
          g.fillStyle = '#fb923c';
          g.font = '700 20px Inter, sans-serif';
          g.fillText('RED APPLE · HALASURU LAB', 256, 836);
          g.fillStyle = '#e4e4e7';
          g.font = '500 18px Inter, sans-serif';
          g.fillText('Original OLED · True Tone Active', 256, 868);

          g.fillStyle = 'rgba(255,255,255,0.85)';
          fillRoundedRect(g, 166, 982, 180, 10, 5);

          const tex = new THREE.CanvasTexture(c);
          tex.anisotropy = 4;
          return tex;
        }

        const heroScreenTex = makeLockScreenTexture();
        const heroOledMat = new THREE.MeshStandardMaterial({
          map: heroScreenTex,
          emissiveMap: heroScreenTex,
          emissive: new THREE.Color(0xffffff),
          emissiveIntensity: 0.45,
          roughness: 0.08,
          metalness: 0.15
        });
        const cosmicOrangeFrame = new THREE.MeshStandardMaterial({ color: 0xea580c, metalness: 0.84, roughness: 0.22 });
        const cosmicOrangeBack = new THREE.MeshStandardMaterial({ color: 0xc2410c, metalness: 0.52, roughness: 0.32 });
        const lensOpticMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x1d4ed8, emissiveIntensity: 0.45, metalness: 0.96, roughness: 0.05 });

        function buildBeveledPhone(matBody, useHeroScreen = false) {
          const g = new THREE.Group();
          const bodyGeo = new THREE.ExtrudeGeometry(roundedShape(1.48, 2.98, 0.24), {
            depth: 0.15, bevelEnabled: true, bevelThickness: 0.028, bevelSize: 0.025, bevelSegments: 5
          });
          bodyGeo.center();
          g.add(new THREE.Mesh(bodyGeo, matBody));

          const backPlate = new THREE.Mesh(new THREE.PlaneGeometry(1.36, 2.84), useHeroScreen ? cosmicOrangeBack : matBody);
          backPlate.rotation.y = Math.PI;
          backPlate.position.z = -0.105;
          g.add(backPlate);

          const bezel = new THREE.Mesh(new THREE.PlaneGeometry(1.38, 2.86), darkObs);
          bezel.position.z = 0.104;
          const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.32, 2.78), useHeroScreen ? heroOledMat : screenMat);
          scr.position.z = 0.108;
          const pill = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.012), darkObs);
          pill.position.set(0, 1.24, 0.114);
          g.add(bezel, scr, pill);

          const pwrBtn = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.34, 0.055), silverMat); pwrBtn.position.set(0.77, 0.34, 0);
          const camBtn = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.24, 0.055), darkObs); camBtn.position.set(0.77, -0.45, 0);
          const actBtn = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.14, 0.055), silverMat); actBtn.position.set(-0.77, 0.72, 0);
          const volUp = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.24, 0.055), silverMat); volUp.position.set(-0.77, 0.4, 0);
          const volDn = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.24, 0.055), silverMat); volDn.position.set(-0.77, 0.08, 0);
          g.add(pwrBtn, camBtn, actBtn, volUp, volDn);

          const barGeo = new THREE.ExtrudeGeometry(roundedShape(1.3, 0.58, 0.14), {
            depth: 0.05, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 3
          });
          barGeo.center();
          const bar = new THREE.Mesh(barGeo, darkObs);
          bar.position.set(0, 1.02, -0.13);
          g.add(bar);

          [[-0.39, 1.13], [-0.39, 0.9], [-0.14, 1.015]].forEach(([x, y]) => {
            const outerRing = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.018, 14, 32), silverMat);
            outerRing.position.set(x, y, -0.175);
            const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.115, 0.055, 28), darkObs);
            barrel.rotation.x = Math.PI / 2; barrel.position.set(x, y, -0.155);
            const optic = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.02, 24), lensOpticMat);
            optic.rotation.x = Math.PI / 2; optic.position.set(x, y, -0.178);
            g.add(outerRing, barrel, optic);
          });
          const lidar = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.035, 20), darkObs);
          lidar.rotation.x = Math.PI / 2; lidar.position.set(0.42, 0.9, -0.165);
          const flash = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.035, 20), new THREE.MeshStandardMaterial({ color: 0xfef3c7, emissive: 0xfde68a, emissiveIntensity: 0.35 }));
          flash.rotation.x = Math.PI / 2; flash.position.set(0.42, 1.12, -0.165);
          const mag = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.02, 14, 48), redGlow);
          mag.position.set(0, -0.12, -0.108);
          g.add(lidar, flash, mag);
          return g;
        }

        // 1. HERO: Flagship Keynote iPhone 17 Pro Max · Orange
        let heroAmbient = false;
        const heroSlot = registerSlot('canvas-hero', 6.1, (root) => {
          const phone = buildBeveledPhone(cosmicOrangeFrame, true);
          const laserScan = new THREE.Mesh(
            new THREE.BoxGeometry(1.86, 0.022, 0.38),
            new THREE.MeshBasicMaterial({ color: 0xfb923c, transparent: true, opacity: 0.78 })
          );
          const halo1 = new THREE.Mesh(
            new THREE.TorusGeometry(1.74, 0.014, 14, 72),
            new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.4 })
          );
          halo1.rotation.x = Math.PI / 2.25;
          const halo2 = new THREE.Mesh(
            new THREE.TorusGeometry(2.02, 0.01, 12, 72),
            new THREE.MeshBasicMaterial({ color: 0xdc2626, transparent: true, opacity: 0.24 })
          );
          halo2.rotation.x = -Math.PI / 2.55;
          const shadow = new THREE.Mesh(
            new THREE.CircleGeometry(1.18, 40),
            new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.38 })
          );
          shadow.rotation.x = -Math.PI / 2;
          shadow.position.y = -1.82;
          root.add(phone, laserScan, halo1, halo2, shadow);
          return (t) => {
            const fy = Math.sin(t * 1.4) * 0.12;
            phone.position.y = fy;
            phone.rotation.z = Math.sin(t * 0.8) * 0.045;
            laserScan.position.y = fy + Math.sin(t * 2.0) * 1.38;
            halo1.rotation.z = t * 0.55;
            halo2.rotation.z = -t * 0.38;
            shadow.scale.setScalar(1.0 - fy * 0.35);
          };
        }, -0.35, 0.06);

        document.getElementById('btn-hero-orbit')?.addEventListener('click', (e) => {
          heroAmbient = !heroAmbient;
          if (heroSlot) heroSlot.orbit.setEnabled(!heroAmbient);
          e.target.textContent = heroAmbient ? 'Enable 360° Drag Orbit' : 'Switch to Scroll-Safe BG';
          const hud = document.getElementById('hero-hud');
          if (hud) hud.textContent = heroAmbient ? 'Scroll-Safe Hero BG · Touch passes through' : 'Drag to orbit 360° · HD Keynote Animation';
        });
        document.getElementById('btn-hero-reset')?.addEventListener('click', () => {
          if (heroSlot) heroSlot.orbit.reset();
        });

        // 2. 30-Second Estimate — Animated 3D iPad Pro
        registerSlot('canvas-estimate-ipad', 6.0, (root) => {
          const padGeo = new THREE.ExtrudeGeometry(roundedShape(2.4, 3.05, 0.16), { depth: 0.07, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 3 });
          padGeo.center();
          const pad = new THREE.Mesh(padGeo, silverMat);
          const scr = new THREE.Mesh(new THREE.PlaneGeometry(2.22, 2.86), screenMat);
          scr.position.z = 0.055;
          const cam = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.05), darkObs);
          cam.position.set(-0.82, 1.15, -0.06);
          const pencil = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.95, 18), silverMat);
          pencil.rotation.z = Math.PI / 2;
          pencil.position.set(0, 1.72, 0);
          root.add(pad, scr, cam, pencil);
          return (t) => {
            root.position.y = Math.sin(t * 1.2) * 0.08;
            pencil.position.y = 1.72 + Math.sin(t * 1.8) * 0.1;
          };
        }, -0.3, 0.1);

        // 3. Free Doorstep Pickup 24/7 — Animated 3D iPhone
        registerSlot('canvas-pickup-iphone', 5.9, (root) => {
          const phone = buildBeveledPhone(slateMat, false);
          const halo = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.02, 12, 60), new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.5 }));
          halo.rotation.x = Math.PI / 2.3;
          root.add(phone, halo);
          return (t) => {
            phone.position.y = Math.sin(t * 1.4) * 0.1;
            halo.rotation.z = t * 0.7;
          };
        }, 0.4, 0.12);

        // 4. TBK OCA Hydraulic Press 3D
        registerSlot('canvas-tbk-oca', 5.8, (root) => {
          root.position.y = -0.2;
          const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 1.8), silverMat); base.position.y = -0.8;
          const top = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 1.8), slateMat); top.position.y = 1.05;
          const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.6, 20), darkObs); cyl.position.y = 1.48;
          const win = new THREE.Mesh(new THREE.BoxGeometry(2.05, 1.2, 1.5), glassClear); win.position.y = 0.22;
          const platen = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.14, 1.25), orangeTit); platen.position.y = 0.5;
          root.add(base, top, cyl, win, platen);
          return (t) => { platen.position.y = 0.5 - ((Math.sin(t * 2.2) + 1) * 0.5) * 0.7; };
        }, -0.4, 0.2);

        // 5. TBK 90L Autoclave Bubble Chamber 3D
        registerSlot('canvas-tbk-90l', 5.9, (root) => {
          const base = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.42, 2.0), darkObs); base.position.y = -1.15;
          const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.98, 2.05, 32), slateMat); tank.rotation.x = Math.PI / 2;
          const dPivot = new THREE.Group(); dPivot.position.set(-0.98, 0, 1.04);
          const hatch = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 0.96, 0.16, 32), silverMat); hatch.rotation.x = Math.PI / 2; hatch.position.x = 0.98;
          const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.055, 12, 28), darkObs); wheel.position.set(0.98, 0, 0.15);
          const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.16, 16), redGlow); hub.rotation.x = Math.PI / 2; hub.position.set(0.98, 0, 0.15);
          dPivot.add(hatch, wheel, hub);
          root.add(base, tank, dPivot);
          return (t) => { dPivot.rotation.y = -Math.max(0, Math.sin(t * 0.9)) * 0.72; };
        }, -0.35, 0.18);

        // 6. TBK-958 Cold UV Purple Laser 3D
        registerSlot('canvas-tbk-958', 5.8, (root) => {
          root.position.y = -0.25;
          const base = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 2.2), silverMat); base.position.y = -1.05;
          const bed = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 1.5), darkObs); bed.position.set(0, -0.82, 0.2);
          const ph = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.06, 1.25), orangeTit); ph.position.set(0, -0.75, 0.2);
          const tower = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.15, 0.54), silverMat); tower.position.set(0, 0.18, -0.75);
          const arm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 1.35), silverMat); arm.position.set(0, 1.05, -0.15);
          const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.032, 1.5, 14), uvGlow); beam.position.set(0, -0.02, 0.2);
          const spot = new THREE.Mesh(new THREE.RingGeometry(0.04, 0.11, 20), uvGlow); spot.rotation.x = -Math.PI / 2; spot.position.set(0, -0.71, 0.2);
          root.add(base, bed, ph, tower, arm, beam, spot);
          return (t) => {
            const sx = Math.sin(t * 3.8) * 0.24;
            const sz = 0.2 + Math.cos(t * 1.8) * 0.42;
            spot.position.set(sx, -0.71, sz);
            beam.position.set(sx * 0.5, -0.02, 0.2 + (sz - 0.2) * 0.5);
            beam.rotation.z = sx * 0.3;
          };
        }, -0.4, 0.2);

        // 7. Stacked iPhone 17 Pro Max Internal Teardown 3D
        let intFactor = 0.65;
        document.getElementById('sl-internals')?.addEventListener('input', (e) => {
          intFactor = parseFloat(e.target.value) / 100;
          const v = document.getElementById('val-internals');
          if (v) v.textContent = Math.round(intFactor * 100) + '%';
        });
        registerSlot('canvas-internals', 5.8, (root) => {
          const lBack = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.8, 0.05), darkObs);
          const lFrame = new THREE.Mesh(new THREE.BoxGeometry(1.42, 2.84, 0.08), slateMat);
          const lBoard = new THREE.Group();
          const batt = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.5, 0.09), darkObs); batt.position.set(-0.25, -0.18, 0);
          const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.46, 1.12, 0.06), pcbMat); pcb.position.set(0.35, 0.24, 0.02);
          const soc = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.08), redGlow); soc.position.set(0.35, 0.34, 0.05);
          const vapor = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.92, 0.025), copperMat); vapor.position.set(-0.23, -0.14, 0.07);
          lBoard.add(batt, pcb, soc, vapor);
          const lOled = new THREE.Mesh(new THREE.BoxGeometry(1.38, 2.78, 0.04), glassClear);
          root.add(lBack, lFrame, lBoard, lOled);
          return () => {
            const sp = 0.1 + intFactor * 0.58;
            lBack.position.z = -sp * 1.5;
            lFrame.position.z = -sp * 0.5;
            lBoard.position.z = sp * 0.5;
            lOled.position.z = sp * 1.5;
          };
        }, -0.45, 0.14);

        // 8. Stacked Realistic AirPods Pro 3D (Matched Dark Crimson-Orange Studio Backdrop)
        let apFactor = 0.7;
        document.getElementById('sl-airpods')?.addEventListener('input', (e) => {
          apFactor = parseFloat(e.target.value) / 100;
          const v = document.getElementById('val-airpods');
          if (v) v.textContent = Math.round(apFactor * 100) + '%';
        });
        registerSlot('canvas-airpods', 5.2, (root) => {
          const apGlossWhite = new THREE.MeshStandardMaterial({ color: 0xf4f4f5, metalness: 0.12, roughness: 0.16 });
          const apSilicone = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.04, roughness: 0.42 });
          const apShadow = new THREE.Mesh(
            new THREE.CircleGeometry(1.38, 36),
            new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.36 })
          );
          apShadow.rotation.x = -Math.PI / 2;
          apShadow.position.y = -1.12;

          const baseGeo = new THREE.ExtrudeGeometry(roundedShape(1.9, 1.02, 0.32), {
            depth: 0.62, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 4
          });
          baseGeo.center();
          const base = new THREE.Mesh(baseGeo, apGlossWhite);
          base.position.y = -0.45;

          const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.12, 0.08), slateMat);
          hinge.position.set(0, 0.08, -0.44);
          const led = new THREE.Mesh(new THREE.SphereGeometry(0.042, 14, 14), new THREE.MeshBasicMaterial({ color: 0x16a34a }));
          led.position.set(0, -0.22, 0.45);

          const lidPivot = new THREE.Group();
          lidPivot.position.set(0, 0.12, -0.38);
          const lidGeo = new THREE.ExtrudeGeometry(roundedShape(1.9, 0.42, 0.2), {
            depth: 0.62, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 4
          });
          lidGeo.center();
          const lid = new THREE.Mesh(lidGeo, apGlossWhite);
          lid.position.set(0, 0.26, 0.38);
          lidPivot.add(lid);

          function makeBud(side) {
            const b = new THREE.Group();
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 20), apGlossWhite); head.scale.set(1.12, 0.96, 0.92);
            const vent = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.14, 0.085), darkObs); vent.position.set(side * 0.26, 0.02, 0);
            const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 12), darkObs); sensor.position.set(-side * 0.14, -0.04, 0.21);
            const tip = new THREE.Mesh(new THREE.SphereGeometry(0.17, 18, 14), apSilicone); tip.position.set(-side * 0.26, 0.02, 0.08);
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.05, 0.66, 18), apGlossWhite); stem.position.set(side * 0.11, -0.4, 0);
            const cap = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 14), slateMat); cap.position.set(side * 0.11, -0.73, 0);
            b.add(head, vent, sensor, tip, stem, cap);
            return b;
          }
          const lb = makeBud(-1), rb = makeBud(1);
          root.add(apShadow, base, hinge, led, lidPivot, lb, rb);
          return (t) => {
            lidPivot.rotation.x = -apFactor * 1.75;
            const fl = Math.sin(t * 2) * 0.04 * apFactor;
            lb.position.set(-0.42 - apFactor * 0.44, 0.08 + apFactor * 0.92 + fl, 0.08);
            rb.position.set(0.42 + apFactor * 0.44, 0.08 + apFactor * 0.92 - fl, 0.08);
          };
        }, -0.32, 0.16);

        // 9. Apple Watch Ultra 3D
        registerSlot('canvas-watch', 5.0, (root) => {
          const wCase = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.38, 0.28), slateMat);
          const face = new THREE.Mesh(new THREE.BoxGeometry(0.94, 1.18, 0.04), darkObs); face.position.z = 0.16;
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.032, 12, 32), redGlow); ring.position.z = 0.19;
          const act = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.34, 0.12), orangeTit); act.position.set(-0.6, 0.05, 0);
          const bTop = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.95, 0.08), darkObs); bTop.position.set(0, 1.15, -0.04);
          const bBot = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.95, 0.08), darkObs); bBot.position.set(0, -1.15, -0.04);
          root.add(wCase, face, ring, act, bTop, bBot);
          return (t) => { ring.scale.setScalar(0.95 + Math.sin(t * 2.2) * 0.05); };
        }, -0.35, 0.12);

        // 10. MacBook Pro 3D
        let mbFactor = 0.75;
        document.getElementById('sl-macbook')?.addEventListener('input', (e) => { mbFactor = parseFloat(e.target.value) / 100; });
        registerSlot('canvas-macbook', 6.0, (root) => {
          root.position.y = -0.35;
          const deck = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.11, 1.95), darkObs);
          const lidPivot = new THREE.Group(); lidPivot.position.set(0, 0.06, -0.96);
          const lid = new THREE.Mesh(new THREE.BoxGeometry(2.88, 1.88, 0.06), slateMat); lid.position.y = 0.95;
          const scr = new THREE.Mesh(new THREE.PlaneGeometry(2.74, 1.72), screenMat); scr.position.set(0, 0.95, 0.036);
          lidPivot.add(lid, scr);
          root.add(deck, lidPivot);
          return () => { lidPivot.rotation.x = Math.PI / 2 - mbFactor * 1.88; };
        }, -0.4, 0.18);

        let t = 0;
        function animate() {
          requestAnimationFrame(animate);
          if (document.hidden) return;
          t += 0.018;
          const frameStart = performance.now();
          for (let i = 0; i < slots.length; i++) {
            const s = slots[i];
            if (!s.visible) continue;
            const cw = s.canvas.clientWidth, ch = s.canvas.clientHeight;
            if (!cw || !ch) continue;
            const rw = Math.min(Math.round(cw * adaptiveDpr), MAX_W);
            const rh = Math.min(Math.round(ch * adaptiveDpr), MAX_H);
            if (s.canvas.width !== rw || s.canvas.height !== rh) {
              s.canvas.width = rw;
              s.canvas.height = rh;
            }
            if (!s.autoFramed && cw && ch) {
              s.autoFramed = true;
              // First 3 device models (hero iPhone, estimate iPad, pickup iPhone) zoom in
              // much bigger/closer; all other models stay at 1.03.
              const id = s.canvas.id;
              // Hero iPhone + pickup iPhone: ~1.4x bigger (pad 0.40). iPad (pad model): +5% zoom (0.456).
              let pad = 1.03;
              if (id === 'canvas-hero' || id === 'canvas-pickup-iphone') pad = 0.40;
              else if (id === 'canvas-estimate-ipad') pad = 0.456;
              // Slight extra zoom on tablet widths across all models.
              if (window.innerWidth >= 768 && window.innerWidth <= 1100) pad = pad * 0.96;
              centerAndFitEdgeToEdge(s.camera, s.root, pad);
            }
            s.camera.aspect = cw / ch;
            s.camera.updateProjectionMatrix();
            s.orbit.update(s === heroSlot && heroAmbient ? 0.009 : 0.006);
            if (s.onTick) s.onTick(t);
            renderer.setViewport(0, 0, rw, rh);
            renderer.setScissor(0, 0, rw, rh);
            renderer.render(s.scene, s.camera);
            s.ctx.clearRect(0, 0, rw, rh);
            s.ctx.drawImage(renderer.domElement, 0, MAX_H - rh, rw, rh, 0, 0, rw, rh);
          }
          perfAcc += performance.now() - frameStart;
          perfFrames++;
          if (perfFrames >= 45) {
            const avg = perfAcc / perfFrames;
            if (avg > 18 && adaptiveDpr > 1) adaptiveDpr = Math.max(1, adaptiveDpr - 0.25);
            else if (avg < 9 && adaptiveDpr < dpr) adaptiveDpr = Math.min(dpr, adaptiveDpr + 0.25);
            perfAcc = 0; perfFrames = 0;
          }
        }
        // Phase C2: Fullscreen Toggle on every 3D stage (GPU-only, viewport-driven)
        for (const slot of slots) {
          const fsBtn = document.createElement('button');
          fsBtn.setAttribute('type','button'); fsBtn.dataset.fsToggle = '1';
          fsBtn.className = 'absolute top-2.5 right-2.5 z-12 pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/90 border border-zinc-300 shadow transition-all hover:scale-110 hover:bg-red-600 hover:text-white';
          fsBtn.textContent = '⎈';
          const wrap = slot.canvas.closest('.stage-3d-box');
          if (wrap) { fsBtn.style.position='absolute'; wrap.appendChild(fsBtn); }
          fsBtn.addEventListener('click', () => toggleFullscreen(slot));
        }
        function toggleFullscreen(slot) {
          if (document.fullscreenElement) { document.exitFullscreen(); return; }
          const el = slot.canvas.closest('.stage-3d-box') || slot.canvas;
          el.requestFullscreen ? el.requestFullscreen() : el.webkitRequestFullscreen?.();
          requestAnimationFrame(() => resizeSlot(slot));
        }
        function resizeSlot(slot) { try { slot.camera.aspect = slot.canvas.clientWidth / slot.canvas.clientHeight; slot.camera.updateProjectionMatrix(); } catch(e){} }
        document.addEventListener('fullscreenchange', () => {
          const canvas = document.fullscreenElement?.querySelector('canvas') || null;
          const slot = slots.find((x) => x.canvas === canvas);
          if (slot) { resizeSlot(slot); requestAnimationFrame(() => resizeSlot(slot)); }
        });
        animate();
      } catch (err) {
        console.warn('3D fallback active:', err);
      }
    };
  if (document.readyState === 'complete' && typeof window.onload === 'function') {
    window.onload();
  }
})();