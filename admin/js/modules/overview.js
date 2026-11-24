import { db } from "../../../js/firebase.js";
import { collection, query, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { esc, fmt, toDate } from "../ui.js";

export default {
  id: "overview", title: "Overview", icon: "grid-1x2-fill",
  mount(root) {
    let appts = [], checks = [];
    const draw = () => {
      const today = new Date().toDateString();
      const stats = [
        ["bell-fill", appts.filter(a => a.status === "new").length, "New requests"],
        ["calendar-day", appts.filter(a => toDate(a.createdAt)?.toDateString() === today).length, "Requests today"],
        ["people-fill", appts.length, "Total appointments"],
        ["heart-pulse-fill", checks.filter(c => c.level >= 2).length, "High-risk health checks"]
      ];
      const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
      const counts = days.map(d => appts.filter(a => toDate(a.createdAt)?.toDateString() === d.toDateString()).length);
      const max = Math.max(1, ...counts);
      root.innerHTML = `
        <div class="row g-3 mb-3">${stats.map(s => `<div class="col-6 col-xl-3"><div class="card-x stat"><div class="ic"><i class="bi bi-${s[0]}"></i></div><div><b>${s[1]}</b><span>${s[2]}</span></div></div></div>`).join("")}</div>
        <div class="row g-3">
          <div class="col-lg-7"><div class="card-x"><h2 class="h6 mb-3">Appointment requests · last 7 days</h2>
            <div class="bars">${counts.map((c, i) => `<div><small>${c}</small><i style="height:${c / max * 100}%"></i>${days[i].toLocaleDateString("en-IN", { weekday: "short" })}</div>`).join("")}</div></div></div>
          <div class="col-lg-5"><div class="card-x"><div class="d-flex justify-content-between mb-2"><h2 class="h6 mb-0">Latest requests</h2><a href="#appointments" class="small">View all</a></div>
            ${appts.slice(0, 5).map(a => `<div class="d-flex justify-content-between border-top py-2 small"><span><b>${esc(a.name)}</b><br><span class="text-muted">${esc(a.concern || "General")}</span></span><span class="text-muted text-end">${fmt(a.createdAt)}</span></div>`).join("") || `<div class="empty">No requests yet</div>`}
          </div></div>
        </div>`;
    };
    draw();
    const sub = (name, set) => onSnapshot(query(collection(db, name), orderBy("createdAt", "desc"), limit(500)),
      s => { set(s.docs.map(d => ({ id: d.id, ...d.data() }))); draw(); },
      e => { root.innerHTML = `<div class="alert alert-danger">Could not load data: ${esc(e.code)}. Check firestore.rules and your admin document.</div>`; });
    const u1 = sub("appointments", v => appts = v), u2 = sub("healthChecks", v => checks = v);
    return () => { u1(); u2(); };
  }
};
