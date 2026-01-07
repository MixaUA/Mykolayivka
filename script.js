const API_URL = "https://raw.githubusercontent.com/Aporial/Svitlo-Sumy-Databases/main/database_new.json";
const WEATHER_API = "https://api.open-meteo.com/v1/forecast?latitude=50.2699&longitude=34.3961&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Europe/Kiev&forecast_days=2";
const P_LIST = ["one", "two", "three", "four", "five", "six", "seven"];
const calendarSVG = `<svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"/></svg>`;
const clockSVG = `<svg class="loader-clock" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="3s" repeatCount="indefinite"/></path></svg>`;

const weatherIcons = {
    sun: `<svg viewBox="0 0 64 64"><g stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round"><circle cx="32" cy="32" r="10"/><g><line x1="32" y1="4" x2="32" y2="12"/><line x1="32" y1="52" x2="32" y2="60"/><line x1="4" y1="32" x2="12" y2="32"/><line x1="52" y1="32" x2="60" y2="32"/><line x1="12" y1="12" x2="18" y2="18"/><line x1="46" y1="46" x2="52" y2="52"/><line x1="12" y1="52" x2="18" y2="46"/><line x1="46" y1="18" x2="52" y2="12"/><animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="20s" repeatCount="indefinite"/></g></g></svg>`,
    cloudSun: `<svg viewBox="0 0 64 64"><g stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round"><g transform="scale(0.6) translate(-2, -8)"><circle cx="32" cy="32" r="10"/><g><line x1="32" y1="4" x2="32" y2="12"/><line x1="32" y1="52" x2="32" y2="60"/><line x1="4" y1="32" x2="12" y2="32"/><line x1="52" y1="32" x2="60" y2="32"/><line x1="12" y1="12" x2="18" y2="18"/><line x1="46" y1="46" x2="52" y2="52"/><line x1="12" y1="52" x2="18" y2="46"/><line x1="46" y1="18" x2="52" y2="12"/><animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="20s" repeatCount="indefinite"/></g></g><path fill="white" d="M18 40h28a8 8 0 0 0 0-16 14 14 0 0 0-28-2A8 8 0 0 0 18 40"/></g></svg>`,
    cloud: `<svg viewBox="0 0 64 64"><g stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round"><path d="M18 40h28a8 8 0 0 0 0-16 14 14 0 0 0-28-2A8 8 0 0 0 18 40"><animateTransform attributeName="transform" type="translate" values="0 0; 2 0; -2 0; 0 0" dur="8s" repeatCount="indefinite"/></path></g></svg>`,
    rain: `<svg viewBox="0 0 64 64"><g stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round"><path d="M18 32h28a8 8 0 0 0 0-16 14 14 0 0 0-28-2A8 8 0 0 0 18 32"/><g><line x1="26" y1="40" x2="26" y2="50"/><animateTransform attributeName="transform" type="translate" values="0 0; 0 10; 0 0" dur="1.5s" begin="0s" repeatCount="indefinite"/></g><g><line x1="34" y1="40" x2="34" y2="50"/><animateTransform attributeName="transform" type="translate" values="0 0; 0 10; 0 0" dur="1.5s" begin="0.3s" repeatCount="indefinite"/></g><g><line x1="42" y1="40" x2="42" y2="50"/><animateTransform attributeName="transform" type="translate" values="0 0; 0 10; 0 0" dur="1.5s" begin="0.6s" repeatCount="indefinite"/></g></g></svg>`,
    snow: `<svg viewBox="0 0 64 64"><g stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round"><path d="M18 32h28a8 8 0 0 0 0-16 14 14 0 0 0-28-2A8 8 0 0 0 18 32"/><g><line x1="28" y1="40" x2="28" y2="46"/><line x1="25" y1="43" x2="31" y2="43"/><line x1="26" y1="41" x2="30" y2="45"/><line x1="30" y1="41" x2="26" y2="45"/><animateTransform attributeName="transform" type="translate" values="0 0; 0 8; 0 0" dur="2s" begin="0s" repeatCount="indefinite"/></g><g><line x1="40" y1="40" x2="40" y2="46"/><line x1="37" y1="43" x2="43" y2="43"/><line x1="38" y1="41" x2="42" y2="45"/><line x1="42" y1="41" x2="38" y2="45"/><animateTransform attributeName="transform" type="translate" values="0 0; 0 8; 0 0" dur="2s" begin="0.8s" repeatCount="indefinite"/></g></g></svg>`
};

// Цикл: 0-Пн, 1-Вт, 2-Ср, 3-Чт, 4-Пт, 5-Сб, 6-Нд
let dayPrefixMap = JSON.parse(localStorage.getItem('calibratedMap')) || [5, 6, 0, 1, 2, 3, 4];
let db = null, curQ = localStorage.getItem('selectedQueue'), currentIdx = 0, weatherData = null;

async function init() {
    document.getElementById('year').innerText = new Date().getFullYear();
    await fetchData();
    await fetchWeather();
    renderGrid();
    if (curQ) selectQ(curQ);
    setInterval(() => { if (curQ) fetchData(); }, 600000);
}

async function fetchData() {
    try {
        const r = await fetch(`${API_URL}?t=${Date.now()}`);
        db = await r.json();
        document.getElementById('status').innerText = `Оновлено: ${db.update_time}`;
        if (curQ) syncLogic();
        render();
    } catch (e) { document.getElementById('status').innerText = "Помилка зв'язку"; }
}

async function fetchWeather() {
    const cached = localStorage.getItem('weatherCache');
    if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp < 3600000) {
            weatherData = data;
            return;
        }
    }
    
    try {
        const r = await fetch(WEATHER_API);
        const data = await r.json();
        weatherData = {
            timestamp: Date.now(),
            today: {
                max: Math.round(data.daily.temperature_2m_max[0]),
                min: Math.round(data.daily.temperature_2m_min[0]),
                code: data.daily.weathercode[0]
            },
            tomorrow: {
                max: Math.round(data.daily.temperature_2m_max[1]),
                min: Math.round(data.daily.temperature_2m_min[1]),
                code: data.daily.weathercode[1]
            }
        };
        localStorage.setItem('weatherCache', JSON.stringify(weatherData));
    } catch (e) {
        weatherData = null;
    }
}

function getWeatherIcon(code) {
    if (code === 0) return weatherIcons.sun;
    if (code >= 1 && code <= 3) return weatherIcons.cloudSun;
    if (code >= 45 && code <= 48) return weatherIcons.cloud;
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return weatherIcons.rain;
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return weatherIcons.snow;
    return weatherIcons.cloud;
}

function syncLogic() {
    if (!db || !curQ) return;
    const [dPart] = db.update_time.split(' ');
    const [d, m, y] = dPart.split('.').map(Number);
    const fileDate = new Date(y, m - 1, d); fileDate.setHours(0,0,0,0);
    const now = new Date(); now.setHours(0,0,0,0);
    const daysDiff = Math.round((now - fileDate) / 86400000);

    // Механізм коригування активується ТІЛЬКИ якщо файл вчорашній
    if (daysDiff === 1) {
        const qData = db[`${curQ}_cherg`];
        const keys = Object.keys(qData);
        const available = [...new Set(keys.map(k => k.split('_')[0]))];
        available.sort((a,b) => P_LIST.indexOf(a) - P_LIST.indexOf(b));
        
        const lastPref = available[available.length - 1];
        const lastIdxInFile = P_LIST.indexOf(lastPref);
        const todayIdx = (now.getDay() + 6) % 7; 

        if (dayPrefixMap[todayIdx] !== lastIdxInFile) {
            const offset = (lastIdxInFile - todayIdx + 7) % 7;
            for (let i = 0; i < 7; i++) dayPrefixMap[i] = (i + offset) % 7;
            localStorage.setItem('calibratedMap', JSON.stringify(dayPrefixMap));
        }
    } else if (daysDiff > 1) {
        document.getElementById('status').innerText = `${db.update_time} ⚠️ Застаріло`;
    }
}

function render() {
    if (!db || !curQ) return;
    const cont = document.getElementById('content');
    const qData = db[`${curQ}_cherg`];
    const now = new Date();
    const nowM = now.getHours() * 60 + now.getMinutes();
    const todayIdx = (now.getDay() + 6) % 7;
    
    document.getElementById('tabL').classList.toggle('active', currentIdx === 0);
    document.getElementById('tabR').classList.toggle('active', currentIdx === 1);

    // Оновлення погоди у вкладках
    if (weatherData) {
        const todayW = weatherData.today;
        const tomorrowW = weatherData.tomorrow;
        document.getElementById('weatherToday').innerHTML = `
            ${getWeatherIcon(todayW.code)}
            <span class="temp-range">${todayW.max > 0 ? '+' : ''}${todayW.max}° / ${todayW.min > 0 ? '+' : ''}${todayW.min}°</span>
        `;
        document.getElementById('weatherTomorrow').innerHTML = `
            ${getWeatherIcon(tomorrowW.code)}
            <span class="temp-range">${tomorrowW.max > 0 ? '+' : ''}${tomorrowW.max}° / ${tomorrowW.min > 0 ? '+' : ''}${tomorrowW.min}°</span>
        `;
    }

    // Перевірка застою для вкладки "Завтра"
    const [dPart] = db.update_time.split(' ');
    const [d, m, y] = dPart.split('.').map(Number);
    const fileDate = new Date(y, m - 1, d); fileDate.setHours(0,0,0,0);
    const nowDate = new Date(); nowDate.setHours(0,0,0,0);
    const daysDiff = Math.round((nowDate - fileDate) / 86400000);

    if (daysDiff > 1 && currentIdx === 1) {
        cont.innerHTML = `<div class="no-actual">⚠️ Дані застарілі</div>`;
        return;
    }

    const targetDayIdx = currentIdx === 0 ? todayIdx : (todayIdx + 1) % 7;
    const pref = P_LIST[dayPrefixMap[targetDayIdx]];

    // --- NEW LOGIC START ---
    const allPrefKeys = Object.keys(qData).filter(k => k.startsWith(pref + '_')).sort();

    if (allPrefKeys.length === 0) {
        cont.innerHTML = `<div class="no-actual">Графік на ${currentIdx === 0 ? 'сьогодні' : 'завтра'} очікується</div>`;
        return;
    }

    const firstSlotValue = qData[allPrefKeys[0]];
    if (firstSlotValue && !firstSlotValue.includes(':')) { // Check if it's a message, not a time range
        cont.innerHTML = `<div class="no-actual" style="margin-top: 50px; font-size: 1.2rem;">${firstSlotValue}</div>`;
        return;
    }
    // --- NEW LOGIC END ---

    const slots = allPrefKeys.map(k => {
        const val = qData[k];
        // Ensure only time-based values are processed
        if (!val.includes(':')) return null; 
        const [s, e] = val.split('-').map(t => {
            const [h, m] = t.split(':').map(Number); return h * 60 + m;
        });
        return { start: s, end: (e === 0 ? 1440 : e), type: 'off' };
    }).filter(v => v !== null).sort((a,b) => a.start - b.start);

    if (slots.length === 0) {
        cont.innerHTML = `<div class="no-actual">Графік на ${currentIdx === 0 ? 'сьогодні' : 'завтра'} очікується</div>`;
        return;
    }

    let full = []; let last = 0;
    slots.forEach(s => {
        if (s.start > last) full.push({ start: last, end: s.start, type: 'on' });
        full.push(s); last = s.end;
    });
    if (last < 1440) full.push({ start: last, end: 1440, type: 'on' });

    const display = full.filter(ev => currentIdx === 0 ? ev.end > nowM : true);

    cont.innerHTML = display.map(ev => {
        const isToday = currentIdx === 0;
        const s = `${Math.floor(ev.start/60).toString().padStart(2,'0')}:${(ev.start%60).toString().padStart(2,'0')}`;
        const e = `${Math.floor(ev.end/60 % 24).toString().padStart(2,'0')}:${(ev.end%60).toString().padStart(2,'0')}`;
        const isCur = isToday && nowM >= ev.start && nowM < ev.end;
        
        // ЗАХИСНИЙ МЕХАНІЗМ: за 60 хв до початку кнопка блокується
        const isLocked = isToday && (ev.start - nowM <= 60);
        
        const dur = (ev.end - ev.start) / 60;
        return `
            <div class="slot ${ev.type} ${isCur ? 'current' : ''}">
                <div class="time-box"><span class="time">${s}-${e}</span></div>
                <div class="slot-right">
                    <span class="dur">${dur % 1 === 0 ? dur : dur.toFixed(1)} год/${ev.type==='off'?'викл':'вкл'}</span>
                    <div style="width:32px; display:flex; justify-content:center;">
                        ${isCur ? clockSVG : `
                            <div class="calendar-btn ${isLocked ? 'disabled' : ''}" 
                                 onclick="${isLocked ? '' : `addToCal('${s}-${e}', ${isToday}, '${ev.type}')`}">
                                ${calendarSVG}
                            </div>`}
                    </div>
                </div>
            </div>`;
    }).join('');
}

function renderGrid() {
    const qs = ["1.1","1.2","2.1","2.2","3.1","3.2","4.1","4.2","5.1","5.2","6.1","6.2"];
    document.getElementById('grid').innerHTML = qs.map(q => `<button class="btn-q" onclick="selectQ('${q}')">${q}</button>`).join('');
}

function selectQ(q) {
    curQ = q; localStorage.setItem('selectedQueue', q);
    document.getElementById('grid').classList.add('hidden');
    document.getElementById('box').classList.remove('hidden');
    document.getElementById('title').innerText = `Черга ${q}`;
    syncLogic(); render();
}

function resetView() { localStorage.removeItem('selectedQueue'); location.reload(); }
function setTab(i) { currentIdx = i; render(); }

function addToCal(slot, isToday, type) {
    const [sT, eT] = slot.split('-');
    const d = new Date(); if (!isToday) d.setDate(d.getDate() + 1);
    const iso = (t) => {
        const [h, m] = t.split(':').map(Number);
        const date = new Date(d); date.setHours(h, m, 0, 0);
        return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    };
    const title = (type === 'off' ? `⚡ Відключення ${curQ}` : `💡 Світло ${curQ}`);
    window.open(`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${iso(sT)}/${iso(eT)}&sf=true&output=xml`, '_blank');
}

function registerSW() {
    if (!('serviceWorker' in navigator)) {
        console.log('Service Worker not supported');
        return;
    }
    
    navigator.serviceWorker.register('./sw.js')
        .then(registration => {
            console.log('ServiceWorker registration successful');

            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showUpdateBar(newWorker);
                    }
                });
            });
        })
        .catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
}

function showUpdateBar(worker) {
    const bar = document.createElement('div');
    bar.className = 'update-bar';
    bar.innerHTML = `
        <span>Доступна нова версія!</span>
        <button id="update-button">Оновити</button>
    `;
    document.body.appendChild(bar);

    document.getElementById('update-button').addEventListener('click', () => {
        worker.postMessage({ action: 'skipWaiting' });
        window.location.reload();
    });
}

init();
registerSW();