import mqtt from "mqtt";

const brokerUrl = process.env.BROKER_URL || "mqtt://localhost:1883";
const retainTopic = "estufa/retain/ultimo-status";

const subscriber = mqtt.connect(brokerUrl, {
  clientId: `retain-sub-${Date.now()}`,
  reconnectPeriod: 0
});

const timeout = setTimeout(() => {
  console.error("[RETAIN-SUB] Timeout: nenhuma mensagem retida recebida");
  subscriber.end(true);
  process.exit(1);
}, 15000);

subscriber.on("connect", () => {
  console.log("[RETAIN-SUB] Subscriber conectado");
  subscriber.subscribe(retainTopic, { qos: 1 }, (err) => {
    if (err) {
      console.error("[RETAIN-SUB] Erro no subscribe:", err.message);
      clearTimeout(timeout);
      process.exit(1);
    }

    console.log(`[RETAIN-SUB] Inscrito em ${retainTopic}`);
    console.log("[RETAIN-SUB] Aguardando mensagem retida...");
  });
});

subscriber.on("message", (_topic, payload, packet) => {
  console.log("[RETAIN-SUB] Mensagem recebida:", payload.toString());
  console.log(`[RETAIN-SUB] packet.retain = ${packet.retain}`);
  console.log("[RETAIN-SUB] Resultado: o ultimo estado foi entregue imediatamente ao novo subscriber");

  clearTimeout(timeout);
  subscriber.end(true);
});

subscriber.on("error", (err) => {
  console.error("[RETAIN-SUB] Erro no subscriber:", err.message);
  clearTimeout(timeout);
  process.exit(1);
});
