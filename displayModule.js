// ----- DISPLAY ----- //

// Function to display event details in the event details bar
function displayEventDetails(events) {
    const eventDetailsDiv = document.getElementById('event-bar');  // Getting the event details container element
    eventDetailsDiv.innerHTML = '';  // Clearing previous content
    
    // Display a message when there are no events
    if (!events || events.length === 0) {
        eventDetailsDiv.innerHTML = '<p class="indented">Keine Ereignisse vorhanden</p>';
        return;
    }

    // Creating an unordered list to display event details
    const detailsList = document.createElement('ul');
    events.forEach((event) => {
        const li = document.createElement('li');
        li.textContent = `${event.title} - ${event.start} - ${event.end} - ${event.id}`;  // Displaying event information
        detailsList.appendChild(li);
    });
    
    // Adding the list of event details to the event details container
    eventDetailsDiv.appendChild(detailsList);
}

// Function to display categories in the right-hand bar
function displayCategories(categories) {
    const categoriesListDiv = document.getElementById('right-hand-bar');  // Getting the right-hand bar container element
    categoriesListDiv.innerHTML = '';  // Clearing previous content
    
    // Display a message when there are no categories
    if (!categories || categories.length === 0) {
        categoriesListDiv.innerHTML = '<p>Keine Kategorien vorhanden</p>';
        return;
    }

    // Creating an unordered list to display categories
    const ul = document.createElement('ul');
    categories.forEach((category) => {
        const li = document.createElement('li');
        li.textContent = `${category.name}`;  // Displaying category name
        ul.appendChild(li);

        // Displaying category details as a paragraph
        const details = document.createElement('p');
        details.textContent = `Details: ${JSON.stringify(category)}`;  // Displaying category details in JSON format
        ul.appendChild(details);
    });

    // Adding the list of categories to the right-hand bar container
    categoriesListDiv.appendChild(ul);
}

// Exporting the display functions for use in other parts of the application
export {
    displayEventDetails,
    displayCategories
};
