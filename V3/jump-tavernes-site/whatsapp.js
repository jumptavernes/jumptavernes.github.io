import { SITE_CONFIG } from "./config.js";

const formatDate = (isoDate) => {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
};

export function buildWhatsAppMessage({ date, schedule, eventType, otherEvent = "", people = "" }) {
  const slot = SITE_CONFIG.schedules.find((item) => item.id === schedule);
  if (!slot) throw new Error("Horario no válido");
  const eventDescription = eventType === "Otro" ? `Otro — ${otherEvent.trim()}` : eventType;
  const lines = [
    "Hola, quiero solicitar una reserva en JUMP Tavernes.",
    "",
    `📅 Fecha: ${formatDate(date)}`,
    `🕒 Horario: ${slot.message}`,
    `🎉 Evento: ${eventDescription}`
  ];
  if (people) lines.push(`👥 Personas: ${people}`);
  lines.push("", "¿Podéis confirmarme si está disponible?");
  return lines.join("\n");
}
