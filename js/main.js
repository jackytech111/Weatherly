import {
  renderCurrent,
  renderHourly,
  renderDaily,
  showToast,
  setUnitToggle,
} from "./ui.js";
import { WEATHER_API_KEY } from "./config.js";

const API_KEY = WEATHER_API_KEY;
const BASE_URL = "https://api.weatherapi.com/v1";

const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const geoBtn = document.getElementById("geoBtn");

const state = {
  unit: "metric",
  lastQuery: "New York",
  coords: null,
  timezone: "",
};

function toLocalDate(ts, timezone) {
  return new Date(
    new Date(ts * 1000).toLocaleString("en-US", { timeZone: timezone }),
  );
}

function hourLabel(ts, timezone) {
  const d = toLocalDate(ts, timezone);
  const hrs = d.getHours();
  const h12 = hrs % 12 || 12;
  return `${h12} ${hrs >= 12 ? "PM" : "AM"}`;
}

function buildHourly(list, timezone) {
  return list.slice(0, 12).map((h) => ({
    label: hourLabel(h.dt, timezone),
    temp: h.main.temp,
    icon: h.weather[0].icon,
    description: h.weather[0].description,
    pop: h.pop,
  }));
}

function buildDaily(days) {
  return days.slice(0, 5).map((d, i) => ({
    label:
      i === 0
        ? "Today"
        : new Date(d.dt * 1000).toLocaleDateString(undefined, {
            weekday: "short",
          }),
    min: d.main.temp_min,
    max: d.main.temp_max,
    icon: d.weather[0].icon,
    description: d.weather[0].description,
  }));
}

function normalizeCurrent(data, forecast, unit) {
  const today = forecast.forecast.forecastday[0];

  const temp = unit === "metric" ? data.current.temp_c : data.current.temp_f;

  return {
    name: data.location.name,
    dt: data.location.localtime_epoch,
    timezone: data.location.tz_id,

    sys: {
      sunrise: today.astro.sunrise,
      sunset: today.astro.sunset,
    },

    visibility: data.current.vis_km * 1000,

    main: {
      temp,
      feels_like:
        unit === "metric" ? data.current.feelslike_c : data.current.feelslike_f,
      temp_max: unit === "metric" ? today.day.maxtemp_c : today.day.maxtemp_f,
      temp_min: unit === "metric" ? today.day.mintemp_c : today.day.mintemp_f,
      humidity: data.current.humidity,
      pressure: data.current.pressure_mb,
    },

    wind: {
      speed:
        unit === "metric" ? data.current.wind_kph / 3.6 : data.current.wind_mph,
    },

    weather: [
      {
        icon: `https:${data.current.condition.icon}`,
        description: data.current.condition.text,
      },
    ],
  };
}

function normalizeHourly(forecast, unit) {
  const hours = forecast.forecast.forecastday.flatMap((d) => d.hour);

  return hours.map((h) => ({
    dt: h.time_epoch,
    main: {
      temp: unit === "metric" ? h.temp_c : h.temp_f,
      temp_min: unit === "metric" ? h.temp_c : h.temp_f,
      temp_max: unit === "metric" ? h.temp_c : h.temp_f,
    },
    weather: [
      {
        icon: `https:${h.condition.icon}`,
        description: h.condition.text,
      },
    ],
    pop: (h.chance_of_rain ?? 0) / 100,
  }));
}

function normalizeDaily(forecast, unit) {
  return forecast.forecast.forecastday.map((d) => ({
    dt: d.date_epoch,
    main: {
      temp_min: unit === "metric" ? d.day.mintemp_c : d.day.mintemp_f,
      temp_max: unit === "metric" ? d.day.maxtemp_c : d.day.maxtemp_f,
    },
    weather: [
      {
        icon: `https:${d.day.condition.icon}`,
        description: d.day.condition.text,
      },
    ],
  }));
}

async function fetchJson(url) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Request failed");
  }

  return res.json();
}

async function loadWeatherByCity(city) {
  try {
    const current = await fetchJson(
      `${BASE_URL}/current.json?key=${API_KEY}&q=${city}`,
    );

    const forecast = await fetchJson(
      `${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=5`,
    );

    state.coords = {
      lat: current.location.lat,
      lon: current.location.lon,
    };

    state.timezone = current.location.tz_id;
    state.lastQuery = city;

    renderCurrent(normalizeCurrent(current, forecast, state.unit), state.unit);

    renderHourly(
      buildHourly(normalizeHourly(forecast, state.unit), state.timezone),
      state.unit,
    );

    renderDaily(buildDaily(normalizeDaily(forecast, state.unit)), state.unit);
  } catch (err) {
    console.error(err);
    showToast("Failed to load weather data", "error");
  }
}

function handleSubmit(e) {
  e.preventDefault();
  const city = input.value.trim();
  if (!city) return;
  loadWeatherByCity(city);
}

function handleUnitSwitch(unit) {
  state.unit = unit;
  setUnitToggle(unit);
  loadWeatherByCity(state.lastQuery);
}

function initUnitButtons() {
  document.querySelectorAll(".pill-switch .pill").forEach((btn) => {
    btn.addEventListener("click", () => handleUnitSwitch(btn.dataset.unit));
  });
}

function initGeoButton() {
  geoBtn?.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      loadWeatherByCity(`${pos.coords.latitude},${pos.coords.longitude}`);
    });
  });
}

function bootstrap() {
  initUnitButtons();
  initGeoButton();

  form?.addEventListener("submit", handleSubmit);

  setUnitToggle(state.unit);
  input.value = state.lastQuery;

  loadWeatherByCity(state.lastQuery);
}

document.addEventListener("DOMContentLoaded", bootstrap);
