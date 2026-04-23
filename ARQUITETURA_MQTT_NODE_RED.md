# Arquitetura MQTT + Node-RED (Resumo)

## Objetivo
Integrar dispositivos simulados via MQTT ao Node-RED para monitoramento e controle, com visualizacao em dashboard.

## Organizacao da solucao
A arquitetura foi dividida em 3 partes:

1. Publishers Node.js
- Simulam sensores e estados da casa.
- Publicam mensagens MQTT em topicos separados por ambiente.

2. Broker MQTT (Mosquitto)
- Faz o roteamento entre publicadores e consumidores.
- Executa localmente via Docker para os topicos locais.
- O topico da cozinha/temperatura usa HiveMQ.

3. Node-RED
- Consome os topicos MQTT.
- Faz parse do JSON, aplica regras e exibe no dashboard.

## Padrao de topicos
Padrao adotado:

casa/<ambiente>/<recurso>

Exemplos implementados:

1. casa/sala/temperatura
- QoS 0
- Uso: telemetria frequente, baixa latencia.

2. casa/cozinha/temperatura
- QoS 1
- Uso: dado importante, aceita duplicidade eventual (publicado no HiveMQ).

3. casa/garagem/portao
- QoS 2
- Uso: estado critico, evita inconsistencias.

4. casa/quarto/ar/status
- QoS 1 + retain
- Uso: manter ultimo estado para novos subscribers.

5. casa/escritorio/presenca/status
- QoS 1 + LWT
- Uso: detectar queda inesperada (offline automatico).

## Decisoes de arquitetura
- QoS por criticidade: QoS 0 para dado menos critico, QoS 1 para confiabilidade intermediaria, QoS 2 para estado critico.
- Retain para estado atual: dashboard recebe valor imediatamente ao reconectar.
- LWT para disponibilidade: broker publica offline quando o cliente cai sem desconectar.
- Payload JSON padronizado: facilita tratamento no Node-RED.

## Fluxo simples no Node-RED
1. MQTT-in por topico (ou wildcard casa/+/+).
2. No JSON para converter payload.
3. No Switch para separar por ambiente/sensor.
4. Dashboard para graficos, indicadores e alertas.

## Observacao para Codespaces + FlowFuse
- Para Node-RED externo ao Codespace, use Cloudflare Tunnel no listener WebSocket do Mosquitto (`http://localhost:9001`).
- No Node-RED, configure broker em `wss` porta `443`, path `/`.
- Isso permite consumir normalmente os topicos `casa/garagem/portao` e `casa/escritorio/presenca/status` fora do ambiente local.

## Arquivos de referencia
- pubCasaSalaQos0.js
- pubCasaCozinhaQos1.js
- pubCasaGaragemQos2.js
- pubCasaQuartoRetain.js
- pubCasaEscritorioLwt.js
- docker-compose.yml
