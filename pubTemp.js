import mqtt from "mqtt";
import { logSent } from "./logUtils.js";

const client = mqtt.connect("mqtt://localhost:1883");
const topic = "estufa/temp/ambiente";
const qos = 0;

client.on("connect", () => {
  console.log("PUB QoS0: conectado");
  const temperaturas = [21.4, 22.1, 22.8, 23.2, 24.0, 24.4, 23.9, 23.1];

  const t = setInterval(() => {
    const temperatura = temperaturas.shift();

    if (temperatura === undefined) {
      clearInterval(t);
      client.end();
      return;
    }

    const msg = {
      sensor: "Temp Ambiente",
      id: `temp-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      valor: temperatura,
      unidade: "C",
      qos
    };

    client.publish(topic, JSON.stringify(msg), { qos });
    logSent({ sensor: msg.sensor, id: msg.id, topic, qos });
    console.log("PUB QoS0 enviou:", temperatura, "C");

  }, 5000);
});
