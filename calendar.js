// Selecting elements from the DOM
let calendar = document.querySelector('.calendar');                 // Calendar container
let rightBarToggle = document.querySelector('.right-bar-toggle');  // Button to toggle right sidebar
let eventFooterBarToggle = document.querySelector('.event-bar-toggle');  // Button to toggle event footer bar

// Array of month names
const month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Function to check if a year is a leap year
isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0 && year % 400 !== 0) || (year % 100 === 0 && year % 400 === 0);
};

// Function to get the number of days in February for a given year
getFebDays = (year) => {
    return isLeapYear(year) ? 29 : 28;
};

// Function to generate the calendar for a specific month and year
generateCalendar = (month, year) => {

    // Selecting relevant elements from the DOM
    let calendar_days = calendar.querySelector('.calendar-days');       // Container for calendar days
    let calendar_header_year = calendar.querySelector('#year');        // Year displayed in the header

    // Array containing the number of days in each month
    let days_of_month = [31, getFebDays(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Clearing the calendar days container
    calendar_days.innerHTML = '';

    // Getting the current date
    let currDate = new Date();
    if (month == null) month = currDate.getMonth();
    if (!year) year = currDate.getFullYear();

    // Displaying the current month and year in the UI
    let curr_month = `${month_names[month]}`;
    month_picker.innerHTML = curr_month;
    calendar_header_year.innerHTML = year;

    // Getting the first day of the month
    let first_day = new Date(year, month, 1);

    // Generating calendar day elements
    for (let i = 0; i <= days_of_month[month] + first_day.getDay() - 1; i++) {
        let day = document.createElement('div');
        if (i >= first_day.getDay()) {
            day.classList.add('calendar-day-hover');
            day.innerHTML = i - first_day.getDay() + 1;
            day.innerHTML += `<span></span>
                            <span></span>
                            <span></span>
                            <span></span>`;
            // Highlighting the current date
            if (i - first_day.getDay() + 1 === currDate.getDate() && year === currDate.getFullYear() && month === currDate.getMonth()) {
                day.classList.add('curr-date');
            }
        }
        calendar_days.appendChild(day);
    }
}

// Function to toggle the event footer bar
function toggleEventBar() {
    const eventFooterBar = document.querySelector('.calendar-event-bar');
    eventFooterBar.classList.toggle('expanded');
}

// Function to toggle the right sidebar
function toggleRightBar() {
    const rightBar = document.querySelector('.calendar-right-bar');
    rightBar.classList.toggle('expanded');
}

// Function to show/hide the event footer bar toggle button
function showEventBarToggle(show) {
    if (show) {
        eventFooterBarToggle.style.display = 'block';
    } else {
        eventFooterBarToggle.style.display = 'none';
    }
}

// Function to show/hide the right sidebar toggle button
function showRightBarToggle(show) {
    if (show) {
        rightBarToggle.style.display = 'block';
    } else {
        rightBarToggle.style.display = 'none';
    }
}

// Iterating through month names and creating month selection elements
let month_list = calendar.querySelector('.month-list');
month_names.forEach((e, index) => {
    let month = document.createElement('div');
    month.innerHTML = `<div data-month="${index}">${e}</div>`;
    month.querySelector('div').onclick = async () => {
        // Handling month selection
        month_list.classList.remove('show');
        curr_month.value = index;
        generateCalendar(index, curr_year.value);
        showRightBarToggle(true);
        showEventBarToggle(true);
    }
    month_list.appendChild(month);
});

// Selecting the month picker element
let month_picker = calendar.querySelector('#month-picker');

// Handling click on the month picker to show/hide the month list
month_picker.onclick = () => {
    month_list.classList.add('show');
    showRightBarToggle(false);
    showEventBarToggle(false);
}

// Getting the current date
let currDate = new Date();

// Current month and year values
let curr_month = { value: currDate.getMonth() };
let curr_year = { value: currDate.getFullYear() };

// Generating the calendar for the current month and year
generateCalendar(curr_month.value, curr_year.value);

// Handling click on the "Previous Year" button
document.querySelector('#prev-year').onclick = () => {
    --curr_year.value;
    generateCalendar(curr_month.value, curr_year.value);
}

// Handling click on the "Next Year" button
document.querySelector('#next-year').onclick = () => {
    ++curr_year.value;
    generateCalendar(curr_month.value, curr_year.value);
}

// Handling click on the dark mode toggle button
let dark_mode_toggle = document.querySelector('.dark-mode-switch');
dark_mode_toggle.onclick = () => {
    document.querySelector('body').classList.toggle('light');
    document.querySelector('body').classList.toggle('dark');
}
