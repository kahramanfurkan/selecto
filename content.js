let isSelectionMode = false;
let originalSpellcheck = null;
let statusTimeout = null;
let copyButton = null;
let currentSelection = "";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "selectText") {
    toggleSelectionMode();
  }
});

function toggleSelectionMode(onTextSelect) {
  isSelectionMode = !isSelectionMode;
  if (isSelectionMode) {
    enableSelectionMode();
  } else {
    disableSelectionMode(onTextSelect);
  }
  toggleStatusPopup(onTextSelect);
}

function enableSelectionMode() {
  originalSpellcheck = document.body.spellcheck;
  document.body.spellcheck = false;
  document.designMode = "on";
  document.body.classList.add("selecto-selection-mode");
  document.addEventListener("keydown", preventEditing, true);
  document.addEventListener("input", preventEditing, true);
  document.addEventListener("click", preventClicks, true);
  document.addEventListener("mouseup", handleMouseUp, true);
  document.addEventListener("dblclick", handleDoubleClick, true);
}

function disableSelectionMode(onTextSelect) {
  document.body.spellcheck = originalSpellcheck;
  document.designMode = "off";
  document.body.classList.remove("selecto-selection-mode");
  document.removeEventListener("keydown", preventEditing, true);
  document.removeEventListener("input", preventEditing, true);
  document.removeEventListener("click", preventClicks, true);
  document.removeEventListener("mouseup", handleMouseUp, true);
  document.removeEventListener("dblclick", handleDoubleClick, true);
  if (!onTextSelect) removeCopyButton();
  document.addEventListener("click", (e) => checkCopyButton(e.target), true);
}

function toggleStatusPopup(onTextSelect) {
  const existingPopup = document.querySelector(".selecto-status");
  if (existingPopup) existingPopup.remove();
  const popup = document.createElement("div");
  popup.className = `selecto-status ${isSelectionMode ? "on" : "off"}`;
  popup.innerHTML = `
        <img src="${chrome.runtime.getURL("icons/icon48.png")}" alt="">
        <span class="status-text">${isSelectionMode ? "ON" : "OFF"}</span>
        ${onTextSelect ? '<span class="status-text">Text Selected</span>' : ""}
    `;
  document.body.appendChild(popup);
  if (statusTimeout) clearTimeout(statusTimeout);
  if (!isSelectionMode) {
    statusTimeout = setTimeout(() => {
      popup.style.opacity = "0";
      setTimeout(() => popup.remove(), 300);
    }, 1000);
  }
}

function handleDoubleClick(e) {
  const selection = window.getSelection();
  if (selection) {
    selection.selectAllChildren(e.target);
    setTimeout(() => {
      handleMouseUp();
    }, 500);
  }
}

function handleMouseUp(e) {
  if (isSelectionMode) {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      currentSelection = selection.toString();
      chrome.storage.sync.get(["showCopyIcon"], (result) => {
        if (result.showCopyIcon !== false) {
          showCopyButton(selection);
        }
      });
      setTimeout(() => {
        toggleSelectionMode(true);
      }, 500);
    }
  }
}

function preventClicks(e) {
  if (isSelectionMode) {
    e.preventDefault();
    e.stopPropagation();
  }
}

function preventEditing(e) {
  if (isSelectionMode) {
    const allowedKeys = [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "PageUp",
      "PageDown",
      "Shift",
    ];
    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  }
}

function showCopyButton(selection) {
  removeCopyButton();
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  copyButton = document.createElement("button");
  copyButton.className = "selecto-copy-button";
  copyButton.innerHTML = `
    <img src="${chrome.runtime.getURL("icons/copy.png")}" alt="">
    <div class="selecto-copy-button-close" title="Close">×</div>
  `;
  copyButton.title = `Copy to clipboard [${currentSelection}]`;
  copyButton.style.top = `${rect.top + window.scrollY}px`;
  copyButton.style.left = `${rect.right + window.scrollX + 5}px`;
  const closeButton = copyButton.querySelector(".selecto-copy-button-close");
  closeButton.addEventListener("click", (e) => {
    e.stopPropagation();
    removeCopyButton();
  });
  copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(currentSelection).then(() => {
      copyButton.classList.add("copied");
      copyButton.innerHTML = "Copied!";

      setTimeout(() => {
        selection.removeAllRanges();
        removeCopyButton();
      }, 1000);
    });
  });
  document.body.appendChild(copyButton);
  const buttonRect = copyButton.getBoundingClientRect();
  if (buttonRect.right > window.innerWidth) {
    copyButton.style.left = `${
      rect.left + window.scrollX - buttonRect.width - 5
    }px`;
  }
}

function removeCopyButton() {
  if (copyButton) {
    copyButton.remove();
    copyButton = null;
    currentSelection = "";
  }
}

function checkCopyButton(target) {
  if (!copyButton?.contains(target)) {
    removeCopyButton();
    document.removeEventListener("click", checkCopyButton, true);
  }
}
