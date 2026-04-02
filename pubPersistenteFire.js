import mqtt from "mqtt";
import { logSent } from "./logUtils.js";

const client = mqtt.connect("mqtt://localhost:1883");
const topic = "estufa/alerta/incendio";
const qos = 2;

client.on("connect", () => {
  console.log("PUB conectado");
  const fire = process.env.FIRE === "true";
  const fireId = process.env.FIRE_ID || "fire-1";

  if (!fire) {
    console.log("FIRE=false, nenhum alerta enviado");
    client.end();
    return;
  }

  const msg = {
    sensor: "Incendio",
    id: fireId,
    valor: "ALERTA",
    qos
  };

  client.publish(topic, JSON.stringify(msg), { qos }, () => {
    logSent({ sensor: msg.sensor, id: msg.id, topic, qos });
    console.log("PUB enviou:", msg);
    console.log("PUB finalizou");
    client.end();
  });
});