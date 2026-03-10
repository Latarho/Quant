<p align="center">
  <strong>КАМПУС</strong>
</p>
<h1 align="center">
  Платформа по работе с ВУЗами
</h1>
<p align="center">
  Единая система управления вузами, договорами, мероприятиями и стажировками
</p>
<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind" />
</p>

---

## 📖 О проекте

**КАМПУС** — современная веб-платформа для комплексной работы с высшими учебными заведениями. Приложение объединяет справочник ВУЗов, управление договорами, мероприятиями, стажировками и аналитикой в едином интерфейсе.

Проект выделен из экосистемы Skillmap и развивается как самостоятельное решение.

---

## ✨ Возможности

| Раздел | Описание |
|--------|----------|
| **ВУЗы** | Справочник высших учебных заведений с фильтрами, поиском, карточками контактов, линиями сотрудничества (БКО, ЦНТР, ДРП, Экосистема), договорами и мероприятиями |
| **Стажировки** | Управление стажировками: создание, заявки студентов, оценка кандидатов, статистика и статусы |
| **Отчетность** | Сводные отчёты по вузам, договорам, мероприятиям, практикантам и стипендиатам |
| **Дэшборд** | Аналитика и визуализация данных по сотрудничеству с ВУЗами |

### Основные функции

- 🔍 **Поиск и фильтрация** — по названию, городу, региону, типу ВУЗа, линиям сотрудничества
- 📋 **Детальные карточки** — полная информация по каждому вузу: филиалы, кураторы, договоры, мероприятия
- 🤝 **Линии сотрудничества** — БКО, ЦНТР (инфраструктура, проекты, акселератор, соглашения), ДРП, Экосистема
- 📊 **Визуализация** — графики и диаграммы на базе Recharts
- 📤 **Экспорт** — выгрузка данных в Excel (xlsx)
- 🌓 **Темная тема** — переключение светлой и тёмной темы оформления

---

## 🛠 Стек технологий

| Категория | Технологии |
|-----------|-------------|
| **Фреймворк** | Next.js 16 (App Router, Turbopack) |
| **UI** | React 19, Radix UI, shadcn/ui, Tailwind CSS 4 |
| **Язык** | TypeScript 5 |
| **Графики** | Recharts |
| **Данные** | xlsx (экспорт в Excel), Zod (валидация) |
| **Иконки** | Lucide React |

---

## 📁 Структура проекта

```
quant/
├── src/
│   ├── app/                    # Страницы и маршруты
│   │   ├── layout.tsx          # Корневой layout
│   │   ├── page.tsx            # Редирект на /universities
│   │   └── universities/
│   │       ├── layout.tsx
│   │       ├── page.tsx        # Главная: ВУЗы, Стажировки, Отчетность, Дэшборд
│   │       └── internship/[id]/page.tsx  # Детали стажировки
│   ├── components/
│   │   ├── app-header.tsx      # Шапка приложения
│   │   ├── app-sidebar.tsx     # Боковая навигация
│   │   ├── aurora-background.tsx
│   │   ├── universities/       # Компоненты ВУЗов
│   │   ├── internships/        # Компоненты стажировок
│   │   └── ui/                 # UI-компоненты (shadcn)
│   ├── lib/                    # Утилиты, бизнес-логика
│   ├── types/                  # TypeScript типы
│   ├── hooks/
│   └── contexts/
├── public/
├── package.json
└── README.md
```

---

## 🚀 Быстрый старт

### Требования

- Node.js 18+
- npm, yarn или pnpm

### Установка

```bash
# Клонирование репозитория
git clone https://github.com/Latarho/Quant.git
cd Quant

# Установка зависимостей
npm install
```

### Запуск

```bash
# Режим разработки (порт 3001)
npm run dev
```

Приложение будет доступно по адресу: **http://localhost:3001**

> 💡 Запуск на порту 3000: `npx next dev -p 3000`

### Сборка для продакшена

```bash
# Сборка
npm run build

# Запуск production-сервера
npm run start
```

### Линтер

```bash
npm run lint
```

---

## 🗺 Маршруты

| URL | Описание |
|-----|----------|
| `/` | Редирект на `/universities` |
| `/universities` | Главная страница с вкладками |
| `/universities?tab=universities` | Справочник ВУЗов |
| `/universities?tab=internships` | Стажировки |
| `/universities?tab=reporting` | Отчетность |
| `/universities?tab=dashboard` | Дэшборд |
| `/universities/internship/[id]` | Детальная страница стажировки |

---

## ⌨ Горячие клавиши

| Комбинация | Действие |
|------------|----------|
| `Ctrl+B` / `Cmd+B` | Свернуть/развернуть боковую панель |

---

## 📄 Лицензия

Проект является частным (`private: true` в package.json).

---

<p align="center">
  <sub>Разработано с Next.js и React</sub>
</p>
