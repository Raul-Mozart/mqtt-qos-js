import mqtt from "mqtt";

const brokerUrl = process.env.BROKER_URL || "mqtt://localhost:1883";
const statusTopic = "estufa/dispositivo/lwt/status";

const dispositivo = mqtt.connect(brokerUrl, {
  clientId: "sensor-lwt-estufa",
  keepalive: 5,
  reconnectPeriod: 0,
  will: {
    topic: statusTopic,
    payload: JSON.stringify({
      dispositivo: "sensor-lwt-estufa",
      status: "offline",
      origem: "LWT",
      registradoEm: new Date().toISOString()
    }),
    qos: 1,
    retain: true
  }
});

dispositivo.on("connect", () => {
  console.log("[LWT] Dispositivo conectado com Last Will configurado");

  const online = {
    dispositivo: "sensor-lwt-estufa",
    status: "online",
    origem: "dispositivo",
    em: new Date().toISOString()
  };

  dispositivo.publish(statusTopic, JSON.stringify(online), { qos: 1, retain: true }, (err) => {
    if (err) {
      console.error("[LWT] Erro ao publicar status online:", err.message);
      process.exit(1);
    }

    console.log("[LWT] Status online enviado");
    console.log("[LWT] Simulando queda abrupta em 2s (sem DISCONNECT)...");

    setTimeout(() => {
      dispositivo.stream.destroy();
    }, 2000);
  });
});

dispositivo.on("error", (err) => {
  console.error("[LWT] Erro no dispositivo:", err.message);
  process.exit(1);
});
