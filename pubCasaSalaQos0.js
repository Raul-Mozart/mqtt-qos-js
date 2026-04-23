import mqtt from "mqtt";

const brokerUrl = process.env.BROKER_URL || "mqtt://localhost:1883";
const topic = "casa/sala/temperatura";
const qos = 0;

const client = mqtt.connect(brokerUrl, {
  clientId: `casa-sala-q0-${Date.now()}`,
  reconnectPeriod: 0
});

client.on("connect", () => {
  console.log("[CASA Q0] Publisher conectado");

  const leituras = [23.1, 23.4, 23.8, 24.0, 23.6];
  let i = 0;

  const timer = setInterval(() => {
    if (i >= leituras.length) {
      clearInterval(timer);
      client.end(true);
      return;
    }

    const payload = {
      casa: "residencia-a",
      ambiente: "sala",
      sensor: "temperatura",
      valor: leituras[i],
      unidade: "C",
      qos,
      ts: new Date().toISOString()
    };

    client.publish(topic, JSON.stringify(payload), { qos });
    console.log("[CASA Q0] Enviado:", payload);
    i += 1;
  }, 2500);
});

client.on("error", (err) => {
  console.error("[CASA Q0] Erro:", err.message);
  process.exit(1);
});
