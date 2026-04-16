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
- `npm run pub:retain`: publisher da demo de retain
- `npm run sub:retain`: subscriber da demo de retain
- `npm run pub:lwt`: dispositivo da demo de LWT (com Last Will)
- `npm run sub:lwt`: monitor/subscriber da demo de LWT

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

## Parte 3 (Retain Flag e Last Will)

Nesta parte, os dois recursos foram implementados em arquivos novos:

- `retain.js` (publisher)
- `subRetain.js` (subscriber)
- `lwt.js` (dispositivo com Last Will)
- `subLwt.js` (monitor/subscriber)

### Retain Flag

O que é:

- Mensagem publicada com `retain: true` fica armazenada no broker como "ultimo valor conhecido" do topico.
- Todo novo subscriber desse topico recebe imediatamente esse valor, mesmo que a publicacao tenha acontecido antes.

Quando usar:

- Estado atual de dispositivo (online/offline)
- Ultima temperatura/umidade/luminosidade conhecida
- Configuracoes que clientes precisam ao conectar

Impactos no sistema IoT real:

- Positivo: novos consumidores entram no sistema ja sincronizados com o ultimo estado.
- Positivo: reduz tempo de inicializacao de dashboards e automacoes.
- Cuidado: dado desatualizado pode continuar sendo entregue se ninguem publicar valor novo.
- Cuidado: uso sem planejamento pode manter muita informacao antiga em topicos desnecessarios.

Como demonstrar no projeto:

1. Rode `docker compose up -d` (caso broker ainda nao esteja ativo).
2. Em um terminal, rode `npm run sub:retain`.
3. Em outro terminal, rode `npm run pub:retain`.
4. Observe no terminal do subscriber que a mensagem chega com `packet.retain = true`.

### Last Will and Testament (LWT)

O que é:

- Mensagem de contingencia registrada no momento da conexao.
- Se o cliente cair sem desconectar corretamente, o broker publica automaticamente essa mensagem.

Quando usar:

- Detectar falha de dispositivo/gateway
- Monitorar disponibilidade de sensores criticos
- Acionar alarmes quando um cliente some inesperadamente

Impactos no sistema IoT real:

- Positivo: deteccao rapida de falhas sem depender de monitoramento externo complexo.
- Positivo: aumenta confiabilidade operacional (alerta e resposta automatica).
- Cuidado: se keepalive estiver alto, a percepcao de falha pode demorar.
- Cuidado: quedas curtas de rede podem gerar eventos de offline/online se nao houver debouncing.

Como demonstrar no projeto:

1. Rode `docker compose up -d` (caso broker ainda nao esteja ativo).
2. Em um terminal, rode `npm run sub:lwt`.
3. Em outro terminal, rode `npm run pub:lwt`.
4. O dispositivo publica status `online`, simula queda abrupta e o monitor recebe `offline` com origem `LWT`.
5. Se existir mensagem retida antiga no topico, ela pode aparecer antes; o monitor ignora esse valor e confirma apenas o LWT da execucao atual.

### Quando usar cada um

- Retain: quando o foco e preservar e entregar o ultimo estado conhecido para novos assinantes.
- LWT: quando o foco e detectar desconexao inesperada de clientes.
- Em sistemas reais, os dois normalmente aparecem juntos: dispositivo publica `online` com retain e configura LWT para `offline`.
