document.addEventListener("DOMContentLoaded", () => {
  const openShortcutsPage = () => {
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
  };

  document.querySelectorAll(".open-shortcuts").forEach(el => {
    el.addEventListener("click", openShortcutsPage);
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

  checkbox.addEventListener("change", (e) => {
    chrome.storage.sync.set({ showCopyIcon: e.target.checked });
  });
});
