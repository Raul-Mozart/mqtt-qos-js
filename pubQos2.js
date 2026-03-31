import mqtt from "mqtt";

const client = mqtt.connect("mqtt://localhost:1883");

client.on("connect", () => {
  console.log("PUB QoS2: conectado");
  let i = 0;

  const t = setInterval(() => {
    client.publish("aula/qos", `msg ${i} (QoS2)`, { qos: 2 });
    console.log("PUB QoS2 enviou:", i);
    i++;

    if (i === 10) {
      clearInterval(t);
      client.end();
    }
  }, 500);
});
