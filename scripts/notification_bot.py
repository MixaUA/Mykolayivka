import json
from datetime import datetime, timedelta
import os
import requests
import re
import random

# --- Helper Functions ---
def escape_markdown_v2(text: str) -> str:
    """Escapes characters in text that have a special meaning in MarkdownV2."""
    escape_chars = r'_*[]()~`>#+-=|{}.!'
    text = text.replace('\\', '\\\\')
    return re.sub(f'([{re.escape(escape_chars)}])', r'\\\1', text)

def format_time_display(time_str):
    """Конвертує 24:00 в 00:00 для відображення."""
    return "00:00" if time_str == "24:00" else time_str

def calculate_duration(start_s, end_s):
    """Рахує тривалість між двома мітками часу."""
    fmt = "%H:%M"
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

def calculate_time_remaining(target_time_str, current_time_dt):
    """Рахує скільки часу залишилось до події."""
    fmt = "%H:%M"
    target_dt = datetime.strptime(target_time_str.replace("24:00", "23:59"), fmt)
    if target_time_str == "24:00":
        target_dt += timedelta(minutes=1)
    
    diff = (target_dt - current_time_dt).total_seconds() / 60
    diff = int(diff)
    
    hours = diff // 60
    minutes = diff % 60
    
    if hours > 0 and minutes > 0:
        return f"{hours} год. {minutes} хв."
    elif hours > 0:
        return f"{hours} год."
    elif minutes > 0:
        return f"{minutes} хв."
    return "менше хвилини"

def get_time_icon(time_str):
    """Повертає іконку залежно від часу доби."""
    hour = int(time_str.split(':')[0])
    if 6 <= hour < 12:
        return "🌅"  # Ранок
    elif 12 <= hour < 18:
        return "☀️"  # День
    elif 18 <= hour < 22:
        return "🌆"  # Вечір
    else:
        return "🌙"  # Ніч

def get_random_tip(event_type):
    """Повертає випадкову пораду залежно від типу події."""
    tips_off = [
        "☕ Встигніть заварити чай або каву\\!",
        "💾 Збережіть всі документи\\!",
        "🕯️ Підготуйте свічки та ліхтарик",
        "💡 Завершіть справи зі світлом",
        "🍳 Підігрійте їжу зараз\\!",
        "🌡️ Налаштуйте температуру в оселі",
        "💧 Наберіть води про запас",
    ]
    
    tips_on = [
        "🎉 Нарешті можна працювати\\!",
        "⚡ Світло ось\\-ось з'явиться\\!",
        "🌟 Готуйтесь \\- світло на підході\\!",
        "🏠 Час підготувати техніку до зарядки\\!",
        "🔌 Підготуйте список що зарядити\\!",
        "📱 Складіть план на час зі світлом\\!",
    ]
    
    return random.choice(tips_off if event_type == "off" else tips_on)

def calculate_daily_stats(intervals, current_time_dt):
    """Рахує статистику відключень на день: що вже було і що залишилось."""
    past_count = 0
    past_hours = 0
    future_count = 0
    future_hours = 0
    
    fmt = "%H:%M"
    
    for interval in intervals:
        start_s, end_s = interval.split('-')
        start_dt = datetime.strptime(start_s, fmt)
        end_dt = datetime.strptime(end_s.replace("24:00", "23:59"), fmt)
        if end_s == "24:00":
            end_dt += timedelta(minutes=1)
        
        # Рахуємо тривалість
        duration = end_dt - start_dt
        hours = int(duration.total_seconds() / 3600)
        
        # Перевіряємо: минуло чи майбутнє
        if end_dt <= current_time_dt:
            # Відключення вже минуло
            past_count += 1
            past_hours += hours
        elif start_dt > current_time_dt:
            # Відключення ще попереду
            future_count += 1
            future_hours += hours
        else:
            # Зараз всередині відключення - рахуємо як поточне (майбутнє)
            future_count += 1
            future_hours += hours
    
    return past_count, past_hours, future_count, future_hours

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
        response.raise_for_status()
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
    current_time_str = now.strftime("%H:%M")
    
    days_ukr = {0: "Понеділок", 1: "Вівторок", 2: "Середа", 3: "Четвер", 4: "П'ятниця", 5: "Субота", 6: "Неділя"}
    weekday = days_ukr[now.weekday()]
    
    queue_data = data.get('queues', {}).get('6.2', {})
    intervals = queue_data.get(weekday, [])

    if not intervals:
        print(f"ℹ️ {current_time_str}: Не знайдено інтервалів для черги 6.2 на {weekday}. Вихід.")
        return

    # Рахуємо денну статистику
    past_count, past_hours, future_count, future_hours = calculate_daily_stats(intervals, current_time_dt)

    found_event = False
    
    for i, interval in enumerate(intervals):
        start_s, end_s = interval.split('-')
        start_dt = datetime.strptime(start_s, "%H:%M")
        end_dt = datetime.strptime(end_s.replace("24:00", "23:59"), "%H:%M")
        
        # Перевірка: чи ми знаходимось всередині інтервалу (чекаємо ВВІМКНЕННЯ)
        if start_dt <= current_time_dt <= end_dt:
            diff_to_end = (end_dt - current_time_dt).total_seconds() / 60
            if 0 < diff_to_end <= 30:
                
                # Підготовка даних
                unescaped_duration = calculate_duration(start_s, end_s)
                time_remaining = calculate_time_remaining(end_s, current_time_dt)
                time_icon = get_time_icon(end_s)
                
                # Екрануємо все
                safe_current_time = escape_markdown_v2(current_time_str)
                safe_weekday = escape_markdown_v2(weekday)
                safe_start_s = escape_markdown_v2(start_s)
                safe_end_s = escape_markdown_v2(format_time_display(end_s))
                safe_duration = escape_markdown_v2(unescaped_duration)
                safe_remaining = escape_markdown_v2(time_remaining)
                safe_past_count = escape_markdown_v2(str(past_count))
                safe_past_hours = escape_markdown_v2(str(past_hours))
                safe_future_count = escape_markdown_v2(str(future_count))
                safe_future_hours = escape_markdown_v2(str(future_hours))
                
                random_tip = get_random_tip("on")
                
                # Формуємо повідомлення про ввімкнення
                message = (
                    f"{time_icon} *Увага\\! Скоро увімкнуть світло\\!* 💡\n\n"
                    f"📅 {safe_weekday}, {safe_current_time}\n"
                    f"⏰ *Залишилось:* {safe_remaining}\n\n"
                    f"📋 *За графіком:*\n"
                    f"   • Вимкнули о {safe_start_s}\n"
                    f"   • Увімкнуть о {safe_end_s}\n"
                    f"   • Тривалість: {safe_duration}\n\n"
                    f"📊 *Сьогодні:*\n"
                    f"   • Відключень було: {safe_past_count} рази \\({safe_past_hours} год\\.\\)\n"
                    f"   • Залишилось: {safe_future_count} рази \\({safe_future_hours} год\\.\\)\n\n"
                    f"{random_tip}"
                )
                send_telegram_message(message)
                found_event = True
                break

        # Перевірка: чи ми знаходимось перед інтервалом (чекаємо ВИМКНЕННЯ)
        elif start_dt > current_time_dt:
            diff_to_start = (start_dt - current_time_dt).total_seconds() / 60
            if 0 < diff_to_start <= 30:

                # Підготовка даних
                unescaped_duration = calculate_duration(start_s, end_s)
                time_remaining = calculate_time_remaining(start_s, current_time_dt)
                time_icon = get_time_icon(start_s)
                
                # Екрануємо все
                safe_current_time = escape_markdown_v2(current_time_str)
                safe_weekday = escape_markdown_v2(weekday)
                safe_start_s = escape_markdown_v2(start_s)
                safe_end_s = escape_markdown_v2(format_time_display(end_s))
                safe_duration = escape_markdown_v2(unescaped_duration)
                safe_remaining = escape_markdown_v2(time_remaining)
                safe_past_count = escape_markdown_v2(str(past_count))
                safe_past_hours = escape_markdown_v2(str(past_hours))
                safe_future_count = escape_markdown_v2(str(future_count))
                safe_future_hours = escape_markdown_v2(str(future_hours))
                
                random_tip = get_random_tip("off")
                
                # Формуємо повідомлення про вимкнення
                message = (
                    f"{time_icon} *Увага\\! Скоро вимкнуть світло\\!* ⚡\n\n"
                    f"📅 {safe_weekday}, {safe_current_time}\n"
                    f"⏰ *Залишилось:* {safe_remaining}\n\n"
                    f"📋 *За графіком:*\n"
                    f"   • Вимкнуть о {safe_start_s}\n"
                    f"   • Увімкнуть о {safe_end_s}\n"
                    f"   • Тривалість: {safe_duration}\n\n"
                    f"📊 *Сьогодні:*\n"
                    f"   • Відключень було: {safe_past_count} рази \\({safe_past_hours} год\\.\\)\n"
                    f"   • Залишилось: {safe_future_count} рази \\({safe_future_hours} год\\.\\)\n\n"
                    f"{random_tip}"
                )
                send_telegram_message(message)
                found_event = True
                break
    
    if not found_event:
        print(f"ℹ️ {current_time_str}: До подій більше 30 хв або подій немає на {weekday}. Вихід.")

if __name__ == "__main__":
    run_bot()
