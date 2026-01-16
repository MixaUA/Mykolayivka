import json
import datetime
import os
import sys
from zoneinfo import ZoneInfo

# --- Константи та шляхи ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_RAW_FILE = os.path.join(BASE_DIR, 'database_new.json')
MAPPING_FILE = os.path.join(BASE_DIR, 'mapping.json')
DB_FINAL_FILE = os.path.join(BASE_DIR, '..', 'database.json')

P_LIST = ["one", "two", "three", "four", "five", "six", "seven"]
DAYS_UA = ["понеділок", "вівторок", "середа", "четвер", "п'ятниця", "субота", "неділя"]
MONTHS = {
    'січня': 1, 'лютого': 2, 'березня': 3, 'квітня': 4, 'травня': 5, 'червня': 6,
    'липня': 7, 'серпня': 8, 'вересня': 9, 'жовтня': 10, 'листопада': 11, 'грудня': 12
}

TZ_KYIV = ZoneInfo("Europe/Kiev")

def load_json(path):
    if not os.path.exists(path):
        print(f"Помилка: Файл не знайдено - {path}")
        return None
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Помилка завантаження {path}: {e}")
        return None

def save_json(data, path):
    try:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Помилка запису v {path}: {e}")

def parse_date(date_str):
    try:
        parts = date_str.split()
        if len(parts) >= 2 and parts[1] in MONTHS:
            day = int(parts[0])
            month = MONTHS[parts[1]]
            kyiv_now = datetime.datetime.now(TZ_KYIV)
            year = kyiv_now.year
            if kyiv_now.month == 1 and month == 12:
                year -= 1
            return datetime.date(year, month, day)
    except Exception:
        pass
    return None

def get_last_queue_idx(db_data):
    indices = set()
    for key, q_data in db_data.items():
        if not (isinstance(q_data, dict) and key.endswith('_cherg')):
            continue
        for slot_key, slot_val in q_data.items():
            if any(char.isdigit() for char in str(slot_val)):
                prefix = slot_key.split('_')[0]
                if prefix in P_LIST:
                    indices.add(P_LIST.index(prefix))
    if not indices: return None
    
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
    final_db = {"update_time": db_raw.get('update_time', ''), "queues": {}}
    queue_keys = [k for k in db_raw.keys() if '.' in k and k.endswith('_cherg')]
    for q_key in queue_keys:
        q_name = q_key.replace('_cherg', '')
        final_db["queues"][q_name] = {}
        for day_idx, day_name in enumerate(DAYS_UA):
            prefix = P_LIST[mapping_map[day_idx]]
            slots = []
            for i in range(1, 10):
                val = db_raw[q_key].get(f"{prefix}_{i}")
                if val and any(c.isdigit() for c in str(val)) and "інформації" not in str(val):
                    slots.append(val)
            final_db["queues"][q_name][day_name] = slots
    return final_db

def main():
    mode = "--calibrate" if "--calibrate" in sys.argv else "--build"
    kyiv_now = datetime.datetime.now(TZ_KYIV)
    today = kyiv_now.date()
    
    print(f"--- Запуск скрипту: {kyiv_now.strftime('%Y-%m-%d %H:%M:%S')} (Kyiv) ---")
    print(f"Режим роботи: {mode}")

    db_raw = load_json(DB_RAW_FILE)
    if not db_raw: sys.exit(1)
        
    mapping_data = load_json(MAPPING_FILE) or {"calibratedMap": [0,1,2,3,4,5,6], "lastCalibration": ""}

    if mode == "--calibrate":
        if mapping_data.get('lastCalibration') == today.isoformat():
            print(f"✅ Сьогодні ({today}) калібрування вже успішно виконано. Вихід.")
            return # ЗУПИНЯЄМО РОБОТУ, ЩОБ НЕ ЗБИРАТИ БАЗУ ВХОЛОСТУ

        file_date = parse_date(db_raw.get('update_time', ''))
        print(f"📅 Дата з файлу: {file_date}, Сьогодні: {today}")

        if file_date and (today - file_date).days == 1:
            print("🚀 Файл актуальний (вчорашній). Аналізую зсув...")
            last_idx = get_last_queue_idx(db_raw)
            if last_idx is not None:
                print(f"🔍 Виявлено індекс на сьогодні: {last_idx} ({P_LIST[last_idx]})")
                offset = (last_idx - today.weekday() + 7) % 7
                new_map = [(i + offset) % 7 for i in range(7)]
                
                if mapping_data.get('calibratedMap') == new_map:
                    print("🛡️ Запобіжник: Розрахована карта збігається з існуючою. Карта не змінилася.")
                else:
                    print(f"🔄 Карта змінилася! Оновлюю: {mapping_data.get('calibratedMap')} -> {new_map}")
                    mapping_data['calibratedMap'] = new_map
                
                mapping_data['lastCalibration'] = today.isoformat()
                save_json(mapping_data, MAPPING_FILE)
                print("✅ Налаштування калібрування збережено.")
            else:
                print("⚠️ Помилка: Не вдалося знайти індекси в сирих даних.")
        else:
            print("ℹ️ Файл не є вчорашнім. Калібрування пропущено.")

    # Ця частина виконується лише при першому калібруванні за добу або в режимі --build
    print("🛠️ Розпочинаю фінальну збірку бази...")
    final_data = build_final(db_raw, mapping_data["calibratedMap"])
    save_json(final_data, DB_FINAL_FILE)
    print(f"✨ Збірка завершена успішно. Карта: {mapping_data['calibratedMap']}")

if __name__ == "__main__":
    main()
