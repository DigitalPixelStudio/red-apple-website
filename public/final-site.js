(function () {
  // Motion defaults ON; only an explicit saved preference or OS reduced-motion
  // preference disables decorative typography motion. The 3D renderer is untouched.
  document.documentElement.dataset.motion = 'off'; // PERFORMANCE_DEFAULT_MOTION_OFF
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }
  if (!document.getElementById('hero')) return;
    window.onload = function () {
      // Enable the site's ambient typography/motion by default when the visitor
      // has not explicitly disabled it. Always respect the OS reduced-motion setting.
      if (!document.documentElement.hasAttribute('data-motion')) {
        document.documentElement.dataset.motion = 'off';
      }
      // Consistent Title Case for customer-facing copy. Preserve official brand
      // spellings, acronyms, contact details, URLs and technical identifiers.
      const titleCaseExceptions = new Map(Object.entries({
        iphone:'iPhone', ipad:'iPad', imac:'iMac', ios:'iOS', macos:'macOS', macbook:'MacBook', airpods:'AirPods', airtag:'AirTag',
        tbk:'TBK', oem:'OEM', oca:'OCA', oled:'OLED', lcd:'LCD', ic:'IC', qc:'QC', uv:'UV', crm:'CRM', faq:'FAQ', ai:'AI', mg:'MG', gps:'GPS', usb:'USB', sim:'SIM',
        wifi:'Wi-Fi', google:'Google', whatsapp:'WhatsApp', bengaluru:'Bengaluru', halasuru:'Halasuru', apple:'Apple', pixel:'Pixel', forge:'Forge', justdial:'JustDial', magicpin:'magicpin', namma:'Namma', linkedin:'LinkedIn', youtube:'YouTube'
      }));
      const titleCaseTextNode = (node) => {
        if (!node || node.nodeType !== Node.TEXT_NODE || !node.nodeValue || !node.nodeValue.trim()) return;
        const raw = node.nodeValue;
        if (/^\s*#/.test(raw) || /@|https?:\/\/|\b(?:tel:|mailto:)\b/i.test(raw)) return;
        node.nodeValue = raw.replace(/\b[\p{L}][\p{L}’'’-]*\b/gu, (word) => {
          const known = titleCaseExceptions.get(word.toLowerCase());
          return known || (word.charAt(0).toLocaleUpperCase('en') + word.slice(1).toLocaleLowerCase('en'));
        });
      };
      const titleCaseTree = (root) => {
        if (!root) return;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
          acceptNode(node) {
            const parent = node.parentElement;
            if (!parent || parent.closest('script,style,textarea,input,select,option,pre,code,svg,iframe,noscript,[data-preserve-case]')) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          }
        });
        const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(titleCaseTextNode);
      };
      titleCaseTree(document.body);
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
            ? `Open Now · ${ist} IST · 10 AM – 12 AM · Halasuru`
            : `Bench Opens 10 AM · ${ist} IST · 24/7 Pickup Active`;
        } catch (_e) {}
      }
      updateISTClock();
      setInterval(updateISTClock, 30000);

      // ============================================================
      // v8: ULTRA-LIGHT AMBIENT PARTICLES — 18 motes, ONE fixed dpr=1 canvas, 30 FPS
      // Replaces the killed shaking background loops. ~0.2ms CPU, GPU-friendly.
      // ============================================================
      // Decorative full-screen particle canvas removed: it consumed a continuous RAF
      // loop during scrolling. 3D product/model rendering is separate and remains enabled.
      document.getElementById('ambient-particles')?.remove();

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

      const attributionStorageKey = 'red-apple:utm-session:v1';
      const attributionKeys = ['gclid', 'fbclid', 'msclkid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
      function captureAttribution() {
        let saved = {};
        try { saved = JSON.parse(sessionStorage.getItem(attributionStorageKey) || '{}'); } catch (_) {}
        const params = new URLSearchParams(window.location.search);
        attributionKeys.forEach((key) => {
          const value = params.get(key);
          if (value) saved[key] = value.slice(0, 512);
        });
        try { sessionStorage.setItem(attributionStorageKey, JSON.stringify(saved)); } catch (_) {}
        return saved;
      }
      function getAttributionRef() {
        const a = captureAttribution();
        const refs = ['gclid', 'fbclid', 'msclkid'].filter((key) => a[key]).map((key) => key + '=' + a[key]);
        return refs.length ? ('Ref: ' + refs.join(' | ')).slice(0, 700) : '';
      }
      function dispatchSameOriginBeacon(path, payload) {
        const body = JSON.stringify(payload);
        try {
          const blob = new Blob([body], { type: 'application/json' });
          if (navigator.sendBeacon && navigator.sendBeacon(path, blob)) return;
        } catch (_) {}
        void fetch(path, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body, keepalive: true, credentials: 'same-origin'
        }).catch(() => {});
      }
      function captureEstimateLeadBeforeWhatsApp() {
        const name = (document.getElementById('est-name')?.value || '').trim();
        const phone = (document.getElementById('est-phone')?.value || '').trim();
        const digits = phone.replace(/\D/g, '');
        if (name.length < 2 || digits.length < 10) return;
        const a = captureAttribution();
        const eventId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : ('ra-' + Date.now() + '-' + Math.random().toString(36).slice(2));
        const issue = (document.getElementById('est-wrong')?.value || 'Need bench inspection').trim();
        const email = (document.getElementById('est-email')?.value || '').trim();
        const device = selectedDev + ' — ' + selectedModel;
        const common = {
          name, phone, email, device, issue, source: 'homepage_estimate',
          page: window.location.pathname, campaign: a.utm_campaign || '',
          utm: JSON.stringify(a).slice(0, 1500), clickId: a.gclid || a.fbclid || a.msclkid || '',
          eventId
        };
        dispatchSameOriginBeacon('/api/lead', common);
        dispatchSameOriginBeacon('/api/track-conversion', {
          eventId, name, email, phone, device, issue, page: window.location.pathname,
          sourceUrl: window.location.href, clickId: common.clickId
        });
      }

      function buildExactWhatsAppTicket() {
        const repair = estRepair ? estRepair.value : 'Front Display Replacement';
        // v13: the separate 'Cracked glass / working display' field was removed —
        // the single full-width 'What is wrong?' input now carries all condition detail.
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
          ...(getAttributionRef() ? [getAttributionRef()] : []),
          '',
          '━━━━━━━━━━━━━━━━━━━━',
          'Please confirm the exact price and the earliest slot. Thank you.'
        ].join('\n');
      }

      document.getElementById('btn-send-wa')?.addEventListener('click', () => {
        captureEstimateLeadBeforeWhatsApp();
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
      const crmLookupButton = document.getElementById("btn-crm-lookup");
      if (crmLookupButton) crmLookupButton.addEventListener("click", async () => {
        const ticket = (document.getElementById("crm-job-id")?.value || "").trim().toUpperCase();
        const phone = (document.getElementById("crm-phone")?.value || "").trim();
        const out = document.getElementById("crm-lookup-res");
        if (!out) return;
        if (ticket.length < 3 || phone.replace(/\D/g, "").length < 10) {
          out.textContent = "Enter a valid ticket number and the registered phone number.";
          return;
        }
        const oldLabel = crmLookupButton.textContent;
        crmLookupButton.disabled = true;
        crmLookupButton.textContent = "Checking…";
        out.textContent = "Checking the live repair record…";
        try {
          const response = await fetch("/api/crm-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ticket, phone }),
            cache: "no-store"
          });
          const data = await response.json();
          if (!response.ok || !data.ok || !data.jobNumber) {
            out.textContent = data.message || "No matching live repair record was found.";
          } else {
            const details = [
              "Job " + data.jobNumber,
              data.invoiceNumber ? "Invoice " + data.invoiceNumber : "",
              data.deviceModel || "",
              data.serviceType || "",
              data.stageLabel ? "Stage: " + data.stageLabel : "Stage awaiting confirmation"
            ].filter(Boolean);
            out.textContent = details.join(" · ");
          }
          if (data.whatsapp) {
            const link = document.createElement("a");
            link.href = data.whatsapp;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.className = "ml-2 font-bold text-red-600 underline";
            link.textContent = "Ask on WhatsApp";
            out.appendChild(link);
          }
        } catch (_) {
          out.textContent = "Live status is temporarily unavailable. Please contact the team on WhatsApp.";
        } finally {
          crmLookupButton.disabled = false;
          crmLookupButton.textContent = oldLabel || "Track";
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
      function setBaPct(pct) {
        pct = Math.max(5, Math.min(95, pct));
        if (baOverlay) baOverlay.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
        if (baLine) baLine.style.left = pct + '%';
        if (baKnob) baKnob.style.left = pct + '%';
        if (baPctLbl) baPctLbl.textContent = `${Math.round(100 - pct)}% Restored`;
        baBox?.setAttribute('aria-valuenow', String(Math.round(pct)));
      }
      function setBaSplit(clientX) {
        if (!baBox) return;
        const r = baBox.getBoundingClientRect();
        setBaPct(((clientX - r.left) / r.width) * 100);
      }
      baBox?.addEventListener('keydown', (e) => {
        const cur = Number(baBox.getAttribute('aria-valuenow') || 50);
        if (e.key === 'ArrowLeft') { setBaPct(cur - 5); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { setBaPct(cur + 5); e.preventDefault(); }
        else if (e.key === 'Home') { setBaPct(5); e.preventDefault(); }
        else if (e.key === 'End') { setBaPct(95); e.preventDefault(); }
      });
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
            // The selected price pill is already inside #glass-lab; avoid a redundant
            // scrollIntoView that can nudge the page and look like scroll jitter.
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

      // All 12 Repair Services Grid
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
        ['Board-Level Storage IC Repair', '1–3 days', 'Confidential hardware diagnosis when photos/files are inaccessible.', 'Assessed first'],
        ['Face ID & Sensor Repair', 'Free diagnosis', 'Face ID, proximity, ambient-light and front-sensor fault assessment; repairability confirmed after model-specific testing.', 'Quote before repair']
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

      // Four YouTube facades: thumbnails are lazy, the heavy player is created only on Play.
      const videoGallery = document.getElementById('studio-video');
      let activeVideoShell = null;
      const restoreVideoFacade = (shell) => {
        if (!shell) return;
        const id = shell.dataset.videoId || '';
        const title = shell.dataset.videoTitle || 'Red Apple Mobile Repair video';
        const thumbnail = shell.dataset.thumbnail || '';
        const img = document.createElement('img');
        img.src = thumbnail; img.alt = title + ' thumbnail'; img.loading = 'lazy'; img.decoding = 'async';
        img.width = 480; img.height = 360; img.className = 'absolute inset-0 h-full w-full object-cover opacity-90';
        const btn = document.createElement('button');
        btn.type = 'button'; btn.dataset.videoPlay = id; btn.className = 'absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-950/20 text-white';
        btn.setAttribute('aria-label', 'Play ' + title);
        btn.innerHTML = '<span class="flex h-12 w-12 items-center justify-center rounded-full border border-white/80 bg-transparent text-xl shadow-none">▶</span><span class="rounded-full bg-zinc-950/65 px-3 py-1 text-[10px] font-extrabold tracking-wider">PLAY VIDEO</span>';
        shell.replaceChildren(img, btn);
      };
      videoGallery?.addEventListener('click', (event) => {
        const play = event.target.closest('[data-video-play]');
        if (!play) return;
        const shell = play.closest('.video-player-shell');
        const id = play.dataset.videoPlay;
        if (!shell || !id) return;
        if (activeVideoShell && activeVideoShell !== shell) restoreVideoFacade(activeVideoShell);
        const frame = document.createElement('iframe');
        frame.className = 'absolute inset-0 block h-full w-full';
        frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
        frame.title = shell.dataset.videoTitle || 'Red Apple Mobile Repair video';
        frame.loading = 'lazy'; frame.referrerPolicy = 'strict-origin-when-cross-origin';
        frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        frame.allowFullscreen = true;
        shell.replaceChildren(frame);
        activeVideoShell = shell;
      });

      // 3D-Tilt Holographic Warranty Card + Live Mouse Glare + Card Switcher
      const holo = document.getElementById('holo-warranty');
      const resetWarrantyTilt = () => {
        if (!holo) return;
        holo.classList.remove('is-active');
        holo.style.setProperty('--gx', '50%');
        holo.style.setProperty('--gy', '50%');
        holo.style.transform = 'perspective(760px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
      };
      const moveWarrantyCard = (e) => {
        if (!holo) return;
        const r = holo.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const px = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
        const py = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
        const rx = (0.5 - py / 100) * 22;
        const ry = (px / 100 - 0.5) * 22;
        holo.style.setProperty('--gx', px + '%');
        holo.style.setProperty('--gy', py + '%');
        holo.style.transform = `perspective(760px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px) scale(1.03)`;
      };
      holo?.addEventListener('pointerdown', (e) => { holo.classList.add('is-active'); moveWarrantyCard(e); });
      holo?.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' || e.buttons > 0) moveWarrantyCard(e); });
      holo?.addEventListener('pointerup', () => { window.setTimeout(resetWarrantyTilt, 180); });
      holo?.addEventListener('pointercancel', resetWarrantyTilt);
      holo?.addEventListener('pointerleave', resetWarrantyTilt);
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
          // v8 BOT-PROOF: never animate the NUMBERS. Googlebot renders JS and previously
          // caught a mid-count frame (1.3/5). SSR already carries the final values —
          // just fade the bar in with a compositor-only class. Zero number mutation.
          statBar.classList.add('stat-final');
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
        ['Where Are You Located?', 'Metro Pillar No. 125, No. 38, Opposite Bhadra Landmark, Halasuru, Bengaluru 560008 (1 min from Halasuru Metro).'],
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
        // Keep FAQ structured data in sync with the exact FAQ content visitors see.
        if (!document.getElementById('faq-jsonld')) {
          const faqScript = document.createElement('script');
          faqScript.id = 'faq-jsonld';
          faqScript.type = 'application/ld+json';
          faqScript.textContent = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map(([q, a]) => ({
              '@type': 'Question',
              name: q,
              acceptedAnswer: { '@type': 'Answer', text: a },
            })),
          });
          document.head.appendChild(faqScript);
        }
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
        { id: '#hero', label: 'Start Here' },
        { id: '#real-shop', label: 'The Studio' },
        { id: '#estimate', label: 'Smart Estimate' },
        { id: '#paired-crm', label: 'Repair Tracking' },
        { id: '#pickup', label: 'Doorstep Pickup' },
        { id: '#glass-lab', label: 'Glass Restoration' },
        { id: '#tbk-machines', label: 'TBK Machinery' },
        { id: '#ecosystem-3d', label: 'Apple Devices' },
        { id: '#qc-grid', label: 'Quality & QC' },
        { id: '#services-grid', label: 'Repair Services' },
        { id: '#triage-symptoms', label: 'Repair Guide' },
        { id: '#comparison', label: 'Our Difference' },
        { id: '#reviews', label: 'Customer Reviews' },
        { id: '#halasuru-map', label: 'Find The Store' },
      ];
      if (pagePlanLinks) {
        pagePlanLinks.innerHTML = PLAN.map((p, i) => `<a href="${p.id}" data-go="${p.id}" class="shrink-0 rounded-[6px] bg-red-600 px-2.5 py-1 text-[10px] font-extrabold tracking-tight text-white hover:bg-red-700 transition-transform hover:scale-105"><span class="inline-block w-4 h-4 rounded-[4px] bg-black/60 text-white text-[9px] text-center leading-4">${i + 1}</span> ${p.label}</a>`).join('');
        pagePlanLinks.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', (e) => e.preventDefault()));
      }
      let tourTimeout = null;
      let tourActive = false;
      let tourIndex = 0;
      let tourFocusTimeout = null;
      const tourButton = document.getElementById('tour-start');
      const tourProgress = document.getElementById('web-tour-progress');
      // Motion stays enabled by default; the effects are transform/opacity based.
      // Lightweight motion is the default. One-shot reveal and user-triggered motion remain enabled.
      const stopTour = () => {
        tourActive = false;
        if (tourTimeout) { clearTimeout(tourTimeout); tourTimeout = null; }
        if (tourFocusTimeout) { clearTimeout(tourFocusTimeout); tourFocusTimeout = null; }
        document.querySelectorAll('.tour-focus').forEach((el) => el.classList.remove('tour-focus'));
        if (tourProgress) tourProgress.textContent = '';
        if (tourButton) {
          tourButton.classList.remove('tour-running');
          tourButton.setAttribute('aria-pressed', 'false');
          tourButton.setAttribute('aria-label', 'Start Web Tour');
        }
      };
      const scrollTourTo = (selector) => {
        const target = document.querySelector(selector);
        if (!target) return false;
        document.querySelectorAll('.tour-focus').forEach((el) => el.classList.remove('tour-focus'));
        const header = document.querySelector('.site-header-120fps');
        const offset = (header?.getBoundingClientRect().height || 76) + 14;
        const top = window.scrollY + target.getBoundingClientRect().top - offset;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        target.classList.add('tour-focus');
        if (tourFocusTimeout) clearTimeout(tourFocusTimeout);
        tourFocusTimeout = setTimeout(() => target.classList.remove('tour-focus'), 2600);
        return true;
      };
      const runTourStep = () => {
        if (!tourActive) return;
        if (tourIndex >= PLAN.length) { stopTour(); return; }
        const stepNumber = tourIndex + 1; const step = PLAN[tourIndex++];
        if (tourProgress) tourProgress.textContent = stepNumber + ' / ' + PLAN.length;
        scrollTourTo(step.id); tourTimeout = setTimeout(runTourStep, 4400);
      };
      const startTour = () => {
        if (tourActive) { stopTour(); return; }
        tourActive = true;
        tourIndex = 0;
        if (tourButton) {
          tourButton.classList.add('tour-running');
          tourButton.setAttribute('aria-pressed', 'true');
          tourButton.setAttribute('aria-label', 'Stop Web Tour');
        }
        runTourStep();
      };
      tourButton?.addEventListener('click', startTour);
      const interruptTour = () => { if (tourActive) stopTour(); };
      window.addEventListener('wheel', interruptTour, { passive: true });
      window.addEventListener('pointerdown', (event) => { if (tourActive && event.target !== tourButton && !tourButton?.contains(event.target)) interruptTour(); }, { passive: true });
      window.addEventListener('touchmove', interruptTour, { passive: true });
      window.addEventListener('keydown', (event) => { if (tourActive && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) interruptTour(); }, { passive: true });
      document.querySelectorAll('#page-plan-links [data-go]').forEach((b) => b.addEventListener('click', (e) => {
        e.preventDefault();
        stopTour();
        scrollTourTo(b.dataset.go);
      }));

      // Phase A2b: Global scroll pause (kills CSS animations in text zones — 120fps answer).
// Smoothness: no per-frame scroll JS. CSS content-visibility + compositor-only
// animations handle text-heavy sections; WebGL pauses only when off-screen.

// The floating back-to-top control is intentionally removed to keep the action dock clear.

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

      // Gift: dark/light theme toggle
      const themeToggle = document.getElementById('theme-toggle');
      const applyTheme = (mode) => {
        const safeMode = mode === 'dark' ? 'dark' : 'light';
        document.documentElement.dataset.theme = safeMode;
        if (themeToggle) {
          themeToggle.setAttribute('aria-pressed', String(safeMode === 'dark'));
          themeToggle.setAttribute('aria-label', safeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
          themeToggle.setAttribute('title', safeMode === 'dark' ? 'Switch to light appearance' : 'Switch to dark appearance');
          document.querySelectorAll('#theme-toggle [data-icon]').forEach(el => el.classList.toggle('hidden', el.getAttribute('data-icon') !== safeMode));
        }
      };
      const detectTheme = () => {
        const saved = localStorage.getItem('ra-theme');
        if (saved === 'dark' || saved === 'light') return saved;
        return 'light';
      };
      applyTheme(detectTheme());
      themeToggle?.addEventListener('click', () => {
        const now = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        applyTheme(now); localStorage.setItem('ra-theme', now);
      });
      // Initial icon state is synchronised by applyTheme above.
      // green check after tour
      const escHtml = (t) => String(t).replace(/</g, '&lt;').replace(/>/g, '&gt;');

      // Smooth dedicated chat entry: type a first message -> asks the bot directly
      const typingIn = document.getElementById('ai-typing-input');
      const typingSend = document.getElementById('ai-typing-send');
      if (typingIn && typingSend && !typingIn.dataset.bound) {
        typingIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') typingSend.click(); });
        typingSend.addEventListener('click', () => { const t = typingIn.value.trim(); typingIn.value = ''; if (t || aiPendingImages.length) replyToUser(t); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && aiDrawer && !aiDrawer.classList.contains('hidden')) { aiDrawer.classList.add('hidden'); aiDrawer.classList.remove('flex'); } });
      const copyBtn = document.getElementById('copy-address');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          const address = 'Metro Pillar No. 125, No. 38, Opposite Bhadra Landmark, Halasuru, Bengaluru 560008';
          const lbl = document.getElementById('address-copied');
          if (lbl) lbl.classList.remove('hidden');
          // Do not await clipboard I/O in the interaction task: let the browser
          // paint the immediate feedback, then finish clipboard work asynchronously.
          if (navigator.clipboard?.writeText) navigator.clipboard.writeText(address).catch(() => {});
          if (lbl) window.setTimeout(() => lbl.classList.add('hidden'), 2500);
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
      let aiPendingImages = [];
      const aiPhotoInput = document.getElementById('ai-photo-input');
      const aiPhotoButton = document.getElementById('btn-ai-photo');
      const aiPhotoStatus = document.getElementById('ai-photo-status');
      const aiPhotoPreview = document.getElementById('ai-photo-preview');
      const aiPhotoConsentWrap = document.getElementById('ai-photo-consent-wrap');
      const aiPhotoConsent = document.getElementById('ai-photo-consent');
      function renderAiPhotoPreview() {
        if (!aiPhotoPreview) return;
        aiPhotoPreview.replaceChildren();
        aiPendingImages.forEach((photo, index) => {
          const item = document.createElement('div'); item.className = 'ai-photo-thumb';
          const image = document.createElement('img'); image.src = photo.previewUrl; image.alt = photo.name || ('Repair photo ' + (index + 1)); image.loading = 'lazy';
          const meta = document.createElement('span'); meta.textContent = (photo.name || 'Photo') + ' · ' + Math.max(1, Math.round(photo.size / 1024)) + ' KB';
          const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'ai-photo-remove'; remove.textContent = 'Remove'; remove.setAttribute('aria-label', 'Remove attached photo ' + (index + 1));
          remove.addEventListener('click', () => { const removed = aiPendingImages.splice(index, 1)[0]; if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl); renderAiPhotoPreview(); if (aiPhotoStatus) aiPhotoStatus.textContent = aiPendingImages.length ? aiPendingImages.length + ' photo(s) ready to send' : 'Attach up to 3 repair photos'; });
          item.append(image, meta, remove); aiPhotoPreview.append(item);
        });
        aiPhotoPreview.classList.toggle('hidden', aiPendingImages.length === 0);
        if (aiPhotoConsentWrap) aiPhotoConsentWrap.classList.toggle('hidden', aiPendingImages.length === 0);
      }
      function readAiPhoto(file) {
        return new Promise((resolve, reject) => {
          if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type)) return reject(new Error('Choose a JPG, PNG or WebP image.'));
          if (file.size > 8 * 1024 * 1024) return reject(new Error('Each photo must be under 8 MB.'));
          const reader = new FileReader();
          reader.onerror = () => reject(new Error('Could not read that photo.'));
          reader.onload = () => {
            const image = new Image();
            image.onerror = () => reject(new Error('That photo could not be decoded.'));
            image.onload = () => {
              const ratio = Math.min(1, 1440 / Math.max(image.naturalWidth, image.naturalHeight));
              const canvas = document.createElement('canvas');
              canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
              canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
              const context = canvas.getContext('2d');
              if (!context) return reject(new Error('Photo processing is unavailable in this browser.'));
              context.drawImage(image, 0, 0, canvas.width, canvas.height);
              const encoded = canvas.toDataURL('image/jpeg', 0.82).split(',')[1];
              if (!encoded) return reject(new Error('Could not prepare that photo.'));
              resolve({ mimeType: 'image/jpeg', data: encoded, previewUrl: URL.createObjectURL(file), name: file.name, size: file.size });
            };
            image.src = String(reader.result);
          };
          reader.readAsDataURL(file);
        });
      }
      aiPhotoButton?.addEventListener('click', () => aiPhotoInput?.click());
      aiPhotoInput?.addEventListener('change', async () => {
        const chosen = Array.from(aiPhotoInput.files || []);
        if (!aiPendingImages.length && aiPhotoConsent) aiPhotoConsent.checked = false;
        const selected = chosen.slice(0, Math.max(0, 3 - aiPendingImages.length));
        if (!selected.length) { if (aiPhotoStatus) aiPhotoStatus.textContent = 'You can attach up to 3 photos per message.'; aiPhotoInput.value = ''; return; }
        if (aiPhotoStatus) aiPhotoStatus.textContent = 'Preparing ' + selected.length + ' photo(s)…';
        if (aiPhotoButton) aiPhotoButton.disabled = true;
        try { const prepared = await Promise.all(selected.map(readAiPhoto)); aiPendingImages.push(...prepared); renderAiPhotoPreview(); if (aiPhotoStatus) aiPhotoStatus.textContent = aiPendingImages.length + ' photo(s) ready · press Ask AI to analyse'; }
        catch (error) { if (aiPhotoStatus) aiPhotoStatus.textContent = error instanceof Error ? error.message : 'Photo could not be prepared.'; }
        finally { if (aiPhotoButton) aiPhotoButton.disabled = false; aiPhotoInput.value = ''; }
      });
      async function replyToUser(rawText) {
        const images = aiPendingImages.slice(0, 3);
        const q = (rawText || '').trim() || (images.length ? 'Please inspect the attached repair photo(s). Describe only what is visibly damaged and what needs technician confirmation.' : '');
        if (!q || !aiMsgs) return;
        if (images.length && !aiPhotoConsent?.checked) { if (aiPhotoStatus) aiPhotoStatus.textContent = 'Please confirm the photo-sharing notice before sending images through FaiCodex AI (Google Gemini).'; return; }
        aiPendingImages = []; images.forEach((photo) => { if (photo.previewUrl) URL.revokeObjectURL(photo.previewUrl); }); renderAiPhotoPreview();
        if (aiPhotoConsent) aiPhotoConsent.checked = false;
        if (aiPhotoStatus) aiPhotoStatus.textContent = images.length ? 'Sending ' + images.length + ' photo(s) to FaiCodex AI…' : 'Attach up to 3 repair photos';
        if (aiPhotoButton) aiPhotoButton.disabled = images.length > 0;
        aiMsgs.innerHTML += '<div class="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-zinc-900 px-3 py-2 text-white shadow-sm">' + escHtml(q) + (images.length ? '<div class="mt-1 text-[10px] text-orange-200">📷 ' + images.length + ' photo(s) attached</div>' : '') + '</div>';
        const bid = 'ai-' + Date.now() + Math.random().toString(36).slice(2, 6);
        aiMsgs.innerHTML += '<div id="' + bid + '" class="max-w-[92%] rounded-2xl rounded-tl-sm border border-zinc-200 bg-white p-3 text-zinc-700 shadow-sm"><span class="text-zinc-400">Checking the bench prices…</span></div>';
        aiMsgs.scrollTop = aiMsgs.scrollHeight;
        const bubble = document.getElementById(bid);
        let full = '';
        try {
          const res = await fetch('/api/concierge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: q, history: aiHistory.slice(-6), images: images.map(({ mimeType, data }) => ({ mimeType, data })), imageConsent: images.length > 0 ? true : false })
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
          const imageFailed = images.length > 0 && src !== 'gemini';
          if (images.length && aiPhotoStatus) aiPhotoStatus.textContent = imageFailed ? 'Photo sent, but live image analysis is unavailable. Please retry or WhatsApp the technician.' : 'Photo analysis complete · ' + images.length + ' image(s) reviewed';
          if (aiPhotoButton) aiPhotoButton.disabled = false;
          if (bubble) bubble.innerHTML = escHtml(full).replace(/\\n/g, '<br>') +
            '<div class="mt-2 text-[9px] font-bold ' + (src === 'gemini' ? 'text-red-600' : 'text-amber-700') + '">' +
            (src === 'gemini' ? '✦ FaiCodex AI · live photo-aware answer' : imageFailed ? '⚠ Photo review unavailable · no image analysis was performed' : '● Verified local knowledge') + '</div>';
          aiHistory.push({ role: 'user', text: q }, { role: 'model', text: full });
        } catch {
          if (images.length && aiPhotoStatus) aiPhotoStatus.textContent = 'Photo upload or analysis failed. Your images were not confirmed as analysed; please retry.';
          if (aiPhotoButton) aiPhotoButton.disabled = false;
          full = images.length ? 'The photo could not be sent for live assessment. Please try again or contact our technician for a manual review.' : localBotAnswer(q);
          if (bubble) bubble.innerHTML = escHtml(full) + '<div class="mt-2 text-[9px] font-bold ' + (images.length ? 'text-amber-700' : 'text-emerald-700') + '">' + (images.length ? '⚠ Photo review unavailable' : '● Verified local knowledge') + '</div>';
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


      // Motion defaults ON for the premium experience; preserve OS reduced-motion accessibility.
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.dataset.motion = 'off';
        document.dispatchEvent(new Event('ra-motion-change'));
      }
      // Premium typography motion: accent colour and subtle breathing only while visible.
      if (false && document.documentElement.dataset.motion !== 'off' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const motionText = document.querySelectorAll('.section-kicker, .quote-color-shift, .text-brand-grad, .badge-breathe, main h2 .text-red-600, main h2 .text-orange-600');
        if ('IntersectionObserver' in window) {
          const motionTextObserver = new IntersectionObserver((entries) => entries.forEach((entry) => entry.target.classList.toggle('ra-motion-visible', entry.isIntersecting)), { rootMargin: '80px 0px', threshold: 0.01 });
          motionText.forEach((element) => { element.classList.add('ra-motion-text'); motionTextObserver.observe(element); });
        } else motionText.forEach((element) => element.classList.add('ra-motion-text', 'ra-motion-visible'));
      }

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

      // Failsafe: lazy reveals must never strand content at opacity 0
      setTimeout(() => {
        document.querySelectorAll('.reveal-up:not(.is-in)').forEach((el) => el.classList.add('is-in'));
      }, 1200);

      // ============================================================
      // 5. RAZOR-SHARP HiDPI SINGLE-CONTEXT WEBGL ENGINE (ALL 10 MODELS)
      // ============================================================
      if (typeof THREE === 'undefined') return;
      try {
        // Six explicit device/orientation profiles. UA + touch capability prevents
        // Chrome Desktop Site on Android tablets from being mistaken for a PC.
        function getDeviceProfile() {
          const w = window.innerWidth || document.documentElement.clientWidth || 1280;
          const h = window.innerHeight || document.documentElement.clientHeight || 800;
          const minSide = Math.min(w, h), maxSide = Math.max(w, h);
          const ua = navigator.userAgent || '';
          const touchPoints = Number(navigator.maxTouchPoints || 0);
          const hasTouch = touchPoints > 1 || ('ontouchstart' in window);
          const ipad = /iPad/i.test(ua) || (/Macintosh/i.test(ua) && hasTouch);
          const androidTablet = /Android/i.test(ua) && minSide >= 600;
          const touchTablet = hasTouch && minSide >= 600 && maxSide <= 3000 && !/Windows NT|Macintosh|Mac OS X/i.test(ua);
          const isTablet = ipad || androidTablet || touchTablet;
          const isPhone = !isTablet && (/iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua) || minSide < 600);
          const device = isPhone ? 'mobile' : (isTablet ? 'tablet' : 'desktop');
          return device + '-' + (w >= h ? 'landscape' : 'portrait');
        }
        const initialProfile = getDeviceProfile();
        const memoryGb = Number(navigator.deviceMemory || 4);
        const cpuCores = Number(navigator.hardwareConcurrency || 4);
        const lowPowerDevice = memoryGb <= 4 || cpuCores <= 4;
        // Device-aware 3D budget: stable frame pacing is more useful than an
        // unstable 60fps target on mobile/tablet GPUs. Geometry and camera framing
        // remain unchanged; only canvas sampling density and render cadence adapt.
        const isMobile3D = initialProfile.startsWith('mobile-');
        const isTablet3D = initialProfile.startsWith('tablet-');
        const dprCap = isMobile3D
          ? (lowPowerDevice ? 1.10 : 1.35)
          : isTablet3D
            ? (lowPowerDevice ? 1.20 : 1.50)
            : 1.80;
        const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
        // The shared surface is a staging buffer, not the visible canvas size.
        // Keep enough headroom for large desktop stages without oversized GPU allocations.
        const MAX_W = 1792, MAX_H = 1344;
        // Fit a slot's render target inside the shared GL canvas while PRESERVING aspect ratio.
        // Clamping width and height independently distorted camera.aspect on 2x-DPI tablets
        // (models looked stretched / pushed off-centre). Never resize the shared renderer per slot.
        function fitDims(cw, ch) {
          const scale = Math.max(0.1, Math.min(dpr, MAX_W / Math.max(1, cw), MAX_H / Math.max(1, ch)));
          return [Math.max(1, Math.round(cw * scale)), Math.max(1, Math.round(ch * scale))];
        }
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' });
        renderer.setPixelRatio(1);
        renderer.setSize(MAX_W, MAX_H, false);
        renderer.setClearColor(0x000000, 0);
        renderer.setScissorTest(true);
        const glCanvas = renderer.domElement;

        const slots = [];
        const visibleSlots = new Set();
        let webglRafId = 0;

        // SCROLL_RENDER_PAUSE: stop expensive WebGL compositing while native page
        // scrolling is in progress, then resume shortly after scroll settles. This
        // removes GPU competition from touch scrolling without lowering model quality,
        // changing render resolution, or disabling direct 3D pointer/touch controls.
        let scrollResumeTimer = 0;
        const SCROLL_RESUME_DELAY_MS = 160;
        function pauseWebGLDuringPageScroll() {
          if (webglRafId) {
            cancelAnimationFrame(webglRafId);
            webglRafId = 0;
          }
          if (scrollResumeTimer) clearTimeout(scrollResumeTimer);
          scrollResumeTimer = setTimeout(() => {
            scrollResumeTimer = 0;
            wakeWebGLLoop();
          }, SCROLL_RESUME_DELAY_MS);
        }
        window.addEventListener('scroll', pauseWebGLDuringPageScroll, { passive: true });

        // Let the browser schedule one render per display refresh. This naturally
        // supports 60/90/120/144Hz screens without a second JavaScript FPS gate,
        // which can create uneven frame pacing on high-refresh displays.
        // Rendering stays active during scroll; only offscreen/hidden scenes sleep.
        function wakeWebGLLoop() {
          if (webglRafId || scrollResumeTimer || visibleSlots.size === 0 || document.hidden) return;
          const tick = (now) => {
            webglRafId = 0;
            if (document.hidden || visibleSlots.size === 0) return;
            renderFrame(now);
            webglRafId = requestAnimationFrame(tick);
          };
          webglRafId = requestAnimationFrame(tick);
        }

        const io = typeof IntersectionObserver !== 'undefined'
          ? new IntersectionObserver((entries) => {
              entries.forEach((en) => {
                const s = slots.find((x) => x.canvas === en.target);
                if (!s) return;
                s.visible = en.isIntersecting;
                if (en.isIntersecting) visibleSlots.add(s);
                else visibleSlots.delete(s);
              });
              wakeWebGLLoop();
            }, { rootMargin: '-18% 0px -18% 0px', threshold: 0.08 })
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
          canvas.addEventListener('pointerdown', (e) => {
            if (!enabled || (e.button !== undefined && e.button !== 0)) return;
            drag = true; px = e.clientX; py = e.clientY;
            try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
          });
          canvas.addEventListener('pointermove', (e) => {
            // POINTER_DRAG_ONLY_NO_LAYOUT_READS: keep pointer handling limited to actual drags.
            // The decorative pointer-follow sheen is removed; no per-move layout reads or style writes.
            if (!drag) return;
            ty += (e.clientX - px) * 0.011;
            tx = Math.max(-0.85, Math.min(0.85, tx + (e.clientY - py) * 0.009));
            px = e.clientX; py = e.clientY;
          });
          const endDrag = (e) => { drag = false; try { canvas.releasePointerCapture(e.pointerId); } catch (_) {} };
          canvas.addEventListener('pointerup', endDrag);
          canvas.addEventListener('pointercancel', endDrag);
          return {
            setEnabled(v) { enabled = v; },
            reset() { ty = initY; tx = initX; },
            update(autoSpeed, frameScale = 1) {
              if (!drag) ty += autoSpeed * frameScale;
              const follow = 1 - Math.pow(1 - 0.14, frameScale);
              ry += (ty - ry) * follow;
              rx += (tx - rx) * follow;
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

        // v9: responsive per-model framing (Faisu's MODEL_FRAMING spec).
        // ADAPTATION: we keep the document's fill math + 3/4 camera, but DO NOT call
        // renderer.setSize/setPixelRatio here — the renderer is SHARED by all 10 stages
        // and resizing it per slot reintroduces the old bottom-right shift bug.
        // MODEL_FRAMING = frozen baseline. Shared renderer — NEVER per-slot setSize.
        const MODEL_FRAMING = {
          'canvas-hero': { fill: 0.98, fov: 34 },
          // iPad is portrait geometry — a RIGID landscape turn (no stretch) makes it fill width.
          'canvas-estimate-ipad': { fill: 0.95, fov: 34, rotZ: -Math.PI / 2 },
          'canvas-pickup-iphone': { fill: 0.95, fov: 34 },
          'canvas-tbk-oca':       { fill: 0.94, fov: 34 },
          'canvas-tbk-90l':       { fill: 0.88, fov: 34 },
          'canvas-tbk-958':       { fill: 0.88, fov: 34 },
          'canvas-internals':     { fill: 0.95, fov: 34 },
          'canvas-airpods':       { fill: 0.92, fov: 34 },
          'canvas-watch':         { fill: 0.95, fov: 34 },
          'canvas-macbook':       { fill: 0.90, fov: 34 }, // FROZEN at 0.90 (no device override)
        };
        // Independent fill targets for all six device/orientation profiles.
        // Hero and Free Pickup iPhones deliberately share identical values in every profile.
        // TBK machines receive a measured increase; mobile MacBook/AirPods are zoomed in.
        const MODEL_PROFILE_FILL = {
          'mobile-portrait': {
            'canvas-hero': 0.98, 'canvas-pickup-iphone': 0.95,
            'canvas-estimate-ipad': 0.95, 'canvas-tbk-oca': 1.10, 'canvas-tbk-90l': 0.98, 'canvas-tbk-958': 0.98,
            'canvas-internals': 0.95, 'canvas-airpods': 0.90, 'canvas-watch': 0.95, 'canvas-macbook': 1.08,
          },
          'mobile-landscape': {
            'canvas-hero': 0.98, 'canvas-pickup-iphone': 0.92,
            'canvas-estimate-ipad': 0.92, 'canvas-tbk-oca': 1.08, 'canvas-tbk-90l': 0.96, 'canvas-tbk-958': 0.96,
            'canvas-internals': 0.92, 'canvas-airpods': 0.92, 'canvas-watch': 0.92, 'canvas-macbook': 1.06,
          },
          'tablet-portrait': {
            'canvas-hero': 0.98, 'canvas-pickup-iphone': 0.94,
            'canvas-estimate-ipad': 0.90, 'canvas-tbk-oca': 0.81, 'canvas-tbk-90l': 0.71, 'canvas-tbk-958': 0.71,
            'canvas-internals': 0.90, 'canvas-airpods': 0.63, 'canvas-watch': 0.90, 'canvas-macbook': 0.90,
          },
          'tablet-landscape': {
            'canvas-hero': 0.98, 'canvas-pickup-iphone': 0.92,
            'canvas-estimate-ipad': 0.88, 'canvas-tbk-oca': 0.79, 'canvas-tbk-90l': 0.69, 'canvas-tbk-958': 0.69,
            'canvas-internals': 0.88, 'canvas-airpods': 0.65, 'canvas-watch': 0.88, 'canvas-macbook': 0.88,
          },
          'desktop-portrait': {
            'canvas-hero': 0.98, 'canvas-pickup-iphone': 0.92,
            'canvas-estimate-ipad': 0.86, 'canvas-tbk-oca': 0.77, 'canvas-tbk-90l': 0.67, 'canvas-tbk-958': 0.67,
            'canvas-internals': 0.86, 'canvas-airpods': 0.61, 'canvas-watch': 0.86, 'canvas-macbook': 0.86,
          },
          'desktop-landscape': {
            'canvas-hero': 0.98, 'canvas-pickup-iphone': 0.90,
            'canvas-estimate-ipad': 0.84, 'canvas-tbk-oca': 0.75, 'canvas-tbk-90l': 0.65, 'canvas-tbk-958': 0.65,
            'canvas-internals': 0.84, 'canvas-airpods': 0.58, 'canvas-watch': 0.84, 'canvas-macbook': 0.84,
          },
        };
        // v10: measure ONLY the real device/machine meshes. The v9 code measured
        // setFromObject(root) which INCLUDED the decorative Torus orbit halos and
        // Circle floor-shadow discs — inflating the radius ~2x and pushing the camera
        // back so every model sat tiny (~35-45%) inside a huge empty stage.
        function computeTightDeviceBounds(root) {
          const box = new THREE.Box3();
          let found = false;
          root.updateMatrixWorld(true);
          root.traverse((obj) => {
            if (!obj.isMesh || !obj.visible) return;
            const name = (obj.name || '').toLowerCase();
            if (name.includes('ring') || name.includes('orbit') || name.includes('shadow') || name.includes('halo')) return;
            const gt = obj.geometry?.type || '';
            if (gt === 'RingGeometry' || gt === 'TorusGeometry' || gt === 'CircleGeometry') return;
            box.expandByObject(obj);
            found = true;
          });
          return found ? box : new THREE.Box3().setFromObject(root);
        }
        function centerAndFitResponsive(camera, root, id) {
          try {
            const cfg = MODEL_FRAMING[id] || { fill: 0.95, fov: 34 };
            // Tablet (iPad) is portrait geometry — widen it with a rigid landscape turn.
            const isTablet = id === 'canvas-estimate-ipad';
            if (isTablet && cfg.rotZ !== undefined) root.rotation.z = cfg.rotZ;
            let size, r;
            if (!root.userData.normalized || !root.userData.baseSize) {
              // v14 ONE-TIME normalization: normalize + centre ONCE, cache the base size.
              root.updateWorldMatrix(true, true);
              const tight0 = computeTightDeviceBounds(root);
              const r0 = tight0.getBoundingSphere(new THREE.Sphere()).radius;
              if (r0 > 0 && isFinite(r0)) root.scale.multiplyScalar(2.0 / r0);
              root.updateWorldMatrix(true, true);
              const tight = computeTightDeviceBounds(root);
              const c = tight.getCenter(new THREE.Vector3());
              root.position.sub(c);
              root.updateWorldMatrix(true, true);
              const tight2 = computeTightDeviceBounds(root);
              size = tight2.getSize(new THREE.Vector3()).clone();
              r = tight2.getBoundingSphere(new THREE.Sphere()).radius;
              const s = root.scale.x || 1;
              root.userData.baseSize = size.clone().divideScalar(s);
              root.userData.baseRadius = r / s;
              root.userData.normalized = true;
            } else {
              size = root.userData.baseSize.clone().multiplyScalar(root.scale.x || 1);
              r = root.userData.baseRadius * (root.scale.x || 1);
            }
            const maxDim = Math.max(size.x, size.y, size.z);
            camera.fov = 34;
            const vFov = THREE.MathUtils.degToRad(camera.fov);
            const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
            // Re-evaluate profile at each intentional reframe so orientation changes
            // switch to their own model values without misclassifying tablet desktop mode.
            const profile = getDeviceProfile();
            const chosen = MODEL_PROFILE_FILL[profile]?.[id] ?? cfg.fill;
            // DESKTOP_TABLET_NON_HERO_FIT: the lower-stage models were filling
            // too much of their containers on wider layouts. Reduce camera fill
            // (increase camera distance) without scaling or deforming model meshes.
            // Keep the hero and every mobile profile exactly at their approved values.
            const isLargeScreen = profile.startsWith('desktop-') || profile.startsWith('tablet-');
            const isLowerStage = id !== 'canvas-hero';
            const isMacbook = id === 'canvas-macbook';
            const isTbkMachine = id === 'canvas-tbk-oca' || id === 'canvas-tbk-90l' || id === 'canvas-tbk-958';
            // Preserve the MacBook's previous large-screen framing; do not shrink every
            // other lower-stage model. The old blanket 0.86 multiplier made the zoom
            // boost net-negative on tablets/desktops.
            const layoutFit = isLargeScreen && isLowerStage && isMacbook ? 0.86 : 1;
            // MODEL_CAMERA_ZOOM_BOOST: camera-only framing; hero and laptop stay unchanged.
            // Machinery gets a measured stronger fill; other non-hero models get a modest increase.
            const machineZoom = isLargeScreen ? 1.05 : 0.86;
            const isAirpods = id === 'canvas-airpods';
            const modelZoom = id === 'canvas-hero' ? 1.04 : isTbkMachine ? machineZoom : isMacbook ? 1.14 : isAirpods ? 1.05 : 1.12;
            const fill = Math.min(1.48, (chosen ?? 0.95) * layoutFit * modelZoom);
            // ASPECT-AWARE PER-AXIS FIT: BOTH width and height, take the larger.
            // hypot(x,z) is rotation-invariant (no 360° crop); base size is cached
            // so animated pose changes can never drift the framing after idle wake.
            const distV = (size.y * 0.5) / (Math.tan(vFov / 2) * fill);
            const distH = (Math.hypot(size.x, size.z) * 0.5) / (Math.tan(hFov / 2) * fill);
            const dist = Math.max(distV, distH);
            const cameraX = isTbkMachine ? 0.22 : 0.16;
            const cameraY = isTbkMachine ? 0.14 : 0.10;
            const cameraZ = isTbkMachine ? 0.965 : 0.982;
            camera.position.set(dist * cameraX, dist * cameraY, dist * cameraZ);
            camera.near = Math.max(0.05, dist - maxDim * 2.5);
            camera.far = dist + maxDim * 4;
            camera.lookAt(0, 0, 0);
            camera.updateProjectionMatrix();
            return { radius: r, distance: dist, fill };
          } catch (e) { return centerAndFitEdgeToEdge(camera, root, 0.8); }
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
          const slot = { canvas, ctx, scene, camera, root, orbit, onTick, visible: false };
          canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); slot.contextLost = true; }, false);
          canvas.addEventListener('webglcontextrestored', () => { slot.contextLost = false; slot.autoFramed = false; slot.autoWake = true; try { renderer.resetState(); } catch (_) {} }, false);
          slots.push(slot);
          if (io) io.observe(canvas);
          else { slot.visible = true; visibleSlots.add(slot); }
          return slot;
        }

        // Crisp Studio PBR Materials
        const orangeTit = new THREE.MeshStandardMaterial({ color: 0xd9480f, metalness: 0.72, roughness: 0.22 });
        const darkObs = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.78, roughness: 0.2 });
        const silverMat = new THREE.MeshStandardMaterial({ color: 0xe4e4e7, metalness: 0.85, roughness: 0.18 });
        const slateMat = new THREE.MeshStandardMaterial({ color: 0x52525b, metalness: 0.76, roughness: 0.22 });
        const screenMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x2563eb, emissiveIntensity: 0.46, roughness: 0.1, metalness: 0.35 });
        const redGlow = new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0xdc2626, emissiveIntensity: 0.75 });
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

          // v8: clean corner-slotted lock screen — date top-left, status top-right,
          // time centred, motif moved BELOW the time, caption in its own bottom card.
          // Nothing overlaps any other text element.
          g.textAlign = 'left';
          g.fillStyle = 'rgba(255,255,255,0.92)';
          g.font = '600 24px Inter, sans-serif';
          g.fillText('Friday, 20 November', 34, 62);
          g.textAlign = 'right';
          g.font = '600 18px Inter, sans-serif';
          g.fillText('●●●', 478, 62);

          g.textAlign = 'center';
          g.fillStyle = '#ffffff';
          g.font = '800 128px Inter, sans-serif';
          g.fillText('9:41', 256, 292);

          g.strokeStyle = 'rgba(255, 237, 213, 0.22)';
          g.lineWidth = 4;
          for (let i = 0; i < 4; i++) {
            g.beginPath();
            g.arc(256, 700 + i * 26, 150 + i * 22, Math.PI * 1.08, Math.PI * 1.92);
            g.stroke();
          }

          g.fillStyle = 'rgba(9, 9, 11, 0.66)';
          fillRoundedRect(g, 66, 824, 380, 84, 26);
          g.fillStyle = '#fb923c';
          g.font = '700 19px Inter, sans-serif';
          g.fillText('RED APPLE · HALASURU LAB', 256, 857);
          g.fillStyle = '#e4e4e7';
          g.font = '500 16px Inter, sans-serif';
          g.fillText('Original OLED · True Tone Active', 256, 885);

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
        // Anti-jank: build 9 remaining models in idle slices (~50ms each)
        // instead of one ~500ms main-thread block during initial load.
        const slotBuildQueue = [];
        const queueSlot = (fn) => slotBuildQueue.push(fn);
        const scheduleSlice = window.requestIdleCallback
          ? (fn) => requestIdleCallback(fn, { timeout: 250 })
          : (fn) => setTimeout(fn, 24);
        function drainSlots() {
          const job = slotBuildQueue.shift();
          if (!job) return;
          try {
            job();
            const just = slots[slots.length - 1];
            if (just) { try { if (renderer.compileAsync) renderer.compileAsync(just.scene, just.camera).catch(() => {}); } catch (_) {} }
          } catch (e) { console.warn('[3D] deferred slot build failed', e); }
          if (slotBuildQueue.length) scheduleSlice(drainSlots);
        }
        scheduleSlice(drainSlots);

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


        document.getElementById('btn-hero-reset')?.addEventListener('click', () => {
          if (heroSlot) heroSlot.orbit.reset();
        });

        // 2. 30-Second Estimate — Animated 3D iPad Pro
        queueSlot(() => { registerSlot('canvas-estimate-ipad', 6.0, (root) => {
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
        }, -0.3, 0.1) });;

        // 3. Free Doorstep Pickup 24/7 — Animated 3D iPhone
        queueSlot(() => { registerSlot('canvas-pickup-iphone', 5.9, (root) => {
          const phone = buildBeveledPhone(slateMat, false);
          const halo = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.02, 12, 60), new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.5 }));
          halo.rotation.x = Math.PI / 2.3;
          // Position-only refinement: preserve the phone geometry, scale and camera fill.
          root.position.set(0.12, -0.12, 0);
          root.add(phone, halo);
          return (t) => {
            phone.position.y = Math.sin(t * 1.4) * 0.1;
            halo.rotation.z = t * 0.7;
          };
        }, 0.4, 0.12) });;

        // 4. TBK OCA Hydraulic Press 3D
        queueSlot(() => { registerSlot('canvas-tbk-oca', 5.8, (root) => {
          root.position.y = -0.2;
          const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 1.8), silverMat); base.position.y = -0.8;
          const top = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 1.8), slateMat); top.position.y = 1.05;
          const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.6, 20), darkObs); cyl.position.y = 1.48;
          const win = new THREE.Mesh(new THREE.BoxGeometry(2.05, 1.2, 1.5), glassClear); win.position.y = 0.22;
          const platen = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.14, 1.25), orangeTit); platen.position.y = 0.5;
          root.add(base, top, cyl, win, platen);
          return (t) => { platen.position.y = 0.5 - ((Math.sin(t * 2.2) + 1) * 0.5) * 0.7; };
        }, -0.4, 0.2) });;

        // 5. TBK 90L Autoclave Bubble Chamber 3D
        queueSlot(() => { registerSlot('canvas-tbk-90l', 5.9, (root) => {
          const base = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.42, 2.0), darkObs); base.position.y = -1.15;
          const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.98, 2.05, 32), slateMat); tank.rotation.x = Math.PI / 2;
          const dPivot = new THREE.Group(); dPivot.position.set(-0.98, 0, 1.04);
          const hatch = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 0.96, 0.16, 32), silverMat); hatch.rotation.x = Math.PI / 2; hatch.position.x = 0.98;
          const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.055, 12, 28), darkObs); wheel.position.set(0.98, 0, 0.15);
          const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.16, 16), redGlow); hub.rotation.x = Math.PI / 2; hub.position.set(0.98, 0, 0.15);
          dPivot.add(hatch, wheel, hub);
          root.add(base, tank, dPivot);
          return (t) => { dPivot.rotation.y = -Math.max(0, Math.sin(t * 0.9)) * 0.72; };
        }, -0.35, 0.18) });;

        // 6. TBK-958 Cold UV Purple Laser 3D
        queueSlot(() => { registerSlot('canvas-tbk-958', 5.8, (root) => {
          root.position.y = -0.25;
          const base = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 2.2), silverMat); base.position.y = -1.05;
          const bed = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 1.5), darkObs); bed.position.set(0, -0.82, 0.2);
          const ph = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.06, 1.25), orangeTit); ph.position.set(0, -0.75, 0.2);
          const tower = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.15, 0.54), silverMat); tower.position.set(0, 0.18, -0.75);
          const arm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 1.35), silverMat); arm.position.set(0, 1.05, -0.15);
          const laserCore = new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0x9333ea, emissiveIntensity: 1.8, transparent: true, opacity: 0.98, roughness: 0.18 });
          const laserAura = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.22, depthWrite: false });
          const beamAura = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.074, 1.5, 18), laserAura);
          const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.032, 1.5, 18), laserCore);
          // Both beam meshes are aimed from the actual laser aperture to the exact
          // animated work point. The cylinder's local Y axis is aligned to that vector.
          const laserOrigin = new THREE.Vector3(0, 0.82, 0.42);
          const laserAxis = new THREE.Vector3(0, 1, 0);
          const laserTarget = new THREE.Vector3();
          const laserDirection = new THREE.Vector3();
          const spot = new THREE.Mesh(new THREE.RingGeometry(0.04, 0.11, 32), new THREE.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.95, side: THREE.DoubleSide }));
          spot.rotation.x = -Math.PI / 2; spot.position.set(0, -0.71, 0.2);
          const spark = new THREE.Mesh(new THREE.SphereGeometry(0.055, 20, 16), new THREE.MeshBasicMaterial({ color: 0xf3e8ff }));
          spark.position.set(0, -0.69, 0.2);
          root.add(base, bed, ph, tower, arm, beamAura, beam, spot, spark);
          return (t) => {
            const sx = Math.sin(t * 3.8) * 0.24;
            const sz = 0.2 + Math.cos(t * 1.8) * 0.42;
            const pulse = 0.72 + (Math.sin(t * 5.2) + 1) * 0.14;
            spot.position.set(sx, -0.71, sz);
            spot.scale.setScalar(0.82 + pulse * 0.24);
            spark.position.set(sx, -0.69, sz);
            laserTarget.set(sx, -0.71, sz);
            laserDirection.subVectors(laserTarget, laserOrigin);
            const beamLength = laserDirection.length();
            beam.position.copy(laserOrigin).add(laserTarget).multiplyScalar(0.5);
            beam.quaternion.setFromUnitVectors(laserAxis, laserDirection.normalize());
            beam.scale.y = beamLength / 1.5;
            beamAura.position.copy(beam.position);
            beamAura.quaternion.copy(beam.quaternion);
            beamAura.scale.y = beam.scale.y;
            laserCore.emissiveIntensity = 1.25 + pulse * 0.9;
            laserAura.opacity = 0.12 + pulse * 0.14;
          };
        }, -0.4, 0.2) });;

        // 7. Stacked iPhone 17 Pro Max Internal Teardown 3D
        let intFactor = 0.65;
        document.getElementById('sl-internals')?.addEventListener('input', (e) => {
          intFactor = parseFloat(e.target.value) / 100;
          const v = document.getElementById('val-internals');
          if (v) v.textContent = Math.round(intFactor * 100) + '%';
        });
        queueSlot(() => { registerSlot('canvas-internals', 5.8, (root) => {
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
        }, -0.45, 0.14) });;

        // v8: explicit AirPods Space Grey material applier (Faisu's contrast request).
        function applyAirpodsSpaceGrey(shell, silicone) {
          shell.color.setHex(0x8a8f98);
          shell.metalness = 0.42;
          shell.roughness = 0.26;
          silicone.color.setHex(0x3f444d);
          silicone.metalness = 0.06;
          silicone.roughness = 0.52;
        }

        // 8. Stacked Realistic AirPods Pro 3D (Space Grey on medium-light orange studio)
        let apFactor = 0.7;
        document.getElementById('sl-airpods')?.addEventListener('input', (e) => {
          apFactor = parseFloat(e.target.value) / 100;
          const v = document.getElementById('val-airpods');
          if (v) v.textContent = Math.round(apFactor * 100) + '%';
        });
        queueSlot(() => { registerSlot('canvas-airpods', 5.2, (root) => {
          // v8: Space Grey shell + graphite silicone — the #8A8F98 tint gives the AirPods
          // a defined silhouette against the medium-light orange studio backdrop.
          const apGlossWhite = new THREE.MeshStandardMaterial({ color: 0x8a8f98, metalness: 0.42, roughness: 0.26 });
          const apSilicone = new THREE.MeshStandardMaterial({ color: 0x3f444d, metalness: 0.06, roughness: 0.52 });
          if (typeof applyAirpodsSpaceGrey === 'function') applyAirpodsSpaceGrey(apGlossWhite, apSilicone);
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
        }, -0.32, 0.16) });;

        // 9. Apple Watch Ultra 3D
        queueSlot(() => { registerSlot('canvas-watch', 5.0, (root) => {
          const wCase = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.38, 0.28), slateMat);
          const face = new THREE.Mesh(new THREE.BoxGeometry(0.94, 1.18, 0.04), darkObs); face.position.z = 0.16;
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.032, 12, 32), redGlow); ring.position.z = 0.19;
          const act = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.34, 0.12), orangeTit); act.position.set(-0.6, 0.05, 0);
          const bTop = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.95, 0.08), darkObs); bTop.position.set(0, 1.15, -0.04);
          const bBot = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.95, 0.08), darkObs); bBot.position.set(0, -1.15, -0.04);
          root.add(wCase, face, ring, act, bTop, bBot);
          return (t) => { ring.scale.setScalar(0.95 + Math.sin(t * 2.2) * 0.05); };
        }, -0.35, 0.12) });;

        // 10. MacBook Pro 3D
        let mbFactor = 0.75;
        document.getElementById('sl-macbook')?.addEventListener('input', (e) => { mbFactor = parseFloat(e.target.value) / 100; });
        queueSlot(() => { registerSlot('canvas-macbook', 6.0, (root) => {
          root.position.y = -0.35;
          const deck = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.11, 1.95), darkObs);
          const lidPivot = new THREE.Group(); lidPivot.position.set(0, 0.06, -0.96);
          const lid = new THREE.Mesh(new THREE.BoxGeometry(2.88, 1.88, 0.06), slateMat); lid.position.y = 0.95;
          const scr = new THREE.Mesh(new THREE.PlaneGeometry(2.74, 1.72), screenMat); scr.position.set(0, 0.95, 0.036);
          lidPivot.add(lid, scr);
          root.add(deck, lidPivot);
          return () => { lidPivot.rotation.x = Math.PI / 2 - mbFactor * 1.88; };
        }, -0.4, 0.18) });;

        // Cache dimensions via ResizeObserver (no layout reads in the render loop)
        if (typeof ResizeObserver !== 'undefined') {
          const ro = new ResizeObserver((entries) => {
            entries.forEach((en) => {
              const target = en.target;
              const slot = slots.find((x) => x.canvas === target);
              if (!slot) return;
              const cs = en.contentRect;
              const previousWidth = slot.cw || 0;
              const previousHeight = slot.ch || 0;
              const previousAspect = previousWidth && previousHeight ? previousWidth / previousHeight : 0;
              slot.cw = Math.round(cs.width); slot.ch = Math.round(cs.height);
              const nextAspect = slot.cw && slot.ch ? slot.cw / slot.ch : 0;
              // Refit when the stage's real dimensions settle, not only when its
              // aspect changes. During first paint/fonts/layout hydration, a canvas
              // can be measured before its final CSS height is applied; keeping the
              // first camera distance then leaves every model temporarily undersized.
              const sizeSettled = Math.abs(slot.cw - previousWidth) > 2 || Math.abs(slot.ch - previousHeight) > 2;
              const aspectChanged = previousAspect && nextAspect && Math.abs(previousAspect - nextAspect) > 0.015;
              if (sizeSettled || aspectChanged) {
                slot.autoFramed = false;
                slot.autoWake = true;
              }
              const [rw, rh] = fitDims(slot.cw, slot.ch);
              slot.rw = rw; slot.rh = rh;
              if (slot.canvas.width !== slot.rw || slot.canvas.height !== slot.rh) {
                slot.canvas.width = slot.rw; slot.canvas.height = slot.rh;
              }
              if (slot.rw && slot.rh) {
                slot.camera.aspect = slot.rw / slot.rh;
                slot.camera.updateProjectionMatrix();
                if (!slot.autoFramed) { slot.autoFramed = true; /* refit on first real size */ }
              }
            });
          });
          slots.forEach((x) => ro.observe(x.canvas));
        }
        // Wake only resumes rendering. It must not refit the camera on tab focus/app return.
        const wakeAll = () => {
          if (document.visibilityState !== 'visible') return;
          wakeWebGLLoop();
        };
        document.addEventListener('visibilitychange', wakeAll);
        window.addEventListener('pageshow', wakeAll);
        window.addEventListener('focus', wakeAll);
        // Orientation is the one intentional global reframe; ResizeObserver also
        // catches the changed canvas aspect and keeps the selected six-way profile in sync.
        window.addEventListener('orientationchange', () => {
          requestAnimationFrame(() => {
            slots.forEach((x) => { x.autoFramed = false; x.autoWake = true; });
            wakeWebGLLoop();
          });
        }, { passive: true });

        let t = 0, lastFrameTime = 0;
        function renderFrame(now = performance.now()) {
          if (document.hidden || visibleSlots.size === 0) return;
          const frameScale = lastFrameTime ? Math.min(2, Math.max(0.5, (now - lastFrameTime) / 16.667)) : 1;
          lastFrameTime = now;
          t += 0.018 * frameScale;
          // Iterate only the small set of stages currently intersecting the viewport.
          for (const s of visibleSlots) {
            if (!s.visible || s.contextLost) continue;
            let cw = s.cw, ch = s.ch;
            if (!cw || !ch) { cw = s.canvas.clientWidth; ch = s.canvas.clientHeight; s.cw = cw; s.ch = ch; }
            if (!cw || !ch) continue;
            const dims = (s.rw && s.rh) ? [s.rw, s.rh] : fitDims(cw, ch);
            const rw = dims[0], rh = dims[1];
            if (s.canvas.width !== rw || s.canvas.height !== rh) {
              s.canvas.width = rw;
              s.canvas.height = rh;
            }
            if ((!s.autoFramed || s.autoWake) && cw && ch) { s.autoWake = false;
              s.autoFramed = true;
              // v14 STALE-ASPECT GUARD: ResizeObserver may not have delivered the new
              // aspect yet after an idle wake; fit against the ACTUAL canvas dims so a
              // stale aspect can never leave the model looking smaller than target fill.
              s.camera.aspect = cw / ch;
              s.camera.updateProjectionMatrix();
              const id = s.canvas.id;
              centerAndFitResponsive(s.camera, s.root, id);
            }
            if (typeof ResizeObserver === 'undefined') { s.camera.aspect = cw / ch; s.camera.updateProjectionMatrix(); }
            s.orbit.update((s === heroSlot && heroAmbient ? 0.0028 : 0.0016), frameScale);
            if (s.onTick) s.onTick(t);
            renderer.setViewport(0, 0, rw, rh);
            renderer.setScissor(0, 0, rw, rh);
            renderer.render(s.scene, s.camera);
            s.ctx.clearRect(0, 0, rw, rh);
            s.ctx.drawImage(glCanvas, 0, MAX_H - rh, rw, rh, 0, 0, rw, rh);
          }
        }
        // Phase C2: Fullscreen Toggle on every 3D stage (GPU-only, viewport-driven)
        for (const slot of slots) {
          // v8: Hero keeps its clean keynote styling — no enlarge button (Faisu's call).
          // The other 9 stages keep the fullscreen control.
          if (slot.canvas.id === 'canvas-hero') continue;
          const fsBtn = document.createElement('button');
          fsBtn.setAttribute('type','button'); fsBtn.dataset.fsToggle = '1';
          fsBtn.className = 'absolute top-2.5 right-2.5 z-20 pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/95 border border-zinc-300 shadow-lg transition-all hover:scale-110 hover:bg-red-600 hover:text-white';
          fsBtn.title = 'Enlarge 3D model · fullscreen 360° view';
          fsBtn.setAttribute('aria-label', 'Enlarge 3D model');
          fsBtn.textContent = '⛶';
          const wrap = slot.canvas.closest('.stage-3d-box');
          if (wrap) { fsBtn.style.position='absolute'; wrap.appendChild(fsBtn); }
          fsBtn.addEventListener('click', () => toggleFullscreen(slot));
        }
        function toggleFullscreen(slot) {
          if (document.fullscreenElement) { document.exitFullscreen(); return; }
          const el = slot.canvas.closest('.stage-3d-box') || slot.canvas;
          if (el.requestFullscreen) el.requestFullscreen();
          else el.webkitRequestFullscreen?.();
          requestAnimationFrame(() => resizeSlot(slot));
        }
        function resizeSlot(slot) {
          try {
            const w = Math.max(1, slot.canvas.clientWidth), h = Math.max(1, slot.canvas.clientHeight);
            slot.cw = w; slot.ch = h;
            const [rw, rh] = fitDims(w, h);
            slot.rw = rw; slot.rh = rh;
            slot.camera.aspect = w / h; slot.camera.updateProjectionMatrix();
            slot.autoWake = true;
            // IMPORTANT: never call renderer.setSize/setPixelRatio here. The renderer is SHARED
            // by all 10 stages at MAX_W×MAX_H; resizing it for one fullscreen stage corrupted
            // the offscreen drawImage source rect and pushed every model to the bottom-right.
          } catch (e) {}
        }
        document.addEventListener('fullscreenchange', () => {
          const canvas = document.fullscreenElement?.querySelector('canvas') || null;
          const slot = slots.find((x) => x.canvas === canvas);
          if (slot) { resizeSlot(slot); requestAnimationFrame(() => resizeSlot(slot)); }
        });
        wakeWebGLLoop();
      } catch (err) {
        console.warn('3D fallback active:', err);
      }
    };
  if (document.readyState === 'complete' && typeof window.onload === 'function') {
    window.onload();
  }
})();