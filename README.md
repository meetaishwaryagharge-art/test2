# Dr. Smita Karpe – Website + Firebase Dashboard

## File structure
```
index.html              Landing page (consult + journey popups)
journy.html             Heart & Lifestyle Health Check (opens in popup)
Code.gs                 Old Google Sheet backend (optional, keep PRIVATE)
firebase.json           Hosting + Firestore settings
firestore.rules         Security rules (visitors create only, admins read)
.firebaserc             Your Firebase project id
js/
  firebase-config.js    <-- PASTE YOUR FIREBASE KEYS HERE (only file you edit)
  firebase.js           Starts Firebase (shared by site + dashboard)
  site-save.js          Saves appointments + health checks to Firestore
admin/
  login.html            Staff login
  index.html            Dashboard shell (sidebar, topbar)
  css/admin.css         Dashboard design
  js/app.js             Auth guard + router
  js/ui.js              Shared helpers (escape, dates, CSV)
  js/modules/           One file per dashboard section
    index.js            Module registry
    overview.js · appointments.js · healthchecks.js
```

## Setup (about 10 minutes)
1. **Create project:** https://console.firebase.google.com > Add project.
2. **Web app:** Project settings > Your apps > `</>` > register. Copy the config into `js/firebase-config.js`.
3. **Authentication:** Build > Authentication > Get started > enable **Email/Password**. Under Users, **Add user** (your clinic email + password).
4. **Firestore:** Build > Firestore Database > Create database (production mode, region `asia-south1` Mumbai).
5. **Make yourself admin:** In Firestore create collection `admins`, with **Document ID = your user's UID** (copy it from Authentication > Users). Add any field, e.g. `role: "admin"`.
6. **Rules + hosting:**
   ```
   npm i -g firebase-tools
   firebase login
   # put your project id in .firebaserc, then:
   firebase deploy
   ```
   (or paste `firestore.rules` into Firestore > Rules > Publish).
7. **Authorised domains:** Authentication > Settings > Authorised domains – add your own domain if you host elsewhere.
8. Open `https://YOUR-SITE/admin/login.html`.

> Pages use ES modules, so open them through a web server (Firebase Hosting, or `npx serve .` locally), not by double-clicking.

## Add a new dashboard module
Create `admin/js/modules/patients.js` exporting `{ id, title, icon, mount(root) }`, then add it to `modules/index.js`. The sidebar and routing update automatically. Add matching rules to `firestore.rules`.

## Security notes
- Staff access = a user in Authentication **and** a document in `admins/<uid>`. Anyone else is signed out.
- Visitors can only create appointments/health checks with validated fields; they cannot read anything.
- Change the old `ADMIN_PASS` in `Code.gs` if you keep using it.

## SEO / AEO work (from the Madhavbaug Airoli audit, 24 Nov 2026)
Done in code: new title, meta description and H1; one H1 with logical H2/H3 headings; "Clinic at a glance" bar; core
consultations (diabetes, heart & BP, weight, Panchakarma) ahead of other concerns; consultation-process section; Panchakarma
precautions; 15 direct-answer FAQs (page + FAQPage JSON-LD from the same text); MedicalClinic + IndividualPhysician + WebPage
JSON-LD; Open Graph / Twitter tags; canonical; robots.txt; sitemap.xml; descriptive image file names; map embed; privacy note and
"enquiry, not a confirmed appointment" wording on both forms; single CTA "Request an Appointment"; GA4 events
(click_to_call, whatsapp_click, appointment_form_start, appointment_form_submit, google_maps_click, video_consultation_select)
in `js/analytics.js` (set `GA_ID` to "" to turn tracking off). Counters now contain real numbers in the HTML (no "0+").
Patient stories (incl. the HbA1c claim) and the "4.8/5" badge are removed from the live page; stories are kept in an HTML comment.

### Before going live (owner must do)
1. **Set the real domain.** Replace `https://YOUR-DOMAIN.com` in `index.html` (canonical, og:, JSON-LD), `robots.txt` and `sitemap.xml`:
   `grep -rl "YOUR-DOMAIN.com" . | xargs sed -i 's#https://YOUR-DOMAIN.com#https://www.your-real-domain.in#g'`
2. Confirm the figures: 10+ years, 500+ treatments, 1000+ patients. Edit `data-to` and the text in the hero stats and "10+" in About/Why.
3. Confirm credentials (B.A.M.S., F.I.P.C.) and add registration details in the About section (see the TODO comment).
4. Get the patient stories reviewed for medical advertising rules before restoring them.
5. Add `geo` coordinates to the MedicalClinic JSON-LD once the Google Business Profile location is confirmed; make sure name, address and phone match the Business Profile exactly.
6. Verify the site in Search Console, submit `sitemap.xml`, and test Core Web Vitals.
