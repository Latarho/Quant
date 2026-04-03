import type { ProforientationApplication } from "./types";

/** При первом запуске без localStorage демо-заявок нет — список пустой. */
export function getSeedProforientationApplications(): ProforientationApplication[] {
  return [];
}
