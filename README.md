# mqtt-qos-js

Projeto simples para simular 3 sensores MQTT com QoS diferentes e gerar relatório de enviadas x recebidas.

## Sensores e QoS

- Temp Ambiente: tópico `estufa/temp/ambiente`, QoS 0
- Nível Água: tópico `estufa/agua/nivel`, QoS 1
- Incêndio: tópico `estufa/alerta/incendio`, QoS 2

## Scripts

- `npm run reset:logs`: limpa logs de teste
- `npm run sub:monitor`: subscriber único monitorando os 3 tópicos
- `npm run pub:temp`: publisher temperatura
- `npm run pub:agua`: publisher nível de água (a cada 30s)
- `FIRE=true npm run pub:fire`: publisher incêndio (só envia se FIRE=true)
- `npm run relatorio`: gera tabela comparativa e resumo do teste de falha

## Parte 1 (implementação básica)

1. Rode `npm run reset:logs`.
2. Em um terminal, rode `npm run sub:monitor`.
3. Em outros terminais, rode:
	 - `npm run pub:temp`
	 - `npm run pub:agua`
	- `FIRE=true npm run pub:fire`
4. Ao final, rode `npm run relatorio`.

## Parte 2 (teste de estresse - falha de rede)

1. Inicie novamente monitor e publishers.
2. Durante o envio, pare o subscriber por alguns segundos (Ctrl+C em `npm run sub:monitor`).
3. Deixe os publishers continuarem enviando.
4. Religue o subscriber com `npm run sub:monitor`.
5. Rode `npm run relatorio` para documentar comportamento por QoS.

## Saída do relatório

O relatório usa os logs em `logs/sent.jsonl` e `logs/received.jsonl` e imprime:

- Tabela: `Sensor | QoS | Enviadas | Recebidas | Perdidas | Duplicadas`
- Resumo simples esperado:
	- QoS 0: pode perder mensagem durante queda
	- QoS 1: entrega ao menos uma vez (pode duplicar)
	- QoS 2: entrega exatamente uma vez
