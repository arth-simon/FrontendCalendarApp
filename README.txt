Calendar Application:

Authors: Arthur Simon, Hannes Lobreyer
We have selected the following browsers for compatibility tests: Mozilla Firefox, Chrome

Note:
The warning "Diese Seite verwendet die nicht standardisierte Eigenschaft "zoom". Stattdessen sollte calc() in den entsprechenden Eigenschaftswerten oder "transform" zusammen mit "transform-origin: 0 0" verwendet werden." is caused by the mapquest css that we had to integrate for the map.

Steps to open and run the webapplication: (We use Vite and Node.js as a local server)


//1. Node JS has to be installed (https://nodejs.org/ latest LTS)
//1.1 Follow installation instructions with 'next' and close.

//2. Open CMD and go into the folder with cd
//2.1 npm init (enter and yes)
//2.2 npm install vite

//3. Restart/Start IDE and open Folder in it
//3.1 npx vite in IDE-Terminal (in the correct file path)
//3.2 calendar should open in default browser

Enhanced features:

- Enhanced data validation (no entries in the past, no reminders after startdate, no equal category names)
- Integration of Maps application (https://www.mapquest.com/) for event location (Map location usage theoretically and in parts practically possible. Since after setting the location in the map the coordinates cannot be stored in the backend (not implemented in the backend of the web service), it is also not possible to update them in updateEvent. Since only an open source Api is used, only one map container is created, this leads to further limitations.)
- Categorization of calendar entries (We have categories if it was meant by that)
- Reminders (reminders notification only in the console)
- Darkmode