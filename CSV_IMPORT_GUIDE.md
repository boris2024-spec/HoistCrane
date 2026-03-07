# Инструкция по загрузке данных из CSV

## Обзор

Данные из CSV файла успешно загружены в базу данных. Всего импортировано **2439 единиц оборудования**.

## Использованный скрипт

Файл: `backend/import_equipment_hebrew.py`

Скрипт автоматически:
- Определяет кодировку файла (поддерживает различные кодировки: cp1255, windows-1255, utf-8-sig, iso-8859-8, latin1)
- Распознает разделитель CSV (`;` или `,`)
- Импортирует данные с учетом текста на иврите
- Сопоставляет данные с существующей моделью Equipment
- Преобразует статусы проверки (бתוקף/לא בתוקף) в значения модели (active/inactive)
- Определяет тип оборудования по названию (מנוף הרמה, גני ליפט, etc.)
- Парсит даты в формате DD/MM/YYYY

## Как запустить импорт

```powershell
cd "C:\full stack 9.92024\HoistCrane\backend"
& "C:/full stack 9.92024/HoistCrane/.venv/Scripts/python.exe" import_equipment_hebrew.py <путь_к_CSV_файлу>
```

Или если CSV файл находится в папке backend:

```powershell
cd "C:\full stack 9.92024\HoistCrane\backend"
& "C:/full stack 9.92024/HoistCrane/.venv/Scripts/python.exe" import_equipment_hebrew.py Equipment_List_-_31-01-2026_167596.csv
```

## Структура маппинга данных

### Поля CSV → Поля модели Equipment

- Номер строки → `equipment_number` (уникальный идентификатор)
- Название оборудования → `model`
- Серийный номер (מסלקד/מספר סידורי) → `serial_number`
- Местоположение (מיקום) → `location_details`
- Заказчик/Работодатель (אתר / סרק, מזמין) → `employer`
- Площадка (אתר / סרק) → `site_name`
- Производитель (יצרן) → `manufacturer`
- Описание (תאור/תיאור) → `description`
- Инспектор (אחראי/בודק/ת) → `inspector_name`
- Дата последней проверки (תאריך יישוא, בדיקה תקופתית) → `last_inspection_date`
- Действителен до (תקף עד) → `next_inspection_date`
- Статус проверки (סטטוס בדיקה) → `status`
- Тип оборудования (определяется по названию) → `equipment_type`

### Маппинг статусов

| Иврит | Английский (в БД) |
|-------|-------------------|
| בתוקף (в силе) | active |
| לא בתוקף (не в силе) | inactive |
| תקף | active |
| לא תקף | inactive |
| פעיל | active |

### Маппинг типов оборудования

| Иврит | Английский (в БД) |
|-------|-------------------|
| מנוף הרמה | crane |
| גני ליפט / Genie lift | platform |
| מלגזה | forklift |
| מעלית | elevator |
| Прочее | other |

## Проверка импортированных данных

### Через Django shell

```powershell
cd "C:\full stack 9.92024\HoistCrane\backend"
& "C:/full stack 9.92024/HoistCrane/.venv/Scripts/python.exe" manage.py shell
```

```python
from equipment.models import Equipment

# Общее количество
print(f"Всего оборудования: {Equipment.objects.count()}")

# Первые 5 записей
for eq in Equipment.objects.all()[:5]:
    print(f"{eq.equipment_number} - {eq.model} ({eq.equipment_type})")

# Статистика по типам
from django.db.models import Count
stats = Equipment.objects.values('equipment_type').annotate(count=Count('id'))
for stat in stats:
    print(f"{stat['equipment_type']}: {stat['count']}")
```

### Через API

Запустите сервер:
```powershell
cd "C:\full stack 9.92024\HoistCrane\backend"
& "C:/full stack 9.92024/HoistCrane/.venv/Scripts/python.exe" manage.py runserver
```

Откройте в браузере:
- Список оборудования: http://localhost:8000/api/equipment/
- API документация: http://localhost:8000/api/

## Обновления в фронтенде

Фронтенд уже настроен и готов к работе с загруженными данными:

### Компоненты:
- `EquipmentList.js` - список оборудования с фильтрацией
- `EquipmentDetail.js` - детальная информация об оборудовании
- `EquipmentForm.js` - форма создания/редактирования
- `EquipmentImport.js` - интерфейс импорта

### Запуск фронтенда:

```powershell
cd "C:\full stack 9.92024\HoistCrane\frontend"
npm start
```

Откройте: http://localhost:3000

## Особенности

1. **Поддержка иврита**: Все данные на иврите корректно обрабатываются и сохраняются
2. **Обновление существующих записей**: Если оборудование с таким номером уже существует, оно будет обновлено
3. **Создание пользователя**: Скрипт автоматически создает пользователя `admin` (пароль: `admin123`) если его нет
4. **Обработка ошибок**: Скрипт продолжает работу даже если некоторые строки содержат ошибки
5. **Логирование**: Детальный вывод процесса импорта с указанием создания/обновления каждой записи

## Результат последнего импорта

```
============================================================
Import completed!
Created: 0
Updated: 2439
Errors: 0
Total processed: 2439
============================================================
```

Все 2439 записей успешно обновлены в базе данных.

## Следующие шаги

1. ✅ Данные загружены в базу
2. ✅ Backend API работает
3. ✅ Frontend настроен
4. 🔄 Можно запускать фронтенд и проверять отображение данных
5. 🔄 При необходимости можно настроить дополнительные фильтры или поля отображения

## Дополнительные возможности

### Экспорт данных в Excel

Backend поддерживает экспорт оборудования в Excel:

```
GET /api/equipment/export/
```

### Фильтрация

API поддерживает следующие фильтры:
- По типу оборудования
- По статусу
- По производителю
- По серийному номеру
- По площадке
- По инспектору
- По датам проверки
- И многое другое

### Поиск

Полнотекстовый поиск по всем полям:
```
GET /api/equipment/?search=<запрос>
```
