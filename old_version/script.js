
    const API_URL = "https://raw.githubusercontent.com/Aporial/Svitlo-Sumy-Databases/main/database_new.json";
    const MINUTES_IN_DAY = 1440;
    const MONTHS = {"січня":0,"лютого":1,"березня":2,"квітня":3,"травня":4,"червня":5,"липня":6,"серпня":7,"вересня":8,"жовтня":9,"листопада":10,"грудня":11};
    
    let db = null, curQ = null, currentIdx = 0, currentDiffDays = 0;

    const clockSVG = `<svg class="loader-clock" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="3s" repeatCount="indefinite"/></path></svg>`;
    const calendarSVG = `<svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"/></svg>`;

    async function init() {
        curQ = localStorage.getItem('selectedQueue');
        try {
            const r = await fetch(`${API_URL}?t=${Date.now()}`);
            db = await r.json();
            document.getElementById('status').innerText = `Оновлено: ${db.update_time}`;
            renderGrid();
            if (curQ) selectQ(curQ);
            setInterval(() => { if (db && curQ) render(); }, 60000);
        } catch (e) { document.getElementById('status').innerText = "Помилка завантаження"; }
    }

    function renderGrid() {
        const g = document.getElementById('grid');
        const qs = ["1.1","1.2","2.1","2.2","3.1","3.2","4.1","4.2","5.1","5.2","6.1","6.2"];
        g.innerHTML = qs.map(q => `<button class="btn-q" onclick="selectQ('${q}')">${q}</button>`).join('');
    }

    function selectQ(q) {
        curQ = q;
        localStorage.setItem('selectedQueue', q);
        document.getElementById('grid').classList.add('hidden');
        document.getElementById('box').classList.remove('hidden');
        document.getElementById('title').innerText = `Черга ${q}`;
        render();
    }

    function resetView() { localStorage.removeItem('selectedQueue'); location.reload(); }
    function setTab(i) { currentIdx = i; render(); }

    function getH(t) {
        const [s, e] = t.split('-').map(v => { const [h, m] = v.split(':').map(Number); return h * 60 + m; });
        let d = e - s; if (d <= 0) d += MINUTES_IN_DAY;
        return (d/60 % 1 === 0 ? d/60 : (d/60).toFixed(1)) + "г";
    }

    function addToCalendar(slotTime) {
        const [startTime, endTime] = slotTime.split('-');
        const eventDate = new Date();
        const targetDayOffset = (currentIdx === 0) ? -currentDiffDays : (1 - currentDiffDays);
        eventDate.setDate(eventDate.getDate() + targetDayOffset);
        
        const formatG = (timeStr, isEnd = false) => {
            const [h, m] = timeStr.split(':');
            const d = new Date(eventDate);
            d.setHours(parseInt(h), parseInt(m), 0);
            if (isEnd && timeStr < startTime) d.setDate(d.getDate() + 1);
            return d.toISOString().replace(/-|:|\.\d\d\d/g, "");
        };
        const start = formatG(startTime), end = formatG(endTime, true);
        window.open(`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('💡 СВІТЛО: '+slotTime)}&dates=${start}/${end}&details=${encodeURIComponent('Черга: '+curQ)}&sf=true&output=xml`, '_blank');
    }

    function render() {
        if (!db || !curQ) return;
        const cont = document.getElementById('content'), qData = db[`${curQ}_cherg`];
        const p = db.update_time.split(' '), fileDate = new Date(new Date().getFullYear(), MONTHS[p[1].toLowerCase()], parseInt(p[0]));
        const now = new Date(), todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        currentDiffDays = Math.round((todayZero - fileDate) / (1000 * 60 * 60 * 24));

        document.getElementById('tabL').innerText = (currentDiffDays === 0) ? "Сьогодні" : "Вчора";
        document.getElementById('tabR').innerText = (currentDiffDays === 0) ? "Завтра" : "Сьогодні";
        document.getElementById('tabL').classList.toggle('active', currentIdx === 0);
        document.getElementById('tabR').classList.toggle('active', currentIdx === 1);

        // Пряма перевірка вкладки ВЧОРА
        const isYesterdayTab = (currentDiffDays === 1 && currentIdx === 0);
        if (isYesterdayTab) {
            cont.innerHTML = `<div class="no-actual">Графік більше не актуальний</div>`;
            return;
        }

        const allKeys = Object.keys(qData).filter(k => qData[k].includes(':'));
        const prefs = [...new Set(allKeys.map(k => k.split('_')[0]))].sort(); 
        const targetPref = prefs[currentIdx];
        const slots = targetPref ? Object.keys(qData).filter(k => k.startsWith(targetPref)).map(k => qData[k]) : [];
        
        const nowMs = now.getTime(); let foundActive = false; let anyFuture = false;

        const html = slots.map(s => {
            const [sT, eT] = s.split('-');
            const sStart = new Date(todayZero), [sH, sM] = sT.split(':').map(Number);
            sStart.setHours(sH, sM, 0, 0);
            const sEnd = new Date(todayZero), [eH, eM] = eT.split(':').map(Number);
            sEnd.setHours(eH, eM, 0, 0);
            const dayOff = (currentIdx === 0) ? -currentDiffDays : (1 - currentDiffDays);
            sStart.setDate(sStart.getDate() + dayOff); sEnd.setDate(sEnd.getDate() + dayOff);
            if (sEnd <= sStart) sEnd.setDate(sEnd.getDate() + 1);

            const isPast = nowMs >= sEnd.getTime();
            const isTarget = nowMs >= sStart.getTime() && nowMs < sEnd.getTime() && !foundActive;
            if (isTarget) foundActive = true;
            if (!isPast) anyFuture = true;

            return `<div class="slot ${isTarget ? 'current' : ''} ${isPast ? 'past' : ''}">
                <div class="time-box"><span class="time">${s}</span>${isTarget ? clockSVG : ''}</div>
                <div class="slot-right">
                    <span class="dur">${getH(s)}</span>
                    <div class="calendar-btn ${isPast ? 'past' : ''}" onclick="${isPast ? '' : `addToCalendar('${s}')`}">
                        ${calendarSVG}
                    </div>
                </div>
            </div>`;
        }).join('');

        // Перевірка СОГОДНІШНЬОЇ вкладки на неактуальність
        const isTodayTab = (currentDiffDays === 0 && currentIdx === 0) || (currentDiffDays === 1 && currentIdx === 1);
        if (isTodayTab && !anyFuture && slots.length > 0) {
            cont.innerHTML = `<div class="no-actual">Графік більше не актуальний</div>`;
        } else {
            cont.innerHTML = html || "<p style='margin-top:30px; opacity:0.3'>Графік відсутній</p>";
        }
    }
    init();
