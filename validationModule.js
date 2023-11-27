
const cancelMessage = 'Vorgang abgebrochen.';

// Function to validate an email address using a regular expression
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

// Function to validate options based on user input
function validateOptions(value, validOptions) {
    const optionsMap = {
        'Verfügbar': 'Free',
        'Beschäftigt': 'Busy',
        'Mit Vorbehalt': 'Tentative'
    };

    let optionValue;
    // Repeatedly prompt until a valid option is provided
    do {
        const input = prompt(`Bitte geben Sie den Verfügbarkeitsstatus des Ereignisses ein Verfügbar/Beschäftigt oder Mit Vorbehalt:`, value);
        if (input === null) {
            console.log(cancelMessage);
            return null;
        }
        if (!validOptions.includes(input)) {
            console.log(`Ungültiger Verfügbarkeitsstatus. Bitte wählen Sie einen der Werte: Verfügbar/Beschäftigt oder Mit Vorbehalt.`);
        } else {
            optionValue = optionsMap[input] || input;
        }
    } while (!optionValue);
    return optionValue;
}

// Helper Function
function validateOption(label) {
    const optionsMap = {
        'zuweisen': true,
        'hinzufügen': true,
        'entfernen': false
    };

    const validOptions = ['zuweisen', 'hinzufügen', 'entfernen'];

    let optionValue;
    do {
        const input = prompt(`Möchten Sie einem Ereignis ${label} hinzufügen/zuweisen oder ${label} entfernen?`);
        if (input === null) {
            console.log(cancelMessage);
            return null;
        }
        if (!validOptions.includes(input)) {
            console.log(`Ungültige Option. Bitte wählen Sie eine der folgenden Optionen: ${validOptions.join(', ')}.`);
        } else {
            optionValue = optionsMap[input];
        }
    } while (optionValue === undefined);
    return optionValue;
}


// Function to validate yes/no input
function validateYesNo(label) {
    let input;
    // Repeatedly prompt until a valid "Ja" or "Nein" input is provided
    do {
        input = prompt(`${label} (Ja/Nein):`);
        if (input === null) {
            console.log(cancelMessage);
            return null; // If canceled, return null
        }
        if (input.toLowerCase() !== 'ja' && input.toLowerCase() !== 'nein') {
            console.log('Ungültige Eingabe. Bitte antworten Sie mit "Ja" oder "Nein".');
        }
    } while (input.toLowerCase() !== 'ja' && input.toLowerCase() !== 'nein');

    // Return true if input is "Ja", otherwise false
    return input.toLowerCase() === 'ja';
}


// Function to validate input with optional maximum length constraint
function validateInput(label, value, maxLength, optional = false) {
    let inputValue;

    // Check if the input is optional
    if (optional) {
        do {
            inputValue = prompt(`Bitte geben Sie den ${label} des Ereignisses ein (optional) (max. ${maxLength} Zeichen):`, value === null ? '' : value);
            if (inputValue === null) {
                console.log(cancelMessage);
                return null; // If canceled, return null
            }
            if (inputValue && inputValue.length > maxLength) {
                console.log(`Der ${label} darf maximal ${maxLength} Zeichen lang sein.`);
            }
        } while (inputValue.length > maxLength);
    } else {
        // Input is required
        do {
            inputValue = prompt(`Bitte geben Sie den ${label} des Ereignisses ein (max. ${maxLength} Zeichen):`, value);
            if (inputValue === null) {
                console.log(cancelMessage);
                return null; // If canceled, return null
            }
            if (!inputValue) {
                console.log('Dieses Feld ist erforderlich.');
            }
            if (inputValue && inputValue.length > maxLength) {
                console.log(`Der ${label} darf maximal ${maxLength} Zeichen lang sein.`);
            }
        } while (!inputValue || inputValue.length > maxLength);
    }

    return inputValue;
}


// Function to validate and prompt for an email address
function validateEmail(value, maxLength) {
    let emailValue;
    do {
        emailValue = prompt(`Bitte geben Sie die E-Mail-Adresse des Veranstalters/der Veranstalterin ein (max. ${maxLength} Zeichen):`, value)
        if (emailValue === null) {
            console.log(cancelMessage);
            return null; // If canceled, return null
        }

        if (!emailValue) {
            console.log('Dieses Feld ist erforderlich.');
        }

        if (emailValue && emailValue.length > maxLength) {
            console.log(`Die E-Mail-Adresse des Veranstalters/der Veranstalterin darf maximal ${maxLength} Zeichen lang sein.`);
        }

        if (!isValidEmail(emailValue)) {
            console.log(`Ungültige E-Mail-Adresse. Bitte geben Sie eine gültige E-Mail-Adresse ein.`);
        }
    } while (!emailValue || emailValue.length > maxLength || !isValidEmail(emailValue));

    return emailValue;
}

// Function to validate and prompt for a date and time
function validateDateTime(label, value, minDateTime = null, reminderValue = false) {
    // Obtain current date in ISO format
    const currentDate = new Date().toISOString().split('T')[0];
    let dateTimeValue;
    const maxMonth = 12;
    const maxDay = 31;
    const maxHour = 23;
    const maxMinute = 59;
    const maxSecond = 59;

    let month, day, hour, minute, second; // Declare variables outside the loop

    do {
        dateTimeValue = prompt(`Bitte geben Sie das ${label} (unterstützte Formate: yyyy-MM-dd'T'HH:mm - yyyy-MM-dd'T'HH:mm:ss'Z' - yyyy-MM-dd'T'HH:mm:ss.mmm'Z') ein:`, value);
        if (dateTimeValue === null) {
            console.log(cancelMessage);
            return null; // If canceled, return null
        }

        const datePart = dateTimeValue.split('T')[0];
        const timePart = dateTimeValue.split('T')[1];
        [, month, day] = datePart.split('-');
        if (timePart) {
            [hour, minute, second] = timePart.split(':');
        } else {
            console.log(`Uhrzeit fehlt. Bitte geben Sie eine Uhrzeit im Format HH:mm an.`);
        }

        // Validate the entered date and time values
        if (!isValidTimeFormat(dateTimeValue)) {
            console.log(`Ungültiges ${label}. Bitte verwenden Sie eines der unterstützten Formate.`);
        } else if (!reminderValue && minDateTime && (dateTimeValue <= minDateTime)) {
            console.log(`Das ${label} müssen nach dem Startdatum liegen.`);
        } else if (reminderValue && minDateTime && (dateTimeValue > minDateTime))  {
            console.log(`Das ${label} müssen vor dem Startdatum liegen`);
        } else if (month > maxMonth || day > maxDay || hour > maxHour || minute > maxMinute || second > maxSecond) {
            console.log(`Das ${label} enthält ungültige Werte.`);
        } else if (dateTimeValue < currentDate) {
            console.log(`Das ${label} dürfen nicht in der Vergangenheit liegen.`);
        }
        
    } while (
        // Validate multiple conditions within the loop
        !isValidTimeFormat(dateTimeValue) ||
        (!reminderValue && minDateTime && (dateTimeValue <= minDateTime)) || (reminderValue && minDateTime && (dateTimeValue > minDateTime)) ||
        (month > maxMonth || day > maxDay || hour > maxHour || minute > maxMinute || second > maxSecond) || (dateTimeValue < currentDate)
    );
    return dateTimeValue;
}

// Function to validate the format of a date and time
function isValidTimeFormat(dateTime) {
    const regex = /^(?:(?:\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{3})?)?)|(?:(?:\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z))|(?:(?:\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)))$/;
    return regex.test(dateTime);
}

// Function to validate and prompt for a start date for all-day events
function validateStartDate(label, value) {
    let startDate;
    let month, day;
    const currentDate = new Date().toISOString().split('T')[0]; // Define currentDate outside the loop
    
    do {
        startDate = prompt(`Bitte geben Sie das ${label} ein:`, value.substring(0, 10));
        if (startDate === null) {
            console.log(cancelMessage);
            return null; // If canceled, return null
        }
        if (!isValidDateFormat(startDate)) {
            console.log('Ungültiges Datumsformat. Bitte verwenden Sie das Format yyyy-MM-dd.');
        } else {
            [, month, day] = startDate.split('-');
            if (month > 12 || day > 31) {
                console.log('Ungültiges Startdatum. Bitte geben Sie ein korrektes Datum ein.');
            }
            else if (startDate < currentDate) {
                console.log('Das Startdatum darf nicht in der Vergangenheit liegen.');
            }
        }
    } while (!isValidDateFormat(startDate) || startDate < currentDate || month > 12 || day > 31);
    
    // Set the start time to 00:00 of the start date
    return `${startDate}T00:00`;
}


// Function to validate and prompt for an end date for all-day events
function validateEndDate(label, minDate, value) {
    let endDate;
    let month, day;
    do {
        endDate = prompt(`Bitte geben Sie das ${label} ein:`, value.substring(0, 10));
        if (endDate === null) {
            console.log(cancelMessage);
            return null; // If canceled, return null
        }
        if (!isValidDateFormat(endDate)) {
            console.log('Ungültiges Datumsformat. Bitte verwenden Sie das Format yyyy-MM-dd.');
        } else {
            [, month, day] = endDate.split('-');
            if (month > 12 || day > 31) {
                console.log('Ungültiges Enddatum. Bitte geben Sie ein korrektes Datum ein.');
            }
            else if (endDate < minDate.slice(0, 10)) {
                console.log('Das Startdatum darf nicht nach dem Enddatum sein.');
            }
        }
    } while (!isValidDateFormat(endDate) || endDate < minDate.slice(0, 10) || month > 12 || day > 31);
    
    // Set the end time to 23:59 of the end date
    return `${endDate}T23:59`;
}

// Regular expression to validate date format (YYYY-MM-DD)
function isValidDateFormat(date) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(date);
}

// Function to validate and fetch an ID using asynchronous API call
async function validateId(promptMessage, url, value) {
    while (true) {
        const id = prompt(promptMessage, value === null ? '' : value);
        if (!id) {
            console.log('Vorgang abgebrochen');
            return null; // If canceled, return null
        }

        const response = await fetch(url + id);
        const isValid = response.ok;

        if (isValid) {
            console.log('ID gültig');
            return id;
        } else {
            console.error('Ungültige ID');
            const errorText = await response.text();
            console.log(`Die eingegebene ID existiert nicht. Fehlermeldung: ${errorText}`);
            continue; // Go back to the beginning of the loop and prompt again
        }
    }
}

// Function to validate image file format
function validateImageFile(file) {
    const allowedFormats = ['image/jpeg', 'image/png'];

    if (!file) {
        return 'Es wurde keine Datei ausgewählt.';
    }

    if (!allowedFormats.includes(file)) {
        return 'Nur JPEG- und PNG-Dateien sind erlaubt.';
    }

    return null;
}

// Function to validate image file size
function validateImageFileSize(file) {
    const maxSizeKB = 500;
    const imageSizeInKB = file.length / 1024;
    if (maxSizeKB < imageSizeInKB) {
        return `Die Datei darf nicht größer als ${maxSizeKB} KB sein.`;
    }
    return null;
}


export {
    isValidEmail,
    validateOptions,
    validateOption,
    validateYesNo,
    validateInput,
    validateEmail,
    validateDateTime,
    isValidTimeFormat,
    validateStartDate,
    validateEndDate,
    isValidDateFormat,
    validateId,
    validateImageFile,
    validateImageFileSize
};