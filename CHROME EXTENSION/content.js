let lastActivityTime = Date.now();

function markActivity() {
  lastActivityTime = Date.now();
  console.log("content.js: activity detected");
  chrome.runtime.sendMessage({ activity: true });
}

// Track user input activity
["mousemove","keydown","click","scroll"].forEach(evt => {
  document.addEventListener(evt, markActivity, true);
});

// Mutation-based activity (e.g., GIF frame changes) with throttling
let _lastMutTime = 0;
const _throttle = 200;
if (typeof MutationObserver !== 'undefined') {
  const observer = new MutationObserver(() => {
    const now = Date.now();
    if (now - _lastMutTime > _throttle) {
      _lastMutTime = now;
      markActivity();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
}

// Seed initial activity
console.log("content.js: seed activity");
chrome.runtime.sendMessage({ activity: true });
