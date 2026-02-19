# Quant — Платформа по работе с ВУЗами

Отдельное приложение, выделенное из Skillmap. Управление ВУЗами, договорами, мероприятиями, стажировками.

## Стек

- Next.js 16, React 19, TypeScript
- Tailwind CSS 4, shadcn/ui (Radix UI)
- Recharts, xlsx, Zod

## Запуск

```bash
npm install
npm run dev
```

Приложение доступно на http://localhost:3001

## Маршруты

- `/` — редирект на `/universities`
- `/universities` — главная страница (ВУЗы, стажировки)
- `/universities/internship/[id]` — детали стажировки

## Документация

- [docs/UNIVERSITIES-PLATFORM-BUSINESS-REQUIREMENTS.md](docs/UNIVERSITIES-PLATFORM-BUSINESS-REQUIREMENTS.md) — бизнес-требования
- [docs/UNIVERSITIES-PLATFORM-TASKS.md](docs/UNIVERSITIES-PLATFORM-TASKS.md) — план развития
