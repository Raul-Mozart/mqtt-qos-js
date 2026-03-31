import mqtt from "mqtt";

const client = mqtt.connect("mqtt://localhost:1883");

client.on("connect", () => {
  console.log("SUB QoS0: conectado");
  client.subscribe("aula/qos", { qos: 0 });
});

client.on("message", (topic, msg) => {
  console.log("SUB QoS0 recebeu:", msg.toString());
});
