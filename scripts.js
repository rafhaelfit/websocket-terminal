const addressInput = document.querySelector("#address-input");
const sendMessageInput = document.querySelector("#send-message-input");
const logArea = document.querySelector("#log-area");
const connectBtn = document.querySelector("#connect");
const disconnectBtn = document.querySelector("#disconnect");

const ECHO_MESSAGE_PREFIX = "echo()";

class Logger {
  static sent(message) {
    logArea.innerText += `>> ${message}\n`;
  }
  static received(message) {
    const endString = message.endsWith("\n") ? "" : "\n";
    logArea.innerText += `<< ${message}${endString}`;

    if (message.startsWith(ECHO_MESSAGE_PREFIX)) {
      const timestampSent = parseInt(message.split(" ")[2]);
      const diff = Date.now() - timestampSent;

      Logger.info(
        `Echo took ${diff} ms.\n      This is the time it takes for the sent message to return.`
      );
      return;
    }
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
  "Welcome to the WebSocket Terminal.\n      Enter a WebSocket Server address and connect it."
);

disconnectBtn.style.display = "none";
addressInput.value =
  decodeURI(window.location.hash.slice(1)) || "wss://echo.websocket.org/";

addressInput.onkeydown = () => {
  setTimeout(() => (window.location.hash = addressInput.value), 0);
};

let ws = null;

sendMessageInput.onkeydown = (event) => {
  let message = event.target.value;

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
    if (message.startsWith(ECHO_MESSAGE_PREFIX)) {
      message = `echo() # ${Date.now()}`;
    }

    ws.send(`${message}\r\n`);
    Logger.sent(message);
    sendMessageInput.value = "";
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    Logger.error(message);
  }
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
