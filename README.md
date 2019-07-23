# Train Scheduler (Homework 7)
### Overview
The Train Scheduler is the Homework 7 submission for Taylor Johnson in the Georgia Tech Coding Bootcamp. It uses HTML, CSS, Bootstrap, JavaScript, jQuery, Google Firebase, and Moment.js to build a front end and backend data source for displaying train station data. This data includes the train's name, destination, next arrival time, and minutes until next arrival. It automatically updates or refreshes every 30 seconds.

Additionally, there is also a form that allows the user to add additional trains to the schedule board. The user inputs in the train name, destination, frequency, and time of the first train daily. The application calculates the next arrival time and minutes until next arrival.

### Mechanics
There are four primary functions for this application:
1. loadTrainSchedule
2. addNewTrain
3. startAutoUpdate
4. stopAutoUpdate

Upon initial load of the application, loadTrainSchedule is invoked via a network call to the Google Firebase real time database for the train scheduler. This function calculates the number of trains in the database (if any) and then iterates through each of them to retrieve the data to be displayed to the user. It should be noted that before this loop can proceed, each train's unique identifier must be calculated and the train's data must be transformed into a JSON object. Only then can the function accurately retrieve the data.

Once the data for a train is retrieved, several calculations are performed using Moment.js:
1. Time since first train
2. Number of minutes since last train
3. Number of minutes until next train
4. Time of next train

The time since first train is calculated by subtracting the time of first train from the current time. This returns the number of minutes since the first train of the day. Number of minutes since last train is calculated by using the remainder operator with time since first train and train frequency. This returns the number of minutes since the last train. Number of minutes until next train is calculated by simply subtracting the number of minutes since last train from the train's frequency. Finally, the time of the next train is calculated by adding the number of minutes until next train to the current time.

Af these calculations are performed, the train's static (train name, destination, and frequency) and calculated (next arrival time and minutes until next arrival) data elements are injected into the DOM using jQuery. This repeats for each train in the Firebase database using the count calculated when the function was initially invoked.

If the user needs to add a new train to the schedule board, he can use the form to add a new unique record to the Firebase database. Based upon the count of unique train records in the database, a new unique identifier is created and then the user input train data is set in the database for the new record. When a new record is added, the train schedule board is updated again in the DOM.

A timer is used to automatically update the train schedule board every thirty (30) seconds. This functionality is enabled by using the setInterval function of JavaScript. Every thirty seconds, the loadTrainSchedule function is called. If needed, the clearInterval function is available in the application's core JavaScript file, trains.js. It is not currently in use. 