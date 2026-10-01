import { SITE_CONFIG } from "./config.js";
import { buildWhatsAppMessage } from "./whatsapp.js";

const hero = document.querySelector("[data-hero]");
const stateButtons = [...document.querySelectorAll("[data-state-button]")];
const stateCopies = [...document.querySelectorAll(".state-copy")];
const shell = document.querySelector("[data-reservation-shell]");
const panel = document.querySelector("[data-reservation-panel]");
const form = document.querySelector("[data-reservation-form]");
const eventType = document.querySelector("[data-event-type]");
const otherField = document.querySelector("[data-other-field]");
const dateInput = document.querySelector("#event-date");
const menuButton = document.querySelector("[data-menu-button]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let currentState = "reservation", transitioning = false, lastFocus = null, touchStartY = null, wheelTotal = 0, wheelTimer;

const localDate = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

function setHeroState(next, focusTab = false) {
  if (next === currentState || transitioning) return;
  transitioning = true;
  hero.dataset.previousState = currentState;
  hero.dataset.state = next;
  hero.classList.add("is-transitioning");
  currentState = next;
  stateButtons.forEach((button) => {
    const active = button.dataset.stateButton === next;
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
    if (active && focusTab) button.focus();
  });
  stateCopies.forEach((copy) => copy.setAttribute("aria-hidden", String(!copy.classList.contains(`state-copy--${next}`))));
  document.querySelector("#panel-reservation").hidden = next !== "reservation";
  document.querySelector("#panel-discover").hidden = next !== "discover";
  setTimeout(() => { hero.classList.remove("is-transitioning"); delete hero.dataset.previousState; transitioning = false; }, reducedMotion.matches ? 350 : 920);
}

stateButtons.forEach((button) => {
  button.addEventListener("click", () => setHeroState(button.dataset.stateButton));
  button.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    setHeroState(event.key === "ArrowLeft" || event.key === "Home" ? "reservation" : "discover", true);
  });
});

hero.addEventListener("wheel", (event) => {
  if (transitioning || Math.abs(event.deltaY) < 4) return;
  wheelTotal += event.deltaY;
  clearTimeout(wheelTimer);
  wheelTimer = setTimeout(() => { wheelTotal = 0; }, 180);
  if (wheelTotal > 75 && currentState === "reservation") { event.preventDefault(); wheelTotal = 0; setHeroState("discover"); }
  else if (wheelTotal < -75 && currentState === "discover" && scrollY < 150) { event.preventDefault(); wheelTotal = 0; setHeroState("reservation"); }
}, { passive: false });

hero.addEventListener("touchstart", (event) => { touchStartY = event.changedTouches[0].clientY; }, { passive: true });
hero.addEventListener("touchend", (event) => {
  if (touchStartY === null || transitioning) return;
  const distance = touchStartY - event.changedTouches[0].clientY;
  touchStartY = null;
  if (distance > 55 && currentState === "reservation") setHeroState("discover");
  if (distance < -55 && currentState === "discover" && scrollY < 80) setHeroState("reservation");
}, { passive: true });

hero.addEventListener("pointermove", (event) => {
  if (reducedMotion.matches || event.pointerType === "touch") return;
  const rect = hero.getBoundingClientRect();
  hero.style.setProperty("--pointer-x", `${(((event.clientX - rect.left) / rect.width) - .5) * 10}px`);
  hero.style.setProperty("--pointer-y", `${(((event.clientY - rect.top) / rect.height) - .5) * 8}px`);
});

function openReservation(trigger) {
  lastFocus = trigger || document.activeElement;
  shell.setAttribute("aria-hidden", "false");
  document.body.classList.add("panel-open");
  requestAnimationFrame(() => panel.focus());
}
function closeReservation() {
  shell.setAttribute("aria-hidden", "true");
  document.body.classList.remove("panel-open");
  lastFocus?.focus();
}
document.querySelectorAll("[data-open-reservation]").forEach((button) => button.addEventListener("click", () => openReservation(button)));
document.querySelectorAll("[data-close-reservation]").forEach((button) => button.addEventListener("click", closeReservation));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && shell.getAttribute("aria-hidden") === "false") closeReservation();
  if (event.key !== "Tab" || shell.getAttribute("aria-hidden") === "true") return;
  const focusables = [...panel.querySelectorAll("button, input, select, [href], [tabindex]:not([tabindex='-1'])")].filter((el) => !el.disabled && !el.hidden);
  const first = focusables[0], last = focusables.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

menuButton.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!expanded));
  mobileMenu.hidden = expanded;
});
mobileMenu.addEventListener("click", () => { mobileMenu.hidden = true; menuButton.setAttribute("aria-expanded", "false"); });

dateInput.min = localDate();
SITE_CONFIG.schedules.forEach((schedule, index) => {
  const label = document.createElement("label");
  label.className = "radio-card";
  label.innerHTML = `<input type="radio" name="schedule" value="${schedule.id}" ${index === 0 ? "checked" : ""}><span><strong>${schedule.label}</strong><small>${schedule.hours}</small></span>`;
  document.querySelector("[data-schedule-options]").append(label);
});
SITE_CONFIG.eventTypes.forEach((type) => { const option = document.createElement("option"); option.value = type; option.textContent = type; eventType.append(option); });
eventType.addEventListener("change", () => {
  const other = eventType.value === "Otro";
  otherField.hidden = !other;
  document.querySelector("#event-other").required = other;
});

const setError = (name, message = "") => { const error = document.querySelector(`[data-error-for="${name}"]`); if (error) error.textContent = message; };

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  let valid = true;
  [["date", data.date, "Selecciona una fecha."], ["schedule", data.schedule, "Selecciona un horario."], ["eventType", data.eventType, "Selecciona el tipo de evento."]].forEach(([name, value, message]) => { const invalid = !value; setError(name, invalid ? message : ""); valid = valid && !invalid; });
  const otherMissing = data.eventType === "Otro" && !data.otherEvent?.trim();
  setError("otherEvent", otherMissing ? "Describe brevemente el evento." : ""); valid = valid && !otherMissing;
  if (!valid) return;
  const status = document.querySelector("[data-form-status]");
  if (!SITE_CONFIG.whatsappNumber) { status.textContent = "Falta configurar el número de WhatsApp de JUMP antes de publicar."; return; }
  status.textContent = "";
  const url = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(buildWhatsAppMessage(data))}`;
  window.open(url, "_blank", "noopener,noreferrer");
});
