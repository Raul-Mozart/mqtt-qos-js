import mqtt from "mqtt";
import { logSent } from "./logUtils.js";

const client = mqtt.connect("mqtt://localhost:1883");
const topic = "estufa/agua/nivel";
const qos = 1;

client.on("connect", () => {
  console.log("PUB reservatório: conectado");
  const niveisAgua = [12, 18, 25, 33, 41, 48, 56, 63, 71, 80];

  for (let i = 0; i < niveisAgua.length; i++) {
    setTimeout(() => {
      const nivel = niveisAgua[i];
      const msg = {
        sensor: "Nivel Agua",
        id: `agua-${i + 1}`,
        valor: nivel,
        unidade: "%",
        qos
      };

      client.publish(topic, JSON.stringify(msg), { qos });
      logSent({ sensor: msg.sensor, id: msg.id, topic, qos });
      console.log("PUB reservatório enviou:", nivel, "%");

      if (i === niveisAgua.length - 1) {
        client.end();
      }
    }, i * 30000);
  }
});
