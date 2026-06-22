(() => {
  const API_EVENTS = "/api/offsite26/events";
  const API_RESET = "/api/offsite26/reset";
  const DAY_START = 480;
  const DAY_END = 1440;
  const HOUR_HEIGHT = 64;
  const PX_PER_MINUTE = HOUR_HEIGHT / 60;

  const DAYS = [
    { id: "2026-06-29", weekday: "Понедельник", date: "29 июня" },
    { id: "2026-06-30", weekday: "Вторник", date: "30 июня" },
    { id: "2026-07-01", weekday: "Среда", date: "1 июля" },
    { id: "2026-07-02", weekday: "Четверг", date: "2 июля" },
    { id: "2026-07-03", weekday: "Пятница", date: "3 июля" },
    { id: "2026-07-04", weekday: "Суббота", date: "4 июля" },
    { id: "2026-07-05", weekday: "Воскресенье", date: "5 июля" }
  ];

  const CATEGORY_LABELS = {
    food: "Еда",
    work: "Работа",
    travel: "Логистика",
    creative: "Креатив",
    sport: "Спорт",
    social: "Команда"
  };

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
      tag: "Суббота",
      title: "Ночной велофестиваль",
      text: "Сгонять 4 июля, а после заехать в бар. Велики в аренду или просто покататься."
    },
    {
      tag: "Креатив",
      title: "Командный подкаст",
      text: "Позвать команду в студию на 10 человек и записать выпуск про внутрянку."
    },
    {
      tag: "Спорт",
      title: "Падел",
      text: "Арендовать корты и сыграть командами."
    },
    {
      tag: "Работа",
      title: "Фулл vibe-code хакатон",
      text: "За день нагенерить идеи, разбиться на команды и собрать прототипы."
    },
    {
      tag: "Контент",
      title: "Рилс-день",
      text: "Сценарии и референсы от Андрюхи, съемка пачкой."
    },
    {
      tag: "Вечер",
      title: "Боулинг и бильярд",
      text: "Дорожка, стол и loser bracket по настроению."
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
    editing: false,
    dirty: false,
    saving: false
  };

  const nodes = {
    calendar: document.getElementById("calendarGrid"),
    editButton: document.getElementById("editButton"),
    saveButton: document.getElementById("saveButton"),
    resetButton: document.getElementById("resetButton"),
    status: document.getElementById("statusLine"),
    eventSelect: document.getElementById("eventSelect"),
    daySelect: document.getElementById("daySelect"),
    startSelect: document.getElementById("startSelect"),
    durationSelect: document.getElementById("durationSelect"),
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
    if (name === "plus") {
      return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z"></path></svg>';
    }

    if (name === "minus") {
      return '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z" clip-rule="evenodd"></path></svg>';
    }

    if (name === "edit") {
      return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m13.586 3.586 2.828 2.828-8.18 8.18a2 2 0 0 1-.878.511l-3.178.91a.75.75 0 0 1-.928-.928l.91-3.178a2 2 0 0 1 .512-.878l8.914-7.445Z"></path><path d="M15 2a2 2 0 0 1 1.414.586l1 1A2 2 0 0 1 17.414 6L16.5 6.914 13.672 4.086 14.586 3.172A2 2 0 0 1 15 2Z"></path></svg>';
    }

    return '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd"></path></svg>';
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

  function groupEventsByDay(events) {
    return DAYS.reduce((groups, day) => {
      groups[day.id] = events
        .filter((event) => event.day === day.id)
        .sort((a, b) => a.start - b.start || a.title.localeCompare(b.title));
      return groups;
    }, {});
  }

  function moveEvent(events, eventId, targetDay) {
    return events.map((event) => (
      event.id === eventId ? { ...event, day: targetDay } : event
    ));
  }

  function resizeEvent(events, eventId, deltaMinutes) {
    return events.map((event) => {
      if (event.id !== eventId) return event;
      const duration = Math.min(480, Math.max(15, event.duration + deltaMinutes));
      return { ...event, duration: Math.min(duration, DAY_END - event.start) };
    });
  }

  function updateEvent(events, eventId, patch) {
    return events.map((event) => {
      if (event.id !== eventId) return event;
      const next = { ...event, ...patch };
      return {
        ...next,
        duration: Math.min(next.duration, DAY_END - next.start)
      };
    });
  }

  function markDirty() {
    state.dirty = true;
    setStatus("Есть несохраненные изменения");
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
      .map((event) => `<option value="${escapeHtml(event.id)}">${escapeHtml(event.title)}</option>`)
      .join("");

    nodes.daySelect.innerHTML = DAYS.map((day) => (
      `<option value="${day.id}">${day.weekday}, ${day.date}</option>`
    )).join("");

    const startOptions = [];
    for (let value = DAY_START; value <= DAY_END - 15; value += 15) {
      startOptions.push(`<option value="${value}">${minutesToTime(value)}</option>`);
    }
    nodes.startSelect.innerHTML = startOptions.join("");

    nodes.durationSelect.innerHTML = [30, 45, 60, 90, 120, 150, 180, 210, 240, 300, 360, 480]
      .map((value) => `<option value="${value}">${value} мин</option>`)
      .join("");

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
  }

  function eventStyle(event) {
    const top = Math.max(0, (event.start - DAY_START) * PX_PER_MINUTE + 4);
    const height = Math.max(48, event.duration * PX_PER_MINUTE - 8);
    return `top:${top}px;height:${height}px;`;
  }

  function renderEvent(event) {
    const isSelected = event.id === state.selectedId ? " is-selected" : "";
    const draggable = state.editing ? ' draggable="true"' : "";
    return `
      <article
        class="event-card event-card--${escapeHtml(event.category)}${isSelected}"
        style="${eventStyle(event)}"
        data-event-id="${escapeHtml(event.id)}"${draggable}
        tabindex="0"
        aria-label="${escapeHtml(`${event.title}, ${minutesToTime(event.start)}-${minutesToTime(eventEnd(event))}`)}"
      >
        <div class="event-card__time">${minutesToTime(event.start)}-${minutesToTime(eventEnd(event))}</div>
        <div class="event-card__title">${escapeHtml(event.title)}</div>
        <div class="event-card__meta">${escapeHtml(event.location || CATEGORY_LABELS[event.category])}</div>
        <div class="event-card__actions" aria-label="Изменить длительность">
          <button class="button button--icon" type="button" data-resize="-30" aria-label="Уменьшить на 30 минут">${icon("minus")}</button>
          <button class="button button--icon" type="button" data-resize="30" aria-label="Увеличить на 30 минут">${icon("plus")}</button>
        </div>
      </article>
    `;
  }

  function renderCalendar() {
    const grouped = groupEventsByDay(state.events);
    const hourTicks = [];
    for (let minutes = DAY_START; minutes < DAY_END; minutes += 60) {
      hourTicks.push(`<div class="time-axis__tick">${minutesToTime(minutes)}</div>`);
    }

    nodes.calendar.innerHTML = `
      <div class="time-head"></div>
      ${DAYS.map((day) => `
        <div class="day-head">
          <div class="day-head__name">${escapeHtml(day.weekday)}</div>
          <div class="day-head__date">${escapeHtml(day.date)}</div>
        </div>
      `).join("")}
      <div class="time-axis">${hourTicks.join("")}</div>
      ${DAYS.map((day) => `
        <div class="day-lane" data-day="${day.id}" aria-label="${escapeHtml(`${day.weekday}, ${day.date}`)}">
          ${(grouped[day.id] || []).map(renderEvent).join("")}
        </div>
      `).join("")}
    `;

    attachCalendarEvents();
    renderControls();
  }

  function selectEvent(eventId) {
    state.selectedId = eventId;
    renderCalendar();
  }

  function attachCalendarEvents() {
    document.querySelectorAll(".event-card").forEach((card) => {
      card.addEventListener("click", () => selectEvent(card.dataset.eventId));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectEvent(card.dataset.eventId);
        }
      });

      card.addEventListener("dragstart", (event) => {
        if (!state.editing) return;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", card.dataset.eventId);
      });

      card.querySelectorAll("[data-resize]").forEach((button) => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          state.events = resizeEvent(state.events, card.dataset.eventId, Number(button.dataset.resize));
          state.selectedId = card.dataset.eventId;
          markDirty();
          renderCalendar();
        });
      });
    });

    document.querySelectorAll(".day-lane").forEach((lane) => {
      lane.addEventListener("dragover", (event) => {
        if (!state.editing) return;
        // Native drop only fires when the target cancels dragover.
        event.preventDefault();
        lane.classList.add("is-drop-target");
      });

      lane.addEventListener("dragleave", () => {
        lane.classList.remove("is-drop-target");
      });

      lane.addEventListener("drop", (event) => {
        if (!state.editing) return;
        event.preventDefault();
        lane.classList.remove("is-drop-target");
        const eventId = event.dataTransfer.getData("text/plain");
        if (!eventId) return;

        state.events = moveEvent(state.events, eventId, lane.dataset.day);
        state.selectedId = eventId;
        markDirty();
        renderCalendar();
      });
    });
  }

  function applySelectedControls() {
    const eventId = nodes.eventSelect.value;
    state.selectedId = eventId;
    state.events = updateEvent(state.events, eventId, {
      day: nodes.daySelect.value,
      start: Number(nodes.startSelect.value),
      duration: Number(nodes.durationSelect.value)
    });
    markDirty();
    renderCalendar();
  }

  function setEditing(enabled) {
    state.editing = enabled;
    document.body.classList.toggle("editing", enabled);
    nodes.editButton.innerHTML = enabled ? `${icon("check")} Готово` : `${icon("edit")} Внести изменения`;
    nodes.saveButton.hidden = !enabled;
    nodes.resetButton.hidden = !enabled;
    renderCalendar();
  }

  async function loadSchedule() {
    setStatus("Загружаем расписание");
    const response = await fetch(API_EVENTS);
    if (!response.ok) {
      throw new Error("Не удалось загрузить расписание");
    }
    const payload = await response.json();
    state.events = payload.events || [];
    state.selectedId = state.events[0] ? state.events[0].id : "";
    state.dirty = false;
    setStatus(payload.updatedAt ? `Обновлено: ${new Date(payload.updatedAt).toLocaleString("ru-RU")}` : "");
    renderCalendar();
  }

  async function saveSchedule() {
    state.saving = true;
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
      state.dirty = false;
      setStatus(`Сохранено: ${new Date(payload.updatedAt).toLocaleString("ru-RU")}`, "success");
      renderCalendar();
    } catch (error) {
      setStatus(error.message, "error");
    } finally {
      state.saving = false;
      nodes.saveButton.disabled = false;
    }
  }

  async function resetSchedule() {
    nodes.resetButton.disabled = true;
    setStatus("Возвращаем дефолтное расписание");

    try {
      const response = await fetch(API_RESET, { method: "POST" });
      if (!response.ok) throw new Error("Не удалось сбросить расписание");
      const payload = await response.json();
      state.events = payload.events || [];
      state.selectedId = state.events[0] ? state.events[0].id : "";
      state.dirty = false;
      setStatus("Дефолтное расписание восстановлено", "success");
      renderCalendar();
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
