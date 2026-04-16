import mqtt from "mqtt";

const brokerUrl = process.env.BROKER_URL || "mqtt://localhost:1883";
const retainTopic = "estufa/retain/ultimo-status";

const publisher = mqtt.connect(brokerUrl, {
  clientId: `retain-pub-${Date.now()}`,
  reconnectPeriod: 0
});

publisher.on("connect", () => {
  console.log("[RETAIN] Publisher conectado");

  const statusAtual = {
    sensor: "controlador-estufa",
    status: "operando",
    temperatura: 24,
    em: new Date().toISOString()
  };

  publisher.publish(
    retainTopic,
    JSON.stringify(statusAtual),
    { qos: 1, retain: true },
    (err) => {
      if (err) {
        console.error("[RETAIN] Erro ao publicar:", err.message);
        process.exit(1);
      }

      console.log("[RETAIN] Ultimo estado publicado com retain=true");
      publisher.end(true);
    }
  );
});

publisher.on("error", (err) => {
  console.error("[RETAIN] Erro no publisher:", err.message);
  process.exit(1);
});
