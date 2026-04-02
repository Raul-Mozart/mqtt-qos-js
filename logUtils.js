import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");
const SENT_LOG = path.join(LOG_DIR, "sent.jsonl");
const RECEIVED_LOG = path.join(LOG_DIR, "received.jsonl");

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function appendJsonLine(filePath, data) {
  ensureLogDir();
  fs.appendFileSync(filePath, `${JSON.stringify(data)}\n`, "utf8");
}

export function logSent(data) {
  appendJsonLine(SENT_LOG, {
    kind: "sent",
    at: new Date().toISOString(),
    ...data
  });
}

export function logReceived(data) {
  appendJsonLine(RECEIVED_LOG, {
    kind: "received",
    at: new Date().toISOString(),
    ...data
  });
}

export function clearLogs() {
  ensureLogDir();
  fs.writeFileSync(SENT_LOG, "", "utf8");
  fs.writeFileSync(RECEIVED_LOG, "", "utf8");
}

export { LOG_DIR, SENT_LOG, RECEIVED_LOG };
