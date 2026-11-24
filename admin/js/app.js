import { auth, db, configured } from "../../js/firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import modules from "./modules/index.js";

const $ = id => document.getElementById(id), view = $("view"), side = $("side");
let cleanup = null;

if (!configured) {
  view.innerHTML = `<div class="alert alert-warning">Firebase is not configured. Paste your keys in <code>js/firebase-config.js</code> (see README.md).</div>`;
} else {
  onAuthStateChanged(auth, async user => {
    if (!user) return location.replace("login.html");
    let ok = false;
    try { ok = (await getDoc(doc(db, "admins", user.uid))).exists(); } catch (e) { ok = false; }
    if (!ok) { await signOut(auth); return location.replace("login.html?denied=1"); }
    $("who").textContent = user.email;
    start();
  });
}

$("logout").onclick = async () => { await signOut(auth); location.replace("login.html"); };
$("burger").onclick = () => side.classList.toggle("open");

function start() {
  $("nav").innerHTML = modules.map(m => `<a href="#${m.id}" data-id="${m.id}"><i class="bi bi-${m.icon}"></i>${m.title}</a>`).join("");
  addEventListener("hashchange", route); route();
}

function route() {
  const id = location.hash.slice(1) || modules[0].id;
  const m = modules.find(x => x.id === id) || modules[0];
  if (typeof cleanup === "function") cleanup();
  document.querySelectorAll("#nav a").forEach(a => a.classList.toggle("active", a.dataset.id === m.id));
  $("pageTitle").textContent = m.title;
  side.classList.remove("open");
  view.innerHTML = "";
  cleanup = m.mount(view);
}
