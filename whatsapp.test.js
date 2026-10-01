import test from "node:test";
import assert from "node:assert/strict";
import { buildWhatsAppMessage } from "./whatsapp.js";

test("genera la solicitud completa", () => {
  const message = buildWhatsAppMessage({ date: "2026-10-17", schedule: "afternoon", eventType: "Cumpleaños", people: "25" });
  assert.match(message, /Fecha: 17\/10\/2026/);
  assert.match(message, /Horario: Tarde \(17:00–22:00\)/);
  assert.match(message, /Evento: Cumpleaños/);
  assert.match(message, /Personas: 25/);
  assert.match(message, /confirmarme si está disponible/);
});

test("omite personas e incluye la descripción de Otro", () => {
  const message = buildWhatsAppMessage({ date: "2026-11-02", schedule: "full-day", eventType: "Otro", otherEvent: "Reunión de amigos" });
  assert.doesNotMatch(message, /Personas:/);
  assert.match(message, /Evento: Otro — Reunión de amigos/);
});
