import { api } from "./api";

export async function sendFriendRequest(receiverUsername) {
  return api.post("/friends/requests", { receiverUsername });
}

export async function listFriendRequests(direction, status) {
  const params = new URLSearchParams({ direction });
  if (status) params.set("status", status);
  return api.get(`/friends/requests?${params}`);
}

export async function acceptFriendRequest(requestId) {
  return api.post(`/friends/requests/${requestId}/accept`);
}

export async function declineFriendRequest(requestId) {
  return api.post(`/friends/requests/${requestId}/decline`);
}

export async function cancelFriendRequest(requestId) {
  return api.delete(`/friends/requests/${requestId}`);
}

export async function listFriends() {
  return api.get("/friends");
}

export async function unfriend(friendshipId) {
  return api.delete(`/friends/${friendshipId}`);
}
