// Import necessary validation and module functions
import {
    validateOptions,
    validateYesNo,
    validateInput,
    validateOption,
    validateEmail,
    validateDateTime,
    validateStartDate,
    validateEndDate,
    validateId,
    validateImageFile,
    validateImageFileSize
} from './validationModule.js';
import { fetchEvents, fetchEvent } from './fetchModule.js';
import { selectLocationOnMap } from './main.js';

// Define constants and variables
const apiUrl = 'http://dhbw.radicalsimplicity.com/calendar/';
const user = '9227155'; // Account-Name (Matrikelnummer Arthur Simon)
const mapContainer = document.getElementById('map'); // Container for the map 


// ----- CREATE EVENT ----- //

async function createEvent(value) {

    // Validate and get event title
    const title = validateInput('Titel', '', 50);
    if (title === null) {
        return;
    }
    // Validate and get event location
    const location = validateInput('Ort', '', 50, true);
    if (location === null) {
        return;
    }

    // Optional: Select event location on the map
    const shouldSelectLocation = validateYesNo('Möchten Sie den Standort des Ereignisses auf der Karte markieren?');
    if (shouldSelectLocation === null) {
        return;
    }

    console.log(mapContainer);
    let locationCoordinates = null;
    if (shouldSelectLocation) {
        mapContainer.style.display = 'block'; // Zeige den Container an
        locationCoordinates = await selectLocationOnMap(mapContainer, '');
        console.log(locationCoordinates);
    }

    // Validate and get event organizer (E-Mail)
    const organizer = validateEmail('', 50);
    if (organizer === null) {
        return;
    }

    // Validate and get allday value
    const allday = validateYesNo('Ist das Ereignis ganztägig');
    if (allday === null) {
        return;
    }

    // Set start- and enddate
    let start;
    if (allday) {
        // Startdate if event is allday
        start = validateStartDate('Startdatum (Format: yyyy-MM-dd)', value);
        if (start === null) {
            return;
        }
    } else {
        // Startdate if event is not allday
        start = validateDateTime('Startdatum und Startzeit', value);
        if (start === null) {
            return;
        }
    }
    console.log("Startdatum: ", start);
    let end;
    if (allday) {
        // Enddate if event is allday
        end = validateEndDate('Enddatum (Format: yyyy-MM-dd)', start, '');
        if (end === null) {
            return;
        }
    } else {
        // Enddate if event is not allday
        end = validateDateTime('Enddatum und Endzeit', '', start);
        if (end === null) {
            return;
        }
    }
    console.log("Enddatum: ", end);

    // Validate and get reminders
    const shouldAddReminder = validateYesNo('Möchten Sie Erinnerungen hinzufügen?');
    if (shouldAddReminder === null) {
        return;
    }
    let reminders;
    if (shouldAddReminder) {
        reminders = validateDateTime('Erinnerungsdatum und Erinnerungszeit', '', start, true);

        if (reminders === null) {
            return;
        }
    }
    console.log("Erinnerung am:", reminders);

    const reminderDate = new Date(reminders);
    const currentDate = new Date();
    const timeDifference = reminderDate - currentDate;

    setTimeout(() => {
        console.log('Erinnerung: Ereignis am', start);
    }, timeDifference);

    // Validate and get status
    const status = validateOptions('', ['Verfügbar', 'Beschäftigt', 'Mit Vorbehalt']);
    if (status === null) {
        return;
    }

    // Optional: Validate and get website URL
    const webpage = validateInput('Webseite für weitere Details', '', 100, true);
    if (webpage === null) {
        return;
    }

    // Optional: Add an image to the event
    const shouldAddImage = validateYesNo('Möchten Sie ein Bild hinzufügen?');
    if (shouldAddImage === null) {
        return;
    }

    let imagedata = null;
    if (shouldAddImage) {
        imagedata = await addImageToEvent();
        if (imagedata === null) {
            return;
        }
    }

    // Validate and get category
    const shouldCategory = validateYesNo('Möchten Sie eine Kategorie hinzufügen?');
    if (shouldCategory === null) {
        return;
    }

    let categoryId = null;
    if (shouldCategory) {
        categoryId = await validateId('Geben Sie die ID der Kategorie ein:', `${apiUrl}${user}/categories/`, '');
        if (categoryId === null) {
            return;
        }
    }

    // Validate and get extra
    const extras = validateInput('Beschreibung des Ereignisses', '', 2000, true);
    if (extras === null) {
        return;
    }

    // Create event data object
    const event_data = {
        title: title,
        location: location,
        organizer: organizer,
        start: start,
        end: end,
        reminder: reminders,
        status: status,
        allday: allday,
        webpage: webpage,
        //imagedata: imagedata,
        categories: categoryId !== null ? [{ id: categoryId }] : [],
        extra: extras,
        locationCoordinate: locationCoordinates,
    };

    // Send event data to the server
    try {
        const response = await fetch(`${apiUrl}${user}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event_data),
        });

        // Handle response
        if (!response.ok) {
            throw new Error('Fehler beim Erstellen des Ereignisses');
        }

        const newEvent = await response.json();
        console.log('Neues Ereignis erstellt:', newEvent);

        // Handle image upload if necessary
        if (imagedata !== null) {
            const imageResponse = await fetch(`${apiUrl}${user}/images/${newEvent.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imagedata: `data:${imagedata.imageContentType};base64,${imagedata.imageData}` }),
            });

            if (!imageResponse.ok) {
                console.error('Fehler beim Hinzufügen des Bildes zum Ereignis');
            } else {
                console.log('Bild erfolgreich zum Ereignis hinzugefügt');
            }
        }

        // Fetch updated events
        fetchEvents();
    } catch (error) {
        console.error('Fehler beim Erstellen des Ereignisses:', error);
    }
}
// Event creation button
const createEventButton = document.getElementById('addEventButton');
createEventButton.addEventListener('click', () => createEvent(''));

// Event creation button within a frame
const createEventFrameButton = document.getElementById('addEventFrameButton');
createEventFrameButton.addEventListener('click', async () => {
    const frameContent = document.getElementById('calendar-events-frame-content');
    const selectedDay = frameContent.getAttribute('data-selected-day');
    await createEvent(selectedDay); // Create event using selected day
    frameContent.innerHTML = ''; // Clear frame content
    fetchEvent(frameContent.id); // Fetch and update events
});


// ----- UPDATE EVENT ----- //

async function updateEvent(validEventId) {

    try {
        // Fetch existing event data
        const existingEventResponse = await fetch(`${apiUrl}${user}/events/${validEventId}`);
        if (!existingEventResponse.ok) {
            throw new Error('Fehler beim Abrufen des bestehenden Ereignisses');
        }
        const existingEventData = await existingEventResponse.json();

        const updatedEvent = { ...existingEventData };

        // Revalidate and update event title
        updatedEvent.title = validateInput('Titel', updatedEvent.title, 50);
        if (updatedEvent.title === null) {
            return;
        }

        // Revalidate and update event location
        updatedEvent.location = validateInput('Ort', updatedEvent.location, 50, true);
        if (updatedEvent.location === null) {
            return;
        }

        // Check if the event's location should be changed
        const shouldChangeLocation = validateYesNo('Möchten Sie den Ort des Ereignisses auf der Karte ändern?');
        if (shouldChangeLocation === null) {
            return;
        }

        if (shouldChangeLocation) {
            // Display map and select location
            mapContainer.style.display = 'block';
            updatedEvent.locationCoordinate = await selectLocationOnMap(mapContainer, updatedEvent.locationCoordinate);
            console.log('selected location:', updatedEvent.locationCoordinate);
        }

        // Revalidate and update organizer (E-Mail)
        updatedEvent.organizer = validateEmail(updatedEvent.organizer, 50);
        if (updatedEvent.organizer === null) {
            return;
        }

        // Revalidate and get allday value
        updatedEvent.allday = validateYesNo('Ist das Ereignis ganztägig');
        if (updatedEvent.allday === null) {
            return;
        }

        // Revalidate and update event startdate and enddate
        if (updatedEvent.allday) {
            updatedEvent.start = validateStartDate('Startdatum (Format: yyyy-MM-dd)', updatedEvent.start);
            if (updatedEvent.start === null) {
                return;
            }
            updatedEvent.end = validateEndDate('Enddatum (Format: yyyy-MM-dd)', updatedEvent.start, updatedEvent.end);
            if (updatedEvent.end === null) {
                return;
            }
        } else {
            updatedEvent.start = validateDateTime('Startdatum und Startzeit', updatedEvent.start, false);
            if (updatedEvent.start === null) {
                return;
            }

            updatedEvent.end = validateDateTime('Enddatum und Endzeit', updatedEvent.end, false, updatedEvent.start);
            if (updatedEvent.end === null) {
                return;
            }
        }

        // Revalidate and update reminders
        const shouldUpdateReminder = validateYesNo('Möchten Sie ihre Erinnerung anpassen?');
        if (shouldUpdateReminder === null) {
            return;
        }
        if (shouldUpdateReminder) {
            updatedEvent.reminders = validateDateTime('Erinnerungsdatum und Erinnerungszeit', updatedEvent.reminders, updatedEvent.start, true);
            if (updatedEvent.reminders === null) {
                return;
            }
        }
        console.log("Erinnerung am: ", updatedEvent.reminders);
        const reminderDate = new Date(updatedEvent.reminders);

        const currentDate = new Date();

        const timeDifference = reminderDate - currentDate;

        setTimeout(() => {
            console.log('Erinnerung: Ereignis am', updatedEvent.start);
        }, timeDifference);

        const optionsMap = {
            'Free': 'Verfügbar',
            'Busy': 'Beschäftigt',
            'Tentative': 'Mit Vorbehalt'
        };

        // Revalidate and get event status
        const updatedOptions = optionsMap[updatedEvent.status] || updatedEvent.status;
        const newStatus = validateOptions(updatedOptions, ['Verfügbar', 'Beschäftigt', 'Mit Vorbehalt']);
        if (newStatus === null) {
            return;
        }
        updatedEvent.status = newStatus;

        // Revalidate and get website URL
        updatedEvent.webpage = validateInput('Webseite für weitere Details', updatedEvent.webpage, 100, true);
        if (updatedEvent.webpage === null) {
            return;
        }

        // Revalidate and get image URL
        const shouldAddImage = validateYesNo('Möchten Sie ein Bild hinzufügen?');
        if (shouldAddImage === null) {
            return;
        }

        /*let imagedata = updatedEvent.imagedata;
        if (shouldAddImage) {
            updatedEvent.imagedata = addImageToEvent();
            if (updatedEvent.imagedata === null) {
                return;
            }
        }
        else {
            updatedEvent.imagedata = null;
        }*/

        // Revalidate and get category value
        const shouldCategory = validateYesNo('Möchten Sie die Kategorie ändern?');
        if (shouldCategory === null) {
            return;
        }
        if (shouldCategory) {
            if (updatedEvent.categories != 0) {
                const categoryID = await validateId('Geben Sie die ID der Kategorie ein:', `${apiUrl}${user}/categories/`, updatedEvent.categories ? updatedEvent.categories[0].id : null);
                if (categoryID === null) {
                    updatedEvent.categories = await removeEventFromCategory(updatedEvent.id, updatedEvent.categories[0].id);
                } else {
                    updatedEvent.categories = await removeEventFromCategory(updatedEvent.id, updatedEvent.categories[0].id);
                    updatedEvent.categories = await assignEventToCategory(updatedEvent.id, categoryID);
                }
            } else {
                const categoryID = await validateId('Geben Sie die ID der Kategorie ein:', `${apiUrl}${user}/categories/`, '');
                if (categoryID != null) {
                    updatedEvent.categories = await assignEventToCategory(updatedEvent.id, categoryID);
                }
            }
        }

        // Revalidate and get extra value
        updatedEvent.extra = validateInput('Beschreibung des Ereignisses', updatedEvent.extra, 2000, true);
        if (updatedEvent.extra === null) {
            return;
        }

        // Send updated event data to the server
        const response = await fetch(`${apiUrl}${user}/events/${validEventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedEvent),
        });

        if (!response.ok) {
            throw new Error('Fehler beim Aktualisieren des Ereignisses');
        }

        // Update successful
        const updatedEventData = await response.json();
        console.log('Ereignis erfolgreich aktualisiert:', updatedEventData);
        fetchEvents(); // Aktualisiere die Ereignisliste
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Ereignisses:', error);
    }
}
// Get the update event button and add a click event listener
const updateEventButton = document.getElementById('updateEventButton');
updateEventButton.addEventListener('click', async () => {
    // Prompt for event ID and validate
    const validEventId = await validateId('Bitte geben Sie die ID des Ereignisses ein:', `${apiUrl}${user}/events/`, '');
    if (validEventId === null) {
        return; // Exit if validation fails
    }
    updateEvent(validEventId); // Call the updateEvent function with the validated ID
});

// Get the update event frame button and add a click event listener
const updateEventFrameButton = document.getElementById('updateEventFrameButton');
updateEventFrameButton.addEventListener('click', async () => {
    const frameContent = document.getElementById('Frame-content');

    // Get the loaded event data from the frame content
    const loadedEvent = JSON.parse(frameContent.innerHTML);

    // Update the event using the loaded event's ID
    await updateEvent(loadedEvent.id);

    // Clear frame content and fetch the updated event
    frameContent.innerHTML = '';
    fetchEvent(loadedEvent.id);
});


// ----- DELETE EVENT ----- //

// Async function to delete an event using its ID
async function deleteEvent(eventId) {
    try {
        // Send a DELETE request to the API endpoint for the specified event ID
        const response = await fetch(`${apiUrl}${user}/events/${eventId}`, {
            method: 'DELETE',
        });

        // Check if the response indicates success, otherwise throw an error
        if (!response.ok) {
            throw new Error('Fehler beim Löschen des Ereignisses');
        }

        // Log success message and update the list of events
        console.log('Ereignis erfolgreich gelöscht');
        fetchEvents(); // Call a function to refresh the events list
    } catch (error) {
        // Handle errors that occurred during the deletion process
        console.error('Fehler beim Löschen des Ereignisses:', error);
    }
}
// Get the button element for deleting an event
const deleteEventButton = document.getElementById('deleteEventButton');
deleteEventButton.addEventListener('click', async () => {
    // Prompt user for the ID of the event to delete
    const eventIdToDelete = await validateId('Geben Sie die ID des zu löschenden Ereignisses ein:', `${apiUrl}${user}/events/`, '');
    if (!eventIdToDelete) {
        return; // Exit if no valid event ID is provided
    }
    // Call the deleteEvent function to delete the event with the provided ID
    deleteEvent(eventIdToDelete);
});

// Get the button element for deleting an event from a frame
const deleteEventFrameButton = document.getElementById('deleteEventFrameButton');
deleteEventFrameButton.addEventListener('click', async () => {
    // Get the content of the frame, assumed to be JSON data of the loaded event
    const frameContent = document.getElementById('Frame-content');
    const loadedEvent = JSON.parse(frameContent.innerHTML);

    // Call the deleteEvent function to delete the loaded event
    deleteEvent(loadedEvent.id);

    // Collapse the expanded frame
    const frame = document.getElementById('eventFrame');
    frame.classList.remove('expanded');

    // Collapse the expanded frame event
    const frameEvent = document.getElementById('calendar-events-frame');
    frameEvent.classList.remove('expanded');
});



// ----- ASSIGN EVENT TO CATEGORY ----- //

// Function to assign an event to a specific category
async function assignEventToCategory(eventIdToAssign, categoryIdToAssign) {
    try {
        // Send a POST request to the API to assign the event to the specified category
        const response = await fetch(`${apiUrl}${user}/categories/${categoryIdToAssign}/${eventIdToAssign}`, {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error('Fehler beim Zuweisen des Ereignisses zur Kategorie');
        }
        // After successful assignment, update the list of events and log success
        fetchEvents();
        console.log('Ereignis erfolgreich zur Kategorie zugewiesen');
    } catch (error) {
        console.error('Fehler beim Zuweisen des Ereignisses zur Kategorie:', error);
    }
}


// ----- SHOULD EVENT-CATEGORY ----- //

// Event handler for assigning/removing an event to/from a category
const eventCategoryButton = document.getElementById('EventCategoryButton');
eventCategoryButton.addEventListener('click', async () => {
    // Prompt the user to choose whether to assign or remove a category
    let shouldCategory = validateOption('eine Kategorie');

    if (shouldCategory === null) {
        return;
    }
    if (shouldCategory) {
        // If user chooses to assign a category
        const eventIdToAssign = await validateId('Geben Sie die ID des Ereignisses ein:', `${apiUrl}${user}/events/`, '');
        if (!eventIdToAssign) {
            return;
        }

        const categoryIdToAssign = await validateId('Geben Sie die ID der Kategorie ein:', `${apiUrl}${user}/categories/`, '');
        if (!categoryIdToAssign) {
            return;
        }
        // Call function to assign the event to the specified category
        assignEventToCategory(eventIdToAssign, categoryIdToAssign);
    }
    else {
        // If user chooses to remove a category
        const eventIdToRemove = await validateId('Geben Sie die ID des Ereignisses ein:', `${apiUrl}${user}/events/`, '');
        if (!eventIdToRemove) {
            return;
        }
        // Fetch existing event data to update
        const existingEventResponse = await fetch(`${apiUrl}${user}/events/${eventIdToRemove}`);
        if (!existingEventResponse.ok) {
            throw new Error('Fehler beim Abrufen des bestehenden Ereignisses');
        }
        const existingEventData = await existingEventResponse.json();

        const updatedEvent = { ...existingEventData };

        if (updatedEvent.categories != 0) {
            const categoryIdToRemove = await validateId('Geben Sie die ID der Kategorie ein:', `${apiUrl}${user}/categories/`, '');
            if (!categoryIdToRemove) {
                return;
            }
            // Call function to remove the event from its current category
            removeEventFromCategory(eventIdToRemove, categoryIdToRemove);
        }
        else {
            console.log('Keine Kategorie zum Entfernen vorhanden.');
        }
    }
});

// Event handler for assigning/removing an event to/from a category from the frame
const eventCategoryFrameButton = document.getElementById('EventCategoryFrameButton');
eventCategoryFrameButton.addEventListener('click', async () => {

    // Prompt the user to choose whether to assign or remove a category
    let shouldCategory = validateOption('eine Kategorie');

    // Get the content of the frame and parse the loaded event data
    const frameContent = document.getElementById('Frame-content');
    const loaded = JSON.parse(frameContent.innerHTML);

    if (shouldCategory === null) {
        return;
    }
    if (shouldCategory) {
        // If user chooses to assign a category
        const categoryIdToAssign = await validateId('Geben Sie die ID der Kategorie ein:', `${apiUrl}${user}/categories/`, '');
        if (!categoryIdToAssign) {
            return;
        }
        // Call function to assign the loaded event to the specified category
        await assignEventToCategory(loaded.id, categoryIdToAssign);
    }
    else {
        // If user chooses to remove a category
        if (loaded.categories != 0) {
            const categoryIdToRemove = await validateId('Geben Sie die ID der Kategorie ein:', `${apiUrl}${user}/categories/`, '');
            if (!categoryIdToRemove) {
                return;
            }
            // Call function to remove the loaded event from its current category
            await removeEventFromCategory(loaded.id, categoryIdToRemove);
        }
        else {
            console.log("Keine Kategorie vorhanden");
            return;
        }
    }

    // Clear the frame content and fetch updated event data
    frameContent.innerHTML = '';
    fetchEvent(loaded.id);
});


// ----- REMOVE EVENT FROM CATEGORY ----- //

async function removeEventFromCategory(eventIdToRemove, categoryIdToRemove,) {

    try {
        const deleteResponse = await fetch(`${apiUrl}${user}/categories/${categoryIdToRemove}/${eventIdToRemove}`, {
            method: 'DELETE',
        });

        if (!deleteResponse.ok) {
            throw new Error('Die Kategorie ist nicht vorhanden, welche du löschen möchtest');
        }
        fetchEvents();
        console.log('Ereignis erfolgreich aus der Kategorie entfernt');
    } catch (error) {
        console.error('Fehler beim Entfernen des Ereignisses aus der Kategorie:', error);
    }
}


// ----- ASIGN IMAGE TO EVENT ----- //

// Function to upload an image to an event
async function uploadImage(imageData, imageContentType, eventId) {
    try {
        // Create an image object to be sent in the request
        const imageObject = {
            imagedata: `data:${imageContentType};base64,${imageData}`,
        };

        // Send a POST request to add the image to the event
        const response = await fetch(`${apiUrl}${user}/images/${eventId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(imageObject),
        });

        if (!response.ok) {
            // Handle errors during image upload
            throw new Error('Fehler beim Hinzufügen des Bildes zum Ereignis');
        }

        console.log('Bild erfolgreich zum Ereignis hinzugefügt');
        // Fetch updated event data after adding the image
        await fetchEvents();
        return true;
    } catch (error) {
        // Handle errors during image upload and return false
        console.error('Fehler beim Hinzufügen des Bildes zum Ereignis:', error);
        return false;
    }
}

// Function to add an image to an event
async function addImageToEvent() {
    return new Promise((resolve) => {
        // Create an input element for selecting an image file
        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.accept = 'image/*';
        imageInput.style.position = 'absolute';
        imageInput.style.left = '-9999px';

        // Append the input element to the document body
        document.body.appendChild(imageInput);

        // Listen for changes in the input (image selection)
        imageInput.addEventListener('change', async (changeEvent) => {
            const selectedFile = changeEvent.target.files[0];
            if (selectedFile) {
                const reader = new FileReader();
                reader.onload = async (loadEvent) => {
                    const imageData = loadEvent.target.result;
                    const imageContent = imageData.split(',')[1];
                    const imageContentType = imageData.split(';')[0].split(':')[1];

                    // Validate image file type and size
                    const validationErrorFile = validateImageFile(imageContentType);
                    const validationErrorSize = validateImageFileSize(imageData);

                    if (validationErrorSize || validationErrorFile) {
                        console.log(validationErrorSize || validationErrorFile);
                        resolve(null); // Return null in case of validation errors
                    }

                    // Resolve with image data and content type
                    resolve({
                        imageData: imageContent,
                        imageContentType,
                    });
                };
                reader.readAsDataURL(selectedFile);
            }

            // Remove the input element from the document body
            document.body.removeChild(imageInput);
        });

        // Trigger a click on the input element to open the file dialog
        imageInput.click();
    });
}



// ----- SHOULD IMAGE EVENT ----- //

// Event listener for the image button on the main interface
const eventImageButton = document.getElementById('imageButton');
eventImageButton.addEventListener('click', async () => {
    // Ask the user whether they want to add or remove an image
    let shouldImage = validateOption('ein Bild');
    if (shouldImage === null) {
        return;
    }
    if (shouldImage) {
        // If the user wants to add an image

        // Get the image data and type from the user
        const imageDataAndType = await addImageToEvent();

        // Get the ID of the event to which the image will be added
        const eventIdToAddImage = await validateId('Geben Sie die ID des Ereignisses ein, dem Sie ein Bild hinzufügen möchten:', `${apiUrl}${user}/events/`, '');
        if (!eventIdToAddImage) {
            return;
        }

        if (imageDataAndType) {
            const { imageData, imageContentType } = imageDataAndType;
            // Upload the image to the specified event
            uploadImage(imageData, imageContentType, eventIdToAddImage);
        }
    }
    else {
        // If the user wants to remove an image

        // Get the ID of the event from which the image will be removed
        const validEventId = await validateId('Bitte geben Sie die ID des Ereignisses ein:', `${apiUrl}${user}/events/`, '');
        if (!validEventId) {
            return;
        }
        
        // Remove the image from the specified event
        removeImageFromEvent(validEventId);        
    }
});

// Event listener for the image button in the frame
const imageFrameButton = document.getElementById('imageFrameButton');
imageFrameButton.addEventListener('click', async () => {
    const frameContent = document.getElementById('Frame-content');

    // Ask the user whether they want to add or remove an image
    let shouldImage = validateOption('ein Bild');
    const loaded = JSON.parse(frameContent.innerHTML);

    if (shouldImage === null) {
        return;
    }

    if (shouldImage) {
        // If the user wants to add an image

        // Get the image data and type from the user
        const imageDataAndType = await addImageToEvent();

        if (imageDataAndType) {
            const { imageData, imageContentType } = imageDataAndType;
            // Upload the image to the specified event in the frame
            await uploadImage(imageData, imageContentType, loaded.id);
        }
    }
    else {
        // If the user wants to remove an image

        // Remove the image from the specified event in the frame
        await removeImageFromEvent(loaded.id);
    }
    // Clear the frame content and fetch the updated event details
    frameContent.innerHTML = '';
    fetchEvent(loaded.id);
});


// ----- REMOVE IMAGE FROM EVENT ----- //

// Function to remove an image from an event
async function removeImageFromEvent(validEventId) {

    try {
        // Send a request to remove the image from the specified event
        const response = await fetch(`${apiUrl}${user}/images/${validEventId}`, {
            method: 'DELETE',
        });

        // Check if the response indicates that the event has no assigned image
        if (response.status === 400) {
            console.log('Das ausgewählte Ereignis hat kein zugewiesenes Bild.');
            return; // Exit if there's no image assigned to the event
        }

        if (!response.ok) {
            throw new Error('Fehler beim Entfernen des Bildes aus dem Ereignis');
        }

        console.log('Bild erfolgreich aus dem Ereignis entfernt');
        await fetchEvents(); // Fetch updated event data
    } catch (error) {
        console.error('Fehler beim Entfernen des Bildes aus dem Ereignis:', error);
    }
}

export {
    createEvent,
    updateEvent,
    deleteEvent,
    assignEventToCategory,
    removeEventFromCategory,
    uploadImage,
    addImageToEvent,
    removeImageFromEvent
};
