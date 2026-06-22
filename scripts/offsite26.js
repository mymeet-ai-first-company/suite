(() => {
  const DAYS = [
    { id: "2026-06-28", weekday: "Воскресенье", date: "28 июня", tone: "arrival" },
    { id: "2026-06-29", weekday: "Понедельник", date: "29 июня", tone: "work" },
    { id: "2026-06-30", weekday: "Вторник", date: "30 июня", tone: "work" },
    { id: "2026-07-01", weekday: "Среда", date: "1 июля", tone: "work" },
    { id: "2026-07-02", weekday: "Четверг", date: "2 июля", tone: "creative" },
    { id: "2026-07-03", weekday: "Пятница", date: "3 июля", tone: "social" },
    { id: "2026-07-04", weekday: "Суббота", date: "4 июля", tone: "sport" },
    { id: "2026-07-05", weekday: "Воскресенье", date: "5 июля", tone: "wrap" }
  ];

  const PROGRAM_EVENTS = [
    {
      id: "sun-arrival",
      title: "Заезд в Москву",
      day: "2026-06-28",
      time: "17:00-21:00",
      category: "travel",
      location: "Гостиница у Красных Ворот",
      description: "Все приезжают в воскресенье, заселяются и спокойно собираются рядом с Красными Воротами."
    },
    {
      id: "mon-work",
      title: "Рабочий день в SOK",
      day: "2026-06-29",
      time: "10:00-18:30",
      category: "work",
      location: "SOK 306-307",
      description: "Старт недели: договориться о фокусах, разложить цели и синхронизировать команды."
    },
    {
      id: "mon-evening",
      title: "Командный ужин",
      day: "2026-06-29",
      time: "19:30-22:00",
      category: "social",
      location: "Москва",
      description: "Первый общий вечер без плотной повестки: собраться, поговорить, настроиться на неделю."
    },
    {
      id: "tue-work",
      title: "Рабочий день в SOK",
      day: "2026-06-30",
      time: "10:00-18:30",
      category: "work",
      location: "SOK 306-307",
      description: "Фокусная работа по продуктам и операционным задачам."
    },
    {
      id: "tue-bowling",
      title: "Боулинг и бильярд",
      day: "2026-06-30",
      time: "19:30-22:00",
      category: "sport",
      location: "Локация TBD",
      description: "Дорожка, стол и loser bracket по настроению."
    },
    {
      id: "wed-work",
      title: "Рабочий день в SOK",
      day: "2026-07-01",
      time: "10:00-18:30",
      category: "work",
      location: "SOK 306-307",
      description: "Демо, разбор блокеров, решения по рабочим трекам."
    },
    {
      id: "wed-padel",
      title: "Падел",
      day: "2026-07-01",
      time: "19:00-21:00",
      category: "sport",
      location: "Корты",
      description: "Арендовать корты и сыграть командами."
    },
    {
      id: "thu-hackathon",
      title: "Фулл vibe-code хакатон",
      day: "2026-07-02",
      time: "10:00-18:00",
      category: "creative",
      location: "SOK 306-307",
      description: "Один день, команды, быстрые прототипы и демо к вечеру."
    },
    {
      id: "thu-demo",
      title: "Демо и неформальный вечер",
      day: "2026-07-02",
      time: "18:30-21:30",
      category: "social",
      location: "SOK / город",
      description: "Показать, что получилось на хакатоне, а дальше спокойно переключиться в вечер."
    },
    {
      id: "fri-strategy",
      title: "Страт-сессия и итоги квартала",
      day: "2026-07-03",
      time: "10:00-17:30",
      category: "strategy",
      location: "SOK 306-307",
      description: "Подвести квартал, зафиксировать решения и договориться, что делаем дальше."
    },
    {
      id: "fri-party",
      title: "Вечер: офис или бар",
      day: "2026-07-03",
      time: "19:00-22:30",
      category: "social",
      location: "SOK / Москва",
      description: "Пиво, снеки, проектор, матч ЧМ и/или F1. Если захочется - уйти куда-нибудь в город."
    },
    {
      id: "sat-walk",
      title: "Гуляем и отдыхаем",
      day: "2026-07-04",
      time: "12:00-18:00",
      category: "free",
      location: "Москва",
      description: "Без работы. Просто погулять, выдохнуть и провести день без созвонов и задач."
    },
    {
      id: "sat-ride",
      title: "Ночной велофестиваль и бар",
      day: "2026-07-04",
      time: "21:00-24:00",
      category: "sport",
      location: "Крылатская улица / Москва",
      description: "Ночной велопробег 4 июля, после него бар. Велики в аренду или просто покататься.",
      link: "https://mosvelofest.mos.ru/events/04jul2026/about/"
    },
    {
      id: "sun-wrap",
      title: "Разъезд",
      day: "2026-07-05",
      time: "Утро-день",
      category: "travel",
      location: "Гостиница / город",
      description: "Без активностей: все разъезжаются. Максимум короткий общий завтрак, если кто-то остается рядом."
    }
  ];

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
      tag: "Работа",
      title: "Четверг - хакатон",
      text: "Вынесли хакатон из субботы: суббота остается днем без работы."
    },
    {
      tag: "Стратегия",
      title: "Пятница - итоги квартала",
      text: "Страт-сессия, квартальные итоги и фиксация решений на следующий период."
    },
    {
      tag: "Спорт",
      title: "Падел, боулинг, вело",
      text: "Падел в среду, боулинг во вторник, велофестиваль в субботу."
    },
    {
      tag: "Суббота",
      title: "Никакой работы",
      text: "Гуляем, отдыхаем, вечером ночной велофестиваль и бар."
    }
  ];

  const nodes = {
    program: document.getElementById("programGrid"),
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

  function groupEventsByDay(events) {
    return DAYS.reduce((groups, day) => {
      groups[day.id] = events.filter((event) => event.day === day.id);
      return groups;
    }, {});
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

  function renderProgramBlock(event) {
    return `
      <article class="program-event program-event--${escapeHtml(event.category)}">
        <div class="program-event__top">
          <span>${escapeHtml(event.time)}</span>
        </div>
        <h3>${escapeHtml(event.title)}</h3>
        <p>${escapeHtml(event.description)}</p>
        <div class="program-event__place">${escapeHtml(event.location || "")}</div>
        ${event.link ? `<a href="${escapeHtml(event.link)}" target="_blank" rel="noopener noreferrer">Открыть ссылку</a>` : ""}
      </article>
    `;
  }

  function renderProgram() {
    const grouped = groupEventsByDay(PROGRAM_EVENTS);

    nodes.program.innerHTML = DAYS.map((day) => {
      const events = grouped[day.id] || [];
      return `
        <section class="day-tile day-tile--${escapeHtml(day.tone)}" data-day="${day.id}">
          <div class="day-tile__head">
            <div>
              <div class="day-tile__weekday">${escapeHtml(day.weekday)}</div>
              <div class="day-tile__date">${escapeHtml(day.date)}</div>
            </div>
          </div>
          <div class="day-tile__body">
            ${events.map(renderProgramBlock).join("") || '<div class="day-tile__empty">Пока пусто</div>'}
          </div>
        </section>
      `;
    }).join("");
  }

  function init() {
    renderProgram();
    renderLogistics();
    renderActivities();
  }

  init();
})();
