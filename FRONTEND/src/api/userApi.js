// import fetch from "node-fetch";
const API_BASE = "/api/v1/users";

export async function registerUser(formData) {
  const response = await fetch(`${API_BASE}/register`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!response.ok) throw new Error("Registration failed");
  return await response.json();
}

export async function loginUser(data) {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!response.ok) throw new Error("Login failed");
  return await response.json();
}

export async function logoutUser() {
  const response = await fetch(`${API_BASE}/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Logout failed");
  return await response.json();
}

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE}/current-user`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to get current user");
  return await response.json();
}
