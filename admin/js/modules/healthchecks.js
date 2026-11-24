import { db } from "../../../js/firebase.js";
import { collection, query, orderBy, limit, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { esc, fmt, digits, downloadCsv } from "../ui.js";

const LEVEL = [["Low risk", "success"], ["Moderate risk", "warning"], ["High risk", "danger"], ["Very high risk", "dark"]];

export default {
  id: "healthchecks", title: "Health Checks", icon: "heart-pulse-fill",
  mount(root) {
    let rows = [];
    root.innerHTML = `<div class="card-x">
      <div class="row g-2 mb-3">
        <div class="col-md-5"><input class="form-control" id="q" placeholder="Search name or phone…"></div>
        <div class="col-md-3"><select class="form-select" id="lv"><option value="">All risk levels</option>${LEVEL.map((l, i) => `<option value="${i}">${l[0]}</option>`).join("")}</select></div>
        <div class="col-md-4 text-md-end"><button class="btn btn-outline-success rounded-pill" id="csv"><i class="bi bi-download me-1"></i>Export CSV</button></div>
      </div>
      <div class="table-responsive"><table class="table table-hover mb-0"><thead><tr><th>Date</th><th>Name</th><th>Age · Sex</th><th>BMI · Waist</th><th>Score</th><th>Risk</th><th></th></tr></thead><tbody id="tb"></tbody></table></div></div>`;
    const $ = id => root.querySelector("#" + id);
    const filtered = () => {
      const q = $("q").value.toLowerCase(), lv = $("lv").value;
      return rows.filter(r => (lv === "" || String(r.level) === lv) && (!q || (r.name + " " + r.phone).toLowerCase().includes(q)));
    };
    const draw = () => {
      $("tb").innerHTML = filtered().map(r => { const l = LEVEL[r.level] || LEVEL[0]; return `<tr>
        <td class="small text-muted">${fmt(r.createdAt)}</td>
        <td><b>${esc(r.name)}</b>${r.flag ? ` <i class="bi bi-exclamation-triangle-fill text-danger" title="Chest symptom flagged"></i>` : ""}<br><span class="small text-muted">${esc(r.phone || "—")}</span></td>
        <td>${esc(r.age)} · ${esc(r.sex)}</td><td>${esc(r.bmi)} · ${esc(r.waist)} cm</td><td><b>${esc(r.score)}</b></td>
        <td><span class="badge text-bg-${l[1]}">${l[0]}</span></td>
        <td class="text-nowrap">${r.phone ? `<a class="btn btn-sm btn-light" target="_blank" rel="noopener" href="https://wa.me/${digits(r.phone)}"><i class="bi bi-whatsapp text-success"></i></a>` : ""}
          <button class="btn btn-sm btn-light text-danger" data-del="${r.id}"><i class="bi bi-trash"></i></button></td></tr>`; }).join("")
        || `<tr><td colspan="7" class="empty">No health checks found</td></tr>`;
    };
    root.addEventListener("input", e => { if (e.target.id === "q") draw(); });
    root.addEventListener("change", e => { if (e.target.id === "lv") draw(); });
    root.addEventListener("click", async e => {
      const b = e.target.closest("[data-del]");
      if (b && confirm("Delete this health check record permanently?")) await deleteDoc(doc(db, "healthChecks", b.dataset.del));
    });
    $("csv").onclick = () => downloadCsv("health-checks.csv", [["Date", "Name", "Phone", "Age", "Sex", "BMI", "Waist cm", "Score", "Risk", "Chest flag"],
      ...filtered().map(r => [fmt(r.createdAt), r.name, r.phone, r.age, r.sex, r.bmi, r.waist, r.score, (LEVEL[r.level] || LEVEL[0])[0], r.flag ? "yes" : "no"])]);
    return onSnapshot(query(collection(db, "healthChecks"), orderBy("createdAt", "desc"), limit(500)),
      s => { rows = s.docs.map(d => ({ id: d.id, ...d.data() })); draw(); },
      e => { root.innerHTML = `<div class="alert alert-danger">Could not load health checks: ${esc(e.code)}</div>`; });
  }
};
