import type { ProforientationApplication } from "./types";
import { formatDateTimeShortRu } from "@/lib/date-utils";

/** Открывает окно печати: пользователь может сохранить как PDF (Chrome: «Сохранить как PDF»). */
export function openResultsPrintWindow(app: ProforientationApplication): void {
  if (typeof window === "undefined" || !app.result) return;

  const r = app.result;
  const recHtml = r.recommendations
    .map(
      (x, i) => `
    <tr>
      <td style="padding:8px;border:1px solid #ccc;">${i + 1}</td>
      <td style="padding:8px;border:1px solid #ccc;"><strong>${x.universityShortName}</strong><br/><span style="font-size:12px;color:#555;">${x.universityName}</span></td>
      <td style="padding:8px;border:1px solid #ccc;">${x.fitScore}</td>
      <td style="padding:8px;border:1px solid #ccc;">${x.reason}</td>
    </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8"/>
  <title>Результаты профориентации — ${app.childFullName}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; max-width: 800px; margin: 0 auto; color: #111; }
    h1 { font-size: 20px; }
    h2 { font-size: 16px; margin-top: 24px; }
    .meta { color: #555; font-size: 14px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #f4f4f5; text-align: left; padding: 8px; border: 1px solid #ccc; }
    @media print { body { padding: 12px; } }
  </style>
</head>
<body>
  <h1>Результаты профессиональной ориентации</h1>
  <div class="meta">
    Участник тестирования: <strong>${app.childFullName}</strong><br/>
    Заявка № ${app.id.slice(0, 8)}… · дата завершения: ${formatDateTimeShortRu(r.completedAt)}
  </div>
  <h2>Профиль (баллы 0–100)</h2>
  <p>Аналитика: ${r.scores.analytical} · Техника/ИТ: ${r.scores.technical} · Коммуникации: ${r.scores.social} · Творчество: ${r.scores.creative}</p>
  <h2>Заключение</h2>
  <p>${r.summary.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
  <h2>Рекомендуемые вузы (по данным платформы)</h2>
  <table>
    <thead>
      <tr>
        <th>№</th>
        <th>ВУЗ</th>
        <th>Соответствие</th>
        <th>Обоснование</th>
      </tr>
    </thead>
    <tbody>${recHtml}</tbody>
  </table>
  <p style="margin-top:24px;font-size:12px;color:#888;">Документ сформирован в ППРСВУЗ. Для сохранения в PDF используйте печать браузера → «Сохранить как PDF».</p>
</body>
</html>`;

  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => {
    w.print();
  }, 250);
}
