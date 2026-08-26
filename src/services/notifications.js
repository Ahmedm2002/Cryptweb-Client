import { api } from "./api";

export async function listNotifications(unreadOnly = false) {
  const params = unreadOnly ? "?unreadOnly=true" : "";
  return api.get(`/notifications${params}`);
}

export async function markNotificationRead(notificationId) {
  return api.patch(`/notifications/${notificationId}/read`);
}

export async function markAllNotificationsRead() {
  return api.patch("/notifications/read-all");
}
