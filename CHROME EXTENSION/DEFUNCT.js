const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const tabSelect = document.getElementById("tabSelect");
const refreshTabs = document.getElementById("refreshTabs");

// Connect to background for live updates
const port = chrome.runtime.connect({ name: "monitor" });

port.onMessage.addListener(msg => {
  if (msg.activity !== undefined) {
    statusEl.textContent = msg.activity ? "Activity detected!" : "No activity detected!";
  }
});

// Populate tab dropdown
async function updateTabs() {
  tabSelect.innerHTML = "";
  const tabs = await chrome.tabs.query({});
  tabs.forEach(tab => {
    if (!tab.url.startsWith("chrome://") && !tab.url.startsWith("chrome-extension://")) {
      const option = document.createElement("option");
      option.value = tab.id;
      option.textContent = tab.title;
      tabSelect.appendChild(option);
    }
  });
}

refreshTabs.addEventListener("click", updateTabs);
updateTabs();

// Start monitoring
startBtn.addEventListener("click", () => {
  const tabId = parseInt(tabSelect.value);
  if (!tabId) {
    statusEl.textContent = "Please select a tab first.";
    return;
  }
  chrome.runtime.sendMessage({ type: "startMonitoring", tabId });
  statusEl.textContent = "Monitoring started in selected tab...";
});

// Stop monitoring
stopBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "stopMonitoring" });
  statusEl.textContent = "Monitoring stopped.";
});
