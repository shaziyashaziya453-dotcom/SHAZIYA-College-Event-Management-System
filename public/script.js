
const API_URL = '/api/events';

const eventForm = document.getElementById('eventForm');
const eventList = document.getElementById('eventList');
const searchEvent = document.getElementById('searchEvent');
const cancelEdit = document.getElementById('cancelEdit');

let allEvents = [];

// Escape text before displaying it in HTML
function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}

// LOAD EVENTS FROM MYSQL
async function loadEvents() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Unable to load events');
        }

        allEvents = await response.json();

        displayEvents(allEvents);
        updateDashboard();

    } catch (error) {
        eventList.innerHTML =
            '<p>Unable to load events. Check your server and database.</p>';

        console.error(error);
    }
}

// DISPLAY EVENTS
function displayEvents(events) {
    if (events.length === 0) {
        eventList.innerHTML = '<p>No events found. Add your first event!</p>';
        return;
    }

    eventList.innerHTML = events.map(event => `
        <div class="event-item">
            <h4>${escapeHTML(event.event_name)}</h4>

            <p><strong>Event ID:</strong> ${event.event_id}</p>
            <p><strong>Type:</strong> ${escapeHTML(event.event_type)}</p>
            <p><strong>Date:</strong> ${escapeHTML(event.event_date)}</p>
            <p><strong>Menu:</strong> ${escapeHTML(event.event_menu || 'Not specified')}</p>
            <p><strong>Description:</strong> ${escapeHTML(event.event_description || 'No description')}</p>

            <button class="action-btn edit-btn"
                onclick="editEvent(${event.event_id})">
                Edit
            </button>

            <button class="action-btn delete-btn"
                onclick="deleteEvent(${event.event_id})">
                Delete
            </button>
        </div>
    `).join('');
}

// ADD OR UPDATE EVENT
eventForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const id = document.getElementById('eventId').value;

    const eventData = {
        event_name: document.getElementById('eventName').value.trim(),
        event_type: document.getElementById('eventType').value,
        event_date: document.getElementById('eventDate').value,
        event_menu: document.getElementById('eventMenu').value.trim(),
        event_description: document.getElementById('eventDescription').value.trim()
    };

    if (!eventData.event_name || !eventData.event_type || !eventData.event_date) {
        alert('Please fill in all required fields.');
        return;
    }

    try {
        const response = await fetch(
            id ? `${API_URL}/${id}` : API_URL,
            {
                method: id ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || result.error || 'Operation failed');
        }

        alert(result.message);

        resetForm();
        loadEvents();

    } catch (error) {
        alert(error.message);
        console.error(error);
    }
});

// EDIT EVENT
function editEvent(id) {
    const event = allEvents.find(item => item.event_id === id);

    if (!event) return;

    document.getElementById('eventId').value = event.event_id;
    document.getElementById('eventName').value = event.event_name;
    document.getElementById('eventType').value = event.event_type;

    // Format MySQL DATE for the date input
    document.getElementById('eventDate').value =
        String(event.event_date).slice(0, 10);

    document.getElementById('eventMenu').value = event.event_menu || '';
    document.getElementById('eventDescription').value =
        event.event_description || '';

    document.getElementById('formTitle').textContent = 'Update Event';
    eventForm.querySelector('button[type="submit"]').textContent = 'Update Event';

    cancelEdit.hidden = false;

    document.getElementById('manage').scrollIntoView({
        behavior: 'smooth'
    });
}

// DELETE EVENT
async function deleteEvent(id) {
    const confirmDelete = confirm(
        'Are you sure you want to delete this event?'
    );

    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Delete failed');
        }

        alert(result.message);
        loadEvents();

    } catch (error) {
        alert(error.message);
        console.error(error);
    }
}

// RESET FORM
function resetForm() {
    eventForm.reset();

    document.getElementById('eventId').value = '';
    document.getElementById('formTitle').textContent = 'Add New Event';

    eventForm.querySelector('button[type="submit"]').textContent = 'Save Event';

    cancelEdit.hidden = true;
}

// CANCEL EDIT
cancelEdit.addEventListener('click', resetForm);

// UPDATE DASHBOARD COUNTS
function updateDashboard() {
    document.getElementById('totalEvents').textContent =
        allEvents.length;

    document.getElementById('sportsEvents').textContent =
        allEvents.filter(e => e.event_type === 'Sports').length;

    document.getElementById('culturalEvents').textContent =
        allEvents.filter(e => e.event_type === 'Cultural').length;
}

// SEARCH EVENTS
searchEvent.addEventListener('input', function() {
    const searchText = this.value.toLowerCase();

    const filteredEvents = allEvents.filter(event =>
        event.event_name.toLowerCase().includes(searchText) ||
        event.event_type.toLowerCase().includes(searchText)
    );

    displayEvents(filteredEvents);
});

// LOAD EVENTS WHEN PAGE OPENS
loadEvents();
