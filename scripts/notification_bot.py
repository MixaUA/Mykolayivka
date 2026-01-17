import json
from datetime import datetime, timedelta
import os
import requests
import re # For Markdown V2 escaping

# --- Helper Functions ---
def escape_markdown_v2(text: str) -> str:
    """Escapes characters in text that have a special meaning in MarkdownV2."""
    escape_chars = r'_*[]()~`>#+-=|{}.!'
    # Escape backslash first to prevent issues with other escapes
    text = text.replace('\\', '\\\\')
    return re.sub(f'([{re.escape(escape_chars)}])', r'\\\1', text)

def calculate_duration(start_s, end_s):
    """Рахує тривалість між двома мітками часу."""
    fmt = "%H:%M"
    # Обробка 24:00 для розрахунків
    t1 = datetime.strptime(start_s, fmt)
    t2 = datetime.strptime(end_s.replace("24:00", "23:59"), fmt)
    if end_s == "24:00": t2 += timedelta(minutes=1)
    
    duration = t2 - t1
    total_minutes = int(duration.total_seconds() / 60)
    hours = total_minutes // 60
    minutes = total_minutes % 60

    if hours > 0 and minutes > 0:
        return f"{hours} год. {minutes} хв."
    elif hours > 0:
        return f"{hours} год."
    elif minutes > 0:
        return f"{minutes} хв."
    return "менше хвилини"

def send_telegram_message(message_text):
    """Надсилає повідомлення в Telegram канал."""
    bot_token = os.environ.get('TELEGRAM_TOKEN')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID')

    if not bot_token or not chat_id:
        print("Помилка: Змінні оточення TELEGRAM_TOKEN або TELEGRAM_CHAT_ID не встановлені.")
        return

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        'chat_id': chat_id,
        'text': message_text,
        'parse_mode': 'MarkdownV2'
    }

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status() # Піднімає HTTPError для поганих відповідей (4xx або 5xx)
        print(f"Повідомлення успішно відправлено в Telegram. Відповідь: {response.json()}")
    except requests.exceptions.RequestException as e:
        print(f"Помилка відправки повідомлення в Telegram: {e}")
        if response is not None:
            print(f"Відповідь Telegram API: {response.text}")


def run_bot():
    # Читаємо з database.json
    json_file_path = 'database.json'
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Помилка: Файл {json_file_path} не знайдено. Переконайтесь, що він існує.")
        return
    except json.JSONDecodeError:
        print(f"Помилка: Не вдалося розпарсити JSON з файлу {json_file_path}. Перевірте його цілісність.")
        return

    now = datetime.now()
    current_time_dt = datetime.strptime(now.strftime("%H:%M"), "%H:%M")
    
    days_ukr = {0: "понеділок", 1: "вівторок", 2: "середа", 3: "четвер", 4: "п'ятниця", 5: "субота", 6: "неділя"}
    weekday = days_ukr[now.weekday()]
    
    # Виправлення: Правильний шлях до черги
    queue_data = data.get('queues', {}).get('6.2', {})
    intervals = queue_data.get(weekday, [])

    if not intervals:
        print(f"ℹ️ {now.strftime('%H:%M')}: Не знайдено інтервалів для черги 6.2 на {weekday}. Вихід.")
        return

    found_event = False
    
    for i, interval in enumerate(intervals):
        start_s, end_s = interval.split('-')
        start_dt = datetime.strptime(start_s, "%H:%M")
        end_dt = datetime.strptime(end_s.replace("24:00", "23:59"), "%H:%M") # "24:00" для розрахунків
        
        # Перевірка: чи ми знаходимось всередині інтервалу відключення (чекаємо ВВІМКНЕННЯ)
        if start_dt <= current_time_dt <= end_dt:
            # Якщо поточний час ближче до кінця інтервалу (ввімкнення)
            diff_to_end = (end_dt - current_time_dt).total_seconds() / 60
            if 0 < diff_to_end <= 30: # 30-хвилинне вікно до ввімкнення
                
                safe_start_s = escape_markdown_v2(start_s)
                safe_end_s = escape_markdown_v2(end_s)
                safe_duration = escape_markdown_v2(calculate_duration(start_s, end_s))
                
                # Формуємо повідомлення про ввімкнення
                message = (
                    f"💡 *Увага! Скоро увімкнуть світло\\!* 💡\n\n"
                    f"За графіком о *{safe_start_s}* світло вимкнули, а о *{safe_end_s}* мають увімкнути\\.\n"
                    f"Загальна тривалість відключення: *{safe_duration}*\\.\n"
                    f"Насолоджуйтесь світлом і плануйте свій час\\! 🙏"
                )
                send_telegram_message(message)
                found_event = True
                break

        # Перевірка: чи ми знаходимось перед інтервалом відключення (чекаємо ВИМКНЕННЯ)
        elif start_dt > current_time_dt:
            # Якщо поточний час ближче до початку інтервалу (вимкнення)
            diff_to_start = (start_dt - current_time_dt).total_seconds() / 60
            if 0 < diff_to_start <= 30: # 30-хвилинне вікно до вимкнення

                safe_start_s = escape_markdown_v2(start_s)
                safe_end_s = escape_markdown_v2(end_s)
                safe_duration = escape_markdown_v2(calculate_duration(start_s, end_s))
                
                # Формуємо повідомлення про вимкнення
                message = (
                    f"⚫ *Увага! Скоро вимкнуть світло\\!* ⚫\n\n"
                    f"За графіком о *{safe_start_s}* світло вимкнуть, а о *{safe_end_s}* мають увімкнути\\.\n"
                    f"Загальна тривалість відключення: *{safe_duration}*\\.\n"
                    f"Будьте готові і плануйте свій час\\! 🙏"
                )
                send_telegram_message(message)
                found_event = True
                break
    
    if not found_event:
        print(f"ℹ️ {now.strftime('%H:%M')}: До подій більше 30 хв або подій на {weekday}. Вихід.")

if __name__ == "__main__":
    run_bot()