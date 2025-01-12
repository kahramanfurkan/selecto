document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("openShortcuts").addEventListener("click", () => {
    chrome.tabs.create({
      url: "chrome://extensions/shortcuts",
    });
  });

  chrome.commands.getAll((commands) => {
    const selectTextCommand = commands.find(
      (cmd) => cmd.name === "select-text"
    );
    if (selectTextCommand && selectTextCommand.shortcut) {
      document.getElementById("currentShortcut").textContent =
        selectTextCommand.shortcut;
    }
  });

  const checkbox = document.getElementById("showCopyIcon");

  chrome.storage.sync.get(["showCopyIcon"], (result) => {
    checkbox.checked = result.showCopyIcon !== false;
  });

  checkbox.addEventListener("change", () => {
    chrome.storage.sync.set({ showCopyIcon: checkbox.checked });
  });
});
