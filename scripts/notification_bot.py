import json
from datetime import datetime, timedelta
import os # Keep os for potential future use or consistency if it was there before

def calculate_duration(start_s, end_s):
    """Рахує тривалість між двома мітками часу."""
    fmt = "%H:%M"
    # Обробка 24:00 для розрахунків
    t1 = datetime.strptime(start_s, fmt)
    t2 = datetime.strptime(end_s.replace("24:00", "23:59"), fmt)
    if end_s == "24:00": t2 += timedelta(minutes=1)
    
    duration = t2 - t1
    hours = duration.total_seconds() // 3600
    minutes = (duration.total_seconds() % 3600) // 60
    
    if hours > 0 and minutes > 0:
        return f"{int(hours)} год. {int(minutes)} хв."
    elif hours > 0:
        return f"{int(hours)} год."
    elif minutes > 0:
        return f"{int(minutes)} хв."
    return "менше хвилини"

def show_message(action, target_time, duration, next_action, next_start, next_end):
    """Виводить повідомлення у stdout (логи GitHub Actions)"""
    print(f"⚠️ Увага! Вже ось-ось \"{action}\"")
    print(f"За графіком о {target_time} годині з тривалістю {duration}.")
    if next_action:
        print(f"Рівно за {target_time} годин заплановано \"{next_action}\" від {next_start} годин по {next_end} годин.")
    print(f"\nПлануйте свій час і бережіть себе! 🙏")

def run_bot():
    # Читаємо з database.json
    json_file_path = 'test_database.json' # Повернуто до database.json
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
    
    # Виправлений шлях до черги
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
                duration = calculate_duration(start_s, end_s)
                
                show_message("ввімкнення", end_s, duration, None, None, None) # Next action info removed for simplicity
                found_event = True
                break

        # Перевірка: чи ми знаходимось перед інтервалом відключення (чекаємо ВИМКНЕННЯ)
        elif start_dt > current_time_dt:
            # Якщо поточний час ближче до початку інтервалу (вимкнення)
            diff_to_start = (start_dt - current_time_dt).total_seconds() / 60
            if 0 < diff_to_start <= 30: # 30-хвилинне вікно до вимкнення
                duration = calculate_duration(start_s, end_s)
                
                show_message("вимкнення", start_s, duration, None, None, None) # Next action info removed for simplicity
                found_event = True
                break
    
    if not found_event:
        print(f"ℹ️ {now.strftime('%H:%M')}: До подій більше 30 хв або подій на {weekday} не знайдено. Вихід.")

if __name__ == "__main__":
    run_bot()