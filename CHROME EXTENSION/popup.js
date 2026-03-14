document.addEventListener("DOMContentLoaded", () => {
  const statusEl = document.getElementById("status");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");

  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  let monitoring = false;
  let lastFrame = null;
  let stream = null;
  let loopTimeout = null;

  async function startCapture() {
    if (monitoring) return;

    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 5 },
        audio: false
      });
    } catch (e) {
      statusEl.textContent = "Capture canceled";
      return;
    }

    stream.getTracks().forEach(track => {
      track.addEventListener("ended", handleStreamEnded);
    });

    video.srcObject = stream;
    await video.play();

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    monitoring = true;
    lastFrame = null;
    statusEl.textContent = "Monitoring";

    startBtn.disabled = true;

    // Start heartbeat in background
    chrome.runtime.sendMessage({ type: "monitoring", value: true });

    monitorLoop();
  }

  function stopCapture() {
    cleanup("Stopped");
    // Stop heartbeat
    chrome.runtime.sendMessage({ type: "monitoring", value: false });
  }

  function handleStreamEnded() {
    cleanup("Capture Stopped");
    chrome.runtime.sendMessage({ type: "monitoring", value: false });
  }

  function cleanup(message) {
    monitoring = false;

    if (loopTimeout) {
      clearTimeout(loopTimeout);
      loopTimeout = null;
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }

    video.srcObject = null;
    lastFrame = null;
    statusEl.textContent = message;
    startBtn.disabled = false;
  }

  function monitorLoop() {
    if (!monitoring || !stream) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let active = false;

    if (lastFrame) {
      let diff = 0;

      for (let i = 0; i < frame.data.length; i += 16) {
        diff += Math.abs(frame.data[i] - lastFrame.data[i]);
        if (diff > 5000) {
          active = true;
          break;
        }
      }
    }

    lastFrame = frame;
    statusEl.textContent = active ? "Activity Detected" : "No Activity Detected";

    loopTimeout = setTimeout(monitorLoop, 1000);
  }

  // Bind events
  startBtn.addEventListener("click", startCapture);

  if (stopBtn) {
    stopBtn.addEventListener("click", stopCapture);
  }

  // Test Notify Pi button
  const testPiBtn = document.getElementById("testPiBtn");
  if (testPiBtn) {
    testPiBtn.addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "testNotifyPi" });
    });
  }

});
