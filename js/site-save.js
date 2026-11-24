// Website -> Firestore. Public visitors can only CREATE these documents (see firestore.rules).
import { db, configured } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const t = (v, n) => String(v ?? "").trim().slice(0, n);
const n = (v, d = 0) => (isFinite(Number(v)) ? Number(v) : d);

// Firestore keeps a write "pending" forever if the database/rules/network are not ready, so give up after 15s.
const withTimeout = (p) => Promise.race([
  p,
  new Promise((_, rej) => setTimeout(() => rej(Object.assign(new Error("timeout"), { code: "timeout" })), 15000))
]);

window.dkSaveAppointment = async (d) => {
  if (!configured) throw new Error("Firebase is not configured");
  await withTimeout(addDoc(collection(db, "appointments"), {
    name: t(d.name, 100), phone: t(d.phone, 20), email: t(d.email, 120), date: t(d.date, 10),
    concern: t(d.concern, 80), consultation: t(d.consultation, 40), message: t(d.message, 1000),
    status: "new", createdAt: serverTimestamp()
  }));
};

const num = (v) => (v === undefined || v === null || v === "" || !isFinite(Number(v)) ? null : Number(v));
const arr = (v) => (Array.isArray(v) ? v.map(Number).filter(isFinite).slice(0, 20) : []);

window.dkSaveHealthCheck = async (r) => {
  if (!configured) throw new Error("Firebase is not configured");
  const a = r.answers || {};
  await withTimeout(addDoc(collection(db, "healthChecks"), {
    name: t(r.name, 100), age: n(r.age), sex: t(r.sex, 10), phone: t(r.phone, 20),
    score: n(r.score), level: n(r.level), bmi: n(r.bmi), waist: n(r.waist),
    flag: !!r.flag, lang: t(r.lang, 5),
    answers: {
      height: n(a.height), weight: n(a.weight), activity: num(a.activity), veg: num(a.veg), fried: num(a.fried),
      tobacco: num(a.tobacco), alcohol: num(a.alcohol), sleep: num(a.sleep), stress: num(a.stress), family: num(a.family),
      cond: arr(a.cond), sym: arr(a.sym)
    },
    createdAt: serverTimestamp()
  }));
};
