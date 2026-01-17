import json
import os
import requests
from datetime import datetime, timedelta

def calculate_duration(start_s, end_s):
    fmt = "%H:%M"
    t1 = datetime.strptime(start_s, fmt)
    t2 = datetime.strptime(end_s.replace("24:00", "23:59"), fmt)
    if end_s == "24:00": t2 += timedelta(minutes=1)
    duration = t2 - t1
    hours = duration.seconds // 3600
    minutes = (duration.seconds % 3600) // 60
    return f"{hours}.{minutes:02d} годин" if minutes > 0 else f"{hours} годин"

def send_telegram_message(text):
    token = os.environ.get('TELEGRAM_TOKEN')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID')
    if not token or not chat_id:
        print("❌ Помилка: Не знайдено Secrets!")
        return
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {"chat_id": chat_id, "text": text, "parse_mode": "Markdown"}
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            print("✅ Повідомлення відправлено!")
        else:
            print(f"❌ Помилка Telegram: {response.text}")
    except Exception as e:
        print(f"❌ Помилка: {e}")

def run_bot():
    try:
        # Шлях '../' бо ми в папці scripts, а файл database.json вище
        with open('../database.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("❌ Помилка: database.json не знайдено!")
        return

    now = datetime.now()
    current_time_dt = datetime.strptime(now.strftime("%H:%M"), "%H:%M")
    days_ukr = {0:"понеділок", 1:"вівторок", 2:"середа", 3:"четвер", 4:"п'ятниця", 5:"субота", 6:"неділя"}
    weekday = days_ukr[now.weekday()]
    intervals = data.get("6.2", {}).get(weekday, [])
    found_event = False
    
    for i, interval in enumerate(intervals):
        start_s, end_s = interval.split('-')
        start_dt = datetime.strptime(start_s, "%H:%M")
        end_dt = datetime.strptime(end_s.replace("24:00", "23:59"), "%H:%M")

        # Чекаємо ВВІМКНЕННЯ
        if start_dt <= current_time_dt <= end_dt:
            diff = (end_dt - current_time_dt).total_seconds() / 60
            if 0 < diff <= 30:
                duration = calculate_duration(start_s, end_s)
                next_idx = (i + 1) % len(intervals)
                n_start, n_end = intervals[next_idx].split('-')
                msg = f"⚠️ **УВАГА! ВВІМКНЕННЯ о {end_s}**\nТривалість вимкнення була: {duration}.\nДалі за графіком: вимкнення о {n_start}."
                send_telegram_message(msg)
                found_event = True
            break

        # Чекаємо ВИМКНЕННЯ
        if start_dt > current_time_dt:
            diff = (start_dt - current_time_dt).total_seconds() / 60
            if 0 < diff <= 30:
                duration = calculate_duration(start_s, end_s)
                msg = f"⚠️ **УВАГА! ВИМКНЕННЯ о {start_s}**\nТривалість: {duration}.\nДалі за графіком: ввімкнення о {end_s}."
                send_telegram_message(msg)
                found_event = True
            break
    if not found_event: print(f"ℹ️ {now.strftime('%H:%M')}: До подій більше 30 хв.")

if __name__ == "__main__":
    run_bot()
