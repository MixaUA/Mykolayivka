// --- Constants and Configuration ---
const API_URL = "https://raw.githubusercontent.com/MixaUA/Mykolayivka/main/database_new.json";
const WEATHER_API = "https://api.open-meteo.com/v1/forecast?latitude=50.2699&longitude=34.3961&daily=temperature_2m_max,temperature_2m_min,weathercode&hourly=weathercode&timezone=Europe/Kiev&forecast_days=2";
const P_LIST = ["one", "two", "three", "four", "five", "six", "seven"];
const DAYS_UA = ["понеділок", "вівторок", "середа", "четвер", "п'ятниця", "субота", "неділя"];

// --- UI Assets (SVGs) ---
const calendarSVG = `<svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"/></svg>`;
const clockSVG = `<svg class="loader-clock" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="3s" repeatCount="indefinite"/></path></svg>`;
const powerOffSVG = `<svg class="icon-pwr" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2.5"><path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/></svg>`;
const powerOnSVG = `<svg class="icon-pwr" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2.5"><path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/></svg>`;
const weatherIcons = {
    sun: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g id="day"><g transform="translate(32,32)"><g class="am-weather-sun am-weather-sun-shiny am-weather-easing-ease-in-out"><g><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,11)" x1="0" x2="0" y1="0" y2="6" /></g><g transform="rotate(45)"><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,11)" x1="0" x2="0" y1="0" y2="6" /></g><g transform="rotate(90)"><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,11)" x1="0" x2="0" y1="0" y2="6" /></g><g transform="rotate(135)"><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,11)" x1="0" x2="0" y1="0" y2="6" /></g><g transform="rotate(180)"><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,11)" x1="0" x2="0" y1="0" y2="6" /></g><g transform="rotate(225)"><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,11)" x1="0" x2="0" y1="0" y2="6" /></g><g transform="rotate(270)"><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,11)" x1="0" x2="0" y1="0" y2="6" /></g><g transform="rotate(315)"><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,11)" x1="0" x2="0" y1="0" y2="6" /></g></g><circle cx="0" cy="0" fill="white" r="7" stroke="black" stroke-width="1.5"/></g></g></svg>`,
    cloudSun: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g id="cloudy-day-1"><g transform="translate(20,10)"><g transform="translate(0,16)"><g class="am-weather-sun"><g><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,9)" x1="0" x2="0" y1="0" y2="3"/></g><g transform="rotate(45)"><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,9)" x1="0" x2="0" y1="0" y2="3"/></g><g transform="rotate(90)"><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,9)" x1="0" x2="0" y1="0" y2="3"/></g><g transform="rotate(135)"><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,9)" x1="0" x2="0" y1="0" y2="3"/></g><g transform="rotate(180)"><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,9)" x1="0" x2="0" y1="0" y2="3"/></g><g transform="rotate(225)"><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,9)" x1="0" x2="0" y1="0" y2="3"/></g><g transform="rotate(270)"><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,9)" x1="0" x2="0" y1="0" y2="3"/></g><g transform="rotate(315)"><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,9)" x1="0" x2="0" y1="0" y2="3"/></g></g><circle cx="0" cy="0" fill="white" r="5" stroke="black" stroke-width="1.5"/></g><g><path d="M47.7,35.4c0-4.6-3.7-8.2-8.2-8.2c-1,0-1.9,0.2-2.8,0.5c-0.3-3.4-3.1-6.2-6.6-6.2c-3.7,0-6.7,3-6.7,6.7c0,0.8,0.2,1.6,0.4,2.3 c-0.3-0.1-0.7-0.1-1-0.1c-3.7,0-6.7,3-6.7,6.7c0,3.6,2.9,6.6,6.5,6.7l17.2,0C44.2,43.3,47.7,39.8,47.7,35.4z" fill="white" stroke="black" stroke-linejoin="round" stroke-width="1.2" transform="translate(-20,-11)"/></g></g></g></svg>`,
    cloud: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g id="cloudy"><g transform="translate(20,10)"><g class="am-weather-cloud-1"><path d="M47.7,35.4c0-4.6-3.7-8.2-8.2-8.2c-1,0-1.9,0.2-2.8,0.5c-0.3-3.4-3.1-6.2-6.6-6.2c-3.7,0-6.7,3-6.7,6.7c0,0.8,0.2,1.6,0.4,2.3c-0.3-0.1-0.7-0.1-1-0.1c-3.7,0-6.7,3-6.7,6.7c0,3.6,2.9,6.6,6.5,6.7l17.2,0C44.2,43.3,47.7,39.8,47.7,35.4z" fill="white" stroke="black" stroke-linejoin="round" stroke-width="1.2" transform="translate(-10,-8), scale(0.6)"/></g><g class="am-weather-cloud-2"><path d="M47.7,35.4c0-4.6-3.7-8.2-8.2-8.2c-1,0-1.9,0.2-2.8,0.5c-0.3-3.4-3.1-6.2-6.6-6.2c-3.7,0-6.7,3-6.7,6.7c0,0.8,0.2,1.6,0.4,2.3c-0.3-0.1-0.7-0.1-1-0.1c-3.7,0-6.7,3-6.7,6.7c0,3.6,2.9,6.6,6.5,6.7l17.2,0C44.2,43.3,47.7,39.8,47.7,35.4z" fill="white" stroke="black" stroke-linejoin="round" stroke-width="1.2" transform="translate(-20,-11)"/></g></g></g></svg>`,
    rain: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g id="rainy-5"><g transform="translate(20,10)"><g><path d="M47.7,35.4c0-4.6-3.7-8.2-8.2-8.2c-1,0-1.9,0.2-2.8,0.5c-0.3-3.4-3.1-6.2-6.6-6.2c-3.7,0-6.7,3-6.7,6.7c0,0.8,0.2,1.6,0.4,2.3 c-0.3-0.1-0.7-0.1-1-0.1c-3.7,0-6.7,3-6.7,6.7c0,3.6,2.9,6.6,6.5,6.7l17.2,0C44.2,43.3,47.7,39.8,47.7,35.4z" fill="white" stroke="black" stroke-linejoin="round" stroke-width="1.2" transform="translate(-20,-11)"/></g></g><g transform="translate(34,46), rotate(10)"><line class="am-weather-rain-1" fill="none" stroke="black" stroke-dasharray="4,7" stroke-linecap="round" stroke-width="2" transform="translate(-6,1)" x1="0" x2="0" y1="0" y2="8" /><line class="am-weather-rain-2" fill="none" stroke="black" stroke-dasharray="4,7" stroke-linecap="round" stroke-width="2" transform="translate(0,-1)" x1="0" x2="0" y1="0" y2="8" /></g></g></svg>`,
    snow: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g id="snowy-5"><g transform="translate(20,10)"><g><path d="M47.7,35.4c0-4.6-3.7-8.2-8.2-8.2c-1,0-1.9,0.2-2.8,0.5c-0.3-3.4-3.1-6.2-6.6-6.2c-3.7,0-6.7,3-6.7,6.7c0,0.8,0.2,1.6,0.4,2.3 c-0.3-0.1-0.7-0.1-1-0.1c-3.7,0-6.7,3-6.7,6.7c0,3.6,2.9,6.6,6.5,6.7l17.2,0C44.2,43.3,47.7,39.8,47.7,35.4z" fill="white" stroke="black" stroke-linejoin="round" stroke-width="1.2" transform="translate(-20,-11)"/></g><g class="am-weather-snow-1"><g transform="translate(7,28)"><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.2" transform="translate(0,9), rotate(0)" x1="0" x2="0" y1="-2.5" y2="2.5" /><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1" transform="translate(0,9), rotate(45)" x1="0" x2="0" y1="-2.5" y2="2.5" /><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1" transform="translate(0,9), rotate(90)" x1="0" x2="0" y1="-2.5" y2="2.5" /><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1" transform="translate(0,9), rotate(135)" x1="0" x2="0" y1="-2.5" y2="2.5" /></g></g><g class="am-weather-snow-2"><g transform="translate(16,28)"><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.2" transform="translate(0,9), rotate(0)" x1="0" x2="0" y1="-2.5" y2="2.5" /><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1" transform="translate(0,9), rotate(45)" x1="0" x2="0" y1="-2.5" y2="2.5" /><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1" transform="translate(0,9), rotate(90)" x1="0" x2="0" y1="-2.5" y2="2.5" /><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1" transform="translate(0,9), rotate(135)" x1="0" x2="0" y1="-2.5" y2="2.5" /></g></g></g></g></svg>`,
    thunder: `<svg viewBox="0 0 64 64"><path d="M47.7,35.4c0-4.6-3.7-8.2-8.2-8.2c-1,0-1.9,0.2-2.8,0.5c-0.3-3.4-3.1-6.2-6.6-6.2c-3.7,0-6.7,3-6.7,6.7c0,0.8,0.2,1.6,0.4,2.3c-0.3-0.1-0.7-0.1-1-0.1c-3.7,0-6.7,3-6.7,6.7c0,3.6,2.9,6.6,6.5,6.7l17.2,0C44.2,43.3,47.7,39.8,47.7,35.4z" fill="white" stroke="black" stroke-linejoin="round" stroke-width="1.2" transform="translate(-2,-11)"/><g transform="translate(18, 30) scale(1.3)"><polygon fill="black" stroke="none" points="14.3,-2.9 20.5,-2.9 16.4,4.3 20.3,4.3 11.5,14.6 14.9,6.9 11.1,6.9" /><animateTransform attributeName="transform" type="translate" values="0 0; 0 5; 0 0" dur="1s" repeatCount="indefinite" additive="sum"/></g><g transform="translate(26,40), rotate(10)"><line class="am-weather-rain-1" fill="none" stroke="black" stroke-dasharray="4,7" stroke-linecap="round" stroke-width="2" transform="translate(-6,1)" x1="0" x2="0" y1="0" y2="8" /><line class="am-weather-rain-2" fill="none" stroke="black" stroke-dasharray="4,7" stroke-linecap="round" stroke-width="2" transform="translate(0,-1)" x1="0" x2="0" y1="0" y2="8" /></g></svg>`,
    fog: `<svg viewBox="0 0 64 64"><path d="M47.7,35.4c0-4.6-3.7-8.2-8.2-8.2c-1,0-1.9,0.2-2.8,0.5c-0.3-3.4-3.1-6.2-6.6-6.2c-3.7,0-6.7,3-6.7,6.7c0,0.8,0.2,1.6,0.4,2.3 c-0.3-0.1-0.7-0.1-1-0.1c-3.7,0-6.7,3-6.7,6.7c0,3.6,2.9,6.6,6.5,6.7l17.2,0C44.2,43.3,47.7,39.8,47.7,35.4z" fill="white" stroke="black" stroke-linejoin="round" stroke-width="1.2" transform="translate(-2,-11)"/><g transform="translate(12, 45)"><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" x1="0" y1="0" x2="40" y2="0" stroke-dasharray="4,4"><animateTransform attributeName="transform" type="translate" values="0 0; 2 0; -2 0; 0 0" dur="3.5s" repeatCount="indefinite" additive="sum"/></line><line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" x1="0" y1="8" x2="35" y2="8" stroke-dasharray="4,4"><animateTransform attributeName="transform" type="translate" values="0 0; -2 0; 2 0; 0 0" dur="4s" repeatCount="indefinite" additive="sum" begin="0.3s"/></line></g></svg>`
};

// --- State Variables ---
let dayPrefixMap = [0, 1, 2, 3, 4, 5, 6]; 
let lastCalibrationDate = null;
let db = null, curQ = localStorage.getItem('selectedQueue');
let dayIdx = 0, viewMode = 1;
let weatherData = null, timerData = null;
let clickedSlots = JSON.parse(localStorage.getItem('clickedSlots')) || {};

/**
 * Loads the external mapping configuration for day-to-prefix associations.
 */
async function loadConfig() {
    try {
        const response = await fetch('mapping.json?t=' + Date.now());
        const config = await response.json();
        const mapChanged = JSON.stringify(config.calibratedMap) !== JSON.stringify(dayPrefixMap);
        if (config.calibratedMap) {
            dayPrefixMap = config.calibratedMap;
            lastCalibrationDate = config.lastCalibration;
            if (mapChanged && db && curQ) { calculateTimerData(); render(); }
        }
    } catch (e) { console.error("Config load error"); }
}

/**
 * Main entry point: initializes UI, loads data, and sets up intervals.
 */
async function init() {
    document.getElementById('year').innerText = new Date().getFullYear();
    updateFlipTimer();
    await loadConfig();
    await fetchData(); 
    renderGrid();
    if (curQ) selectQ(curQ);
    await fetchWeather();
    setInterval(updateFlipTimer, 1000);
    setInterval(() => { if (curQ && db) { calculateTimerData(); render(); } }, 60000);
    setInterval(async () => { if (curQ) await fetchData(); }, 1200000); 
    setInterval(() => { fetchWeather(); }, 3600000);
}

/**
 * Fetches power schedule data from the GitHub repository.
 */
async function fetchData() {
    if (lastCalibrationDate) {
        const todayStr = new Date().toISOString().split('T')[0];
        if (todayStr > lastCalibrationDate) await loadConfig();
    }
    const now = Date.now();
    try {
        const r = await fetch(`${API_URL}?t=${now}`);
        if (!r.ok) throw new Error();
        db = await r.json();
        localStorage.setItem('db_cache', JSON.stringify(db));
        localStorage.setItem('db_cache_time', now.toString());
        document.getElementById('status').innerText = `Оновлено: ${db.update_time}`;
        if (curQ) { calculateTimerData(); render(); }
    } catch (e) {
        const cached = localStorage.getItem('db_cache');
        if (cached) { db = JSON.parse(cached); if (curQ) { calculateTimerData(); render(); } }
        document.getElementById('status').innerText = "Офлайн / Кеш";
    }
}

/**
 * Calculates current event duration and type for the countdown timer.
 */
function calculateTimerData() {
    if (!db || !curQ || !dayPrefixMap || !P_LIST) return;
    const now = new Date(), nowM = now.getHours() * 60 + now.getMinutes();
    const qData = db[`${curQ}_cherg`];
    const tIdx = (now.getDay() + 6) % 7;
    const pref = P_LIST[dayPrefixMap[tIdx]];
    const dayKeys = Object.keys(qData).filter(k => k.startsWith(pref + '_'));
    if (!dayKeys.length) return;

    const slots = dayKeys.map(k => {
        const val = qData[k];
        if (!val || !/\d/.test(val)) return null;
        const [s, e] = val.split('-').map(t => { 
            const [h, m] = t.split(':').map(Number); 
            return h * 60 + m; 
        });
        return { start: s, end: (e === 0 ? 1440 : e), type: 'off' };
    }).filter(Boolean);

    let full = [], last = 0;
    slots.sort((a, b) => a.start - b.start).forEach(s => {
        if (s.start > last) full.push({ start: last, end: s.start, type: 'on' });
        full.push(s); last = s.end;
    });
    if (last < 1440) full.push({ start: last, end: 1440, type: 'on' });

    let cur = full.find(ev => nowM >= ev.start && nowM < ev.end);
    if (cur) {
        if (cur.end === 1440) {
            const nextDayIdx = (tIdx + 1) % 7;
            const nextPref = P_LIST[dayPrefixMap[nextDayIdx]];
            const nextKeys = Object.keys(qData).filter(k => k.startsWith(nextPref + '_'));
            const firstNext = nextKeys.map(k => {
                const [s, e] = qData[k].split('-').map(t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; });
                return { start: s, type: 'off' };
            }).sort((a,b) => a.start - b.start)[0];
            if (firstNext && firstNext.start === 0 && cur.type === 'off') {
                const nextEnd = qData[nextKeys.sort()[0]].split('-')[1];
                const [eh, em] = nextEnd.split(':').map(Number);
                timerData = { endTime: 1440 + (eh * 60 + em), type: 'off' };
                return;
            }
        }
        timerData = { endTime: cur.end, type: cur.type };
    } else { timerData = null; }
}

/**
 * Updates the flip-style clock UI with current time or countdown.
 */
function updateFlipTimer() {
    const cont = document.getElementById('timer-container');
    if (!cont) return;
    const now = new Date();
    let h, m, s, label;
    if (curQ && timerData) {
        const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        let diff = (timerData.endTime * 60) - nowSec;
        if (diff >= 0) {
            h = Math.floor(diff / 3600); m = Math.floor((diff % 3600) / 60); s = diff % 60;
            label = timerData.type === 'off' ? "До ввімкнення:" : "До відключення:";
        } else { calculateTimerData(); return; }
    } else { h = now.getHours(); m = now.getMinutes(); s = now.getSeconds(); label = "Поточний час:"; }

    if (!cont.querySelector('.flip-clock')) {
        cont.innerHTML = `<div class="timer-wrapper"><div class="timer-label"></div><div class="flip-clock">
            <div class="flip-unit"><div class="flip-pair"><div class="roll-digit-container"><div id="h1" class="roll-digit-strip"></div></div><div class="roll-digit-container"><div id="h2" class="roll-digit-strip"></div></div></div><div class="unit-desc">год</div></div>
            <div class="flip-unit"><div class="flip-pair"><div class="roll-digit-container"><div id="m1" class="roll-digit-strip"></div></div><div class="roll-digit-container"><div id="m2" class="roll-digit-strip"></div></div></div><div class="unit-desc">хв</div></div>
            <div class="flip-unit"><div class="flip-pair"><div class="roll-digit-container"><div id="s1" class="roll-digit-strip"></div></div><div class="roll-digit-container"><div id="s2" class="roll-digit-strip"></div></div></div><div class="unit-desc">сек</div></div>
        </div></div>`;
        ['h1', 'h2', 'm1', 'm2', 's1', 's2'].forEach(id => {
            document.getElementById(id).innerHTML = Array.from({ length: 10 }, (_, i) => `<div class="roll-num">${i}</div>`).join('');
        });
    }
    setDigit('h1', Math.floor(h / 10)); setDigit('h2', h % 10);
    setDigit('m1', Math.floor(m / 10)); setDigit('m2', m % 10);
    setDigit('s1', Math.floor(s / 10)); setDigit('s2', s % 10);
    const tL = cont.querySelector('.timer-label'); if (tL) tL.textContent = label;
    updateGridMarker();
}

/**
 * Highlights the current hour cell in the visual grid.
 */
function updateGridMarker() {
    if (dayIdx !== 0) {
        document.querySelectorAll('.hour-cell.current').forEach(el => { el.classList.remove('current'); el.querySelector('.current-dot')?.remove(); });
        return;
    }
    const h = new Date().getHours(), id = `hcell-${h}`, act = document.querySelector('.hour-cell.current');
    if (act && act.id === id) return;
    if (act) { act.classList.remove('current'); act.querySelector('.current-dot')?.remove(); }
    const n = document.getElementById(id);
    if (n) { n.classList.add('current'); if (!n.querySelector('.current-dot')) n.prepend(Object.assign(document.createElement('div'), { className: 'current-dot' })); }
}

/**
 * Animates vertical scroll for the flip clock digits.
 */
function setDigit(id, v) { const s = document.getElementById(id); if (s) s.style.transform = `translateY(-${v * 52}px)`; }

/**
 * Main render function for schedule lists and visual grids.
 */
function render() {
    if (!db || !curQ) return;
    const qData = db[`${curQ}_cherg`], now = new Date(), nowM = now.getHours() * 60 + now.getMinutes();
    const elT = document.getElementById('weatherToday'), elTom = document.getElementById('weatherTomorrow');
    if (weatherData && elT && elTom) {
        elT.innerHTML = `${getWeatherIcon(weatherData.today.code)} <span class="temp-range">${fmtTemp(weatherData.today.max)} / ${fmtTemp(weatherData.today.min)}</span>`;
        elTom.innerHTML = `${getWeatherIcon(weatherData.tomorrow.code)} <span class="temp-range">${fmtTemp(weatherData.tomorrow.max)} / ${fmtTemp(weatherData.tomorrow.min)}</span>`;
    }
    const tIdx = ((now.getDay() + 6) % 7 + dayIdx) % 7;
    const pref = P_LIST[dayPrefixMap[tIdx]];
    const dayKeys = Object.keys(qData).filter(k => k.startsWith(pref + '_'));
    let msg = null;
    if (!dayKeys.length) msg = `<div class="no-actual">Графік на ${dayIdx === 0 ? 'сьогодні' : 'завтра'} очікується</div>`;
    else if (!/\d/.test(qData[dayKeys[0]])) msg = `<div class="no-actual">${qData[dayKeys[0]]}</div>`;
    if (msg) {
        const cl = document.getElementById('content-list'), cv = document.getElementById('content-visual');
        if (cl) { cl.innerHTML = msg; cl.classList.toggle('hidden', viewMode !== 1); }
        if (cv) { document.getElementById('hours-grid').innerHTML = msg; cv.classList.toggle('hidden', viewMode !== 2); }
        return;
    }
    const slots = dayKeys.map(k => {
        const [s, e] = qData[k].split('-').map(t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; });
        return { start: s, end: (e === 0 ? 1440 : e), type: 'off', raw: qData[k] };
    }).sort((a, b) => a.start - b.start);
    let full = [], last = 0;
    slots.forEach(s => {
        if (s.start > last) full.push({ start: last, end: s.start, type: 'on', raw: `${minToTime(last)}-${minToTime(s.start)}` });
        full.push(s); last = s.end;
    });
    if (last < 1440) full.push({ start: last, end: 1440, type: 'on', raw: `${minToTime(last)}-${minToTime(1440)}` });
    renderList(full, nowM, now);
    renderVisual(slots, nowM);
}

/**
 * Generates HTML for the list view of the schedule.
 */
function renderList(full, nowM, now) {
    const cont = document.getElementById('content-list'); if (!cont) return;
    cont.classList.toggle('hidden', viewMode !== 1);
    const display = full.filter(ev => dayIdx === 0 ? ev.end > nowM : true);
    const d = new Date(); if (dayIdx === 1) d.setDate(d.getDate() + 1);
    const dateStr = d.toISOString().split('T')[0];
    cont.innerHTML = display.map(ev => {
        const s = minToTime(ev.start), e = minToTime(ev.end), dur = (ev.end - ev.start) / 60;
        const isCur = dayIdx === 0 && nowM >= ev.start && nowM < ev.end;
        const isLocked = dayIdx === 0 && (ev.start - nowM <= 60);
        const slotId = btoa(unescape(encodeURIComponent(`${dateStr}-${curQ}-${ev.raw || (s + e)}`))).replace(/=/g, '');
        const hasClicked = clickedSlots.hasOwnProperty(slotId);
        return `<div class="slot ${ev.type} ${isCur ? 'current' : ''}">
            <div class="time-box"><span class="time">${s}-${e}</span></div>
            <div class="slot-right">
                <span class="dur">${dur % 1 === 0 ? dur : dur.toFixed(1)} год/${ev.type === 'off' ? 'викл' : 'вкл'}</span>
                <div style="width:32px; display:flex; justify-content:center;">
                    ${isCur ? clockSVG : `<div class="calendar-btn ${isLocked ? 'disabled' : ''} ${hasClicked ? 'no-anim' : ''}" 
                        onclick="${isLocked ? '' : `handleCalendarClick('${s}-${e}', ${dayIdx === 0}, '${ev.type}', '${slotId}')`}">
                        ${calendarSVG}
                    </div>`}
                </div>
            </div>
        </div>`;
    }).join('') || `<div class="no-actual">На сьогодні все</div>`;
}

/**
 * Generates HTML for the visual hourly grid view.
 */
function renderVisual(slots, nowM) {
    const cont = document.getElementById('content-visual'); if (!cont) return;
    cont.classList.toggle('hidden', viewMode !== 2);
    const grid = document.getElementById('hours-grid');
    let html = '';
    for (let h = 0; h < 24; h++) {
        const hS = h * 60, hE = (h + 1) * 60;
        let type = 'on';
        for (const s of slots) if (s.start <= hS && s.end > hS) { type = 'off'; break; }
        const isCur = dayIdx === 0 && nowM >= hS && nowM < hE;
        html += `<div id="hcell-${h}" class="hour-cell ${type} ${isCur ? 'current' : ''}">
            ${isCur ? '<div class="current-dot"></div>' : ''}
            <div class="hour-time">${h.toString().padStart(2, '0')}:00<br>${((h + 1) % 24).toString().padStart(2, '0')}:00</div>
            ${type === 'off' ? powerOffSVG : powerOnSVG}
        </div>`;
    }
    grid.innerHTML = html;
}

/**
 * Utility: formats temperature value with a plus sign for positive numbers.
 */
function fmtTemp(t) { return t > 0 ? `+${t}°` : `${t}°`; }

/**
 * Utility: converts minutes from start of day to HH:MM format.
 */
function minToTime(m) { return `${Math.floor(m / 60 % 24).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`; }

/**
 * Maps WMO weather codes to corresponding SVG icons.
 */
function getWeatherIcon(code) {
    if (code === 0) return weatherIcons.sun;
    if ([1, 2].includes(code)) return weatherIcons.cloudSun;
    if (code === 3) return weatherIcons.cloud;
    if ([45, 48].includes(code)) return weatherIcons.fog;
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return weatherIcons.rain;
    if ((code >= 71 && code <= 77) || [85, 86].includes(code)) return weatherIcons.snow;
    if (code >= 95) return weatherIcons.thunder;
    return weatherIcons.cloud;
}

/**
 * Renders the queue selection grid (e.g., 1.1, 1.2).
 */
function renderGrid() {
    const g = document.getElementById('grid');
    if (g) g.innerHTML = ["1.1", "1.2", "2.1", "2.2", "3.1", "3.2", "4.1", "4.2", "5.1", "5.2", "6.1", "6.2"]
        .map(q => `<button class="btn-q" onclick="selectQ('${q}')">${q}</button>`).join('');
}

/**
 * Handles queue selection and UI state transitions.
 */
function selectQ(q) {
    curQ = q; localStorage.setItem('selectedQueue', q);
    document.getElementById('grid').classList.add('hidden');
    document.getElementById('box').classList.remove('hidden');
    document.getElementById('title').innerText = `Черга ${q}`;
    calculateTimerData(); render();
}

/**
 * Resets the application to the queue selection view.
 */
function resetView() { localStorage.removeItem('selectedQueue'); location.reload(); }

/**
 * Toggles between Today (0) and Tomorrow (1) views.
 */
function setDay(i) { dayIdx = i; document.getElementById('tabL').classList.toggle('active', i === 0); document.getElementById('tabR').classList.toggle('active', i === 1); render(); }

/**
 * Toggles between List (1) and Visual (2) view modes.
 */
function setView(v) { viewMode = v; document.getElementById('view1').classList.toggle('active', v === 1); document.getElementById('view2').classList.toggle('active', v === 2); render(); }

/**
 * Fetches and processes weather forecast data.
 */
async function fetchWeather() {
    try {
        const r = await fetch(WEATHER_API);
        if (!r.ok) throw new Error();
        const data = await r.json();
        function getDominantCode(dayIdx) {
            if (!data.hourly?.weathercode) return data.daily.weathercode[dayIdx];
            const start = 10, end = 16, off = dayIdx * 24;
            const codes = data.hourly.weathercode.slice(off + start, off + end + 1);
            const counts = {};
            for (const c of codes) counts[c] = (counts[c] || 0) + 1;
            if ((counts[0] || 0) >= 2) return 0;
            if ((counts[1] || 0) + (counts[2] || 0) >= 2) return 2;
            let max = 0, dom = codes[0];
            for (const c in counts) if (counts[c] > max) { max = counts[c]; dom = parseInt(c); }
            return dom;
        }
        weatherData = {
            timestamp: Date.now(),
            today: { max: Math.round(data.daily.temperature_2m_max[0]), min: Math.round(data.daily.temperature_2m_min[0]), code: getDominantCode(0) },
            tomorrow: { max: Math.round(data.daily.temperature_2m_max[1]), min: Math.round(data.daily.temperature_2m_min[1]), code: getDominantCode(1) }
        };
        localStorage.setItem('weatherCache', JSON.stringify(weatherData));
        if (curQ) render();
    } catch (e) { const c = localStorage.getItem('weatherCache'); if (c) { weatherData = JSON.parse(c); if (curQ) render(); } }
}

/**
 * Cleans up expired calendar click tracking from local storage.
 */
function cleanOldClicks() {
    const now = Date.now();
    for (const k in clickedSlots) if (now - clickedSlots[k] > 172800000) delete clickedSlots[k];
    localStorage.setItem('clickedSlots', JSON.stringify(clickedSlots));
}

/**
 * Handles clicks on the calendar icon, checking for duplicate entries.
 */
function handleCalendarClick(slot, isToday, type, slotId) {
    const act = () => { openGoogleCalendar(slot, isToday, type); clickedSlots[slotId] = Date.now(); localStorage.setItem('clickedSlots', JSON.stringify(clickedSlots)); render(); };
    clickedSlots[slotId] ? showCustomAlert(act) : act();
}

/**
 * Displays a custom alert modal for duplicate calendar entries.
 */
function showCustomAlert(cb) {
    let ov = document.getElementById('modalOverlay');
    if (!ov) {
        ov = document.createElement('div'); ov.id = 'modalOverlay'; ov.className = 'modal-overlay';
        ov.innerHTML = `<div class="modal-content"><div style="font-size:40px; margin-bottom:10px;">📅</div><h3 style="margin:0 0 10px; color:#222;">Вже у календарі?</h3><p style="margin:0; color:#666; font-size:14px;">Ви вже додавали цей слот. Перейти ще раз?</p><div class="modal-btns"><button class="btn-modal btn-go" id="modalGo">Перейти</button><button class="btn-modal btn-exit" id="modalExit">Вийти</button></div></div>`;
        document.body.appendChild(ov);
    }
    ov.classList.add('active');
    document.getElementById('modalGo').onclick = () => { cb(); ov.classList.remove('active'); };
    document.getElementById('modalExit').onclick = () => ov.classList.remove('active');
}

/**
 * Redirects the user to the Google Calendar event creation page.
 */
function openGoogleCalendar(slot, isToday, type) {
    const [sT, eT] = slot.split('-');
    const d = new Date(); if (!isToday) d.setDate(d.getDate() + 1);
    const iso = (t) => { const [h, m] = t.split(':').map(Number); const date = new Date(d); date.setHours(h, m, 0, 0); return date.toISOString().replace(/-|:|\.\d\d\d/g, ""); };
    const title = `Черга ${curQ}: ${type === 'off' ? 'Відключення' : 'Включення'} (${sT}-${eT})`;
    window.open(`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${iso(sT)}/${iso(eT)}&sf=true&output=xml`, '_blank');
}

/**
 * Registers Service Worker for offline support and updates.
 */
function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.addEventListener('controllerchange', () => { window.location.reload(); });
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).then(reg => {
        reg.addEventListener('updatefound', () => {
            const w = reg.installing;
            w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) showUpdateBar(w); });
        });
    });
}

/**
 * Displays UI notification bar when a new version is available.
 */
function showUpdateBar(w) {
    const bar = document.createElement('div'); bar.className = 'update-bar';
    bar.innerHTML = `<span>Доступна нова версія!</span><button id="update-button">Оновити</button>`;
    document.body.appendChild(bar);
    document.getElementById('update-button').onclick = () => {
        w.postMessage({ action: 'skipWaiting' });
        setTimeout(() => { localStorage.removeItem('weatherCache'); window.location.reload(true); }, 500);
    };
}

// --- Execution ---
cleanOldClicks();
init();
registerSW();
