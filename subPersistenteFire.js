import mqtt from "mqtt";
import { logReceived } from "./logUtils.js";

const client = mqtt.connect("mqtt://localhost:1883", {
  clientId: "sub-monitor-estufa",
  clean: false,
  reconnectPeriod: 1000
});

const recebidas = new Set();
const topicos = {
  "estufa/temp/ambiente": { qos: 0 },
  "estufa/agua/nivel": { qos: 1 },
  "estufa/alerta/incendio": { qos: 2 }
};

client.on("connect", (connack) => {
  console.log(`SUB conectado (sessao recuperada: ${connack.sessionPresent})`);

  client.subscribe(topicos, (err) => {
    if (err) {
      console.error("Erro ao inscrever nos topicos:", err.message);
      return;
    }
    console.log("SUB monitorando 3 topicos: temp, agua, incendio");
  });
});

client.on("offline", () => {
  console.log("SUB offline");
});

client.on("reconnect", () => {
  console.log("SUB tentando reconectar...");
});

client.on("message", (topic, msg) => {
  const payload = msg.toString();
  let data;

  try {
    data = JSON.parse(payload);
  } catch {
    data = { sensor: "desconhecido", id: payload, valor: payload, qos: 0 };
  }

  const chave = `${topic}|${data.id}`;
  const duplicada = recebidas.has(chave);

  if (!duplicada) {
    recebidas.add(chave);
  }

  logReceived({
    sensor: data.sensor,
    id: data.id,
    topic,
    qos: data.qos,
    duplicated: duplicada
  });

  if (duplicada) {
    console.log("DUPLICADA:", topic, data.id);
  } else {
    console.log("RECEBIDA:", topic, data);
  }
});