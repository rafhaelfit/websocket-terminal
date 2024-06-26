const addressInput = document.querySelector("#address-input");
const sendMessageInput = document.querySelector("#send-message-input");
const logArea = document.querySelector("#log-area");
const connectBtn = document.querySelector("#connect");
const disconnectBtn = document.querySelector("#disconnect");

class Logger {
  static sent(message) {
    logArea.innerText += `>> ${message}\n`;
  }
  static received(message) {
    logArea.innerText += `<< ${message}\n`;
  }

  static info(message) {
    logArea.innerText += `Info: ${message}\n`;
  }

  static warning(message) {
    logArea.innerText += `Warning: ${message}\n`;
  }

  static error(message) {
    logArea.innerText += `Error: ${message}\n`;
  }
}

const logMessage = (message) => {
  logArea.innerText += `${message}\n`;
};

Logger.info(
  "Welcome to the WebSocket Serial Monitor.\n      Enter the server URL and connect."
);

disconnectBtn.style.display = "none";
let ws = null;

sendMessageInput.onkeydown = (event) => {
  const message = event.target.value;

  if (event.key !== "Enter" || message === "") {
    return;
  }

  if (!ws) {
    Logger.warning(
      "Please, connect to the WebSocket server before sending messages."
    );
    return;
  }

  try {
    ws.send(`${message}\r\n`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    Logger.error(message);
  }

  Logger.send(message);
  sendMessageInput.value = "";
};

connectBtn.onclick = () => {
  const url = addressInput.value.trim();
  if (!url) {
    Logger.warning("Please, enter the WebSocket server URL.");
    return;
  }

  if (
    !url.toLowerCase().startsWith("ws://") &&
    !url.toLowerCase().startsWith("wss://")
  ) {
    Logger.warning("Please, enter a valid WebSocket url.");
    return;
  }

  Logger.info("Connecting...");
  connectBtn.disabled = true;
  connectBtn.innerText = "Connecting...";

  try {
    ws = new WebSocket(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    Logger.error(message);
    connectBtn.disabled = false;
    connectBtn.innerText = "Connect";
    return;
  }

  ws.onopen = () => {
    Logger.info("Connected.");
    connectBtn.disabled = false;
    connectBtn.innerText = "Connect";
    connectBtn.style.display = "none";
    disconnectBtn.style.display = "block";
  };

  ws.onmessage = (event) => {
    const message = event.data;
    Logger.received(message);
  };

  ws.onerror = () => {
    Logger.error("Failed to connect.");
    connectBtn.disabled = false;
    connectBtn.innerText = "Connect";
  };

  ws.onclose = () => {
    ws = null;
    Logger.info("Disconnected.");
    connectBtn.style.display = "block";
    disconnectBtn.style.display = "none";
  };
};

disconnectBtn.onclick = () => {
  ws?.close();
};
