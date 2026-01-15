import json
import datetime
import os
import sys

# --- Константи (залишаються без змін) ---
DB_FILE = 'database_new.json'
MAPPING_FILE = 'mapping.json'
P_LIST = ["one", "two", "three", "four", "five", "six", "seven"]
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
    except (json.JSONDecodeError, UnicodeDecodeError):
        print(f"Помилка: Некоректний формат JSON або кодування у файлі {path}")
        return None
    except Exception as e:
        print(f"Неочікувана помилка при читанні {path}: {e}")
        return None

def parse_date(date_str):
    """Парсить дату з рядка."""
    try:
        parts = date_str.split()
        if len(parts) >= 2 and parts[1] in MONTHS:
            day = int(parts[0])
            month = MONTHS[parts[1]]
            year = datetime.datetime.now().year
            if datetime.datetime.now().month == 1 and month == 12: year -= 1
            return datetime.date(year, month, day)
        clean_date = date_str.split()[0].replace('.', '-')
        return datetime.datetime.strptime(clean_date, "%d-%m-%Y").date()
    except Exception: return None

def get_last_queue_idx(db_data):
    """Знаходить індекс початку нового циклу графіка."""
    indices = set()
    for key, q_data in db_data.items():
        if not (isinstance(q_data, dict) and key.endswith('_cherg')): continue
        for slot_key, slot_val in q_data.items():
            if any(char.isdigit() for char in str(slot_val)):
                prefix = slot_key.split('_')[0]
                if prefix in P_LIST: indices.add(P_LIST.index(prefix))
    if not indices:
        print("Запобіжник: Не знайдено жодного активного слота з годинами у файлі даних.")
        return None
    sorted_indices = sorted(list(indices))
    last_idx, max_gap = sorted_indices[-1], 0
    if len(sorted_indices) > 1:
        for i in range(len(sorted_indices)):
            cur = sorted_indices[i]
            next_idx = sorted_indices[(i + 1) % len(sorted_indices)]
            gap = (next_idx - cur + 7) % 7
            if gap > max_gap: max_gap, last_idx = gap, cur
    return last_idx

def main():
    print(f"--- Запуск скрипту калібрування: {datetime.datetime.now()} ---")
    today = datetime.datetime.now().date()

    # === ЗАПОБІЖНИК 1: Перевірка, чи калібрування вже було сьогодні ===
    # Це основний "замок", щоб уникнути повторних запусків у вікні 00:00-01:00.
    mapping_data = load_json(MAPPING_FILE)
    if mapping_data and mapping_data.get('lastCalibration') == today.isoformat():
        print(f"Запобіжник: Калібрування на сьогодні ({today.isoformat()}) вже виконано. Вихід.")
        sys.exit(0)

    # === ЗАПОБІЖНИК 2: Перевірка файлу `database_new.json` на валідність ===
    db = load_json(DB_FILE)
    if not db:
        print(f"Запобіжник: Файл {DB_FILE} відсутній або містить помилку. Вихід.")
        sys.exit(1) # Вихід з кодом помилки

    update_time_str = db.get('update_time')
    if not update_time_str:
        print(f"Запобіжник: Поле 'update_time' не знайдено в {DB_FILE}. Вихід.")
        sys.exit(1)

    file_date = parse_date(update_time_str)
    if not file_date:
        print(f"Запобіжник: Не вдалося розпарсити 'update_time' ('{update_time_str}'). Вихід.")
        sys.exit(1)
        
    print(f"Дата з файлу: {file_date}, Сьогодні: {today}")

    # === ЗАПОБІЖНИК 3: Перевірка актуальності файлу для калібрування ===
    # Єдиний валідний сценарій — коли файл датований вчорашнім днем.
    days_diff = (today - file_date).days
    if days_diff != 1:
        print(f"Запобіжник: Файл не від учора (різниця: {days_diff} дн.). Калібрування не потрібне.")
        # Навіть без калібрування, оновлюємо дату, щоб "заблокувати" повторні запуски.
        current_map = mapping_data.get('calibratedMap', [0,1,2,3,4,5,6]) if mapping_data else [0,1,2,3,4,5,6]
        with open(MAPPING_FILE, 'w', encoding='utf-8') as f:
            json.dump({"calibratedMap": current_map, "lastCalibration": today.isoformat()}, f, indent=2)
        print("Оновлено дату останньої перевірки. Вихід.")
        sys.exit(0)

    # === ОСНОВНА ЛОГІКА КАЛІБРУВАННЯ ===
    print("Файл актуальний. Розпочинаю калібрування...")
    last_idx = get_last_queue_idx(db)

    # === ЗАПОБІЖНИК 4: Перевірка, чи вдалося визначити цикл з файлу ===
    if last_idx is None:
        print("Запобіжник: Не вдалося визначити цикл графіка з файлу (можливо, він порожній). Вихід без змін.")
        sys.exit(1)

    target_idx = last_idx
    print(f"Джерело: вчорашній файл. Визначено індекс на сьогодні: {target_idx} ({P_LIST[target_idx]})")
    
    today_dow = today.weekday() 
    offset = (target_idx - today_dow + 7) % 7
    new_map = [(i + offset) % 7 for i in range(7)]
    print(f"Розрахована нова карта: {new_map}")

    # === ЗАПОБІЖНИК 5: Перевірка, чи карта дійсно змінилася ===
    current_map = mapping_data.get('calibratedMap') if mapping_data else None
    if current_map == new_map:
        print("Запобіжник: Розрахована карта збігається з існуючою.")
        mapping_data['lastCalibration'] = today.isoformat()
        with open(MAPPING_FILE, 'w', encoding='utf-8') as f:
            json.dump(mapping_data, f, indent=2)
        print("Оновлено дату останньої перевірки. Карта не змінилась. Вихід.")
        sys.exit(0)

    # === ЗАПИС НОВОЇ КАРТИ ===
    print("Карта змінилася! Оновлюю mapping.json...")
    output = {
        "calibratedMap": new_map,
        "lastCalibration": today.isoformat(),
        "meta": {"source_date": str(file_date), "trigger": "calibration_success"}
    }
    with open(MAPPING_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2)
    
    print(f"--- Скрипт калібрування успішно завершено: {datetime.datetime.now()} ---")

if __name__ == "__main__":
    main()