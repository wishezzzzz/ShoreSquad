// ShoreSquad basic front-end interactions (vanilla JS, module)
// Small utilities: debounce and localStorage helpers, and placeholder for map & weather features.

const site = {
  savedEventsKey: 'shoresquad:savedEvents',
}

// Helpers
const debounce = (fn, wait = 250) => {
  let t
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait) }
}

const el = (selector) => document.querySelector(selector)

// Save event to local storage as toggled
function toggleSaveEvent(eventId) {
  const saved = JSON.parse(localStorage.getItem(site.savedEventsKey) || '[]');
  const idx = saved.indexOf(eventId);
  if (idx === -1) {
    saved.push(eventId)
  } else {
    saved.splice(idx, 1)
  }
  localStorage.setItem(site.savedEventsKey, JSON.stringify(saved))
  updateSavedUI()
}

function updateSavedUI() {
  const saved = JSON.parse(localStorage.getItem(site.savedEventsKey) || '[]');
  document.querySelectorAll('.event').forEach(ev => {
    const id = ev.dataset.eventId;
    const btn = ev.querySelector('.btn.save');
    if (saved.includes(id)) {
      btn.textContent = 'Saved';
      btn.classList.add('saved')
    } else {
      btn.textContent = 'Save';
      btn.classList.remove('saved')
    }
  })
}

// Weather: fetch NEA 4-day forecast from data.gov.sg (metric units)
const NEA_4DAY_URL = 'https://api.data.gov.sg/v1/environment/4-day-weather-forecast'
const NEA_CACHE_KEY = 'shoresquad:nea:4day'
const NEA_CACHE_TTL = 1000 * 60 * 15 // 15 minutes

function isCacheFresh(ts) {
  return (Date.now() - ts) < NEA_CACHE_TTL
}

async function fetchNEAForecast() {
  const summaryEl = el('#weather-summary')
  const listEl = el('#forecast-list')
  summaryEl.textContent = 'Loading forecast...'
  listEl.innerHTML = ''

  try {
    // cached response first
    const cached = JSON.parse(localStorage.getItem(NEA_CACHE_KEY) || 'null')
    if (cached && cached.timestamp && isCacheFresh(cached.timestamp)) {
      renderNEAForecast(cached.data)
      return cached.data
    }

    const resp = await fetch(NEA_4DAY_URL)
    if (!resp.ok) throw new Error('NEA API error: ' + resp.status)
    const json = await resp.json()
    const data = json.items && json.items.length ? json.items[0] : null
    if (!data || !data.forecasts) throw new Error('Invalid NEA forecast response')

    // cache data
    localStorage.setItem(NEA_CACHE_KEY, JSON.stringify({timestamp: Date.now(), data}))

    renderNEAForecast(data)
    return data
  } catch (err) {
    console.error('NEA fetch error', err)
    summaryEl.textContent = 'Weather unavailable'
    const fallback = document.createElement('li')
    fallback.textContent = 'Forecast unavailable'
    listEl.appendChild(fallback)
    return null
  }
}

function renderNEAForecast(data) {
  const summaryEl = el('#weather-summary')
  const listEl = el('#forecast-list')
  listEl.innerHTML = ''

  // show a simple summary of today's forecast if it's present
  if (data && data.forecasts && data.forecasts.length) {
    const today = data.forecasts[0]
    summaryEl.textContent = `${today.forecast} • ${today.temperature.low}°C–${today.temperature.high}°C`;
  }

  // Render each forecast day
  if (data && data.forecasts) {
    data.forecasts.forEach(f => {
      const li = document.createElement('li')
      const dayName = new Date(f.date + 'T00:00:00').toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric'})
      const lowTemp = f.temperature && f.temperature.low !== undefined ? f.temperature.low : '-'
      const highTemp = f.temperature && f.temperature.high !== undefined ? f.temperature.high : '-'
      const windLow = f.wind && f.wind.speed && f.wind.speed.low !== undefined ? f.wind.speed.low : '-'
      const windHigh = f.wind && f.wind.speed && f.wind.speed.high !== undefined ? f.wind.speed.high : '-'
      const windDir = f.wind && f.wind.direction ? f.wind.direction : ''
      const rhLow = f.relative_humidity && f.relative_humidity.low !== undefined ? f.relative_humidity.low : '-'
      const rhHigh = f.relative_humidity && f.relative_humidity.high !== undefined ? f.relative_humidity.high : '-'

      li.innerHTML = `
        <div class="forecast-day">${dayName}</div>
        <div class="forecast-desc">${escapeHtml(f.forecast)}</div>
        <div class="forecast-temp">${lowTemp}°C — ${highTemp}°C</div>
        <div class="forecast-meta">Wind: ${windLow}–${windHigh} km/h ${windDir}</div>
        <div class="forecast-meta">Humidity: ${rhLow}%–${rhHigh}%</div>
      `
      listEl.appendChild(li)
    })
  }
}

// rudimentary HTML escaping to avoid injecting unexpected HTML from API
function escapeHtml(value) {
  if (!value) return ''
  return String(value).replace(/[&<>"']/g, function(ch) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch]
  })
}

// Lazy load map to improve initial performance
function initMapIfNeeded() {
  const mapContainer = el('#map-placeholder')
  // If there's already an iframe (we embedded it in HTML), don't reinsert.
  if (mapContainer.dataset.loaded === 'true') return
  if (mapContainer.querySelector('iframe')) {
    mapContainer.dataset.loaded = 'true';
    return;
  }

  // Fallback placeholder: provide a minimal message if the iframe isn't present
  mapContainer.textContent = '';
  const info = document.createElement('div')
  info.style.padding = '1rem'
  info.textContent = 'Map loaded (placeholder). Integrate Mapbox or Leaflet for full maps.'
  mapContainer.appendChild(info)
  mapContainer.dataset.loaded = 'true'
}

function attachEventListeners() {
  // Toggle map button
  const btn = el('#btn-toggle-map')
  btn.addEventListener('click', () => {
    const mapSection = el('#map')
    const visible = !mapSection.classList.contains('hidden')
    mapSection.classList.toggle('hidden')
    btn.textContent = visible ? 'Show Map' : 'Hide Map'
    // Lazy load the map
    if (!visible) initMapIfNeeded()
  })

  // Join and Save buttons
  document.addEventListener('click', (evt) => {
    const saveBtn = evt.target.closest('.btn.save')
    if (saveBtn) {
      const id = evt.target.closest('.event').dataset.eventId
      toggleSaveEvent(id)
    }
    const joinBtn = evt.target.closest('.btn.join')
    if (joinBtn) {
      // placeholder for join flow — could open modal, share link, or integrate auth
      const id = evt.target.closest('.event').dataset.eventId
      window.alert('You joined event ' + id + ' — nice!')
    }

    // Click on event item to center the map on its coordinates (if available)
    const clickedEvent = evt.target.closest('.event')
    if (clickedEvent) {
      // Do not re-center map if user clicked on a button/link inside the event
      if (evt.target.closest('.btn, a')) return
      const lat = clickedEvent.dataset.lat
      const lng = clickedEvent.dataset.lng
      if (lat && lng) {
        // Ensure map is visible
        const mapSection = el('#map')
        if (mapSection.classList.contains('hidden')) {
          mapSection.classList.remove('hidden')
          el('#btn-toggle-map').textContent = 'Hide Map'
        }
        const iframe = el('#google-map-embed')
        if (iframe) {
          const qlabel = encodeURIComponent(clickedEvent.querySelector('.event-title').textContent.trim())
          iframe.src = `https://maps.google.com/maps?q=${lat},${lng}(${qlabel})&t=&z=15&ie=UTF8&iwloc=&output=embed`
          // set the dataset so we don't reinit
          el('#map-placeholder').dataset.loaded = 'true'
        } else {
          initMapIfNeeded()
        }
      }
    }
  })

  // Responsive behavior: debounce resize-related heavy work
  window.addEventListener('resize', debounce(() => {
    // e.g., recalc map layout, but we just console log in this scaffold
    console.log('resize — update layouts')
  }, 300))

  // Weather refresh button
  const refreshBtn = el('#btn-refresh-weather')
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      // Clear cache and fetch new data
      localStorage.removeItem(NEA_CACHE_KEY)
      await fetchNEAForecast()
      // Briefly show a success state via button text
      const prev = refreshBtn.textContent
      refreshBtn.textContent = 'Updated'
      setTimeout(() => refreshBtn.textContent = prev, 1500)
    })
  }
}

// Init app
function init() {
  // ensure map hidden by default for performance on mobile
  const mapSection = el('#map')
  mapSection.classList.add('hidden')
  attachEventListeners()
  updateSavedUI()
  fetchNEAForecast()
}

// Boot up
document.addEventListener('DOMContentLoaded', init)

// Exported for tests or future modules (progressive enhancements)
export default { init }
