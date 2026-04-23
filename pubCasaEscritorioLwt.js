import mqtt from "mqtt";

const brokerUrl = process.env.BROKER_URL || "mqtt://localhost:1883";
const topic = "casa/escritorio/presenca/status";
const abruptMs = Number(process.env.ABRUPT_MS || 12000);

const dispositivo = mqtt.connect(brokerUrl, {
  clientId: "casa-escritorio-presenca",
  keepalive: 5,
  reconnectPeriod: 0,
  will: {
    topic,
    payload: JSON.stringify({
      casa: "residencia-a",
      ambiente: "escritorio",
      sensor: "presenca",
      status: "offline",
      origem: "lwt",
      ts: new Date().toISOString()
    }),
    qos: 1,
    retain: true
  }
});

let heartbeat;

dispositivo.on("connect", () => {
  console.log("[CASA LWT] Dispositivo conectado com Last Will configurado");

  const online = {
    casa: "residencia-a",
    ambiente: "escritorio",
    sensor: "presenca",
    status: "online",
    origem: "dispositivo",
    ts: new Date().toISOString()
  };

  dispositivo.publish(topic, JSON.stringify(online), { qos: 1, retain: true }, (err) => {
    if (err) {
      console.error("[CASA LWT] Erro ao publicar online:", err.message);
      process.exit(1);
    }

    console.log("[CASA LWT] Status online enviado");

    heartbeat = setInterval(() => {
      const ativo = {
        casa: "residencia-a",
        ambiente: "escritorio",
        sensor: "presenca",
        status: "ativo",
        origem: "dispositivo",
        ts: new Date().toISOString()
      };

      dispositivo.publish(topic, JSON.stringify(ativo), { qos: 1, retain: false });
      console.log("[CASA LWT] Heartbeat enviado");
    }, 3000);

    console.log(`[CASA LWT] Queda abrupta simulada em ${abruptMs}ms`);

    setTimeout(() => {
      clearInterval(heartbeat);
      dispositivo.stream.destroy();
    }, abruptMs);
  });
});

dispositivo.on("error", (err) => {
  console.error("[CASA LWT] Erro:", err.message);
  process.exit(1);
});
