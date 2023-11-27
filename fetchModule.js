// fetchModule.js
import { displayEventDetails, displayCategories } from './displayModule';
import { validateId } from './validationModule.js';

const apiUrl = 'http://dhbw.radicalsimplicity.com/calendar/';
const user = '9227155'; // Dein Account-Name


// Function to fetch data from a given URL and handle success or error
async function fetchData(url, errorMessage, successCallback) {
    try {
        // Fetch data from the provided URL
        const response = await fetch(url);

        // If the response is not OK, throw an error with the given error message
        if (!response.ok) {
            throw new Error(errorMessage);
        }

        // Parse the response data as JSON
        const data = await response.json();

        // Call the provided success callback function with the parsed data
        successCallback(data);
    } catch (error) {
        // Log the error message along with the caught error
        console.error(errorMessage, error);
    }
}

// Function to fetch events and mark relevant calendar days
async function fetchEvents() {
    // Construct the URL for fetching events
    const url = `${apiUrl}${user}/events`;

    // Define an error message for fetching events
    const errorMessage = 'Fehler beim Abrufen der Ereignisse';

    try {
        // Fetch events data from the constructed URL
        const response = await fetch(url);

        // If the response is not OK, throw an error with the given error message
        if (!response.ok) {
            throw new Error(errorMessage);
        }

        // Parse the events data as JSON
        const events = await response.json();

        // Get the current year and month values
        const currentYear = curr_year.value;
        const currentMonth = curr_month.value + 1;

        // Get all calendar day elements and remove previous event markings
        const calendarDays = document.querySelectorAll('.calendar-day-hover');
        calendarDays.forEach(day => day.classList.remove('event-day'));

        // Iterate through each event and mark relevant calendar days
        events.forEach(event => {
            // Extract event start and end dates
            const eventStartDate = new Date(event.start);
            const eventEndDate = new Date(event.end);

            // Extract various components of the dates
            const eventStartYear = eventStartDate.getFullYear();
            const eventStartMonth = eventStartDate.getMonth() + 1;
            const eventStartDay = eventStartDate.getDate();
            const eventEndMonth = eventEndDate.getMonth() + 1;
            const eventEndYear = eventEndDate.getFullYear();
            const eventEndDay = eventEndDate.getDate();
            let calendarDay = null;

            // Validation to mark the event days in the calendar
            if ((currentYear >= eventStartYear && currentYear <= eventEndYear) && ((currentMonth >= eventStartMonth || currentYear > eventStartYear) && (currentMonth <= eventEndMonth || currentYear < eventEndYear))) {
                if (currentMonth === eventEndMonth && currentYear === eventEndYear) {
                    if (eventStartDay > eventEndDay) {
                        for (let dayNumber = 1; dayNumber <= eventEndDay; dayNumber++) {
                            calendarDay = calendarDays[dayNumber - 1];
                            if (calendarDay) {
                                calendarDay.classList.add('event-day');
                                calendarDay.dataset.year = eventStartDate.getFullYear(); // Speichern des Jahres im Dataset
                                calendarDay.dataset.month = eventStartDate.getMonth() + 1;
                            }
                        }
                    }
                    else {
                        for (let dayNumber = eventStartDay; dayNumber <= eventEndDay; dayNumber++) {
                            calendarDay = calendarDays[dayNumber - 1];
                            if (calendarDay) {
                                calendarDay.classList.add('event-day');
                                calendarDay.dataset.year = eventStartDate.getFullYear(); // Speichern des Jahres im Dataset
                                calendarDay.dataset.month = eventStartDate.getMonth() + 1;
                            }
                        }
                        if (eventStartDay === eventEndDay && currentYear != eventEndYear) {
                            for (let dayNumber = 1; dayNumber <= eventEndDay; dayNumber++) {
                                calendarDay = calendarDays[dayNumber - 1];
                                if (calendarDay) {
                                    calendarDay.classList.add('event-day');
                                    calendarDay.dataset.year = eventStartDate.getFullYear(); // Speichern des Jahres im Dataset
                                    calendarDay.dataset.month = eventStartDate.getMonth() + 1;
                                }
                            }
                        }
                        if (eventStartDay <= eventEndDay && currentYear != eventStartYear) {
                            for (let dayNumber = 1; dayNumber <= eventEndDay; dayNumber++) {
                                calendarDay = calendarDays[dayNumber - 1];
                                if (calendarDay) {
                                    calendarDay.classList.add('event-day');
                                    calendarDay.dataset.year = eventStartDate.getFullYear(); // Speichern des Jahres im Dataset
                                    calendarDay.dataset.month = eventStartDate.getMonth() + 1;
                                }
                            }
                        }
                    }
                }
                else {
                    for (let dayNumber = eventStartDay; dayNumber <= 31; dayNumber++) {
                        calendarDay = calendarDays[dayNumber - 1];
                        if (calendarDay) {
                            calendarDay.classList.add('event-day');
                            calendarDay.dataset.year = eventStartDate.getFullYear(); // Speichern des Jahres im Dataset
                            calendarDay.dataset.month = eventStartDate.getMonth() + 1;
                        }
                    }
                    if (currentYear != eventEndYear && ((currentMonth != eventEndMonth && currentMonth != eventStartMonth) || (currentMonth === eventEndMonth && currentYear != eventEndYear && currentYear != eventStartYear))) {
                        for (let dayNumber = 1; dayNumber <= 31; dayNumber++) {
                            calendarDay = calendarDays[dayNumber - 1];
                            if (calendarDay) {
                                calendarDay.classList.add('event-day');
                                calendarDay.dataset.year = eventStartDate.getFullYear(); // Speichern des Jahres im Dataset
                                calendarDay.dataset.month = eventStartDate.getMonth() + 1;
                            }
                        }
                    }
                    if (currentYear === eventEndYear && currentMonth < eventEndMonth && currentYear != eventStartYear) {
                        for (let dayNumber = 1; dayNumber <= 31; dayNumber++) {
                            calendarDay = calendarDays[dayNumber - 1];
                            if (calendarDay) {
                                calendarDay.classList.add('event-day');
                                calendarDay.dataset.year = eventStartDate.getFullYear(); // Speichern des Jahres im Dataset
                                calendarDay.dataset.month = eventStartDate.getMonth() + 1;
                            }
                        }
                    }
                }
            }
        });

        displayEventDetails(events);
    } catch (error) {
        console.error(errorMessage, error);
    }
}

fetchEvents()

function fetchCategories() {
    const url = `${apiUrl}${user}/categories`;
    const errorMessage = 'Fehler beim Abrufen der Kategorien';
    const displayFunction = displayCategories;
    fetchData(url, errorMessage, displayFunction);
}

// Fetch categories when the page loads
fetchCategories();


// ----- CALENDAR LOAD MONTH&YEAR ----- //

// Event listener for clicking on month navigation buttons
document.querySelector('.month-list').addEventListener('click', async (event) => {
    await fetchEvents();
});
// Event listener for clicking on previous year button
document.querySelector('#prev-year').addEventListener('click', async () => {
    await fetchEvents();
});
// Event listener for clicking on next year button
document.querySelector('#next-year').addEventListener('click', async () => {
    await fetchEvents();
});


// ----- FRAME CATEGORY OR EVENT ----- //

// Function to fetch and display event or category details
async function fetchEventOrCategory(url, errorMessage, eventType) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(errorMessage);
        }

        // Parse the response data as JSON
        const data = await response.json();
        console.log('Daten abgerufen:', data);

        // Get the eventFrame element and expand it
        const frame = document.getElementById('eventFrame');
        frame.classList.add('expanded');

        // Get the Frame-content element and display the data
        const content = document.getElementById('Frame-content');
        content.innerHTML = JSON.stringify(data, null, 2); // Display the data

        // Get event and category icons' elements
        const eventIcons = document.getElementById('Frame-icons-event');
        const categoryIcons = document.getElementById('Frame-icons-category');

        // Show the relevant icons based on the event type
        if (eventType === 'event') {
            eventIcons.style.display = 'block';
            categoryIcons.style.display = 'none';
        } else if (eventType === 'category') {
            eventIcons.style.display = 'none';
            categoryIcons.style.display = 'block';
        }

    } catch (error) {
        // Log the error message along with the caught error
        console.error(errorMessage, error);
    }
}


const backButton = document.getElementById('back');
backButton.addEventListener('click', () => {
    const frame = document.getElementById('eventFrame');
    frame.classList.remove('expanded');
});

// ----- FETCH EVENT ----- //

// Function to fetch an event by its ID
function fetchEvent(eventId) {
    // Construct the URL for fetching the specific event
    const url = `${apiUrl}${user}/events/${eventId}`;
    const errorMessage = 'Fehler beim Abrufen des Ereignisses';

    // Fetch and display the event using the common function
    fetchEventOrCategory(url, errorMessage, 'event');
}

// Get the 'fetchEventButton' element and add a click event listener
const fetchEventButton = document.getElementById('fetchEventButton');
fetchEventButton.addEventListener('click', async () => {
    const validEventId = await validateId('Bitte geben Sie die ID des Ereignisses ein:', `${apiUrl}${user}/events/`, '');

    // If a valid event ID is provided, fetch and display the event
    if (validEventId) {
        fetchEvent(validEventId);
    }
});

// Get the 'fetchEventFrameButton' element and add a click event listener
const fetchEventFrameButton = document.getElementById('fetchEventFrameButton');
fetchEventFrameButton.addEventListener('click', async () => {
    const validEventId = await validateId('Bitte geben Sie die ID des Ereignisses ein:', `${apiUrl}${user}/events/`, '');

    // If a valid event ID is provided, fetch and display the event
    if (validEventId) {
        fetchEvent(validEventId);
    }
});


// ----- FETCH CATEGORY BY ID ----- //

// Function to fetch a category by its ID
function fetchCategory(categoryId) {
    // Construct the URL for fetching the specific category
    const url = `${apiUrl}${user}/categories/${categoryId}`;
    const errorMessage = 'Fehler beim Abrufen der Kategorie';

    // Fetch and display the category using the common function
    fetchEventOrCategory(url, errorMessage, 'category');
}

const fetchCategoryButton = document.getElementById('fetchCategoryButton');
fetchCategoryButton.addEventListener('click', async () => {
    const validCategoryId = await validateId('Bitte geben Sie die ID der abzurufenden Kategorie ein:', `${apiUrl}${user}/categories/`, '');

    if (validCategoryId) {
        fetchCategory(validCategoryId);
    }
});


// ----- EVENT DAY APPEARANCE ----- //

// Variable to store the selected day
let selectedDay = null;

// Function to display events for the selected day
async function showEventsForSelectedDay() {
    const calendarEventsFrameContent = document.getElementById('calendar-events-frame-content');

    if (!selectedDay) {
        return;
    }

    const events = await fetchEventsForDay(selectedDay);
    calendarEventsFrameContent.innerHTML = '';

    // Create a list to display event details
    const detailsList = document.createElement('ul');
    events.forEach(event => {
        const li = document.createElement('li');
        li.textContent = `${event.title} - ${event.start} - ${event.end} - ${event.id}`;
        detailsList.appendChild(li);
    });

    calendarEventsFrameContent.appendChild(detailsList);
}

// Function to fetch events for a specific day
async function fetchEventsForDay(selectedDay) {
    const url = `${apiUrl}${user}/events`;
    const errorMessage = 'Fehler beim Abrufen der Ereignisse';

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(errorMessage);
        }

        const events = await response.json();
        const selectedDate = new Date(selectedDay);

        // Extract day, month, and year from the selected date
        const selectedDateDay = selectedDate.getDate();
        const selectedDateMonth = (selectedDate.getMonth() + 1);
        const selectedDateYear = selectedDate.getFullYear();

        // Filtering each event based on selected date
        const eventsForSelectedDays = events.filter(event => {
            // Extract day, month, and year from event start and end dates
            const eventStartDate = new Date(event.start);
            const eventEndDate = new Date(event.end);

            const eventStartDateDay = eventStartDate.getDate();
            const eventStartDateMonth = (eventStartDate.getMonth() + 1);
            const eventStartDateYear = eventStartDate.getFullYear();

            const eventEndDateDay = eventEndDate.getDate();
            const eventEndDateMonth = (eventEndDate.getMonth() + 1);
            const eventEndDateYear = eventEndDate.getFullYear();

            // Check if the event falls on the selected day
            if (event.allday) {
                return (
                    (selectedDate >= eventStartDate && selectedDate <= eventEndDate)
                );
            } else {
                return (
                    ((selectedDateYear > eventStartDateYear || (selectedDateYear == eventStartDateYear && (selectedDateMonth > eventStartDateMonth || selectedDateMonth == eventStartDateMonth && selectedDateDay >= eventStartDateDay)))
                    && (selectedDateYear < eventEndDateYear || (selectedDateYear == eventEndDateYear && (selectedDateMonth < eventEndDateMonth || selectedDateMonth == eventEndDateMonth && selectedDateDay <= eventEndDateDay))))
                );
            }
        });

        return eventsForSelectedDays;
    } catch (error) {
        console.error(errorMessage, error);
        return [];
    }
}

// Event listener for clicking on calendar days
const calendarDays = document.querySelector('.calendar-days');
calendarDays.addEventListener('click', (event) => {
    // Expand the calendar events frame
    document.getElementById('calendar-events-frame').classList.add('expanded');

    const clickedDay = event.target;
    const selectedYear = curr_year.value;
    const selectedMonth = (curr_month.value + 1).toString().padStart(2, '0');
    const selectedDayNumber = clickedDay.textContent.trim();

    // Format the selected day
    selectedDay = `${selectedYear}-${selectedMonth}-${selectedDayNumber}`;

    // Set the selected day attribute for the events frame content
    document.getElementById('calendar-events-frame-content').setAttribute('data-selected-day', selectedDay);

    // Show events for the selected day
    showEventsForSelectedDay();

});

// Event listener for clicking the back button in the events frame
const backEventDayButton = document.getElementById('calendar-events-frame-back');
backEventDayButton.addEventListener('click', () => {
    // Collapse the calendar events frame and reset its content
    document.getElementById('calendar-events-frame').classList.remove('expanded');
    const calendarEventsFrameContent = document.getElementById('calendar-events-frame-content');
    calendarEventsFrameContent.innerHTML = '';
    document.getElementById('calendar-events-frame-content').removeAttribute('data-selected-day');
});


// Export the functions
export {
    fetchData,
    fetchEventOrCategory,
    fetchEvents,
    fetchCategories,
    fetchEvent,
    fetchCategory
};
