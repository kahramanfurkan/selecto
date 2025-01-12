let isSelectionMode = false;
let originalSpellcheck = null;
let statusTimeout = null;

function toggleStatusPopup(onTextSelect) {
    const existingPopup = document.querySelector('.selecto-status');
    if (existingPopup) {
        existingPopup.remove();
    }

    const popup = document.createElement('div');
    popup.className = `selecto-status ${isSelectionMode ? 'on' : 'off'}`;
    popup.innerHTML = `
        <img src="${chrome.runtime.getURL('icons/icon48.png')}" alt="">
        <span class="status-text">${isSelectionMode ? 'ON' : 'OFF'}</span>
        ${onTextSelect ? '<span class="status-text">Text Selected</span>' : ''}
    `;
    document.body.appendChild(popup);

    if (statusTimeout) {
        clearTimeout(statusTimeout);
    }

    if (!isSelectionMode) {
        statusTimeout = setTimeout(() => {
            popup.style.opacity = '0';
            setTimeout(() => popup.remove(), 300);
        }, 2000);
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'selectText') {
        toggleSelectionMode();
    }
});


function toggleSelectionMode(onTextSelect) {
    isSelectionMode = !isSelectionMode;

    if (isSelectionMode) {
        enableSelectionMode();
    } else {
        disableSelectionMode();
    }
    toggleStatusPopup(onTextSelect);
}

function enableSelectionMode() {
    originalSpellcheck = document.body.spellcheck;
    document.body.spellcheck = false;
    document.designMode = 'on';
    document.body.style.cursor = 'text';
    document.addEventListener('keydown', preventEditing, true);
    document.addEventListener('input', preventEditing, true);
    document.addEventListener('click', preventClicks, true);
    document.addEventListener('mouseup', handleMouseUp, true);
}

function disableSelectionMode() {
    document.body.spellcheck = originalSpellcheck;
    document.designMode = 'off';
    document.body.style.cursor = '';
    document.removeEventListener('keydown', preventEditing, true);
    document.removeEventListener('input', preventEditing, true);
    document.removeEventListener('click', preventClicks, true);
    document.removeEventListener('mouseup', handleMouseUp, true);
}


function preventClicks(e) {
    if (isSelectionMode) {
        e.preventDefault();
        e.stopPropagation();
    }
}

function handleMouseUp(e) {
    if (isSelectionMode) {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
            setTimeout(() => {
                toggleSelectionMode(true);
            }, 500);
        }
    }
}

function preventEditing(e) {
    if (isSelectionMode) {
        const allowedKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', 'Shift'];
        if (!allowedKeys.includes(e.key)) {
            e.preventDefault();
        }
    }
} 