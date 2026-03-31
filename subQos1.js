import mqtt from "mqtt";

// CONFIGURAÇÃO ESSENCIAL: 
// 1. clientId fixo (para o Broker saber quem é você quando voltar)
// 2. clean: false (pede para o Broker manter sua assinatura e mensagens pendentes)
//clean: false: É o comando que diz ao Broker: "Se eu cair, mantenha minha assinatura do tópico aula/qos ativa e guarde as 
// mensagens QoS 1 que chegarem para mim".
const options = {
  clientId: "subscriber_01", 
  clean: false 
};

const client = mqtt.connect("mqtt://localhost:1883", options);

client.on("connect", (connack) => {
  // connack.sessionPresent indica se o Broker já tinha sua sessão guardada
  console.log(`SUB QoS1: conectado (Sessão recuperada: ${connack.sessionPresent})`);
  
  // No QoS 1 com clean:false, você só precisa dar subscribe uma vez na vida.
  // Mas deixar aqui garante que o tópico seja assinado na primeira execução.
  
  client.subscribe("aula/qos", { qos: 1 });
});

client.on("message", (topic, msg) => {
  console.log("SUB QoS1 recebeu:", msg.toString());
});
