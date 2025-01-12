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
});
