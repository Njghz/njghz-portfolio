const STORAGE_KEYS = {
  status: "discord-panel-demo-status",
  compact: "discord-panel-compact",
  animations: "discord-panel-animations",
};

const statusContent = {
  online: {
    label: "Online",
    title: "Бот на связи и готов к работе",
    description: "Все демонстрационные модули работают штатно.",
  },
  offline: {
    label: "Offline",
    title: "Бот сейчас не в сети",
    description: "Это локальный демонстрационный статус, а не данные Discord API.",
  },
};

const body = document.body;
const menuToggle = document.querySelector("[data-sidebar-open]");
const statusAnnouncement = document.querySelector("#status-announcement");
const toast = document.querySelector(".toast");
const toastTitle = document.querySelector("[data-toast-title]");
const toastMessage = document.querySelector("[data-toast-message]");
let toastTimer;

function readSetting(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSetting(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // The panel still works when browser storage is unavailable.
  }
}

function setSidebar(open) {
  body.classList.toggle("sidebar-open", open);
  menuToggle?.setAttribute("aria-expanded", String(open));
}

function setBotStatus(status, announce = true) {
  const nextStatus = status === "offline" ? "offline" : "online";
  const content = statusContent[nextStatus];

  body.dataset.botStatus = nextStatus;
  document.querySelectorAll("[data-status-label]").forEach((element) => {
    element.textContent = content.label;
  });

  document.querySelectorAll("[data-status-control]").forEach((button) => {
    const selected = button.dataset.statusControl === nextStatus;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  const stateTitle = document.querySelector("#bot-state-title");
  const stateDescription = document.querySelector("#bot-state-description");
  if (stateTitle) stateTitle.textContent = content.title;
  if (stateDescription) stateDescription.textContent = content.description;

  document.querySelectorAll(".status-pill").forEach((pill) => {
    pill.classList.toggle("is-online", nextStatus === "online");
  });

  document.querySelectorAll(".status-badge").forEach((badge) => {
    badge.classList.toggle("is-online", nextStatus === "online");
    badge.setAttribute("aria-pressed", String(nextStatus === "offline"));
  });

  writeSetting(STORAGE_KEYS.status, nextStatus);

  if (announce) {
    statusAnnouncement.textContent = `Демонстрационный статус изменён: ${content.label}`;
  }
}

function showToast(title, message) {
  window.clearTimeout(toastTimer);
  toastTitle.textContent = title;
  toastMessage.textContent = message;
  toast.classList.add("is-visible");

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 4200);
}

function closeDialog(dialog) {
  if (!dialog?.open) return;

  if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
  }
}

function openDialog(dialog) {
  if (!dialog) return;
  setSidebar(false);

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.append(textArea);
    textArea.select();
    const copied = document.execCommand("copy");
    textArea.remove();
    return copied;
  }
}

function applyStoredSettings() {
  const storedStatus = readSetting(STORAGE_KEYS.status);
  setBotStatus(storedStatus === "offline" ? "offline" : "online", false);

  const compactToggle = document.querySelector('[data-setting-toggle="compact"]');
  if (compactToggle) {
    compactToggle.checked = readSetting(STORAGE_KEYS.compact) === "true";
    body.classList.toggle("compact-mode", compactToggle.checked);
  }

  const animationsToggle = document.querySelector('[data-setting-toggle="animations"]');
  if (animationsToggle) {
    const animationsDisabled = readSetting(STORAGE_KEYS.animations) === "false";
    animationsToggle.checked = !animationsDisabled;
    body.classList.toggle("no-animations", animationsDisabled);
  }

  const year = document.querySelector("#current-year");
  if (year) year.textContent = new Date().getFullYear();
}

document.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-dialog-open]");
  if (openButton) {
    openDialog(document.getElementById(openButton.dataset.dialogOpen));
    return;
  }

  const closeButton = event.target.closest("[data-dialog-close]");
  if (closeButton) {
    closeDialog(closeButton.closest("dialog"));
    return;
  }

  const statusButton = event.target.closest("[data-status-control]");
  if (statusButton) {
    setBotStatus(statusButton.dataset.statusControl);
    return;
  }

  const statusToggle = event.target.closest("[data-status-toggle]");
  if (statusToggle) {
    setBotStatus(body.dataset.botStatus === "online" ? "offline" : "online");
    return;
  }

  const commandButton = event.target.closest("[data-copy-command]");
  if (commandButton) {
    copyText(commandButton.dataset.copyCommand).then((copied) => {
      showToast(
        copied ? "Команда скопирована" : "Не удалось скопировать",
        copied ? commandButton.dataset.copyCommand : "Скопируйте команду вручную",
      );
    });
    return;
  }

  const settingToggle = event.target.closest("[data-setting-toggle]");
  if (settingToggle) {
    const setting = settingToggle.dataset.settingToggle;
    const isChecked = settingToggle.checked;

    if (setting === "compact") {
      body.classList.toggle("compact-mode", isChecked);
      writeSetting(STORAGE_KEYS.compact, String(isChecked));
    }

    if (setting === "animations") {
      body.classList.toggle("no-animations", !isChecked);
      writeSetting(STORAGE_KEYS.animations, String(isChecked));
    }
    return;
  }

  const demoAction = event.target.closest("[data-demo-action]");
  if (demoAction) {
    const action = demoAction.dataset.demoAction;
    closeDialog(demoAction.closest("dialog"));

    if (action === "oauth") {
      showToast(
        "Демо-режим",
        "OAuth не подключён: на сайте нет токена или запросов к Discord API.",
      );
    }

    if (action === "save-settings") {
      showToast("Настройки сохранены", "Изменения действуют только в этом браузере.");
    }
    return;
  }

  if (event.target.closest("[data-refresh]")) {
    const refreshIcon = event.target.closest("[data-refresh]")?.querySelector(".refresh-icon");
    refreshIcon?.classList.add("is-refreshing");
    window.setTimeout(() => refreshIcon?.classList.remove("is-refreshing"), 500);
    showToast("Данные обновлены", "Показаны локальные демонстрационные значения.");
    return;
  }

  const sectionButton = event.target.closest("[data-section-target]");
  if (sectionButton) {
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.toggle("is-active", item === sectionButton);
      item.removeAttribute("aria-current");
    });
    sectionButton.setAttribute("aria-current", "page");
    document.getElementById(sectionButton.dataset.sectionTarget)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setSidebar(false);
  }
});

document.querySelector("[data-sidebar-open]")?.addEventListener("click", () => {
  setSidebar(!body.classList.contains("sidebar-open"));
});

document.querySelector("[data-sidebar-close]")?.addEventListener("click", () => {
  setSidebar(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setSidebar(false);
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;

    const bounds = dialog.getBoundingClientRect();
    const clickedInside =
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom;

    if (!clickedInside) closeDialog(dialog);
  });
});

document.querySelector("[data-toast-close]")?.addEventListener("click", () => {
  window.clearTimeout(toastTimer);
  toast.classList.remove("is-visible");
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 860) setSidebar(false);
});

applyStoredSettings();
