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
    # Код бере дані з блоку 'env', який ми прописали у .yml файлі
    token = os.environ.get('TELEGRAM_TOKEN')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID')
    
    if not token or not chat_id:
        print("❌ Помилка: Не знайдено TELEGRAM_TOKEN або TELEGRAM_CHAT_ID у Secrets!")
        return

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {"chat_id": chat_id, "text": text, "parse_mode": "Markdown"}
    
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            print("✅ Повідомлення успішно відправлено в Telegram!")
        else:
            print(f"❌ Помилка Telegram: {response.text}")
    except Exception as e:
        print(f"❌ Помилка при відправці: {e}")

def run_bot():
    try:
        # Шлях до бази даних, яка лежить рівнем вище папки scripts
        with open('database.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("❌ Помилка: Файл database.json не знайдено!")
        return

    now = datetime.now()
    current_time_str = now.strftime("%H:%M")
    current_time_dt = datetime.strptime(current_time_str, "%H:%M")
    
    days_ukr = {0: "понеділок", 1: "вівторок", 2: "середа", 3: "четвер", 4: "п'ятниця", 5: "субота", 6: "неділя"}
    weekday = days_ukr[now.weekday()]
    intervals = data.get("6.2", {}).get(weekday, [])

    found_event = False
    
    for i, interval in enumerate(intervals):
        start_s, end_s = interval.split('-')
        start_dt = datetime.strptime(start_s, "%H:%M")
        end_dt = datetime.strptime(end_s.replace("24:00", "23:59"), "%H:%M")

        # 1. Чекаємо ВВІМКНЕННЯ
        if start_dt <= current_time_dt <= end_dt:
            diff = (end_dt - current_time_dt).total_seconds() / 60
            if 0 < diff <= 30:
                duration = calculate_duration(start_s, end_s)
                next_idx = (i + 1) % len(intervals)
                n_start, n_end = intervals[next_idx].split('-')
                msg = (f"⚠️ **УВАГА! ВВІМКНЕННЯ о {end_s}**\n"
                       f"Тривалість відключення: {duration}.\n"
                       f"Наступне вимкнення за графіком: о {n_start}.\n"
                       f"Бережіть себе! 🙏")
                send_telegram_message(msg)
                found_event = True
            break

        # 2. Чекаємо ВИМКНЕННЯ
        if start_dt > current_time_dt:
            diff = (start_dt - current_time_dt).total_seconds() / 60
            if 0 < diff <= 30:
                duration = calculate_duration(start_s, end_s)
                msg = (f"⚠️ **УВАГА! ВИМКНЕННЯ о {start_s}**\n"
                       f"Орієнтовна тривалість: {duration}.\n"
                       f"Наступне ввімкнення за графіком: о {end_s}.\n"
                       f"Не забудьте зарядити пристрої! 🔋")
                send_telegram_message(msg)
                found_event = True
            break

    if not found_event:
        print(f"ℹ️ {current_time_str}: До подій за графіком більше 30 хв. Канал мовчить.")

if __name__ == "__main__":
    run_bot()
