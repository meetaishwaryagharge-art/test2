// Small helpers shared by all dashboard modules.
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const toDate = t => (t?.toDate ? t.toDate() : t ? new Date(t) : null);
export const fmt = t => { const d = toDate(t); return d ? d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"; };
export const digits = p => String(p || "").replace(/\D/g, "").replace(/^0+/, "").replace(/^(\d{10})$/, "91$1");
export function downloadCsv(name, rows) {
  const txt = rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["\ufeff" + txt], { type: "text/csv" }));
  a.download = name; a.click(); URL.revokeObjectURL(a.href);
}
