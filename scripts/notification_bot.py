import json
from datetime import datetime

def run_bot():
    # 1. Завантаження даних
    with open('database.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 2. Визначення часу та дня (Київ)
    now = datetime.now()
    current_time_str = now.strftime("%H:%M")
    
    days_ukr = {
        0: "понеділок", 1: "вівторок", 2: "середа", 
        3: "четвер", 4: "п'ятниця", 5: "субота", 6: "неділя"
    }
    weekday = days_ukr[now.weekday()]
    
    # 3. Отримання графіку для черги 6.2
    intervals = data.get("6.2", {}).get(weekday, [])
    
    # Визначаємо: ми зараз в періоді відключення чи ні?
    is_off = False
    target_end = ""
    next_event = "невідомо"
    
    now_dt = datetime.strptime(current_time_str, "%H:%M")

    for i, interval in enumerate(intervals):
        start_s, end_s = interval.split('-')
        # Для розрахунків 24:00 перетворюємо на 23:59
        calc_end = end_s.replace("24:00", "23:59")
        
        start_dt = datetime.strptime(start_s, "%H:%M")
        end_dt = datetime.strptime(calc_end, "%H:%M")

        if start_dt <= now_dt <= end_dt:
            is_off = True
            target_end = end_s
            # Наступна подія (ввімкнення) вже відбудеться, шукаємо наступне вимкнення
            next_idx = (i + 1) % len(intervals)
            next_event = intervals[next_idx].split('-')[0]
            break

    # Якщо ми НЕ в інтервалі відключення, значить зараз СВІТЛО Є
    if not is_off:
        for interval in intervals:
            start_s = interval.split('-')[0]
            if datetime.strptime(start_s, "%H:%M") > now_dt:
                target_end = start_s # Час, коли вимкнуть
                next_event = "за наступним блоком"
                break

    # 4. Формування твого чіткого шаблону
    action_text = "увімкнення" if is_off else "вимкнення"
    next_action = "вимкнення" if is_off else "ввімкнення"

    message = (
        f"⚠️ **Увага!**\n"
        f"До {action_text} світла залишилося менше 20 хвилин.\n"
        f"Наступне {next_action} за графіком почнеться о {next_event}.\n\n"
        f"Бережіть себе та плануйте свій день завчасно! 🙏"
    )

    print(f"--- Результат для {weekday}, {current_time_str} ---")
    print(message)

if __name__ == "__main__":
    run_bot()
