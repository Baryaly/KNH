// Utility helpers (attached to window for easy access)

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatPhone(phone) {
  // Simple formatting for US-style numbers
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length !== 10) return phone;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

window.utils = {
  clamp,
  formatPhone,
};
