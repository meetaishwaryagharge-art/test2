// GA4 / Google Tag Manager style conversion events (see SEO audit, section 9).
// Set GA_ID to "" to switch tracking off. Events are also pushed to window.dataLayer, so GTM can use them.
(function () {
  var GA_ID = "G-T1M2M4Q84N";   // GA4 measurement id from js/firebase-config.js

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { dataLayer.push(arguments); };
  if (GA_ID) {
    var s = document.createElement("script");
    s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
    gtag("js", new Date());
    gtag("config", GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
  }

  function track(name, params) { try { gtag("event", name, params || {}); } catch (e) {} }
  window.dkTrack = track;
  function where(el) { var sec = el.closest && el.closest("[id]"); return (sec && sec.id) || "page"; }

  // Phone, WhatsApp and Google Maps links
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var h = a.getAttribute("href") || "";
    if (h.indexOf("tel:") === 0) track("click_to_call", { location: where(a) });
    else if (h.indexOf("wa.me") > -1) track("whatsapp_click", { location: where(a) });
    else if (h.indexOf("google.com/maps") > -1) track("google_maps_click", { location: where(a) });
  });

  // Appointment form: first interaction, and Video Consultation chosen
  ["appointmentForm", "consultForm"].forEach(function (id) {
    var f = document.getElementById(id);
    if (!f) return;
    var started = false;
    f.addEventListener("focusin", function () { if (!started) { started = true; track("appointment_form_start", { form: id }); } });
    f.addEventListener("change", function (e) {
      if (e.target && e.target.name === "consultation" && /video/i.test(e.target.value)) track("video_consultation_select", { form: id });
    });
  });
  // appointment_form_submit is sent by index.html after the enquiry is saved successfully.
})();
