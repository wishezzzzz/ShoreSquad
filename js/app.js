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

// Weather demo: placeholder fetch with graceful fallback
async function fetchWeatherDemo() {
  const summary = el('#weather-summary')
  // Show loader
  summary.textContent = 'Loading weather...'
  try {
    // Placeholder: use a static sample to avoid needing an API key here
    await new Promise(resolve => setTimeout(resolve, 500))
    summary.textContent = 'Sunny • 19°C • Light breeze — good day for a cleanup!'
  } catch (err) {
    summary.textContent = 'Weather unavailable'
  }
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
}

// Init app
function init() {
  // ensure map hidden by default for performance on mobile
  const mapSection = el('#map')
  mapSection.classList.add('hidden')
  attachEventListeners()
  updateSavedUI()
  fetchWeatherDemo()
}

// Boot up
document.addEventListener('DOMContentLoaded', init)

// Exported for tests or future modules (progressive enhancements)
export default { init }
