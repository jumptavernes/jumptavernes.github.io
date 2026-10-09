import test from "node:test";
import assert from "node:assert/strict";
import { WHATSAPP_NUMBER } from "./config.js";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "./whatsapp.js";

test("genera la solicitud completa", () => {
  const message = buildWhatsAppMessage({ date: "2026-10-17", schedule: "afternoon", eventType: "Cumpleaños", people: "25" });
  assert.equal(message, [
    "👋 Hola, quiero solicitar una reserva en JUMP Tavernes.",
    "",
    "📅 Fecha: 17/10/2026",
    "🕒 Horario: Tarde (17:00–22:00)",
    "🎉 Tipo de evento: Cumpleaños",
    "👥 Personas: 25",
    "",
    "¿Podéis confirmarme si está disponible? 🙂"
  ].join("\n"));
  assert.doesNotMatch(message, /�|&#\d+;|&#x[\da-f]+;|&[a-z]+;/i);
});

test("omite personas e incluye la descripción de Otro", () => {
  const message = buildWhatsAppMessage({ date: "2026-11-02", schedule: "full-day", eventType: "Otro", otherEvent: "Reunión de amigos" });
  assert.doesNotMatch(message, /Personas:/);
  assert.match(message, /Tipo de evento: Otro — Reunión de amigos/);
});

test("genera una URL directa de WhatsApp con número y mensaje codificados", () => {
  const data = { date: "2026-10-17", schedule: "morning", eventType: "Baby shower", people: "" };
  const url = buildWhatsAppUrl(data);
  const parsed = new URL(url);
  assert.equal(WHATSAPP_NUMBER, "34658276396");
  assert.equal(parsed.origin + parsed.pathname, "https://api.whatsapp.com/send");
  assert.equal(parsed.searchParams.get("phone"), WHATSAPP_NUMBER);
  assert.equal(parsed.searchParams.get("text"), buildWhatsAppMessage(data));
});

test("codifica una sola vez el mensaje UTF-8 completo y conserva los emojis", () => {
  const data = { date: "2026-10-17", schedule: "afternoon", eventType: "Cumpleaños", people: "25" };
  const message = buildWhatsAppMessage(data);
  const url = buildWhatsAppUrl(data);
  const encodedMessage = url.split("&text=")[1];

  assert.equal(decodeURIComponent(encodedMessage), message);
  assert.match(encodedMessage, /%F0%9F%91%8B/);
  assert.match(encodedMessage, /%F0%9F%99%82/);
  assert.doesNotMatch(encodedMessage, /%25F0%259F/);
  assert.doesNotMatch(decodeURIComponent(encodedMessage), /�/);
});
