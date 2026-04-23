import mqtt from "mqtt";

const brokerUrl = process.env.HIVEMQ_BROKER_URL || "mqtt://broker.hivemq.com:1883";
const topic = "casa/cozinha/temperatura";
const qos = 1;

const client = mqtt.connect(brokerUrl, {
  clientId: `casa-cozinha-q1-${Date.now()}`,
  reconnectPeriod: 0
});

client.on("connect", () => {
  console.log("[CASA Q1] Publisher conectado no HiveMQ");

  const leituras = [25.1, 25.4, 25.8, 26.2, 25.9];

  for (let i = 0; i < leituras.length; i++) {
    setTimeout(() => {
      const payload = {
        casa: "residencia-a",
        ambiente: "cozinha",
        sensor: "temperatura",
        valor: leituras[i],
        unidade: "C",
        qos,
        ts: new Date().toISOString()
      };

      client.publish(topic, JSON.stringify(payload), { qos }, (err) => {
        if (err) {
          console.error("[CASA Q1] Erro publish:", err.message);
          return;
        }
        console.log("[CASA Q1] Enviado:", payload);
      });

      if (i === leituras.length - 1) {
        setTimeout(() => client.end(true), 600);
      }
    }, i * 2800);
  }
});

client.on("error", (err) => {
  console.error("[CASA Q1] Erro:", err.message);
  process.exit(1);
});
