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
    return f"{duration.seconds // 3600} годин"

def send_telegram_message(text):
    token = os.environ.get('TELEGRAM_TOKEN')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID')
    if token and chat_id:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        requests.post(url, json={"chat_id": chat_id, "text": text, "parse_mode": "Markdown"})

def run_bot():
    try:
        # '../' виходить з папки scripts до файлу database.json
        with open('../database.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Помилка бази: {e}")
        return

    now = datetime.now()
    current_time_dt = datetime.strptime(now.strftime("%H:%M"), "%H:%M")
    days_ukr = {0:"понеділок", 1:"вівторок", 2:"середа", 3:"четвер", 4:"п'ятниця", 5:"субота", 6:"неділя"}
    intervals = data.get("6.2", {}).get(days_ukr[now.weekday()], [])

    for i, interval in enumerate(intervals):
        start_s, end_s = interval.split('-')
        start_dt = datetime.strptime(start_s, "%H:%M")
        end_dt = datetime.strptime(end_s.replace("24:00", "23:59"), "%H:%M")

        # Перевірка 30-хвилинного вікна
        if (start_dt > current_time_dt and (start_dt - current_time_dt).total_seconds() / 60 <= 30) or \
           (start_dt <= current_time_dt <= end_dt and (end_dt - current_time_dt).total_seconds() / 60 <= 30):
            
            action = "ВВІМКНЕННЯ" if current_time_dt >= start_dt else "ВИМКНЕННЯ"
            target = end_s if action == "ВВІМКНЕННЯ" else start_s
            
            msg = f"⚠️ УВАГА! {action} о {target} за графіком 6.2."
            print(msg) # Залишаємо для логів
            send_telegram_message(msg) # Для Телеграму
            return

    print(f"ℹ️ {now.strftime('%H:%M')}: До подій більше 30 хв.")

if __name__ == "__main__":
    run_bot()
