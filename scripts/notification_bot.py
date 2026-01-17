import json
from datetime import datetime, timedelta
import os
import requests
import re
import random

# --- Helper Functions (БЕЗ ЗМІН) ---
def escape_markdown_v2(text: str) -> str:
    escape_chars = r'_*[]()~`>#+-=|{}.!'
    text = text.replace('\\', '\\\\')
    return re.sub(f'([{re.escape(escape_chars)}])', r'\\\1', text)

def format_time_display(total_minutes):
    """Конвертує абсолютні хвилини у формат HH:MM (як на сайті)"""
    h = (int(total_minutes) // 60) % 24
    m = int(total_minutes) % 60
    return f"{h:02d}:{m:02d}"

def calculate_duration_from_min(start_m, end_m):
    """Рахує тривалість на основі хвилин"""
    total_minutes = int(end_m - start_m)
    hours = total_minutes // 60
    minutes = total_minutes % 60
    if hours > 0 and minutes > 0: return f"{hours} год. {minutes} хв."
    elif hours > 0: return f"{hours} год."
    elif minutes > 0: return f"{minutes} хв."
    return "0 хв."

def get_time_icon(total_minutes):
    hour = (int(total_minutes) // 60) % 24
    if 6 <= hour < 12: return "🌅"
    elif 12 <= hour < 18: return "☀️"
    elif 18 <= hour < 22: return "🌆"
    else: return "🌙"

def get_random_tip(event_type):
    tips_off = ["☕ Встигніть заварити чай або каву\\!", "💾 Збережіть всі документи\\!", "🕯️ Підготуйте свічки та ліхтарик", "💡 Завершіть справи зі світлом", "🍳 Підігрійте їжу зараз\\!", "🌡️ Налаштуйте температуру в оселі", "💧 Наберіть води про запас"]
    tips_on = ["🎉 Нарешті можна працювати\\!", "⚡ Світло ось\\-ось з'явиться\\!", "🌟 Готуйтесь \\- світло на підході\\!", "🏠 Час підготувати техніку до зарядки\\!", "🔌 Підготуйте список що зарядити\\!", "📱 Складіть план на час зі світлом\\!"]
    return random.choice(tips_off if event_type == "off" else tips_on)

def send_telegram_message(message_text):
    bot_token = os.environ.get('TELEGRAM_TOKEN')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID')
    if not bot_token or not chat_id: return
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {'chat_id': chat_id, 'text': message_text, 'parse_mode': 'MarkdownV2'}
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
    except: pass

def run_bot():
    json_file_path = 'database.json'
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except: return

    now = datetime.now()
    now_m = now.hour * 60 + now.minute
    current_time_str = now.strftime("%H:%M")
    
    days_ukr = {0: "понеділок", 1: "вівторок", 2: "середа", 3: "четвер", 4: "п'ятниця", 5: "субота", 6: "неділя"}
    days_ukr_cap = {0: "Понеділок", 1: "Вівторок", 2: "Середа", 3: "Четвер", 4: "П'ятниця", 5: "Субота", 6: "Неділя"}
    today_dow = now.weekday()
    
    # --- ХІРУРГІЧНА ВСТАВКА: МАТЕМАТИЧНА СКЛЕЙКА (ЯК НА САЙТІ) ---
    all_events = []
    for day_offset in range(2):
        target_dow = (today_dow + day_offset) % 7
        day_name = days_ukr[target_dow]
        schedule = data.get('queues', {}).get('6.2', {}).get(day_name, [])
        
        for val in schedule:
            s_str, e_str = val.split('-')
            s_h, s_m = map(int, s_str.split(':'))
            e_h, e_m = map(int, e_str.split(':'))
            start_total = s_h * 60 + s_m + (day_offset * 1440)
            end_total = (1440 if (e_h == 0 and e_m == 0) or e_h == 24 else e_h * 60 + e_m) + (day_offset * 1440)
            all_events.append({'start': start_total, 'end': end_total})

    if not all_events: return

    # Склеювання
    all_events.sort(key=lambda x: x['start'])
    merged = []
    if all_events:
        curr = all_events[0]
        for next_ev in all_events[1:]:
            if curr['end'] == next_ev['start']: curr['end'] = next_ev['end']
            else:
                merged.append(curr); curr = next_ev
        merged.append(curr)

    # Статистика (тільки на поточну добу)
    past_count, past_hours, future_count, future_hours = 0, 0, 0, 0
    for ev in merged:
        if ev['start'] < 1440:
            actual_end = min(ev['end'], 1440)
            duration = (actual_end - ev['start']) / 60
            if actual_end <= now_m:
                past_count += 1; past_hours += int(duration)
            else:
                future_count += 1; future_hours += int(duration)

    # Перевірка на події (20-30 хв вікно)
    for ev in merged:
        # Чекаємо ВВІМКНЕННЯ (ми вже всередині)
        if ev['start'] <= now_m < ev['end']:
            diff = ev['end'] - now_m
            if 0 < diff <= 30:
                send_notif(current_time_str, days_ukr_cap[today_dow], ev['start'], ev['end'], diff, past_count, past_hours, future_count, future_hours, "on")
                break
        # Чекаємо ВИМКНЕННЯ (подія попереду)
        elif ev['start'] > now_m:
            diff = ev['start'] - now_m
            if 0 < diff <= 30:
                send_notif(current_time_str, days_ukr_cap[today_dow], ev['start'], ev['end'], diff, past_count, past_hours, future_count, future_hours, "off")
                break

def send_notif(cur_time, day, start, end, diff, p_c, p_h, f_c, f_h, type):
    icon = get_time_icon(start if type == "off" else end)
    status = "вимкнуть світло\\! ⚡" if type == "off" else "увімкнуть світло\\! 💡"
    duration = calculate_duration_from_min(start, end)
    
    msg = (
        f"{icon} *Увага\\! Скоро {status}*\n\n"
        f"📅 {escape_markdown_v2(day)}, {escape_markdown_v2(cur_time)}\n"
        f"⏰ *Залишилось:* {escape_markdown_v2(str(int(diff)))} хв\\.\n\n"
        f"📋 *За графіком:*\n"
        f"   • Вимкнення: {escape_markdown_v2(format_time_display(start))}\n"
        f"   • Увімкнення: {escape_markdown_v2(format_time_display(end))}\n"
        f"   • Тривалість: {escape_markdown_v2(duration)}\n\n"
        f"📊 *Сьогодні:*\n"
        f"   • Відключень було: {escape_markdown_v2(str(p_c))} \\({escape_markdown_v2(str(p_h))} год\\.\\)\n"
        f"   • Залишилось: {escape_markdown_v2(str(f_c))} \\({escape_markdown_v2(str(f_h))} год\\.\\)\n\n"
        f"{get_random_tip(type)}\n\n"
        f"📊 Повний графік відключень для всіх черг: https://mixaua\\.github\\.io/Grafik/"
    )
    send_telegram_message(msg)

if __name__ == "__main__":
    run_bot()
