import mqtt from "mqtt";

const brokerUrl = process.env.BROKER_URL || "mqtt://localhost:1883";
const topic = "casa/garagem/portao";
const qos = 2;

const client = mqtt.connect(brokerUrl, {
  clientId: `casa-garagem-q2-${Date.now()}`,
  reconnectPeriod: 0
});

client.on("connect", () => {
  console.log("[CASA Q2] Publisher conectado");

  const eventos = ["fechado", "abrindo", "aberto", "fechando", "fechado"];

  eventos.forEach((estado, index) => {
    setTimeout(() => {
      const payload = {
        casa: "residencia-a",
        ambiente: "garagem",
        atuador: "portao",
        estado,
        qos,
        ts: new Date().toISOString()
      };

      client.publish(topic, JSON.stringify(payload), { qos }, (err) => {
        if (err) {
          console.error("[CASA Q2] Erro publish:", err.message);
          return;
        }
        console.log("[CASA Q2] Enviado:", payload);
      });

      if (index === eventos.length - 1) {
        setTimeout(() => client.end(true), 600);
      }
    }, index * 3200);
  });
});

client.on("error", (err) => {
  console.error("[CASA Q2] Erro:", err.message);
  process.exit(1);
});
