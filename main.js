import { fetchEvents, fetchCategories } from './fetchModule.js';
import { validateId, validateInput, validateYesNo } from './validationModule.js';

const apiUrl = 'http://dhbw.radicalsimplicity.com/calendar/';
const user = '9227155';
let mapInitialized = false;


// ----- CREATE CATEGORY ----- //

async function createCategory() {
    // Validate and retrieve the category name from user input
    const categoryName = validateInput('Namen der Kategorie', '', 30);

    // If the user cancels the input, return without creating a category
    if (categoryName === null) {
        return;
    }

    try {
        // Fetch existing categories
        const categoriesResponse = await fetch(`${apiUrl}${user}/categories`);

        if (!categoriesResponse.ok) {
            throw new Error('Fehler beim Abrufen der Kategorien');
        }

        const existingCategories = await categoriesResponse.json();

        // Check if the entered category name already exists
        const categoryExists = existingCategories.some(category => category.name === categoryName);
        if (categoryExists) {
            console.log(`Die Kategorie "${categoryName}" existiert bereits.`);
            return;
        }

        // Prepare category data for creation
        const category_data = {
            name: categoryName,
        };

        const response = await fetch(`${apiUrl}${user}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(category_data),
        });

        if (!response.ok) {
            throw new Error('Fehler beim Erstellen der Kategorie');
        }

        // Parse the response data to get the details of the newly created category
        const newCategory = await response.json();
        console.log('Neue Kategorie erstellt:', newCategory);

        // Update the categories list by fetching categories again
        fetchCategories();
    } catch (error) {
        console.error('Fehler beim Erstellen der Kategorie:', error);
    }
}

// Get the 'createCategoryButton' element and add a click event listener
const createCategoryButton = document.getElementById('createCategoryButton');
createCategoryButton.addEventListener('click', createCategory);



// ----- DELETE CATEGORY ----- //

// Function to delete a category by its ID
async function deleteCategory(categoryId) {
    try {
        // Send a DELETE request to delete the category
        const response = await fetch(`${apiUrl}${user}/categories/${categoryId}`, {
            method: 'DELETE',
        });

        // If the DELETE request is not successful, throw an error
        if (!response.ok) {
            throw new Error('Fehler beim Löschen der Kategorie');
        }

        // Log success message, then refresh events and categories
        console.log('Kategorie erfolgreich gelöscht');
        fetchEvents();
        fetchCategories();
    } catch (error) {
        console.error('Fehler beim Löschen der Kategorie:', error);
    }
}

// Get the 'deleteCategoryButton' element and add a click event listener
const deleteCategoryButton = document.getElementById('deleteCategoryButton');
deleteCategoryButton.addEventListener('click', async () => {
    const categoryIdToDelete = await validateId('Bitte geben Sie die ID der zu löschenden Kategorie ein:', `${apiUrl}${user}/categories/`, '');

    if (!categoryIdToDelete) {
        return;
    }

    // Call the deleteCategory function to delete the category
    deleteCategory(categoryIdToDelete);
});

// Get the 'deleteCategoryFrameButton' element and add a click event listener
const deleteCategoryFrameButton = document.getElementById('deleteCategoryFrameButton');
deleteCategoryFrameButton.addEventListener('click', async () => {
    // Get the loaded event data from the frame content
    const frameContent = document.getElementById('Frame-content');
    const loadedEvent = JSON.parse(frameContent.innerHTML);

    // Call the deleteCategory function to delete the loaded event's category
    deleteCategory(loadedEvent.id);

    // Collapse the event frame after deleting the category
    const frame = document.getElementById('eventFrame');
    frame.classList.remove('expanded');
});


// ----- SELECT LOCATION ----- // 

L.mapquest.key = 'V7nW5CioXj8Ux4jUt0jTBH0StJJuzpXf'

// Function to select a location on the map and return its coordinates
async function selectLocationOnMap(mapContainer, value) {
    return new Promise((resolve) => {
        // Check if the map has already been initialized
        if (!mapInitialized) {
            // Initialize the map if it hasn't been done yet
            const map = L.mapquest.map(mapContainer, {
                center: [0, 0],
                layers: L.mapquest.tileLayer('dark'),
                zoom: 10,
            });

            let currentPosition = [0, 0];
            let initialPosition = [0, 0];
            let markerMoved = false;

            // Use provided value as the initial position if available
            if (value != null) {
                initialPosition = value;
            }

            // Create a draggable marker and add it to the map
            const marker = L.marker([0, 0], {
                draggable: true,
            }).addTo(map);

            // Event handler when marker dragging starts
            marker.on('dragstart', () => {
                markerMoved = true;
                initialPosition = marker.getLatLng(); // Store the initial position
            });

            // Event handler while marker is being dragged
            marker.on('drag', (event) => {
                if (markerMoved) {
                    currentPosition = event.target.getLatLng(); // Update current position
                }
            });

            // Event handler when marker dragging ends
            marker.on('dragend', async () => {
                if (markerMoved) {
                    const isSure = validateYesNo('Sind Sie sicher mit dieser Position?');
                    if (!isSure) {
                        // Reset the marker position to the initial position
                        marker.setLatLng(currentPosition);
                    } else {
                        mapContainer.style.display = 'none'; // Hide the map
                        resolve({
                            lat: currentPosition.lat,
                            lng: currentPosition.lng,
                        });
                    }
                }
            });

            mapInitialized = true; // Set the initialization status to true
        }

    });
}

export {
    selectLocationOnMap
}
