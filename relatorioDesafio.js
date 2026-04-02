import fs from "fs";
import { RECEIVED_LOG, SENT_LOG } from "./logUtils.js";

const sensores = [
  { nome: "Temp Ambiente", qos: 0, topic: "estufa/temp/ambiente" },
  { nome: "Nível Água", qos: 1, topic: "estufa/agua/nivel" },
  { nome: "Incêndio", qos: 2, topic: "estufa/alerta/incendio" }
];

function readJsonLines(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const content = fs.readFileSync(filePath, "utf8").trim();
  if (!content) {
    return [];
  }

  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

const sent = readJsonLines(SENT_LOG);
const received = readJsonLines(RECEIVED_LOG);

const tabela = sensores.map((sensor) => {
  const enviados = sent.filter((item) => item.topic === sensor.topic);
  const recebidosUnicos = new Set(
    received
      .filter((item) => item.topic === sensor.topic && !item.duplicated)
      .map((item) => item.id)
  );
  const duplicadas = received.filter(
    (item) => item.topic === sensor.topic && item.duplicated
  ).length;

  const enviadas = enviados.length;
  const recebidas = recebidosUnicos.size;
  const perdidas = Math.max(0, enviadas - recebidas);

  return {
    sensor: sensor.nome,
    qos: sensor.qos,
    enviadas,
    recebidas,
    perdidas,
    duplicadas
  };
});

console.log("\nTabela comparativa:\n");
console.log("| Sensor | QoS | Enviadas | Recebidas | Perdidas | Duplicadas |\n|---|---:|---:|---:|---:|---:|");
for (const linha of tabela) {
  console.log(
    `| ${linha.sensor} | ${linha.qos} | ${linha.enviadas} | ${linha.recebidas} | ${linha.perdidas} | ${linha.duplicadas} |`
  );
}

console.log("\nAnálise simples do teste de falha de rede:\n");
for (const linha of tabela) {
  if (linha.qos === 0) {
    console.log(`- ${linha.sensor} (QoS 0): pode perder mensagens durante a queda. Perdidas observadas: ${linha.perdidas}.`);
  }

  if (linha.qos === 1) {
    console.log(`- ${linha.sensor} (QoS 1): entrega ao menos uma vez, pode repetir. Duplicadas observadas: ${linha.duplicadas}.`);
  }

  if (linha.qos === 2) {
    console.log(`- ${linha.sensor} (QoS 2): entrega exatamente uma vez. Duplicadas observadas: ${linha.duplicadas}.`);
  }
}
