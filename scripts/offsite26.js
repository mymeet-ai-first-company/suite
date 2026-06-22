(() => {
  const API_EVENTS = "/api/offsite26/events";
  const API_RESET = "/api/offsite26/reset";

  const DAYS = [
    { id: "2026-06-28", weekday: "Воскресенье", date: "28 июня", tone: "arrival" },
    { id: "2026-06-29", weekday: "Понедельник", date: "29 июня", tone: "work" },
    { id: "2026-06-30", weekday: "Вторник", date: "30 июня", tone: "work" },
    { id: "2026-07-01", weekday: "Среда", date: "1 июля", tone: "work" },
    { id: "2026-07-02", weekday: "Четверг", date: "2 июля", tone: "work" },
    { id: "2026-07-03", weekday: "Пятница", date: "3 июля", tone: "social" },
    { id: "2026-07-04", weekday: "Суббота", date: "4 июля", tone: "sport" },
    { id: "2026-07-05", weekday: "Воскресенье", date: "5 июля", tone: "wrap" }
  ];

  const CATEGORY_LABELS = {
    work: "Работа",
    travel: "Заезд",
    creative: "Креатив",
    sport: "Спорт",
    social: "Команда",
    food: "Еда"
  };

  const CATEGORY_OPTIONS = ["work", "travel", "creative", "sport", "social"];
  const DAY_START = 540;
  const DAY_END = 1440;

  const LOCATIONS = [
    {
      title: "Гостиница у Красных Ворот",
      text: "Хомутовский тупик 5-7 с.13. Тихая база рядом с Красными Воротами и Садовым кольцом.",
      links: [
        { label: "Сайт гостиницы", href: "https://гостиницаукрасныхворот.рф" },
        { label: "Карта гостиницы", href: "https://yandex.com.tr/maps/-/CLA96NOa" }
      ]
    },
    {
      title: "SOK Земляной Вал",
      text: "Коворкинг на Земляном Валу, 8. Наши комнаты: 306-307.",
      links: [
        { label: "Страница SOK", href: "https://sok.works/locations/sok-zemlyanoy-val/" },
        { label: "Карта SOK", href: "https://yandex.com.tr/maps/-/CLrBfUZL" }
      ]
    },
    {
      title: "Ночной велофестиваль",
      text: "4 июля, Крылатская улица. Слоты старта 21:00 или 22:00.",
      links: [
        { label: "О событии", href: "https://mosvelofest.mos.ru/events/04jul2026/about/" }
      ]
    }
  ];

  const ACTIVITY_IDEAS = [
    {
      tag: "Вечер",
      title: "Вечера с планом",
      text: "Не расписываем завтраки и обеды. Днем работаем вместе, вечером делаем одну активность с понедельника по субботу."
    },
    {
      tag: "Креатив",
      title: "Подкаст и рилсы",
      text: "Записать выпуск про внутрянку и снять контент пачкой по сценариям."
    },
    {
      tag: "Спорт",
      title: "Падел и вело",
      text: "Арендовать корты, а 4 июля сходить на ночной велофестиваль."
    },
    {
      tag: "SOK",
      title: "Вечеринка в коворкинге",
      text: "Пиво, снеки, проектор, матч ЧМ и/или F1."
    }
  ];

  const state = {
    events: [],
    selectedId: "",
    editing: false
  };

  const nodes = {
    program: document.getElementById("programGrid"),
    editButton: document.getElementById("editButton"),
    saveButton: document.getElementById("saveButton"),
    resetButton: document.getElementById("resetButton"),
    status: document.getElementById("statusLine"),
    eventSelect: document.getElementById("eventSelect"),
    daySelect: document.getElementById("daySelect"),
    startSelect: document.getElementById("startSelect"),
    durationSelect: document.getElementById("durationSelect"),
    categorySelect: document.getElementById("categorySelect"),
    logisticsGrid: document.getElementById("logisticsGrid"),
    activityGrid: document.getElementById("activityGrid")
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function icon(name) {
    if (name === "edit") {
      return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m13.586 3.586 2.828 2.828-8.18 8.18a2 2 0 0 1-.878.511l-3.178.91a.75.75 0 0 1-.928-.928l.91-3.178a2 2 0 0 1 .512-.878l8.914-7.445Z"></path><path d="M15 2a2 2 0 0 1 1.414.586l1 1A2 2 0 0 1 17.414 6L16.5 6.914 13.672 4.086 14.586 3.172A2 2 0 0 1 15 2Z"></path></svg>';
    }

    if (name === "check") {
      return '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd"></path></svg>';
    }

    return '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"></path></svg>';
  }

  function minutesToTime(minutes) {
    if (minutes === 1440) return "24:00";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  }

  function eventEnd(event) {
    return Math.min(DAY_END, event.start + event.duration);
  }

  function dayTitle(dayId) {
    const day = DAYS.find((item) => item.id === dayId);
    return day ? `${day.weekday}, ${day.date}` : dayId;
  }

  function slotLabel(count) {
    if (count === 1) return "1 слот";
    if (count > 1 && count < 5) return `${count} слота`;
    return `${count} слотов`;
  }

  function groupEventsByDay(events) {
    return DAYS.reduce((groups, day) => {
      groups[day.id] = events
        .filter((event) => event.day === day.id)
        .sort((a, b) => a.start - b.start || a.title.localeCompare(b.title));
      return groups;
    }, {});
  }

  function updateEvent(events, eventId, patch) {
    return events.map((event) => {
      if (event.id !== eventId) return event;
      const next = { ...event, ...patch };
      return { ...next, duration: Math.min(next.duration, DAY_END - next.start) };
    });
  }

  function setStatus(message, mode = "") {
    nodes.status.textContent = message;
    nodes.status.className = `status-line${mode ? ` is-${mode}` : ""}`;
  }

  function renderLogistics() {
    nodes.logisticsGrid.innerHTML = LOCATIONS.map((location) => `
      <article class="info-card">
        <h3>${escapeHtml(location.title)}</h3>
        <p>${escapeHtml(location.text)}</p>
        <div class="link-list">
          ${location.links.map((linkItem) => `
            <a href="${escapeHtml(linkItem.href)}" target="_blank" rel="noopener noreferrer">
              <span>${escapeHtml(linkItem.label)}</span>
            </a>
          `).join("")}
        </div>
      </article>
    `).join("");
  }

  function renderActivities() {
    nodes.activityGrid.innerHTML = ACTIVITY_IDEAS.map((activity) => `
      <article class="activity-card">
        <span class="activity-card__tag">${escapeHtml(activity.tag)}</span>
        <h3>${escapeHtml(activity.title)}</h3>
        <p>${escapeHtml(activity.text)}</p>
      </article>
    `).join("");
  }

  function renderControls() {
    nodes.eventSelect.innerHTML = state.events
      .slice()
      .sort((a, b) => a.day.localeCompare(b.day) || a.start - b.start)
      .map((event) => `<option value="${escapeHtml(event.id)}">${escapeHtml(dayTitle(event.day))} · ${escapeHtml(event.title)}</option>`)
      .join("");

    nodes.daySelect.innerHTML = DAYS.map((day) => (
      `<option value="${day.id}">${day.weekday}, ${day.date}</option>`
    )).join("");

    const startOptions = [];
    for (let value = DAY_START; value <= DAY_END - 15; value += 15) {
      startOptions.push(`<option value="${value}">${minutesToTime(value)}</option>`);
    }
    nodes.startSelect.innerHTML = startOptions.join("");

    nodes.durationSelect.innerHTML = [60, 90, 120, 150, 180, 210, 240, 300, 360, 390, 480, 510]
      .map((value) => `<option value="${value}">${value} мин</option>`)
      .join("");

    nodes.categorySelect.innerHTML = CATEGORY_OPTIONS.map((category) => (
      `<option value="${category}">${CATEGORY_LABELS[category]}</option>`
    )).join("");

    if (!state.selectedId && state.events[0]) {
      state.selectedId = state.events[0].id;
    }

    syncSelectedControls();
  }

  function syncSelectedControls() {
    const selected = state.events.find((event) => event.id === state.selectedId);
    if (!selected) return;

    nodes.eventSelect.value = selected.id;
    nodes.daySelect.value = selected.day;
    nodes.startSelect.value = String(selected.start);
    nodes.durationSelect.value = String(selected.duration);
    nodes.categorySelect.value = selected.category;
  }

  function renderProgramBlock(event) {
    const isSelected = event.id === state.selectedId ? " is-selected" : "";
    return `
      <article
        class="program-event program-event--${escapeHtml(event.category)}${isSelected}"
        data-event-id="${escapeHtml(event.id)}"
        tabindex="0"
        aria-label="${escapeHtml(`${event.title}, ${minutesToTime(event.start)}-${minutesToTime(eventEnd(event))}`)}"
      >
        <div class="program-event__top">
          <span>${minutesToTime(event.start)}-${minutesToTime(eventEnd(event))}</span>
          <span>${escapeHtml(CATEGORY_LABELS[event.category] || event.category)}</span>
        </div>
        <h3>${escapeHtml(event.title)}</h3>
        <p>${escapeHtml(event.description)}</p>
        <div class="program-event__place">${escapeHtml(event.location || "")}</div>
        ${event.link ? `<a href="${escapeHtml(event.link)}" target="_blank" rel="noopener noreferrer">Открыть ссылку</a>` : ""}
      </article>
    `;
  }

  function renderProgram() {
    const grouped = groupEventsByDay(state.events);

    nodes.program.innerHTML = DAYS.map((day) => {
      const events = grouped[day.id] || [];
      return `
        <section class="day-tile day-tile--${escapeHtml(day.tone)}" data-day="${day.id}">
          <div class="day-tile__head">
            <div>
              <div class="day-tile__weekday">${escapeHtml(day.weekday)}</div>
              <div class="day-tile__date">${escapeHtml(day.date)}</div>
            </div>
            <span class="day-tile__count">${slotLabel(events.length)}</span>
          </div>
          <div class="day-tile__body">
            ${events.map(renderProgramBlock).join("") || '<div class="day-tile__empty">Пока пусто</div>'}
          </div>
        </section>
      `;
    }).join("");

    attachProgramEvents();
    renderControls();
  }

  function selectEvent(eventId) {
    state.selectedId = eventId;
    renderProgram();
  }

  function attachProgramEvents() {
    document.querySelectorAll(".program-event").forEach((card) => {
      card.addEventListener("click", () => selectEvent(card.dataset.eventId));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectEvent(card.dataset.eventId);
        }
      });
    });
  }

  function applySelectedControls() {
    const eventId = nodes.eventSelect.value;
    state.selectedId = eventId;
    state.events = updateEvent(state.events, eventId, {
      day: nodes.daySelect.value,
      start: Number(nodes.startSelect.value),
      duration: Number(nodes.durationSelect.value),
      category: nodes.categorySelect.value
    });
    setStatus("Есть несохраненные изменения");
    renderProgram();
  }

  function setEditing(enabled) {
    state.editing = enabled;
    document.body.classList.toggle("editing", enabled);
    nodes.editButton.innerHTML = enabled ? `${icon("check")} Готово` : `${icon("edit")} Внести изменения`;
    nodes.saveButton.hidden = !enabled;
    nodes.resetButton.hidden = !enabled;
    document.querySelector(".editor-panel").hidden = !enabled;
    renderProgram();
  }

  async function loadSchedule() {
    setStatus("Загружаем программу");
    const response = await fetch(API_EVENTS);
    if (!response.ok) {
      throw new Error("Не удалось загрузить программу");
    }
    const payload = await response.json();
    state.events = payload.events || [];
    state.selectedId = state.events[0] ? state.events[0].id : "";
    setStatus(payload.updatedAt ? `Обновлено: ${new Date(payload.updatedAt).toLocaleString("ru-RU")}` : "");
    renderProgram();
  }

  async function saveSchedule() {
    nodes.saveButton.disabled = true;
    setStatus("Сохраняем");

    try {
      const response = await fetch(API_EVENTS, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: state.events })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Не удалось сохранить");
      }

      const payload = await response.json();
      state.events = payload.events || state.events;
      setStatus(`Сохранено: ${new Date(payload.updatedAt).toLocaleString("ru-RU")}`, "success");
      renderProgram();
    } catch (error) {
      setStatus(error.message, "error");
    } finally {
      nodes.saveButton.disabled = false;
    }
  }

  async function resetSchedule() {
    nodes.resetButton.disabled = true;
    setStatus("Возвращаем дефолтную программу");

    try {
      const response = await fetch(API_RESET, { method: "POST" });
      if (!response.ok) throw new Error("Не удалось сбросить программу");
      const payload = await response.json();
      state.events = payload.events || [];
      state.selectedId = state.events[0] ? state.events[0].id : "";
      setStatus("Дефолтная программа восстановлена", "success");
      renderProgram();
    } catch (error) {
      setStatus(error.message, "error");
    } finally {
      nodes.resetButton.disabled = false;
    }
  }

  function bindControls() {
    nodes.editButton.addEventListener("click", () => setEditing(!state.editing));
    nodes.saveButton.addEventListener("click", saveSchedule);
    nodes.resetButton.addEventListener("click", resetSchedule);
    nodes.eventSelect.addEventListener("change", () => selectEvent(nodes.eventSelect.value));
    nodes.daySelect.addEventListener("change", applySelectedControls);
    nodes.startSelect.addEventListener("change", applySelectedControls);
    nodes.durationSelect.addEventListener("change", applySelectedControls);
    nodes.categorySelect.addEventListener("change", applySelectedControls);
  }

  function init() {
    renderLogistics();
    renderActivities();
    bindControls();
    loadSchedule().catch((error) => {
      setStatus(error.message, "error");
    });
  }

  init();
})();
