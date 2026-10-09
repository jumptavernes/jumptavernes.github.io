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
    "👋 Hola, quiero solicitar una reserva en JUMP Tavernes.",
    "",
    `📅 Fecha: ${formatDate(date)}`,
    `🕒 Horario: ${slot.message}`,
    `🎉 Tipo de evento: ${eventDescription}`
  ];
  if (people.trim()) lines.push(`👥 Personas: ${people.trim()}`);
  lines.push("", "¿Podéis confirmarme si está disponible? 🙂");
  return lines.join("\n");
}

export function buildWhatsAppUrl(data) {
  const message = buildWhatsAppMessage(data);
  const encodedMessage = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${SITE_CONFIG.whatsappNumber}&text=${encodedMessage}`;
}
