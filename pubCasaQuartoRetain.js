import mqtt from "mqtt";

const brokerUrl = process.env.BROKER_URL || "mqtt://localhost:1883";
const topic = "casa/quarto/ar/status";
const clearRetain = process.env.CLEAR_RETAIN === "true";

const client = mqtt.connect(brokerUrl, {
  clientId: `casa-quarto-retain-${Date.now()}`,
  reconnectPeriod: 0
});

client.on("connect", () => {
  console.log("[CASA RETAIN] Publisher conectado");

  const payload = clearRetain
    ? ""
    : JSON.stringify({
        casa: "residencia-a",
        ambiente: "quarto",
        equipamento: "ar-condicionado",
        status: "ligado",
        temperaturaAlvo: 22,
        modo: "frio",
        ts: new Date().toISOString()
      });

  client.publish(topic, payload, { qos: 1, retain: true }, (err) => {
    if (err) {
      console.error("[CASA RETAIN] Erro publish:", err.message);
      process.exit(1);
    }

    if (clearRetain) {
      console.log("[CASA RETAIN] Mensagem retida removida do topico");
    } else {
      console.log("[CASA RETAIN] Estado retido publicado em", topic);
    }

    client.end(true);
  });
});

client.on("error", (err) => {
  console.error("[CASA RETAIN] Erro:", err.message);
  process.exit(1);
});
