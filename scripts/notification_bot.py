import json
from datetime import datetime, timedelta

def calculate_duration(start_s, end_s):
    """Рахує тривалість між двома мітками часу."""
    fmt = "%H:%M"
    # Обробка 24:00 для розрахунків
    t1 = datetime.strptime(start_s, fmt)
    t2 = datetime.strptime(end_s.replace("24:00", "23:59"), fmt)
    if end_s == "24:00": t2 += timedelta(minutes=1)
    
    duration = t2 - t1
    hours = duration.seconds // 3600
    minutes = (duration.seconds % 3600) // 60
    if minutes > 0:
        return f"{hours}.{minutes:02d} годин"
    return f"{hours} годин"

def run_bot():
    with open('database.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    now = datetime.now()
    current_time_dt = datetime.strptime(now.strftime("%H:%M"), "%H:%M")
    
    days_ukr = {0: "понеділок", 1: "вівторок", 2: "середа", 3: "четвер", 4: "п'ятниця", 5: "субота", 6: "неділя"}
    weekday = days_ukr[now.weekday()]
    intervals = data.get("6.2", {}).get(weekday, [])

    found_event = False
    
    for i, interval in enumerate(intervals):
        start_s, end_s = interval.split('-')
        start_dt = datetime.strptime(start_s, "%H:%M")
        end_dt = datetime.strptime(end_s.replace("24:00", "23:59"), "%H:%M")

        # 1. Ми всередині відключення (чекаємо ВВІМКНЕННЯ)
        if start_dt <= current_time_dt <= end_dt:
            if 0 < diff <= 30:
                next_idx = (i + 1) % len(intervals)
                n_start, n_end = intervals[next_idx].split('-')
                n_dur = calculate_duration(n_start, n_end)
                show_message("ввімкнення", end_s, calculate_duration(start_s, end_s), "вимкнення", n_start, n_end)
                found_event = True
            break

        # 2. Ми поза графіком (чекаємо ВИМКНЕННЯ)
        if start_dt > current_time_dt:
            diff = (start_dt - current_time_dt).total_seconds() / 60
            if 0 < diff <= 30:
                # Шукаємо кінець цього майбутнього відключення для тривалості
                duration = calculate_duration(start_s, end_s)
                # Наступна подія після цього вимкнення - це ввімкнення (початок наступної паузи)
                next_idx = (i + 1) % len(intervals)
                next_on_time = intervals[next_idx].split('-')[0] # Орієнтовно
                show_message("вимкнення", start_s, duration, "ввімкнення", end_s, "наступного блоку")
                found_event = True
            break

    if not found_event:
        print(f"ℹ️ {now.strftime('%H:%M')}: До подій більше 15 хв. Вихід.")

def show_message(action, target_time, duration, next_action, next_start, next_end):
    # Твій новий людяний шаблон
    print(f"⚠️ **Увага! Вже ось-ось \"{action}\"**")
    print(f"За графіком о **{target_time}** годині з тривалістю **{duration}**.")
    print(f"Рівно за **{target_time}** годин заплановано \"{next_action}\" від **{next_start}** годин по **{next_end}** годин.")
    print(f"\nПлануйте свій час і бережіть себе! 🙏")

if __name__ == "__main__":
    run_bot()
