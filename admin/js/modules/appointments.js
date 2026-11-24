import { db } from "../../../js/firebase.js";
import { collection, query, orderBy, limit, onSnapshot, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { esc, fmt, digits, downloadCsv } from "../ui.js";

const STATUS = { new: "primary", confirmed: "success", completed: "secondary", cancelled: "danger" };

export default {
  id: "appointments", title: "Appointments", icon: "calendar2-heart-fill",
  mount(root) {
    let rows = [];
    root.innerHTML = `<div class="card-x">
      <div class="row g-2 mb-3">
        <div class="col-md-5"><input class="form-control" id="q" placeholder="Search name, phone, concern…"></div>
        <div class="col-md-3"><select class="form-select" id="st"><option value="">All statuses</option>${Object.keys(STATUS).map(s => `<option>${s}</option>`).join("")}</select></div>
        <div class="col-md-4 text-md-end"><button class="btn btn-outline-success rounded-pill" id="csv"><i class="bi bi-download me-1"></i>Export CSV</button></div>
      </div>
      <div class="table-responsive"><table class="table table-hover mb-0"><thead><tr><th>Received</th><th>Patient</th><th>Concern</th><th>Mode · Date</th><th>Status</th><th></th></tr></thead><tbody id="tb"></tbody></table></div></div>`;
    const $ = id => root.querySelector("#" + id);
    const filtered = () => {
      const q = $("q").value.toLowerCase(), st = $("st").value;
      return rows.filter(r => (!st || r.status === st) && (!q || [r.name, r.phone, r.concern, r.email].join(" ").toLowerCase().includes(q)));
    };
    const draw = () => {
      const list = filtered();
      $("tb").innerHTML = list.map(r => `<tr>
        <td class="small text-muted">${fmt(r.createdAt)}</td>
        <td><b>${esc(r.name)}</b><br><span class="small text-muted">${esc(r.phone)}${r.email ? " · " + esc(r.email) : ""}</span>${r.message ? `<br><span class="small fst-italic">“${esc(r.message)}”</span>` : ""}</td>
        <td>${esc(r.concern || "—")}</td>
        <td class="small">${esc(r.consultation)}<br>${esc(r.date || "Flexible")}</td>
        <td><select class="form-select form-select-sm text-bg-${STATUS[r.status] || "light"}" data-id="${r.id}" style="min-width:120px">${Object.keys(STATUS).map(s => `<option ${s === r.status ? "selected" : ""}>${s}</option>`).join("")}</select></td>
        <td class="text-nowrap"><a class="btn btn-sm btn-light" href="tel:${esc(r.phone)}" title="Call"><i class="bi bi-telephone"></i></a>
          <a class="btn btn-sm btn-light" target="_blank" rel="noopener" href="https://wa.me/${digits(r.phone)}" title="WhatsApp"><i class="bi bi-whatsapp text-success"></i></a>
          <button class="btn btn-sm btn-light text-danger" data-del="${r.id}" title="Delete"><i class="bi bi-trash"></i></button></td></tr>`).join("")
        || `<tr><td colspan="6" class="empty">No appointment requests found</td></tr>`;
    };
    root.addEventListener("input", e => { if (e.target.id === "q") draw(); });
    root.addEventListener("change", async e => {
      if (e.target.id === "st") return draw();
      if (e.target.dataset.id) await updateDoc(doc(db, "appointments", e.target.dataset.id), { status: e.target.value });
    });
    root.addEventListener("click", async e => {
      const b = e.target.closest("[data-del]");
      if (b && confirm("Delete this appointment request permanently?")) await deleteDoc(doc(db, "appointments", b.dataset.del));
    });
    $("csv").onclick = () => downloadCsv("appointments.csv", [["Received", "Name", "Phone", "Email", "Concern", "Mode", "Preferred date", "Status", "Message"],
      ...filtered().map(r => [fmt(r.createdAt), r.name, r.phone, r.email, r.concern, r.consultation, r.date, r.status, r.message])]);
    return onSnapshot(query(collection(db, "appointments"), orderBy("createdAt", "desc"), limit(500)),
      s => { rows = s.docs.map(d => ({ id: d.id, ...d.data() })); draw(); },
      e => { root.innerHTML = `<div class="alert alert-danger">Could not load appointments: ${esc(e.code)}</div>`; });
  }
};
