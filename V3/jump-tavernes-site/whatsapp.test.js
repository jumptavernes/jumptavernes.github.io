import test from "node:test";
import assert from "node:assert/strict";
import { WHATSAPP_NUMBER } from "./config.js";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "./whatsapp.js";

test("genera la solicitud completa", () => {
  const message = buildWhatsAppMessage({ date: "2026-10-17", schedule: "afternoon", eventType: "Cumpleaños", people: "25" });
  assert.equal(message, [
    "👋 Hola! quiero solicitar una reserva en JUMP Tavernes.",
    "",
    "📅 Fecha: 17/10/2026",
    "🕒 Horario: Tarde (17:00–22:00)",
    "🎉 Tipo de evento: Cumpleaños",
    "👥 Personas: 25",
    "",
    "¿Podéis confirmarme si está disponible? 😊"
  ].join("\n"));
});

test("omite personas e incluye la descripción de Otro", () => {
  const message = buildWhatsAppMessage({ date: "2026-11-02", schedule: "full-day", eventType: "Otro", otherEvent: "Reunión de amigos" });
  assert.doesNotMatch(message, /Personas:/);
  assert.match(message, /Tipo de evento: Otro — Reunión de amigos/);
});

test("genera una URL de wa.me con número y mensaje codificados", () => {
  const data = { date: "2026-10-17", schedule: "morning", eventType: "Baby shower", people: "" };
  const url = buildWhatsAppUrl(data);
  const parsed = new URL(url);
  assert.equal(WHATSAPP_NUMBER, "34658276396");
  assert.equal(parsed.origin + parsed.pathname, `https://wa.me/${WHATSAPP_NUMBER}`);
  assert.equal(parsed.searchParams.get("text"), buildWhatsAppMessage(data));
});
