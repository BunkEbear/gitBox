// Open popup in new tab
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
});

// Raspberry Pi config
const PI_ENDPOINT = "http://192.168.1.120:25565/activity";

let monitoringActive = false;
let lastActivityTime = Date.now();
let heartbeat = null;

// Send status to Raspberry Pi
async function notifyPi(status, testFlag) {
  try {
    await fetch(PI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, test: !!testFlag, monitoring: monitorStateForPayload() })
    });
  } catch (err) {
    console.error("Failed to reach Raspberry Pi", err);
  }
}

function monitorStateForPayload() {
  // login: if monitoringActive is true -> true, else false
  return !!monitoringActive;
}

function startHeartbeat() {
  if (heartbeat) return;
  lastActivityTime = Date.now();
  heartbeat = setInterval(() => {
    if (!monitoringActive) return;
    // compute activity since lastActivityTime
    const isActive = (Date.now() - lastActivityTime) <= 3000;
    notifyPi(isActive ? "active" : "inactive");
  }, 3000);
}

function stopHeartbeat() {
  if (heartbeat) {
    clearInterval(heartbeat);
    heartbeat = null;
  }
}

// Listen for messages
chrome.runtime.onMessage.addListener((msg) => {
  // Start/stop monitoring
  if (msg.type === "monitoring") {
    monitoringActive = !!msg.value;
    if (monitoringActive) startHeartbeat(); else stopHeartbeat();
  }

  // Activity reports from content.js
  if (typeof msg.activity === "boolean") {
    if (msg.activity) {
      lastActivityTime = Date.now();
    }
  }

  // Test: handle testNotifyPi
  if (msg.type === "testNotifyPi") {
    console.log("Test Notify Pi button pressed");
    notifyPi("active", true);
  }

  // State updates can be handled here if needed
});
