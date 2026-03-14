Testing heartbeat end-to-end

- Start monitoring from the extension popup.
- Generate activity (mouse move, key press, etc.) on a tracked page.
- Expect the server to print ACTIVITY DETECTED while active.
- After ~3 seconds of no activity, expect NO ACTIVITY DETECTED and EXTENSION INACTIVE/ACTIVE messages depending on state.
