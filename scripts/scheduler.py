import json
import datetime
import os
import sys

# --- Константи та шляхи ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_RAW_FILE = os.path.join(BASE_DIR, 'database_new.json')
MAPPING_FILE = os.path.join(BASE_DIR, 'mapping.json')
DB_FINAL_FILE = os.path.join(BASE_DIR, '..', 'database.json') # Результат буде в кореневій папці

P_LIST = ["one", "two", "three", "four", "five", "six", "seven"]
DAYS_UA = ["понеділок", "вівторок", "середа", "четвер", "п'ятниця", "субота", "неділя"]
MONTHS = {
    'січня': 1, 'лютого': 2, 'березня': 3, 'квітня': 4, 'травня': 5, 'червня': 6,
    'липня': 7, 'серпня': 8, 'вересня': 9, 'жовтня': 10, 'листопада': 11, 'грудня': 12
}

def load_json(path):
    """Безпечно завантажує JSON, повертає None у разі помилки."""
    if not os.path.exists(path):
        print(f"Помилка: Файл не знайдено - {path}")
        return None
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, UnicodeDecodeError) as e:
        print(f"Помилка: Некоректний формат JSON або кодування у файлі {path}. Помилка: {e}")
        return None
    except Exception as e:
        print(f"Неочікувана помилка при читанні {path}: {e}")
        return None

def save_json(data, path):
    """Зберігає дані в JSON файл."""
    try:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Неочікувана помилка при записі в {path}: {e}")

def parse_date(date_str):
    """Парсить дату з рядка '15 січня о 08:18'."""
    try:
        parts = date_str.split()
        if len(parts) >= 2 and parts[1] in MONTHS:
            day = int(parts[0])
            month = MONTHS[parts[1]]
            year = datetime.datetime.now().year
            # Handle case where it's January but the file is from December
            if datetime.datetime.now().month == 1 and month == 12:
                year -= 1
            return datetime.date(year, month, day)
        return None
    except Exception:
        return None

def get_last_queue_idx(db_data):
    """Знаходить індекс останнього активного дня в циклі графіка."""
    indices = set()
    for key, q_data in db_data.items():
        if not (isinstance(q_data, dict) and key.endswith('_cherg')):
            continue
        for slot_key, slot_val in q_data.items():
            if any(char.isdigit() for char in str(slot_val)):
                prefix = slot_key.split('_')[0]
                if prefix in P_LIST:
                    indices.add(P_LIST.index(prefix))
    if not indices:
        return None
    
    sorted_indices = sorted(list(indices))
    last_idx, max_gap = sorted_indices[-1], 0
    if len(sorted_indices) > 1:
        for i in range(len(sorted_indices)):
            cur = sorted_indices[i]
            next_idx = sorted_indices[(i + 1) % len(sorted_indices)]
            gap = (next_idx - cur + 7) % 7
            if gap > max_gap:
                max_gap, last_idx = gap, cur
    return last_idx

def build_final(db_raw, mapping_map):
    """Трансформує сирий JSON у чистий, клієнт-орієнтований формат."""
    final_db = {"update_time": db_raw.get('update_time', ''), "queues": {}}
    queue_keys = [k for k in db_raw.keys() if '.' in k and k.endswith('_cherg')]
    
    for q_key in queue_keys:
        q_name = q_key.replace('_cherg', '')
        final_db["queues"][q_name] = {}
        
        for day_idx, day_name in enumerate(DAYS_UA):
            # day_idx: 0=Пн, ..., 6=Нд
            pref_idx = mapping_map[day_idx]
            prefix = P_LIST[pref_idx]
            
            slots = []
            for i in range(1, 10): # Шукаємо слоти від _1 до _9
                val = db_raw[q_key].get(f"{prefix}_{i}")
                if val and any(c.isdigit() for c in str(val)) and "інформації" not in str(val):
                    slots.append(val)
            
            final_db["queues"][q_name][day_name] = slots
            
    return final_db

def main():
    """Головна функція, що керує режимами роботи бота."""
    mode = "--calibrate" if "--calibrate" in sys.argv else "--build"
    print(f"--- Запуск бота в режимі '{mode}': {datetime.datetime.now()} ---")
    today = datetime.datetime.now().date()

    # --- Завантаження основних даних ---
    db_raw = load_json(DB_RAW_FILE)
    if not db_raw:
        print(f"Критична помилка: Файл {DB_RAW_FILE} відсутній або містить помилку. Вихід.")
        sys.exit(1)
        
    mapping_data = load_json(MAPPING_FILE) or {"calibratedMap": [0,1,2,3,4,5,6], "lastCalibration": ""}

    # --- РЕЖИМ КАЛІБРУВАННЯ ---
    if mode == "--calibrate":
        print("Перевірка необхідності калібрування...")
        if mapping_data.get('lastCalibration') == today.isoformat():
            print("Калібрування на сьогодні вже виконано. Пропускаю.")
        else:
            update_time_str = db_raw.get('update_time')
            file_date = parse_date(update_time_str) if update_time_str else None

            if file_date and (today - file_date).days == 1:
                print("Файл даних за вчора. Виконую калібрування...")
                last_idx = get_last_queue_idx(db_raw)
                
                if last_idx is not None:
                    today_dow = today.weekday() # 0 = Пн
                    offset = (last_idx - today_dow + 7) % 7
                    new_map = [(i + offset) % 7 for i in range(7)]
                    
                    if mapping_data.get('calibratedMap') != new_map:
                        print(f"Карта змінилася! Нова карта: {new_map}")
                        mapping_data['calibratedMap'] = new_map
                    else:
                        print("Розрахована карта збігається з існуючою. Зміни не потрібні.")

                else:
                    print("Попередження: Не вдалося визначити цикл графіка з файлу.")
            
            else:
                days_diff_str = (today - file_date).days if file_date else "невідомо"
                print(f"Файл даних не є вчорашнім (різниця: {days_diff_str} дн.). Калібрування не виконується.")

            # Оновлюємо дату останньої перевірки, щоб уникнути повторного запуску
            mapping_data['lastCalibration'] = today.isoformat()
            save_json(mapping_data, MAPPING_FILE)
            print("Дата останнього калібрування оновлена.")

    # --- РЕЖИМ ЗБІРКИ (виконується завжди, після калібрування або як окрема задача) ---
    print("Виконую збірку фінального файлу `database.json`...")
    final_data = build_final(db_raw, mapping_data["calibratedMap"])
    save_json(final_data, DB_FINAL_FILE)
    print(f"Успішно! Файл {os.path.basename(DB_FINAL_FILE)} оновлено.")
    
    print(f"--- Бот завершив роботу: {datetime.datetime.now()} ---")

if __name__ == "__main__":
    main()