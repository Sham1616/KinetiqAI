const API_BASE_URL = "http://localhost:5000/api";

const api = async (path, opts = {}) => {
  const res = await fetch(API_BASE_URL + path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
};

export default api;
