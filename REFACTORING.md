# План рефакторинга проекта Quant

## ✅ Выполнено (2026-02-20)

- **Фаза 2:** Удалены неиспользуемые UI-компоненты (table-pagination, toast, breadcrumb, alert)
- **Фаза 1:** Вынесены константы в `lib/universities/constants.ts`, утилиты в `lib/format-utils.ts`, `lib/universities/university-utils.ts`
- **Фаза 1:** Интеграция в page.tsx — импорт constants, format-utils, university-utils, date-utils
- **Фаза 4:** university-dashboard и university-reporting используют типы из `@/types/universities`

## ✅ Дополнительно выполнено (2026-02-20)

- **InternshipsTab** — вынесена вкладка «Стажировки» в `components/universities/internships-tab.tsx` (~270 строк)
- **display-utils** — `lib/internships/display-utils.ts`: `getInternshipStatusText`, `getInternshipStatusColor`
- **UniversityListPanel** — левая колонка со списком ВУЗов в `components/universities/university-list-panel.tsx` (~140 строк)
- **getCooperationLineLabel** — вынесена в `lib/universities/constants.ts`, убрано дублирование в page.tsx и university-reporting.tsx

## ⏳ Отложено

- **Вынос mockUniversities** — объём ~1900 строк с динамическими IIFE, требуется отдельная задача (частично вынесено)
- **Фаза 3 (разбиение page.tsx)** — остаётся ~19200 строк (university-detail-tabs, личные кабинеты, хуки состояния)

---

# План рефакторинга проекта Quant (оригинал)

## Сводка

| Метрика | Значение |
|---------|----------|
| Размер `universities/page.tsx` | ~21 655 строк |
| `useState` в page.tsx | ~110 |
| Обработчиков `handle*` | ~76 |
| Моковые данные в page.tsx | ~1 900 строк |
| Неиспользуемых UI-компонентов | 4 |

---

## 1. Лишние / неиспользуемые файлы

| Файл | Действие | Причина |
|------|----------|---------|
| `src/components/ui/table-pagination.tsx` | **Удалить** | Нигде не импортируется |
| `src/components/ui/toast.tsx` | **Удалить** | Нигде не импортируется |
| `src/components/ui/breadcrumb.tsx` | **Удалить** | Используется только `breadcrumb-context`, сам компонент не задействован |
| `src/components/ui/alert.tsx` | **Удалить** | В проекте используется `alert-dialog.tsx`, `alert.tsx` не импортируется |

---

## 2. Дублирование кода

### 2.1. Форматирование дат

В `page.tsx` — более 30 локальных функций `formatDate` / `formatDateToDDMMYYYY`.  
В `src/lib/date-utils.ts` уже есть:
- `formatDate`
- `formatDateObject`
- `formatDateToDDMMYYYY`
- `formatDateOrDefault`

**Действие:** заменить все локальные вызовы на импорты из `@/lib/date-utils`.

### 2.2. Локальные типы

В `university-dashboard.tsx` и `university-reporting.tsx` объявлены локальные типы (`Contract`, `Event`, `Intern`, `Practitioner`), хотя аналогичные типы есть в `@/types/universities` и `@/types/internships`.

**Действие:** убрать дублирование и использовать централизованные типы.

### 2.3. Фильтры мероприятий

В `page.tsx` несколько раз повторяется похожая логика:
- `eventsFeedFilters`
- `drpEventsFeedFilters`
- `ecosystemEventsFeedFilters`
- `cntrEventsFeedFilters`

**Действие:** выделить хук `useEventFeedFilters()` и переиспользовать.

### 2.4. Пагинация

Пагинация реализована вручную в нескольких местах. Компонент `TablePagination` существует, но не используется.

**Действие:** либо использовать `TablePagination`, либо удалить, если пагинация будет переработана позже.

---

## 3. Структура декомпозиции `universities/page.tsx`

### Этап 1: Вынос данных и констант

| Файл | Содержимое |
|------|------------|
| `src/lib/universities/mock-universities.ts` | ~1 900 строк моковых данных ВУЗов |
| `src/lib/universities/constants.ts` | `availableBranches`, `cooperationLines`, `responsiblePersons` и др. |

### Этап 2: Вынос утилит

| Файл | Содержимое |
|------|------------|
| `src/lib/format-utils.ts` | `validateDates`, `getInitials`, `validateEmail`, `validateURL` |
| Использовать `@/lib/date-utils` | Заменить все локальные `formatDate` |

### Этап 3: Компоненты вкладок

| Компонент | Описание | Строк (прибл.) |
|-----------|----------|----------------|
| `university-list-tab.tsx` | Поиск, фильтры, список ВУЗов | ~5 000 |
| `internships-tab.tsx` | Вкладка «Стажировки» | ~1 900 |
| `university-detail-tabs.tsx` | Оболочка детальной карточки ВУЗа | — |

### Этап 4: Подвкладки детальной карточки

| Компонент | Описание |
|-----------|----------|
| `university-detail-general.tsx` | Общая информация |
| `university-detail-contracts.tsx` | Договоры |
| `university-detail-kaleidoscope.tsx` | Калейдоскоп |
| `university-detail-events-feed.tsx` | Лента мероприятий |

### Этап 5: Личные кабинеты

| Компонент | Описание |
|-----------|----------|
| `cabinets/bko-cabinet.tsx` | Личный кабинет БКО |
| `cabinets/cntr-cabinet.tsx` | Личный кабинет ЦНТР |
| `cabinets/drp-cabinet.tsx` | Личный кабинет ДРП |
| `cabinets/ecosystem-cabinet.tsx` | Личный кабинет Экосистема |

### Этап 6: Хуки состояния

| Хук | Назначение |
|-----|------------|
| `use-university-detail-state.ts` | Состояние детальной карточки ВУЗа |
| `use-event-feed-filters.ts` | Фильтры мероприятий |

---

## 4. Рекомендуемый порядок работ

1. **Фаза 1 — Подготовка**
   - Вынести `mockUniversities` в `lib/universities/mock-universities.ts`
   - Вынести константы в `lib/universities/constants.ts`
   - Унифицировать форматирование дат через `date-utils.ts`

2. **Фаза 2 — Удаление**
   - Удалить неиспользуемые UI-компоненты: `table-pagination`, `toast`, `breadcrumb`, `alert`
   - Удалить неиспользуемые экспорты из `date-utils.ts`

3. **Фаза 3 — Декомпозиция page.tsx**
   - Вынести `university-list-tab.tsx`
   - Вынести `internships-tab.tsx`
   - Вынести `university-detail-tabs.tsx` и подвкладки
   - Вынести компоненты личных кабинетов
   - Вынести хуки состояния

4. **Фаза 4 — Типы**
   - Привести `university-dashboard.tsx` и `university-reporting.tsx` к использованию типов из `@/types/*`

---

## 5. Риски

- **Высокий:** разделение `page.tsx` — много состояний и связей, возможны регрессии.
- **Средний:** удаление UI-компонентов — убедиться, что они точно не планируются.
- **Низкий:** вынос данных, констант и утилит — минимальные риски.

---

## 6. Оценка трудозатрат

| Фаза | Оценка |
|------|--------|
| Фаза 1 | 2–4 часа |
| Фаза 2 | 0.5–1 час |
| Фаза 3 | 2–4 дня |
| Фаза 4 | 1–2 часа |
