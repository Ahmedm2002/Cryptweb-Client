import { api } from "./api";

export async function searchUsers(query, excludeFriends = false) {
  const params = new URLSearchParams({ q: query });
  if (excludeFriends) params.set("excludeFriends", "true");
  return api.get(`/users/search?${params}`);
}

export async function checkUsername(username) {
  return api.get(`/users/check-username?username=${encodeURIComponent(username)}`);
}

export async function updateSettings(saveMessagesDefault, applyToAllConversations = false) {
  return api.patch("/users/me/settings", { saveMessagesDefault, applyToAllConversations });
}
