const API_URL = "https://raw.githubusercontent.com/Aporial/Svitlo-Sumy-Databases/main/database_new.json";
const WEATHER_API = "https://api.open-meteo.com/v1/forecast?latitude=50.2699&longitude=34.3961&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Europe/Kiev&forecast_days=2";
const P_LIST = ["one", "two", "three", "four", "five", "six", "seven"];
const calendarSVG = `<svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"/></svg>`;
const clockSVG = `<svg class="loader-clock" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="3s" repeatCount="indefinite"/></path></svg>`;

const weatherIcons = {
    sun: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <g id="day">
            <g transform="translate(32,32)">
                <g class="am-weather-sun am-weather-sun-shiny am-weather-easing-ease-in-out">
                    <g>
                        <line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,11)" x1="0" x2="0" y1="0" y2="6" />
                    </g>
                    <g transform="rotate(45)">
                        <line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,11)" x1="0" x2="0" y1="0" y2="6" />
                    </g>
                    <g transform="rotate(90)">
                        <line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,11)" x1="0" x2="0" y1="0" y2="6" />
                    </g>
                    <g transform="rotate(135)">
                        <line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,11)" x1="0" x2="0" y1="0" y2="6" />
                    </g>
                    <g transform="rotate(180)">
                        <line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,11)" x1="0" x2="0" y1="0" y2="6" />
                    </g>
                    <g transform="rotate(225)">
                        <line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,11)" x1="0" x2="0" y1="0" y2="6" />
                    </g>
                    <g transform="rotate(270)">
                        <line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,11)" x1="0" x2="0" y1="0" y2="6" />
                    </g>
                    <g transform="rotate(315)">
                        <line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,11)" x1="0" x2="0" y1="0" y2="6" />
                    </g>
                </g>
                <circle cx="0" cy="0" fill="white" r="7" stroke="black" stroke-width="1.5"/>
            </g>
        </g>
    </svg>`,
    cloudSun: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <g id="cloudy-day-1">
            <g transform="translate(20,10)">
                <g transform="translate(0,16)">
                    <g class="am-weather-sun">
                        <g>
                            <line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,9)" x1="0" x2="0" y1="0" y2="3"/>
                        </g>
                        <g transform="rotate(45)">
                            <line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,9)" x1="0" x2="0" y1="0" y2="3"/>
                        </g>
                        <g transform="rotate(90)">
                            <line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,9)" x1="0" x2="0" y1="0" y2="3"/>
                        </g>
                        <g transform="rotate(135)">
                            <line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,9)" x1="0" x2="0" y1="0" y2="3"/>
                        </g>
                        <g transform="rotate(180)">
                            <line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,9)" x1="0" x2="0" y1="0" y2="3"/>
                        </g>
                        <g transform="rotate(225)">
                            <line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,9)" x1="0" x2="0" y1="0" y2="3"/>
                        </g>
                        <g transform="rotate(270)">
                            <line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,9)" x1="0" x2="0" y1="0" y2="3"/>
                        </g>
                        <g transform="rotate(315)">
                            <line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.5" transform="translate(0,9)" x1="0" x2="0" y1="0" y2="3"/>
                        </g>
                    </g>
                    <circle cx="0" cy="0" fill="white" r="5" stroke="black" stroke-width="1.5"/>
                </g>
                <g>
                    <path d="M47.7,35.4c0-4.6-3.7-8.2-8.2-8.2c-1,0-1.9,0.2-2.8,0.5c-0.3-3.4-3.1-6.2-6.6-6.2c-3.7,0-6.7,3-6.7,6.7c0,0.8,0.2,1.6,0.4,2.3    c-0.3-0.1-0.7-0.1-1-0.1c-3.7,0-6.7,3-6.7,6.7c0,3.6,2.9,6.6,6.5,6.7l17.2,0C44.2,43.3,47.7,39.8,47.7,35.4z" fill="white" stroke="black" stroke-linejoin="round" stroke-width="1.2" transform="translate(-20,-11)"/>
                </g>
            </g>
        </g>
    </svg>`,
    cloud: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <g id="cloudy">
            <g transform="translate(20,10)">
                <g class="am-weather-cloud-1">
                    <path d="M47.7,35.4     c0-4.6-3.7-8.2-8.2-8.2c-1,0-1.9,0.2-2.8,0.5c-0.3-3.4-3.1-6.2-6.6-6.2c-3.7,0-6.7,3-6.7,6.7c0,0.8,0.2,1.6,0.4,2.3     c-0.3-0.1-0.7-0.1-1-0.1c-3.7,0-6.7,3-6.7,6.7c0,3.6,2.9,6.6,6.5,6.7l17.2,0C44.2,43.3,47.7,39.8,47.7,35.4z" fill="white" stroke="black" stroke-linejoin="round" stroke-width="1.2" transform="translate(-10,-8), scale(0.6)"/>
                </g>
                <g class="am-weather-cloud-2">
                    <path d="M47.7,35.4     c0-4.6-3.7-8.2-8.2-8.2c-1,0-1.9,0.2-2.8,0.5c-0.3-3.4-3.1-6.2-6.6-6.2c-3.7,0-6.7,3-6.7,6.7c0,0.8,0.2,1.6,0.4,2.3     c-0.3-0.1-0.7-0.1-1-0.1c-3.7,0-6.7,3-6.7,6.7c0,3.6,2.9,6.6,6.5,6.7l17.2,0C44.2,43.3,47.7,39.8,47.7,35.4z" fill="white" stroke="black" stroke-linejoin="round" stroke-width="1.2" transform="translate(-20,-11)"/>
                </g>
            </g>
        </g>
    </svg>`,
    rain: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <g id="rainy-5">
            <g transform="translate(20,10)">
                <g>
                    <path d="M47.7,35.4c0-4.6-3.7-8.2-8.2-8.2c-1,0-1.9,0.2-2.8,0.5c-0.3-3.4-3.1-6.2-6.6-6.2c-3.7,0-6.7,3-6.7,6.7c0,0.8,0.2,1.6,0.4,2.3    c-0.3-0.1-0.7-0.1-1-0.1c-3.7,0-6.7,3-6.7,6.7c0,3.6,2.9,6.6,6.5,6.7l17.2,0C44.2,43.3,47.7,39.8,47.7,35.4z" fill="white" stroke="black" stroke-linejoin="round" stroke-width="1.2" transform="translate(-20,-11)"/>
                </g>
            </g>
            <g transform="translate(34,46), rotate(10)">
                <line class="am-weather-rain-1" fill="none" stroke="black" stroke-dasharray="4,7" stroke-linecap="round" stroke-width="2" transform="translate(-6,1)" x1="0" x2="0" y1="0" y2="8" />
                <line class="am-weather-rain-2" fill="none" stroke="black" stroke-dasharray="4,7" stroke-linecap="round" stroke-width="2" transform="translate(0,-1)" x1="0" x2="0" y1="0" y2="8" />
            </g>
        </g>
    </svg>`,
    snow: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <g id="snowy-5">
            <g transform="translate(20,10)">
                <g>
                    <path d="M47.7,35.4c0-4.6-3.7-8.2-8.2-8.2c-1,0-1.9,0.2-2.8,0.5c-0.3-3.4-3.1-6.2-6.6-6.2c-3.7,0-6.7,3-6.7,6.7c0,0.8,0.2,1.6,0.4,2.3    c-0.3-0.1-0.7-0.1-1-0.1c-3.7,0-6.7,3-6.7,6.7c0,3.6,2.9,6.6,6.5,6.7l17.2,0C44.2,43.3,47.7,39.8,47.7,35.4z" fill="white" stroke="black" stroke-linejoin="round" stroke-width="1.2" transform="translate(-20,-11)"/>
                </g>
                <g class="am-weather-snow-1">
                    <g transform="translate(7,28)">
                        <line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.2" transform="translate(0,9), rotate(0)" x1="0" x2="0" y1="-2.5" y2="2.5" />
                        <line fill="none" stroke="black" stroke-linecap="round" stroke-width="1" transform="translate(0,9), rotate(45)" x1="0" x2="0" y1="-2.5" y2="2.5" />
                        <line fill="none" stroke="black" stroke-linecap="round" stroke-width="1" transform="translate(0,9), rotate(90)" x1="0" x2="0" y1="-2.5" y2="2.5" />
                        <line fill="none" stroke="black" stroke-linecap="round" stroke-width="1" transform="translate(0,9), rotate(135)" x1="0" x2="0" y1="-2.5" y2="2.5" />
                    </g>
                </g>
                <g class="am-weather-snow-2">
                    <g transform="translate(16,28)">
                        <line fill="none" stroke="black" stroke-linecap="round" stroke-width="1.2" transform="translate(0,9), rotate(0)" x1="0" x2="0" y1="-2.5" y2="2.5" />
                        <line fill="none" stroke="black" stroke-linecap="round" stroke-width="1" transform="translate(0,9), rotate(45)" x1="0" x2="0" y1="-2.5" y2="2.5" />
                        <line fill="none" stroke="black" stroke-linecap="round" stroke-width="1" transform="translate(0,9), rotate(90)" x1="0" x2="0" y1="-2.5" y2="2.5" />
                        <line fill="none" stroke="black" stroke-linecap="round" stroke-width="1" transform="translate(0,9), rotate(135)" x1="0" x2="0" y1="-2.5" y2="2.5" />
                    </g>
                </g>
            </g>
        </g>
    </svg>`
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
    
    let refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        localStorage.removeItem('weatherCache'); // Clear stale weather cache
        window.location.reload();
        refreshing = true;
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
    });
}

init();
registerSW();