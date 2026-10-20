import { getDashboardMetrics } from "./repository";

export async function getMetrics() {
  return getDashboardMetrics();
}