import json
from datetime import datetime, timedelta

def calculate_duration(start_s, end_s):
    """Рахує тривалість між двома мітками часу."""
    fmt = "%H:%M"
    t1 = datetime.strptime(start_s, fmt)
    t2 = datetime.strptime(end_s.replace("24:00", "23:59"), fmt)
    if end_s == "24:00": t2 += timedelta(minutes=1)
    
    duration = t2 - t1
    hours = duration.seconds // 3600
    minutes = (duration.seconds % 3600) // 60
    if minutes > 0:
        return f"{hours}.{minutes:02d} годин"
    return f"{hours} годин"

def show_message(action, target_time, duration, next_action, next_start, next_end):
    """Виводить гарне повідомлення в консоль GitHub."""
    print(f"\n⚠️  УВАГА! ВЖЕ ОСЬ-ОСЬ {action.upper()}")
    print(f"За графіком о **{target_time}** годині з тривалістю **{duration}**.")
    print(f"Далі заплановано \"{next_action}\" від **{next_start}** годин по **{next_end}** годин.")
    print(f"Плануйте свій час і бережіть себе! 🙏\n")

def run_bot():
    try:
        with open('database.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("❌ Помилка: Файл database.json не знайдено!")
        return

    now = datetime.now()
    # Час для порівняння
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

        # 1. СИТУАЦІЯ: Ми ЗАРАЗ БЕЗ СВІТЛА (чекаємо ВВІМКНЕННЯ)
        if start_dt <= current_time_dt <= end_dt:
            diff = (end_dt - current_time_dt).total_seconds() / 60
            if 0 < diff <= 30:
                duration = calculate_duration(start_s, end_s)
                next_idx = (i + 1) % len(intervals)
                n_start, n_end = intervals[next_idx].split('-')
                
                show_message("ввімкнення", end_s, duration, "вимкнення", n_start, n_end)
                found_event = True
            break

        # 2. СИТУАЦІЯ: СВІТЛО Є (чекаємо найближче ВИМКНЕННЯ)
        if start_dt > current_time_dt:
            diff = (start_dt - current_time_dt).total_seconds() / 60
            if 0 < diff <= 30:
                duration = calculate_duration(start_s, end_s)
                # Наступна подія після цього вимкнення — це його кінець (ввімкнення)
                show_message("вимкнення", start_s, duration, "ввімкнення", end_s, "наступного блоку")
                found_event = True
            break

    if not found_event:
        print(f"ℹ️ {current_time_str}: До подій за графіком 6.2 більше 30 хв. Вихід.")

if __name__ == "__main__":
    run_bot()
