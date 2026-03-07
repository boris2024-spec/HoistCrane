# Экспорт данных в Excel с поддержкой иврита (UTF-8)

## ✅ Что реализовано

### Backend (Django)

1. **Добавлена библиотека openpyxl** в [backend/requirements.txt](backend/requirements.txt)
   - `openpyxl==3.1.2` для работы с файлами Excel (.xlsx)

2. **Новые API endpoints:**
   - `GET /api/equipment/export_excel/` - экспорт оборудования в Excel
   - `GET /api/documents/export_excel/` - экспорт документов в Excel

3. **Особенности реализации:**
   - ✅ Полная поддержка Unicode/UTF-8 (иврит отображается корректно)
   - ✅ Стилизованные заголовки (синий фон, белый текст, выравнивание)
   - ✅ Автоматическая ширина колонок
   - ✅ Заголовки на иврите
   - ✅ Применяются текущие фильтры при экспорте
   - ✅ Правильный MIME type и имя файла с датой

### Frontend (React)

1. **Обновлен API клиент** [frontend/src/services/api.js](frontend/src/services/api.js):
   - `equipmentAPI.exportExcel(params)` - метод экспорта оборудования
   - `documentAPI.exportExcel(params)` - метод экспорта документов

2. **Добавлена кнопка экспорта** в [frontend/src/pages/Equipment/EquipmentList.js](frontend/src/pages/Equipment/EquipmentList.js):
   - Кнопка "ייצא ל-Excel" (Export to Excel) рядом с кнопкой CSV
   - Автоматическое скачивание файла с правильным именем
   - Передача JWT токена для авторизации
   - Применение текущих фильтров

## 📊 Экспортируемые данные

### Equipment (Оборудование) - 22 колонки:
1. פריט ציוד (Equipment Number)
2. סוג ציוד (Equipment Type)
3. סטטוס (Status)
4. יצרן (Manufacturer)
5. דגם (Model)
6. מספר סידורי (Serial Number)
7. קיבולת (Capacity)
8. יחידת קיבולת (Capacity Unit)
9. גובה (Height)
10. אתר (Site)
11. מקום עבודה (Workplace)
12. מעסיק (Employer)
13. מחלקה (Department)
14. בודק (Inspector)
15. תאריך ייצור (Manufacture Date)
16. שנת ייצור (Manufacture Year)
17. תאריך רכישה (Purchase Date)
18. תאריך התקנה (Installation Date)
19. בדיקה אחרונה (Last Inspection)
20. בדיקה הבאה (Next Inspection)
21. תיאור (Description)
22. הערות (Notes)

### Documents (Документы) - 10 колонок:
1. מזהה (ID)
2. כותרת (Title)
3. סוג מסמך (Document Type)
4. ציוד (Equipment)
5. תיאור (Description)
6. תאריך מסמך (Document Date)
7. תאריך תפוגה (Expiry Date)
8. גודל קובץ (File Size KB)
9. הועלה על ידי (Uploaded By)
10. תאריך העלאה (Upload Date)

## 🧪 Тестирование

Созданы тестовые скрипты:
- [backend/test_excel_export.py](backend/test_excel_export.py) - тест создания Excel с ивритом
- [backend/test_api_export.py](backend/test_api_export.py) - тест API endpoints
- [backend/verify_excel_content.py](backend/verify_excel_content.py) - проверка содержимого

Результаты тестов:
- ✅ Equipment Export: успешно (2442 записи, 163 KB)
- ✅ Documents Export: успешно (5 KB)
- ✅ Иврит корректно экспортируется и читается

## 📝 Использование

### Из веб-интерфейса:
1. Перейдите на страницу списка оборудования
2. При необходимости примените фильтры
3. Нажмите кнопку "ייצא ל-Excel" (Export to Excel)
4. Файл автоматически скачается

### Программно (API):
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/equipment/export_excel/ \
  --output equipment.xlsx

curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/documents/export_excel/ \
  --output documents.xlsx
```

### С фильтрами:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/equipment/export_excel/?equipment_type=crane&status=active" \
  --output equipment_filtered.xlsx
```

## 🔧 Установка зависимостей

Если вы разворачиваете проект заново:

```bash
# Backend
cd backend
pip install -r requirements.txt

# Или только openpyxl:
pip install openpyxl==3.1.2
```

## ✨ Преимущества .xlsx перед CSV

1. **Гарантированная поддержка Unicode** - иврит всегда отображается корректно
2. **Колонки не ломаются** - Excel правильно определяет границы столбцов
3. **Форматирование** - заголовки стилизованы, колонки имеют оптимальную ширину
4. **Нет проблем с разделителями** - не зависит от локальных настроек (запятая/точка с запятой)
5. **Открывается сразу** - не требует дополнительной настройки кодировки

## 📌 Примечания

- Файлы создаются с именем формата: `equipment_export_YYYYMMDD_HHMMSS.xlsx`
- При экспорте применяются все активные фильтры из веб-интерфейса
- Требуется авторизация (JWT token) для доступа к endpoints
- Excel файлы открываются во всех версиях Microsoft Excel, LibreOffice, Google Sheets
