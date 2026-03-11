# HoistCrane — SaaS Transformation Plan

## CTO Architecture Review & Production Roadmap

**Дата:** 11 марта 2026  
**Платформа:** HoistCrane — Lifting Equipment Management Platform  
**Текущий стек:** Django + DRF + PostgreSQL / React + Material UI

---

# 1️⃣ Architecture Review — Текущее состояние и рекомендации

## 1.1 Backend Architecture

### Текущее состояние (Strengths)
- ✅ Правильная структура Django-приложений: `equipment`, `inspections`, `documents`, `issues`, `users`
- ✅ UUID primary keys — готовность к распределённым системам
- ✅ JWT-аутентификация с refresh-токенами
- ✅ PostgreSQL с индексами на ключевых полях
- ✅ Полное RTL/Hebrew-поддержка в PDF-генераторе (~900 строк профессионального кода)
- ✅ Гибкий импорт CSV/Excel с нормализацией заголовков

### Критические проблемы

#### 1. Отсутствие сервисного слоя (Service Layer)
**Проблема:** Вся бизнес-логика сосредоточена в `views.py`. Файл `equipment/views.py` содержит 800+ строк, включая CSV-парсинг, маппинг типов, Excel-экспорт, PDF-генерацию — всё в одном ViewSet.

**Решение:** Ввести трёхслойную архитектуру:

```
views.py          → Только HTTP-обработка, валидация запросов, формирование ответов
services.py       → Бизнес-логика, оркестрация операций
repositories.py   → Доступ к данным, сложные запросы
```

**Пример структуры:**
```python
# equipment/services/import_service.py
class EquipmentImportService:
    def import_from_csv(self, file, user) -> ImportResult:
        rows = self._parse_csv(file)
        return self._process_rows(rows, user)

# equipment/services/export_service.py  
class EquipmentExportService:
    def export_to_excel(self, queryset) -> HttpResponse: ...
    def export_to_csv(self, queryset) -> HttpResponse: ...

# equipment/services/pdf_service.py
class InspectionPDFService:
    def generate_report(self, equipment, inspection) -> BytesIO: ...
```

#### 2. Отсутствие разделения прав доступа (RBAC)
**Проблема:** Модель `CustomUser` имеет поле `role` с 4 ролями (admin, manager, technician, viewer), но ни один View не проверяет эти роли. Все эндпоинты доступны любому авторизованному пользователю.

**Решение:**
```python
# core/permissions.py
class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'admin'

class IsManagerOrAbove(BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ('admin', 'manager')

class CanModifyEquipment(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.role in ('admin', 'manager', 'technician')
```

#### 3. Отсутствие аудита и логирования действий
**Проблема:** Нет журнала действий пользователей. Для промышленной платформы это критично — регуляторы требуют полного аудита.

**Решение:** Добавить middleware + модель `ActivityLog`.

#### 4. Конфигурация не готова к Production
- `SECRET_KEY` захардкожен как fallback
- `DEBUG = True` по умолчанию
- CORS настроен только для localhost
- Нет rate-limiting
- Нет HTTPS-принуждения

#### 5. Нет асинхронной обработки
**Проблема:** Импорт CSV/Excel, генерация PDF делаются синхронно в request-response цикле. При больших файлах — таймауты.

**Решение:** Celery + Redis для фоновых задач.

### Рекомендуемая структура бэкенда

```
backend/
├── core/                          # Новый модуль
│   ├── permissions.py             # RBAC
│   ├── middleware.py              # Audit, error handling
│   ├── exceptions.py             # Custom exceptions
│   ├── mixins.py                 # Shared viewset mixins
│   └── utils.py                  # Common utilities
├── equipment/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py                  # Slim — только HTTP
│   ├── services/
│   │   ├── equipment_service.py
│   │   ├── import_service.py
│   │   ├── export_service.py
│   │   └── pdf_service.py
│   ├── filters.py                # Вынести фильтры
│   ├── tasks.py                  # Celery tasks
│   └── tests/
│       ├── test_models.py
│       ├── test_services.py
│       └── test_views.py
├── tenants/                      # Multi-tenancy (новый)
│   ├── models.py                 # Company, Subscription
│   ├── middleware.py             # Tenant resolution
│   └── mixins.py                # Tenant-scoped querysets
└── notifications/                # Новый модуль
    ├── models.py
    ├── services.py
    └── tasks.py
```

## 1.2 Database Structure

### Текущие проблемы

1. **Отсутствие связи Equipment → Company:** Поле `employer` — просто `CharField`. Нет FK на стандартизированные компании.

2. **Дублирование данных между моделями:** `InspectionReport`, `Inspection`, и `Equipment` все хранят `employer`, `workplace_name`, `location` как отдельные текстовые поля.

3. **Нет soft delete:** Удаление оборудования необратимо. Для промышленной системы недопустимо.

4. **`EquipmentSpecification` — key-value anti-pattern:** Для произвольных характеристик лучше использовать `JSONField` (уже поддерживается PostgreSQL).

## 1.3 API Design

### Текущие проблемы

| Проблема | Пример | Решение |
|----------|--------|---------|
| Нет версионирования API | `/api/equipment/` | `/api/v1/equipment/` |
| Нет throttling | Любой запрос проходит | DRF throttle classes |
| Нет API-документации | — | drf-spectacular (OpenAPI 3.0) |
| Pagination слишком большая | 100 элементов/страница, max 10000 | 25/страница, max 100 |
| Bulk-операции через custom actions | `@action bulk_delete` | Стандартный pattern с `POST /bulk-actions` |

---

# 2️⃣ Frontend UX/UI Improvements

## 2.1 Dashboard Design

### Текущее состояние
- Простые статистические карточки с градиентами
- Распределение статусов в виде текстового списка
- Quick actions — простая сетка

### Рекомендации (паттерны Linear/Notion/Retool)

#### A. Command Palette (Cmd+K)
```
Как в Linear/Notion — глобальная команда поиска:
- Поиск оборудования по любому полю
- Быстрые действия: "Добавить оборудование", "Новый отчёт"
- Навигация между страницами
- Поиск записей инспекций
```

**Реализация:** React portal с `Combobox` (Headless UI) или `@mui/joy` Autocomplete.

#### B. Real-time Activity Feed
```
Правая панель или секция на дашборде:
"10:32 — Boris обновил Equipment #1052"
"10:15 — Inspection Report #423 утверждён"
"09:45 — Новая проблема: Safety Issue на Equipment #890"
```

#### C. Interactive Charts
Заменить текстовые статистики на:
- **Doughnut chart** — статусы оборудования (recharts / nivo)
- **Bar chart** — инспекции по месяцам
- **Timeline** — предстоящие инспекции на ближайшие 30 дней
- **Heatmap** — проблемы по приоритету/типу

#### D. Widgets / Configurable Dashboard
```
Drag & drop виджеты:
- Expiring certificates (next 30 days)
- Overdue inspections
- Open issues by priority
- Equipment by location (map view)
```

## 2.2 Data Tables

### Текущее состояние
- MUI DataGrid с 40+ колонками — перегружен
- Нет сохранения пользовательских фильтров

### Рекомендации

#### A. Column Presets
```
Pre-configured views (как в Retool):
- "Overview" — 8 ключевых колонок
- "Technical" — характеристики
- "Location" — иерархия местоположения
- "Inspection" — даты и статусы инспекций
Пользователь может создавать свои пресеты
```

#### B. Saved Filters / Views
```
Как в Linear:
"Все активное оборудование в Тель-Авив"
"Просроченные инспекции — критические"
"Мои назначенные issues"
Сохранять в localStorage → затем в API
```

#### C. Inline Editing
```
Быстрое редактирование прямо в таблице:
- Double-click на ячейку → inline edit
- Checkbox для статусов
- Bulk actions toolbar при выделении
```

#### D. Advanced Filtering UI
```
Structured filter builder (как в Notion):
"Equipment Type IS lifting_facilities"
AND "Status IS active"
AND "Next Inspection BEFORE 2026-04-01"
→ Visual pill-based filter UI
```

## 2.3 Navigation

### Рекомендации

1. **Breadcrumbs** — для вложенных страниц (Equipment → #1052 → Inspections)
2. **Sidebar collapse** — иконки в свёрнутом состоянии (как в Linear)
3. **Keyboard shortcuts** — `G+E` → Equipment, `G+I` → Inspections
4. **Tab navigation** — на странице деталей оборудования уже есть табы — хорошо
5. **Recent items** — быстрый доступ к последним просмотренным записям

## 2.4 Mobile UX

### Текущее состояние
- Карточный список для мобильных — хорошая база
- Drawer-меню

### Рекомендации

1. **Bottom navigation bar** — для мобильных вместо Drawer
2. **Swipe actions** на карточках оборудования (edit, delete, inspect)
3. **Pull-to-refresh**
4. **Camera integration** для фото оборудования прямо из мобильного
5. **QR scanner** — навести камеру → открывается карточка оборудования
6. **Offline mode** с Service Worker (просмотр данных без интернета)

---

# 3️⃣ Industrial SaaS Features

## 3.1 Equipment Timeline

**Описание:** Хронологическая лента всех событий для единицы оборудования: создание, инспекции, ремонты, инциденты, документы, перемещения.

**Бизнес-ценность:** Полная история актива — критично для аудита, compliance, и принятия решений о списании.

**Техническая реализация:**
```python
# core/models.py
class ActivityLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=50)  # created, updated, inspected, moved, etc.
    entity_type = models.CharField(max_length=50)  # equipment, inspection, issue
    entity_id = models.UUIDField()
    changes = models.JSONField(default=dict)  # {"field": {"old": "X", "new": "Y"}}
    metadata = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True)
```

Frontend: Вертикальный timeline компонент с иконками для разных типов событий.

## 3.2 Equipment QR Codes

**Описание:** Каждая единица оборудования получает уникальный QR-код, ведущий на её карточку в системе.

**Бизнес-ценность:** Мгновенная идентификация оборудования в полевых условиях. Техник сканирует QR с телефона → видит всю информацию.

**Техническая реализация:**
```python
# qr_service.py
import qrcode
from io import BytesIO

class QRCodeService:
    def generate_qr(self, equipment_id: str, base_url: str) -> BytesIO:
        url = f"{base_url}/equipment/{equipment_id}"
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        return buffer
```

- API endpoint: `GET /api/v1/equipment/{id}/qr-code/`
- Batch print: генерация PDF-листа с несколькими QR-кодами для печати наклеек
- На фронтенде: кнопка "Download QR" + "Print QR Label"

## 3.3 Equipment Photo Gallery

**Описание:** Множественные фотографии для каждой единицы оборудования с хронологией, аннотациями, и категориями (общий вид, шильдик, дефект).

**Бизнес-ценность:** Визуальная документация состояния оборудования для инспекций и страховых случаев.

**Техническая реализация:**
```python
class EquipmentPhoto(models.Model):
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='equipment/photos/%Y/%m/')
    thumbnail = models.ImageField(upload_to='equipment/photos/thumbs/', blank=True)
    category = models.CharField(max_length=50, choices=[
        ('general', 'General View'), ('nameplate', 'Nameplate'),
        ('defect', 'Defect'), ('repair', 'Repair'), ('installation', 'Installation')
    ])
    caption = models.CharField(max_length=500, blank=True)
    taken_at = models.DateTimeField(null=True, blank=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

- Автоматическая генерация thumbnails при загрузке (Pillow)
- Lightbox gallery на фронтенде
- Drag & drop upload с мобильного + камера

## 3.4 Inspection Reminders & Scheduling

**Описание:** Автоматические уведомления о предстоящих и просроченных инспекциях за 30, 14, 7 дней.

**Бизнес-ценность:** Предотвращение простоя оборудования из-за просроченных инспекций. Соответствие нормативным требованиям.

**Техническая реализация:**
```python
# notifications/tasks.py (Celery)
@shared_task
def check_upcoming_inspections():
    thresholds = [30, 14, 7, 1]
    today = date.today()
    for days in thresholds:
        target_date = today + timedelta(days=days)
        equipment = Equipment.objects.filter(next_inspection_date=target_date)
        for eq in equipment:
            Notification.objects.create(
                company=eq.company,
                recipient=eq.responsible_user,
                type='inspection_reminder',
                title=f'Inspection due in {days} days',
                entity_type='equipment',
                entity_id=eq.id,
            )
            # + Email/SMS через email backend или Twilio
```

Celery Beat: ежедневная задача в 08:00.

## 3.5 Maintenance Scheduling (Preventive Maintenance)

**Описание:** Календарь плановых ТО с повторяющимися задачами, назначением техников, чеклистами.

**Бизнес-ценность:** Снижение внеплановых простоев на 30-40%. Transition от reactive к preventive maintenance.

**Техническая реализация:**
```python
class MaintenanceSchedule(models.Model):
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    frequency = models.CharField(max_length=20, choices=[
        ('daily', 'Daily'), ('weekly', 'Weekly'), ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'), ('semi_annual', 'Semi-Annual'), ('annual', 'Annual')
    ])
    last_completed = models.DateField(null=True, blank=True)
    next_due = models.DateField()
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    checklist = models.JSONField(default=list)  # [{"item": "Check oil level", "required": true}]
    estimated_duration = models.DurationField(null=True, blank=True)

class MaintenanceTask(models.Model):
    schedule = models.ForeignKey(MaintenanceSchedule, on_delete=models.CASCADE)
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'), ('in_progress', 'In Progress'),
        ('completed', 'Completed'), ('overdue', 'Overdue'), ('cancelled', 'Cancelled')
    ])
    scheduled_date = models.DateField()
    completed_date = models.DateTimeField(null=True, blank=True)
    checklist_results = models.JSONField(default=list)
    notes = models.TextField(blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
```

## 3.6 Compliance Tracking & Certificate Expiration Alerts

**Описание:** Мониторинг соответствия нормативным требованиям. Автоматическое отслеживание сроков действия сертификатов и лицензий.

**Бизнес-ценность:** Избежание штрафов и остановки работы из-за просроченных сертификатов. Критической важности для Израильского рынка (תקנות הבטיחות בעבודה).

**Техническая реализация:**
```python
class ComplianceRequirement(models.Model):
    name = models.CharField(max_length=300)
    regulation = models.CharField(max_length=200)  # e.g., "תקנות הבטיחות בעבודה (עגורנאים), תשל"ב-1972"
    equipment_types = models.JSONField(default=list)  # applicable equipment types
    frequency = models.CharField(max_length=50)  # inspection frequency requirement
    description = models.TextField(blank=True)

class Certificate(models.Model):
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    certificate_type = models.CharField(max_length=50)
    certificate_number = models.CharField(max_length=100)
    issued_date = models.DateField()
    expiry_date = models.DateField()
    issuing_authority = models.CharField(max_length=200)
    document = models.FileField(upload_to='certificates/')
    status = models.CharField(max_length=20)  # valid, expiring_soon, expired
```

## 3.7 Technician Mobile Workflows

**Описание:** Специализированный мобильный интерфейс для техников: список задач на день, чеклисты, фото-документация, подпись, оффлайн-режим.

**Бизнес-ценность:** Value creation для основных пользователей. Экономия 2-3 часа в день на бумажной документации.

**Техническая реализация:**
- PWA (Progressive Web App) с Service Worker
- IndexedDB для оффлайн-хранения задач
- Camera API для фотографий
- Canvas API для электронной подписи
- Sync queue — автоматическая синхронизация при появлении сети

## 3.8 Interactive Plant Layout Map

**Описание:** 2D-карта объекта с расположением оборудования, цветовыми индикаторами статуса, кликабельными точками.

**Бизнес-ценность:** Визуализация распространения оборудования, быстрая навигация по объекту, planning размещения.

**Техническая реализация:**
- Frontend: React + `react-konva` или `leaflet` для indoor mapping
- Загрузка SVG/PNG планировки здания
- Drag & drop размещение оборудования на карте
- Цветовые маркеры: зелёный (active), жёлтый (maintenance), красный (issue)
- Tooltip с основной информацией при наведении

---

# 4️⃣ Data Model Improvements

## 4.1 Текущая схема — проблемы

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Equipment     │     │  Inspection      │     │   Issue         │
│   (50+ fields)  │────▶│  Report          │     │                 │
│                 │────▶│                  │     │                 │
│   employer:str  │     │  employer:str    │     │                 │
│   site_name:str │     │  site:str        │     │                 │
└─────────┬───────┘     └──────────────────┘     └─────────────────┘
          │
          ▼
┌─────────────────┐     ┌──────────────────┐
│  Document       │     │  EquipmentSpec   │
│                 │     │  (key-value)     │
└─────────────────┘     └──────────────────┘
```

**Проблема:** `employer`, `site_name`, `workplace_name` — всё текстовые поля. Нет нормализации. Один и тот же работодатель может быть записан 10 разными способами.

## 4.2 Рекомендуемая схема

### Новые модели

#### Company (Tenant)
```python
class Company(models.Model):
    """Организация-клиент (tenant в SaaS)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=300)
    legal_name = models.CharField(max_length=300, blank=True)
    tax_id = models.CharField(max_length=50, blank=True)  # ח.פ.
    industry = models.CharField(max_length=100, blank=True)
    logo = models.ImageField(upload_to='companies/logos/', blank=True)
    
    # Subscription
    plan = models.CharField(max_length=20, choices=[
        ('free', 'Free'), ('starter', 'Starter'), 
        ('professional', 'Professional'), ('enterprise', 'Enterprise')
    ], default='free')
    max_equipment = models.IntegerField(default=50)
    max_users = models.IntegerField(default=5)
    
    # Settings
    settings = models.JSONField(default=dict)  # company-specific config
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### Site (Нормализованный объект)
```python
class Site(models.Model):
    """Физическое местоположение / объект"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    name = models.CharField(max_length=300)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=200, blank=True)
    country = models.CharField(max_length=100, default='Israel')
    coordinates = models.JSONField(null=True, blank=True)  # {"lat": 32.08, "lng": 34.78}
    contact_person = models.CharField(max_length=200, blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    floor_plan = models.FileField(upload_to='sites/plans/', blank=True)
    is_active = models.BooleanField(default=True)
```

#### ActivityLog
```python
class ActivityLog(models.Model):
    """Полный аудит-лог всех действий"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=50)  # create, update, delete, export, login
    entity_type = models.CharField(max_length=50)
    entity_id = models.UUIDField(null=True)
    entity_repr = models.CharField(max_length=300, blank=True)  # human-readable
    changes = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(null=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['company', '-timestamp']),
            models.Index(fields=['entity_type', 'entity_id']),
        ]
```

#### Notification
```python
class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    type = models.CharField(max_length=50, choices=[
        ('inspection_reminder', 'Inspection Reminder'),
        ('certificate_expiry', 'Certificate Expiry'),
        ('issue_assigned', 'Issue Assigned'),
        ('maintenance_due', 'Maintenance Due'),
        ('system', 'System Notification'),
    ])
    title = models.CharField(max_length=300)
    message = models.TextField(blank=True)
    entity_type = models.CharField(max_length=50, blank=True)
    entity_id = models.UUIDField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['recipient', 'is_read', '-created_at']),
        ]
```

## 4.3 Улучшения существующих моделей

### Equipment — дополнения
```python
class Equipment(models.Model):
    # ADD: Foreign keys вместо текстовых полей
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE)
    site = models.ForeignKey('tenants.Site', on_delete=models.SET_NULL, null=True, blank=True)
    
    # ADD: Soft delete
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True,
                                   on_delete=models.SET_NULL, related_name='deleted_equipment')
    
    # ADD: QR code
    qr_code = models.ImageField(upload_to='equipment/qr/', blank=True)
    
    # ADD: Cost tracking
    purchase_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    current_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # ADD: Custom manager для soft delete
    objects = EquipmentManager()  # Excludes deleted by default
    all_objects = models.Manager()  # Includes deleted
```

### CustomUser — дополнения
```python
class CustomUser(AbstractUser):
    # ADD: Company relation
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, null=True)
    
    # ADD: Profile
    avatar = models.ImageField(upload_to='users/avatars/', blank=True)
    job_title = models.CharField(max_length=200, blank=True)
    department = models.CharField(max_length=200, blank=True)
    
    # ADD: Preferences
    notification_preferences = models.JSONField(default=dict)
    language = models.CharField(max_length=10, default='he')
    timezone = models.CharField(max_length=50, default='Asia/Jerusalem')
    
    # ADD: Security
    last_password_change = models.DateTimeField(null=True, blank=True)
    failed_login_attempts = models.IntegerField(default=0)
```

## 4.4 Рекомендуемая ER-диаграмма

```
Company (Tenant)
  ├── Site (1:N)
  ├── User (1:N) 
  ├── Equipment (1:N)
  │     ├── EquipmentPhoto (1:N)
  │     ├── Document (1:N)
  │     ├── Inspection (1:N)
  │     ├── InspectionReport (1:N)
  │     │     └── InspectionReportItem (1:N)
  │     ├── Issue (1:N)
  │     │     └── IssueComment (1:N)
  │     ├── MaintenanceSchedule (1:N)
  │     │     └── MaintenanceTask (1:N)
  │     ├── Certificate (1:N)
  │     └── ActivityLog (polymorphic via entity_type + entity_id)
  ├── Notification (1:N per user)
  ├── ComplianceRequirement (1:N)
  └── Subscription (1:1)
```

---

# 5️⃣ SaaS Transformation

## 5.1 Multi-Tenant Architecture

### Подход: Schema-Level Isolation с Shared Database

**Рекомендация:** Для первого этапа — **Row-Level Isolation** (shared schema, `company_id` на каждой таблице). Это проще в реализации и подходит для сотен клиентов. Schema-per-tenant (с `django-tenants`) — для этапа Enterprise (тысячи клиентов).

```python
# tenants/middleware.py
class TenantMiddleware:
    """Автоматически определяет компанию текущего пользователя"""
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        if hasattr(request, 'user') and request.user.is_authenticated:
            request.tenant = request.user.company
        else:
            request.tenant = None
        return self.get_response(request)

# tenants/mixins.py
class TenantQuerySetMixin:
    """Автоматическая фильтрация по company"""
    def get_queryset(self):
        qs = super().get_queryset()
        if hasattr(self.request, 'tenant') and self.request.tenant:
            return qs.filter(company=self.request.tenant)
        return qs

class TenantCreateMixin:
    """Автоматическое назначение company при создании"""
    def perform_create(self, serializer):
        serializer.save(company=self.request.tenant)
```

### Data Isolation гарантии

```python
# Дополнительная защита на уровне модели
class TenantModel(models.Model):
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE)
    
    class Meta:
        abstract = True
    
    def save(self, *args, **kwargs):
        # Убедиться, что company установлена
        if not self.company_id:
            raise ValidationError("Company must be set")
        super().save(*args, **kwargs)
```

## 5.2 Subscription Plans

| Feature | Free | Starter ($49/mo) | Professional ($149/mo) | Enterprise ($499/mo) |
|---------|------|-------------------|------------------------|----------------------|
| Equipment | 50 | 500 | Unlimited | Unlimited |
| Users | 3 | 10 | 50 | Unlimited |
| Sites | 1 | 5 | Unlimited | Unlimited |
| Storage | 1 GB | 10 GB | 100 GB | 1 TB |
| PDF Reports | ✅ | ✅ | ✅ | ✅ |
| CSV Import | ✅ | ✅ | ✅ | ✅ |
| Mobile App | ✅ | ✅ | ✅ | ✅ |
| QR Codes | ❌ | ✅ | ✅ | ✅ |
| Maintenance Schedule | ❌ | ✅ | ✅ | ✅ |
| API Access | ❌ | ❌ | ✅ | ✅ |
| Compliance Tracking | ❌ | ❌ | ✅ | ✅ |
| AI Features | ❌ | ❌ | ❌ | ✅ |
| Audit Logs | ❌ | ❌ | ✅ | ✅ |
| SSO/SAML | ❌ | ❌ | ❌ | ✅ |
| Custom Branding | ❌ | ❌ | ❌ | ✅ |
| SLA | — | — | 99.5% | 99.9% |
| Support | Community | Email | Priority | Dedicated |

## 5.3 Billing Architecture

```python
class Subscription(models.Model):
    company = models.OneToOneField(Company, on_delete=models.CASCADE)
    plan = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=[
        ('active', 'Active'), ('trial', 'Trial'), 
        ('past_due', 'Past Due'), ('cancelled', 'Cancelled')
    ])
    stripe_customer_id = models.CharField(max_length=100, blank=True)
    stripe_subscription_id = models.CharField(max_length=100, blank=True)
    trial_end = models.DateTimeField(null=True, blank=True)
    current_period_start = models.DateTimeField()
    current_period_end = models.DateTimeField()
    
class UsageRecord(models.Model):
    """Отслеживание использования для metered billing"""
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    metric = models.CharField(max_length=50)  # equipment_count, storage_bytes, api_calls
    value = models.BigIntegerField()
    recorded_at = models.DateTimeField(auto_now_add=True)
```

**Интеграция:** Stripe для платежей — Django Stripe Webhooks для обработки событий (subscription created, payment failed, etc.).

## 5.4 Account Management

### Signup Flow
```
1. Landing page → "Start Free Trial"
2. Registration form: email, password, company name
3. Auto-create: Company + User (role=admin) + 14-day trial
4. Onboarding wizard: import первых единиц оборудования
5. Day 7: email "How's it going?"
6. Day 12: email "Your trial ends in 2 days"
7. Day 14: trial → payment required
```

### Admin Panel для компании
```
Company Settings:
  ├── General (name, logo, timezone)
  ├── Users Management (invite, roles, deactivate)
  ├── Sites Management (CRUD)
  ├── Billing (plan, invoices, payment method)
  ├── API Keys
  ├── Integrations (webhooks, ERP connectors)
  └── Data Export / Account Deletion
```

---

# 6️⃣ DevOps & Production

## 6.1 Docker Setup

```dockerfile
# backend/Dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# System dependencies for PDF generation (reportlab, fonts)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc fonts-dejavu-core && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

EXPOSE 8000
CMD ["gunicorn", "hoistcraneproject.wsgi:application", \
     "--bind", "0.0.0.0:8000", "--workers", "4", "--threads", "2"]
```

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

```yaml
# docker-compose.yml
version: '3.9'

services:
  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: hoistcrane_db
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    env_file: .env
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - media_data:/app/media
    ports:
      - "8000:8000"

  celery:
    build: ./backend
    command: celery -A hoistcraneproject worker -l info --concurrency=4
    env_file: .env
    depends_on:
      - backend
      - redis

  celery-beat:
    build: ./backend
    command: celery -A hoistcraneproject beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
    env_file: .env
    depends_on:
      - backend
      - redis

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
  media_data:
```

## 6.2 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
        ports: [5432:5432]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install -r backend/requirements.txt
      - run: cd backend && python manage.py test --parallel
      - run: cd backend && flake8 . --max-line-length=120
      - run: cd backend && coverage run manage.py test && coverage report --fail-under=80

  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - run: cd frontend && npm ci
      - run: cd frontend && npm test -- --coverage --watchAll=false
      - run: cd frontend && npm run build

  deploy:
    needs: [backend-test, frontend-test]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # Deploy to your cloud provider (AWS/GCP/Azure/Railway)
      # - Build and push Docker images
      # - Deploy via Kubernetes/ECS/Cloud Run
```

## 6.3 Environment Configuration

```bash
# .env.example
# === Django ===
SECRET_KEY=generate-a-secure-random-key-here
DEBUG=False
ALLOWED_HOSTS=hoistcrane.com,api.hoistcrane.com

# === Database ===
DB_NAME=hoistcrane_db
DB_USER=hoistcrane_user
DB_PASSWORD=secure-password-here
DB_HOST=db
DB_PORT=5432

# === Redis ===
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/1

# === Storage ===
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=hoistcrane-media
AWS_S3_REGION_NAME=eu-west-1

# === Email ===
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key

# === Stripe ===
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# === Monitoring ===
SENTRY_DSN=https://...@sentry.io/...
```

## 6.4 Monitoring Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| **Error Tracking** | Sentry | Exception capture, performance monitoring |
| **APM** | Sentry Performance / New Relic | Request tracing, DB query analysis |
| **Logging** | Structlog → CloudWatch / ELK | Structured JSON logs |
| **Metrics** | Prometheus + Grafana | System metrics, custom business metrics |
| **Uptime** | UptimeRobot / Pingdom | External health checks |
| **Alerting** | PagerDuty / OpsGenie | On-call rotation for critical issues |

```python
# settings.py — Production logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(name)s %(levelname)s %(message)s',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'json',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django.db.backends': {'level': 'WARNING'},
        'hoistcrane': {'level': 'DEBUG', 'handlers': ['console'], 'propagate': False},
    },
}
```

## 6.5 Performance Optimization

1. **Database:**
   - Connection pooling: `django-db-connection-pool` или PgBouncer
   - Read replicas для аналитических запросов
   - `select_related` / `prefetch_related` audit (текущий код не использует)
   - Materialized views для dashboard statistics

2. **Caching:**
   ```python
   # Redis caching
   CACHES = {
       'default': {
           'BACKEND': 'django_redis.cache.RedisCache',
           'LOCATION': 'redis://redis:6379/2',
       }
   }
   # Cache dashboard stats for 5 minutes
   # Cache equipment list for 1 minute
   # Cache PDF reports for 1 hour
   ```

3. **API:**
   - ETags для conditional requests
   - Compression middleware (gzip/brotli)
   - CDN для статики и медиа (CloudFront/Cloudflare)

4. **Frontend:**
   - Code splitting с React.lazy
   - Image optimization (WebP, lazy loading)
   - Service Worker для PWA
   - Bundle analysis и tree shaking

---

# 7️⃣ AI Enhancements

## 7.1 Predictive Maintenance

**Описание:** ML-модель предсказывает вероятность отказа оборудования на основе истории инспекций, возраста, интенсивности использования.

**Реалистичная реализация:**
```python
# ai/predictive_maintenance.py
from sklearn.ensemble import GradientBoostingClassifier
import pandas as pd

class FailurePredictionModel:
    """Предсказание отказов на основе исторических данных"""
    
    def extract_features(self, equipment):
        return {
            'age_days': (date.today() - equipment.installation_date).days,
            'days_since_last_inspection': (date.today() - equipment.last_inspection_date).days,
            'total_issues': equipment.issues.count(),
            'critical_issues': equipment.issues.filter(priority='critical').count(),
            'maintenance_tasks_overdue': equipment.maintenance_tasks.filter(status='overdue').count(),
            'inspection_fail_rate': self._calc_fail_rate(equipment),
            'equipment_type_encoded': self._encode_type(equipment.equipment_type),
        }
    
    def predict_failure_risk(self, equipment) -> dict:
        features = self.extract_features(equipment)
        probability = self.model.predict_proba([list(features.values())])[0][1]
        return {
            'risk_score': round(probability * 100, 1),
            'risk_level': 'high' if probability > 0.7 else 'medium' if probability > 0.4 else 'low',
            'recommended_action': self._recommend_action(probability, features),
            'contributing_factors': self._explain_factors(features),
        }
```

**Минимальные требования:** 500+ единиц оборудования с историей инспекций ≥ 2 года.

**MVP без ML:** Rule-based scoring. Баллы за возраст, частоту проблем, просроченные инспекции → risk score.

## 7.2 Anomaly Detection

**Описание:** Автоматическое обнаружение аномалий в данных: резкий рост Issues на определённом объекте, необычные паттерны инспекций.

**Реализация:**
```python
# ai/anomaly_detection.py
from scipy import stats

class AnomalyDetector:
    def detect_issue_spike(self, company_id, window_days=30):
        """Обнаружение необычного роста проблем на объекте"""
        sites = Site.objects.filter(company_id=company_id)
        alerts = []
        for site in sites:
            recent = Issue.objects.filter(
                equipment__site=site,
                reported_date__gte=date.today() - timedelta(days=window_days)
            ).count()
            historical_avg = self._get_historical_average(site, window_days)
            if recent > historical_avg * 2.5:  # Z-score threshold
                alerts.append({
                    'site': site.name,
                    'recent_issues': recent,
                    'expected': historical_avg,
                    'severity': 'high' if recent > historical_avg * 4 else 'medium'
                })
        return alerts
```

## 7.3 Smart Equipment Search (NLP)

**Описание:** Поиск на естественном языке: "покажи все краны в Тель-Авив с просроченной инспекцией".

**Реализация:**
```python
# ai/smart_search.py
import openai

class SmartSearchService:
    def parse_query(self, natural_language_query: str) -> dict:
        """Конвертация NL запроса в API фильтры"""
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "system",
                "content": """Convert Hebrew/English equipment search query to API filters.
                Available filters: equipment_type, status, inspection_status, city, 
                site_name, manufacturer, next_inspection_date__lte, next_inspection_date__gte.
                Return JSON only."""
            }, {
                "role": "user",
                "content": natural_language_query
            }],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
```

**Стоимость:** ~$0.001 за запрос с gpt-4o-mini. При 1000 запросов/день = ~$1/день.

## 7.4 Automatic Inspection Summaries

**Описание:** Автоматическая генерация текстовых резюме после инспекции на основе чеклиста.

**Реализация:**
```python
class InspectionSummaryService:
    def generate_summary(self, inspection_report) -> str:
        checklist_data = inspection_report.data
        defects = inspection_report.defects_description
        
        prompt = f"""Generate a professional inspection summary in Hebrew:
        Equipment: {inspection_report.equipment.equipment_number}
        Type: {inspection_report.equipment.equipment_type}
        Findings: {json.dumps(checklist_data, ensure_ascii=False)}
        Defects: {defects}
        """
        
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": "You are an industrial equipment inspector."},
                      {"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
```

## 7.5 Document OCR & Data Extraction

**Описание:** Автоматическое извлечение данных из сканированных инспекционных отчётов и сертификатов.

**Реализация:** Azure Document Intelligence / Google Document AI → извлечение полей → автоматическое заполнение модели `InspectionReport`.

---

# 8️⃣ 90-Day Development Roadmap

## Phase 1 — Core Improvements (Дни 1-21)

> **Цель:** Стабилизация, безопасность, тестирование. Фундамент для дальнейшего роста.

### Неделя 1-2: Architecture Foundation

| # | Задача | Приоритет | Effort |
|---|--------|-----------|--------|
| 1 | Создать `core/` app: permissions.py, exceptions.py, mixins.py | 🔴 Critical | 2d |
| 2 | Внедрить RBAC (IsAdmin, IsManager, IsViewerReadOnly) на все ViewSets | 🔴 Critical | 2d |
| 3 | Вынести бизнес-логику из views.py в services/ (equipment, inspections) | 🟡 High | 3d |
| 4 | Добавить API-версионирование (`/api/v1/`) | 🟡 High | 1d |
| 5 | Настроить throttling (rate-limiting) | 🟡 High | 0.5d |
| 6 | Добавить `drf-spectacular` для OpenAPI-документации | 🟢 Medium | 1d |

### Неделя 3: Security & Configuration

| # | Задача | Приоритет | Effort |
|---|--------|-----------|--------|
| 7 | Секьюрити-аудит settings.py (SECRET_KEY, DEBUG, CORS, HTTPS) | 🔴 Critical | 1d |
| 8 | Добавить `.env.example` и docker-compose.yml | 🟡 High | 1d |
| 9 | Dockerfile для backend и frontend | 🟡 High | 1d |
| 10 | GitHub Actions CI: lint + test на каждый PR | 🟡 High | 1d |
| 11 | Написать тесты: models (30+), views (20+), permissions (10+) | 🟡 High | 3d |
| 12 | Добавить `select_related` / `prefetch_related` в ViewSets | 🟢 Medium | 0.5d |

**Deliverable Phase 1:** Безопасный, тестируемый, документированный API с правильным RBAC.

---

## Phase 2 — Product Features (Дни 22-50)

> **Цель:** Ключевые фичи, которые создают ценность для клиентов и дифференцируют от Excel.

### Неделя 4-5: Core Features

| # | Задача | Приоритет | Effort |
|---|--------|-----------|--------|
| 13 | Модель `ActivityLog` + middleware для аудита | 🔴 Critical | 2d |
| 14 | Equipment Timeline UI (хронология всех событий) | 🟡 High | 2d |
| 15 | Модель `Notification` + API endpoints | 🟡 High | 2d |
| 16 | Notification center в UI (bell icon → dropdown → page) | 🟡 High | 2d |
| 17 | QR Code генерация для оборудования (api + batch print) | 🟡 High | 2d |
| 18 | Equipment Photo Gallery (model + upload + lightbox) | 🟢 Medium | 2d |

### Неделя 5-7: Dashboard & UX

| # | Задача | Приоритет | Effort |
|---|--------|-----------|--------|
| 19 | Dashboard: интерактивные графики (recharts) — статусы, типы, тренды | 🟡 High | 3d |
| 20 | Dashboard: "Expiring Soon" виджет (инспекции + сертификаты) | 🟡 High | 1d |
| 21 | Saved filters / Column presets на Equipment List | 🟡 High | 2d |
| 22 | Command Palette (Cmd+K) глобальный поиск | 🟢 Medium | 2d |
| 23 | Breadcrumbs + keyboard shortcuts | 🟢 Medium | 1d |
| 24 | Mobile bottom navigation + swipe actions | 🟢 Medium | 2d |

### Неделя 7: Maintenance Module

| # | Задача | Приоритет | Effort |
|---|--------|-----------|--------|
| 25 | Модели: MaintenanceSchedule + MaintenanceTask | 🟡 High | 2d |
| 26 | Maintenance Calendar UI (планирование ТО) | 🟡 High | 3d |
| 27 | Celery + Redis: inspection reminders (email + in-app) | 🟡 High | 2d |

**Deliverable Phase 2:** Полнофункциональная платформа с аудитом, уведомлениями, QR-кодами, и preventive maintenance.

---

## Phase 3 — SaaS Infrastructure (Дни 51-70)

> **Цель:** Мультитенантность, биллинг, onboarding. Переход от single-tenant к SaaS.

### Неделя 8-9: Multi-Tenancy

| # | Задача | Приоритет | Effort |
|---|--------|-----------|--------|
| 28 | Модель `Company` (tenant) + миграция существующих данных | 🔴 Critical | 3d |
| 29 | `TenantMiddleware` + `TenantQuerySetMixin` на всех ViewSets | 🔴 Critical | 2d |
| 30 | Модель `Site` (нормализация местоположений) | 🟡 High | 2d |
| 31 | Company Settings UI (name, logo, users) | 🟡 High | 2d |
| 32 | User invitation flow (email invite → registration) | 🟡 High | 2d |

### Неделя 9-10: Billing & Onboarding

| # | Задача | Приоритет | Effort |
|---|--------|-----------|--------|
| 33 | Stripe integration (djstripe): plans, subscriptions | 🟡 High | 3d |
| 34 | Модели: Subscription, UsageRecord | 🟡 High | 1d |
| 35 | Billing UI: plan selection, payment method, invoices | 🟡 High | 3d |
| 36 | Plan enforcement middleware (лимиты equipment, users, sites) | 🟡 High | 2d |
| 37 | Signup & onboarding flow (landing → reg → first import) | 🟡 High | 3d |
| 38 | Landing page (marketing website) | 🟢 Medium | 3d |

**Deliverable Phase 3:** Работающая SaaS-платформа: регистрация → оплата → использование.

---

## Phase 4 — Enterprise Features (Дни 71-90)

> **Цель:** Конкурентные преимущества, AI, масштабирование.

### Неделя 11-12: Advanced Features

| # | Задача | Приоритет | Effort |
|---|--------|-----------|--------|
| 39 | Compliance Tracking: ComplianceRequirement, Certificate models | 🟡 High | 2d |
| 40 | Certificate expiration alerts (Celery tasks) | 🟡 High | 1d |
| 41 | Excel/PDF branded reports (company logo, colors) | 🟡 High | 2d |
| 42 | Webhook system для интеграции с внешними системами | 🟢 Medium | 2d |
| 43 | API rate limits per plan tier | 🟢 Medium | 1d |
| 44 | Data export (company-wide backup download) | 🟢 Medium | 1d |

### Неделя 12-13: AI & Intelligence

| # | Задача | Приоритет | Effort |
|---|--------|-----------|--------|
| 45 | Rule-based risk scoring для оборудования (MVP predictive maintenance) | 🟡 High | 2d |
| 46 | Anomaly detection: issue spike alerts | 🟢 Medium | 2d |
| 47 | Smart search (NLP → API filters) | 🟢 Medium | 2d |
| 48 | Auto-generated inspection summaries | 🟢 Medium | 2d |

### Неделя 13: Production Hardening

| # | Задача | Приоритет | Effort |
|---|--------|-----------|--------|
| 49 | Sentry integration (error tracking + performance) | 🔴 Critical | 1d |
| 50 | Production deployment (AWS/GCP) + CDN + SSL | 🔴 Critical | 3d |
| 51 | Monitoring: Prometheus/Grafana dashboard | 🟡 High | 2d |
| 52 | Load testing (locust) — 100 concurrent users | 🟡 High | 1d |
| 53 | Security audit: OWASP Top 10 checklist | 🔴 Critical | 2d |
| 54 | Documentation: user guide (Hebrew) + API docs | 🟢 Medium | 2d |

**Deliverable Phase 4:** Production-ready SaaS platform с AI-функциями, мониторингом, и enterprise-фичами.

---

## Итоговая архитектура после 90 дней

```
                    ┌─────────────────────────────────────┐
                    │         CloudFlare CDN               │
                    │    SSL + DDoS Protection + Cache     │
                    └──────────┬──────────────────────────┘
                               │
                    ┌──────────▼──────────────────────────┐
                    │         Nginx / ALB                   │
                    │    Load Balancer + Static Files       │
                    └──────┬──────────────────┬────────────┘
                           │                  │
              ┌────────────▼────────┐  ┌──────▼──────────┐
              │   React Frontend    │  │  Django API      │
              │   (S3 + CloudFront) │  │  (Gunicorn x4)   │
              │                     │  │  ECS / Cloud Run  │
              │   - Dashboard       │  │                   │
              │   - Equipment Mgmt  │  │  - REST API v1    │
              │   - Inspections     │  │  - JWT Auth        │
              │   - Mobile (PWA)    │  │  - RBAC            │
              │   - Command Palette │  │  - Multi-tenant    │
              └─────────────────────┘  └──────┬────────────┘
                                              │
                           ┌──────────────────┼──────────────┐
                           │                  │              │
                    ┌──────▼──────┐  ┌────────▼────┐  ┌─────▼──────┐
                    │ PostgreSQL  │  │   Redis     │  │   S3       │
                    │ RDS         │  │ ElastiCache │  │   Media    │
                    │ + Read      │  │             │  │   Storage  │
                    │   Replica   │  │ - Cache     │  │            │
                    │             │  │ - Celery    │  │            │
                    │             │  │ - Sessions  │  │            │
                    └─────────────┘  └─────────────┘  └────────────┘
                                            │
                                     ┌──────▼──────┐
                                     │  Celery     │
                                     │  Workers    │
                                     │             │
                                     │ - PDF gen   │
                                     │ - Emails    │
                                     │ - Reminders │
                                     │ - AI tasks  │
                                     │ - Imports   │
                                     └─────────────┘
                                            │
                                     ┌──────▼──────┐
                                     │  Sentry     │
                                     │  Prometheus │
                                     │  Grafana    │
                                     └─────────────┘
```

---

## KPI для отслеживания (Post-Launch)

| Метрика | Цель (3 мес) | Цель (6 мес) |
|---------|-------------|-------------|
| Зарегистрированные компании | 20 | 100 |
| Paying customers | 5 | 30 |
| MRR (Monthly Recurring Revenue) | $1,000 | $5,000 |
| Equipment units managed | 2,000 | 15,000 |
| DAU (Daily Active Users) | 50 | 200 |
| Uptime | 99.5% | 99.9% |
| API response time (p95) | < 500ms | < 300ms |
| Customer churn (monthly) | < 10% | < 5% |

---

*Документ подготовлен как стратегический план трансформации HoistCrane из single-tenant приложения в production-grade SaaS платформу для управления промышленным оборудованием.*
