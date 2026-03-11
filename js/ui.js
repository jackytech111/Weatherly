const elements = {
  city: document.getElementById("cityName"),
  localTime: document.getElementById("localTime"),
  temp: document.getElementById("currentTemp"),
  desc: document.getElementById("description"),
  feels: document.getElementById("feelsLike"),
  tMax: document.getElementById("tempMax"),
  tMin: document.getElementById("tempMin"),
  wind: document.getElementById("wind"),
  humidity: document.getElementById("humidity"),
  pressure: document.getElementById("pressure"),
  visibility: document.getElementById("visibility"),
  sunrise: document.getElementById("sunrise"),
  sunset: document.getElementById("sunset"),
  icon: document.getElementById("currentIcon"),
  hourly: document.getElementById("hourlyList"),
  daily: document.getElementById("dailyList"),
  toast: document.getElementById("toast"),
  unitButtons: document.querySelectorAll(".pill-switch .pill"),
};

const iconUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  return url;
};

const pad = (n) => String(n).padStart(2, "0");

const formatTime = (ts, timezone) => {
  if (!ts) return "—";

  if (typeof timezone === "string") {
    const date = new Date(ts * 1000);
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    }).format(date);
  }

  const date = new Date((ts + timezone) * 1000);
  const hours = date.getUTCHours();
  const minutes = pad(date.getUTCMinutes());

  return `${hours % 12 || 12}:${minutes} ${hours >= 12 ? "PM" : "AM"}`;
};

export function renderCurrent(data, units) {
  if (!data) return;

  const unitSymbol = units === "metric" ? "°C" : "°F";

  elements.city.textContent = data.name ?? "—";
  elements.localTime.textContent = formatTime(data.dt, data.timezone);

  elements.temp.textContent = `${Math.round(data.main.temp)}${unitSymbol}`;
  elements.desc.textContent = data.weather?.[0]?.description ?? "—";

  elements.feels.textContent = `${Math.round(data.main.feels_like)}${unitSymbol}`;
  elements.tMax.textContent = `${Math.round(data.main.temp_max)}${unitSymbol}`;
  elements.tMin.textContent = `${Math.round(data.main.temp_min)}${unitSymbol}`;

  elements.wind.textContent = `${Math.round(data.wind.speed)} ${
    units === "metric" ? "m/s" : "mph"
  }`;

  elements.humidity.textContent = `${data.main.humidity ?? "—"}%`;
  elements.pressure.textContent = `${data.main.pressure ?? "—"} hPa`;

  elements.visibility.textContent =
    data.visibility != null ? `${(data.visibility / 1000).toFixed(1)} km` : "—";

  const sunrise = data.sys?.sunrise;
  const sunset = data.sys?.sunset;

  elements.sunrise.textContent =
    typeof sunrise === "number"
      ? formatTime(sunrise, data.timezone)
      : (sunrise ?? "—");

  elements.sunset.textContent =
    typeof sunset === "number"
      ? formatTime(sunset, data.timezone)
      : (sunset ?? "—");

  const icon = data.weather?.[0]?.icon;

  elements.icon.src = iconUrl(icon);
  elements.icon.alt = data.weather?.[0]?.description ?? "";
}

export function renderHourly(hours, units) {
  if (!elements.hourly) return;

  elements.hourly.innerHTML = "";

  const unitSymbol = units === "metric" ? "°C" : "°F";

  hours.slice(0, 12).forEach((item) => {
    const card = document.createElement("div");

    card.className = "hour";

    card.innerHTML = `
      <span class="muted">${item.label}</span>
      <img src="${iconUrl(item.icon)}" alt="${item.description ?? ""}">
      <strong>${Math.round(item.temp)}${unitSymbol}</strong>
      <span class="muted">${Math.round((item.pop ?? 0) * 100)}% chance</span>
    `;

    elements.hourly.appendChild(card);
  });
}

export function renderDaily(days, units) {
  if (!elements.daily) return;

  elements.daily.innerHTML = "";

  const unitSymbol = units === "metric" ? "°C" : "°F";

  days.slice(0, 5).forEach((day) => {
    const row = document.createElement("div");

    row.className = "day";

    row.innerHTML = `
      <div class="row">
        <span>${day.label}</span>
        <img src="${iconUrl(day.icon)}" alt="${day.description ?? ""}">
      </div>

      <div class="row muted">
        <span>${day.description ?? ""}</span>
        <span>
          <strong>${Math.round(day.max)}${unitSymbol}</strong> /
          ${Math.round(day.min)}${unitSymbol}
        </span>
      </div>
    `;

    elements.daily.appendChild(row);
  });
}

export function showToast(message, type = "info") {
  if (!elements.toast) return;

  elements.toast.textContent = message;

  elements.toast.style.borderColor =
    type === "error" ? "rgba(248, 113, 113, 0.6)" : "var(--stroke)";

  elements.toast.classList.add("show");

  setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2600);
}

export function setUnitToggle(activeUnit) {
  elements.unitButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.unit === activeUnit);
  });
}
