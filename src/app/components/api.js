// Centralized API layer — single place to change base URL, auth header, and error handling.
const BASE_URL = ""; // relative — same Next.js app mein hai, poora URL likhne ki zarurat nahi

function getToken() {
  return localStorage.getItem("salon_token");
}

async function request(path, { method = "GET", body } = {}) {
  const token = getToken();
  const res = await fetch(BASE_URL + "/api" + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try { data = await res.json(); } catch { /* empty body, e.g. some DELETE responses */ }
  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  login: (username, password) => request("/auth/login", { method: "POST", body: { username, password } }),
  forgotPassword: (email) => request("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (token, newPassword) => request("/auth/reset-password", { method: "POST", body: { token, newPassword } }),
  register: (salonName, name, username, password, email) =>
    request("/auth/register", { method: "POST", body: { salonName, name, username, password, email } }),

  getAppointments: () => request("/appointments"),
  addAppointment: (payload) => request("/appointments", { method: "POST", body: payload }),
  updateAppointmentStatus: (id, status) => request(`/appointments/${id}`, { method: "PUT", body: { status } }),
  deleteAppointment: (id) => request(`/appointments/${id}`, { method: "DELETE" }),

  getInventory: () => request("/inventory"),
  addInventoryItem: (payload) => request("/inventory", { method: "POST", body: payload }),
  deleteInventoryItem: (id) => request(`/inventory/${id}`, { method: "DELETE" }),

  getSalaries: () => request("/salaries"),
  addSalary: (payload) => request("/salaries", { method: "POST", body: payload }),
  deleteSalary: (id) => request(`/salaries/${id}`, { method: "DELETE" }),

  getEmployees: () => request("/users"),
  addEmployee: (payload) => request("/users", { method: "POST", body: payload }),
  deleteEmployee: (id) => request(`/users/${id}`, { method: "DELETE" }),
};

export function saveSession(token, user) {
  localStorage.setItem("salon_token", token);
  localStorage.setItem("salon_user", JSON.stringify(user));
}
export function loadSession() {
  const token = getToken();
  const raw = localStorage.getItem("salon_user");
  if (!token || !raw) return null;
  try { return { token, user: JSON.parse(raw) }; } catch { return null; }
}
export function clearSession() {
  localStorage.removeItem("salon_token");
  localStorage.removeItem("salon_user");
}