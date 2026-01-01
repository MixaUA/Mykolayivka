const API_URL = "https://raw.githubusercontent.com/Aporial/Svitlo-Sumy-Databases/main/database_new.json";
const MINUTES_IN_DAY = 1440;
const DAY_NAMES = ["one", "two", "three", "four", "five", "six", "seven"];

let db = null, curQ = null, currentIdx = 0, todayPrefix = null, tomorrowPrefix = null;

const clockSVG = `<svg class="loader-clock" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="3s" repeatCount="indefinite"/></path></svg>`;
const calendarSVG = `<svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"/></svg>`;

async function init() {
    document.getElementById('year').innerText = new Date().getFullYear();

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
    determineCycleDays();
    render();
}

function resetView() { localStorage.removeItem('selectedQueue'); location.reload(); }
function setTab(i) { currentIdx = i; render(); }

function checkLastSlotPast(prefix, qData) {
    const now = new Date();
    const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const slots = Object.keys(qData)
        .filter(k => k.startsWith(prefix + '_'))
        .map(k => qData[k])
        .filter(v => v && v.includes(':') && !v.includes('інформації'));
    
    if (slots.length === 0) return true;
    
    let lastSlot = null;
    let latestEndTime = -1;
    
    slots.forEach(s => {
        const [sT, eT] = s.split('-');
        const [eH, eM] = eT.split(':').map(Number);
        const endMinutes = eH * 60 + eM;
        
        if (endMinutes > latestEndTime) {
            latestEndTime = endMinutes;
            lastSlot = s;
        }
    });
    
    if (!lastSlot) return true;
    
    const [sT, eT] = lastSlot.split('-');
    const sEnd = new Date(todayZero);
    const [eH, eM] = eT.split(':').map(Number);
    sEnd.setHours(eH, eM, 0, 0);
    
    const sStart = new Date(todayZero);
    const [sH, sM] = sT.split(':').map(Number);
    sStart.setHours(sH, sM, 0, 0);
    
    if (sEnd <= sStart) sEnd.setDate(sEnd.getDate() + 1);
    
    return now.getTime() >= sEnd.getTime();
}

function determineCycleDays() {
    if (!db || !curQ) return;
    const qData = db[`${curQ}_cherg`];
    const prefixesWithData = [];
    for (let dayName of DAY_NAMES) {
        const keys = Object.keys(qData).filter(k => k.startsWith(dayName + '_'));
        if (keys.length > 0 && keys.some(k => qData[k] && qData[k].includes(':') && !qData[k].includes('інформації'))) {
            prefixesWithData.push(dayName);
        }
    }
    
    if (prefixesWithData.length === 0) {
        todayPrefix = null; tomorrowPrefix = null; return;
    }
    
    if (prefixesWithData.length === 1) {
        if (checkLastSlotPast(prefixesWithData[0], qData)) {
            todayPrefix = null; tomorrowPrefix = null;
        } else {
            todayPrefix = prefixesWithData[0]; tomorrowPrefix = null;
        }
        return;
    }
    
    prefixesWithData.sort((a, b) => DAY_NAMES.indexOf(a) - DAY_NAMES.indexOf(b));
    
    const isTransitionPair = prefixesWithData.includes('seven') && 
                             prefixesWithData.includes('one') && 
                             prefixesWithData.length === 2;
    
    let smallerPrefix, largerPrefix;
    if (isTransitionPair) {
        smallerPrefix = 'seven'; largerPrefix = 'one';
    } else {
        smallerPrefix = prefixesWithData[0]; largerPrefix = prefixesWithData[1];
    }
    
    if (checkLastSlotPast(smallerPrefix, qData)) {
        todayPrefix = largerPrefix; tomorrowPrefix = null;
    } else {
        todayPrefix = smallerPrefix; tomorrowPrefix = largerPrefix;
    }
}

function getH(t) {
    const [s, e] = t.split('-').map(v => { const [h, m] = v.split(':').map(Number); return h * 60 + m; });
    let d = e - s; if (d <= 0) d += MINUTES_IN_DAY;
    return (d/60 % 1 === 0 ? d/60 : (d/60).toFixed(1)) + "г";
}

function addToCalendar(slotTime, isToday) {
    const [startTime, endTime] = slotTime.split('-');
    const eventDate = new Date();
    if (!isToday) eventDate.setDate(eventDate.getDate() + 1);
    
    const formatG = (timeStr, isEnd = false) => {
        const [h, m] = timeStr.split(':');
        const d = new Date(eventDate);
        d.setHours(parseInt(h), parseInt(m), 0);
        if (isEnd && timeStr < startTime) d.setDate(d.getDate() + 1);
        return d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    };
    const start = formatG(startTime), end = formatG(endTime, true);
    const eventTitle = `Черга ${curQ} ⚡ Відключення світла з ${startTime} по ${endTime}`;
    window.open(`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${start}/${end}&details=${encodeURIComponent('Миколаївка, графік відключень')}&sf=true&output=xml`, '_blank');
}

function render() {
    if (!db || !curQ) return;
    const cont = document.getElementById('content');
    const qData = db[`${curQ}_cherg`];
    const targetPrefix = (currentIdx === 0) ? todayPrefix : tomorrowPrefix;
    
    document.getElementById('tabL').classList.toggle('active', currentIdx === 0);
    document.getElementById('tabR').classList.toggle('active', currentIdx === 1);
    
    if (!targetPrefix) {
        cont.innerHTML = `<div class="no-actual">Графік відсутній</div>`;
        return;
    }
    
    const slots = Object.keys(qData)
        .filter(k => k.startsWith(targetPrefix + '_'))
        .map(k => qData[k])
        .filter(v => v && v.includes(':') && !v.includes('інформації'));
    
    if (slots.length === 0) {
        cont.innerHTML = `<p style='margin-top:30px; opacity:0.3'>Графік відсутній</p>`;
        return;
    }
    
    const now = new Date();
    const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isToday = (currentIdx === 0);
    const targetDate = new Date(todayZero);
    if (!isToday) targetDate.setDate(targetDate.getDate() + 1);
    
    const nowMs = now.getTime();
    const oneHourMs = 60 * 60 * 1000;
    let foundActive = false;
    let anyFuture = false;

    const html = slots.map(s => {
        const [sT, eT] = s.split('-');
        const sStart = new Date(targetDate);
        const [sH, sM] = sT.split(':').map(Number);
        sStart.setHours(sH, sM, 0, 0);
        
        const sEnd = new Date(targetDate);
        const [eH, eM] = eT.split(':').map(Number);
        sEnd.setHours(eH, eM, 0, 0);
        if (sEnd <= sStart) sEnd.setDate(sEnd.getDate() + 1);

        const isPast = nowMs >= sEnd.getTime();
        const isCurrent = isToday && nowMs >= sStart.getTime() && nowMs < sEnd.getTime() && !foundActive;
        if (isCurrent) foundActive = true;
        if (!isPast) anyFuture = true;
        
        const canAddToCalendar = !isPast && !isCurrent && (!isToday || (sStart.getTime() - nowMs) > oneHourMs);

        return `<div class="slot ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}">
            <div class="time-box"><span class="time">${s}</span>${isCurrent ? clockSVG : ''}</div>
            <div class="slot-right">
                <span class="dur">${getH(s)}</span>
                <div class="calendar-btn ${!canAddToCalendar ? 'past' : ''}" onclick="${!canAddToCalendar ? '' : `addToCalendar('${s}', ${isToday})`}">
                    ${calendarSVG}
                </div>
            </div>
        </div>`;
    }).join('');

    if (isToday && !anyFuture && slots.length > 0) {
        cont.innerHTML = `<div class="no-actual">Графік більше не актуальний</div>`;
    } else {
        cont.innerHTML = html;
    }
}

init();
