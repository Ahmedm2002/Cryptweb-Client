import { api } from "./api";

export async function listConversations() {
  return api.get("/conversations");
}

export async function getMessages(conversationId, limit = 50, before) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (before) params.set("before", before);
  return api.get(`/conversations/${conversationId}/messages?${params}`);
}

export async function setConversationPreference(conversationId, saveMessages) {
  return api.patch(`/conversations/${conversationId}/preferences`, { saveMessages });
}
