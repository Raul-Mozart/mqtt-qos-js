import mqtt from "mqtt";

const brokerUrl = process.env.BROKER_URL || "mqtt://localhost:1883";
const statusTopic = "estufa/dispositivo/lwt/status";

const monitor = mqtt.connect(brokerUrl, {
  clientId: `lwt-monitor-${Date.now()}`,
  reconnectPeriod: 0
});

let onlineVisto = false;

const timeout = setTimeout(() => {
  console.error("[LWT-SUB] Timeout: Last Will nao foi observado");
  monitor.end(true);
  process.exit(1);
}, 2000000);

monitor.on("connect", () => {
  console.log("[LWT-SUB] Monitor conectado");
  monitor.subscribe(statusTopic, { qos: 1 }, (err) => {
    if (err) {
      console.error("[LWT-SUB] Erro no subscribe:", err.message);
      clearTimeout(timeout);
      process.exit(1);
    }

    console.log(`[LWT-SUB] Inscrito em ${statusTopic}`);
  });
});

monitor.on("message", (_topic, payload, packet) => {
  const texto = payload.toString();
  console.log("[LWT-SUB] Mensagem recebida:", texto);

  let dados;
  try {
    dados = JSON.parse(texto);
  } catch {
    dados = null;
  }

  if (!dados) {
    return;
  }

  if (dados.origem === "dispositivo" && dados.status === "online") {
    onlineVisto = true;
    console.log("[LWT-SUB] Online atual detectado. Aguardando queda abrupta...");
    return;
  }

  if (dados.origem === "LWT" && !onlineVisto && packet.retain) {
    console.log("[LWT-SUB] Offline retido antigo detectado. Ignorando e aguardando execucao atual...");
    return;
  }

  if (dados.origem === "LWT" && onlineVisto) {
    console.log("[LWT-SUB] Last Will confirmado: broker publicou offline automaticamente");
    clearTimeout(timeout);
    monitor.end(true);
    setTimeout(() => process.exit(0), 300);
  }
});

monitor.on("error", (err) => {
  console.error("[LWT-SUB] Erro no monitor:", err.message);
  clearTimeout(timeout);
  process.exit(1);
});
