// jQuery listener that runs the JavaScript only after the page has loaded 
$(document).ready(function()
{
    // Code block that initializes the Firebase realtime database
    var config =
    {
        apiKey: "AIzaSyA5eYKsB8T2q6rMGdKSvac6eQsWTzsZEjE",
        authDomain: "ftswizz-train-scheduler.firebaseapp.com",
        databaseURL: "https://tswizz-train-scheduler.firebaseio.com/",
        storageBucket: "tswizz-train-scheduler.appspot.com"
    };

    firebase.initializeApp(config);

    // Creates a reference to the Firebase database so it can be called easily later in the code
    var database = firebase.database();
    var autoUpdate;
    var lastUpdated;

    // Initializes the train count global variable
    // Used to populate the train schedule table on load of of the application and when new trains are added
    var trainCount = 0;

    // Function invoked to load/refresh the train schedule
    function loadTrainSchedule()
    {
        // Empties the Scheduled Trains table body so that updated time tables can be injected into the DOM
        $("#scheduled-trains").empty();

        // Calls the Firebase database Trains path through the Firebase API
        var ref = database.ref("/trains");
        ref.once("value")
            .then(function(snapshot)
            {
                // Counts the number of children in the Trains path to know how many times to iterate
                trainCount = snapshot.numChildren();
                console.log("There are "+snapshot.numChildren()+" trains scheduled.");

                // Conditional to check if there are any scheduled trains
                if (trainCount > 0)
                {   
                    // Loop which iterates through the Firebase database's Trains path if there are scheduled trains
                    for(i = 0; i < trainCount; i++)
                    {                  
                        // Determines each train's a unique identifier so that it's data can be retreieved from the Firebase API response
                        trainNum = i + 1;
                        trainId = "train" + trainNum;

                        // Transforms the Firebase data in to a readable JSON format 
                        var data = snapshot.toJSON();

                        // Sets the current train's data object to the train variable to easily retrieve it 
                        var train = data[trainId];

                        // Logs the current train's data object to the console for debugging purposes
                        console.log(data[trainId]);

                        // Transforms the train's first arrival time into a format that can be read or used in calculations
                        // Uses Moment.js
                        var firstTrain = moment(train.firstTrain, "hh:mm").subtract(1, "years");
                        
                        // Logs the current train's key data elements in string format to the console for debugging purposes
                        console.log("Train Name: " + train.trainName);
                        console.log("Destination: " + train.destination);
                        console.log("Frequency: " + train.frequency);
                        console.log("First Train (HH:MM): " + moment(firstTrain).format("hh:mm"));
                        
                        // Calculates the time since first train to determine how long until the next train
                        // Subtracts the time of first train in the day (in HH:MM) from the current time (in HH:MM) using Moment.js
                        var timeSinceFirstTrain = moment().diff(moment(firstTrain), "minutes");
                        console.log("Time Since First Train (mins): " + timeSinceFirstTrain); // Logs the time since first train

                        // Calculates the number of minutes since last train using the remainder operator
                        // This uses the time since first train and divides it by the train's frequency to get the remainder (or minutes since last train)
                        var minsSinceLastTrain = timeSinceFirstTrain % train.frequency;
                        console.log("Time Since Last Train (mins): " + minsSinceLastTrain); // Logs the time since last train

                        // Calculates the minutes until the next train
                        // Subtracts the minutes since last train from the train's frequency 
                        var minsUntilNextTrain = train.frequency - minsSinceLastTrain;
                        console.log("Minutes Until Next Train: " + minsUntilNextTrain); // Logs the minutes until next train

                        // Calculates the time of next train
                        // Adds the minutes until next train to the current time using Moment.js
                        var nextTrainTime = moment(moment().add(minsUntilNextTrain, "minutes")).format("hh:mm");
                        console.log("Time of Next Train (HH:MM): " + nextTrainTime); // Logs the next train time

                        // Locally initializes the HTML tag variables needed to update the DOM with the train schedule
                        var trainRow = $("<tr>"); // Row in table for current train
                        var nameCol = $("<th>"); // Train name cell for special formatting of text (first cell in row)
                        var destinationCol = $("<td>"); // Destination cell
                        var frequencyCol = $("<td>"); // Frequency cell 
                        var nextArrivalCol = $("<td>"); // Next arrival time cell
                        var minsAwayCol = $("<td>"); // Minutes away cell

                        // Adds the scope attribute of "row" to the train's row HTML
                        nameCol.attr("scope","row");
                       
                        // Adds the respective data to each cell variable in the train's row
                        nameCol.text(train.trainName); // Train name
                        destinationCol.text(train.destination); // Destination
                        frequencyCol.text(train.frequency); // Frequency
                        nextArrivalCol.text(nextTrainTime); // Next arrival time
                        minsAwayCol.text(minsUntilNextTrain); // Minutes away

                        // Appends each cell to the train's row HTML tag variable
                        $(trainRow).append(nameCol);
                        $(trainRow).append(destinationCol);
                        $(trainRow).append(frequencyCol);
                        $(trainRow).append(nextArrivalCol);
                        $(trainRow).append(minsAwayCol);

                        // Appends the current train's row to the Scheduled Trains table in the DOM
                        $("#scheduled-trains").append(trainRow);

                        // Updates the DOM with the last update time stamp using Moment.js
                        lastUpdated = moment().format("MM-DD-YYYY hh:mm:ss");
                        $("#update-time").empty();
                        $("#update-time").append(lastUpdated);
                    }
                }
            });
    }

    // Function invoked to add a new train to the schedule
    // Four arguments or input parameters: train name, destination, frequency (mins), and time of first train
    function addNewTrain (name, destination, frequency, firstTrainTime)
    {
        // Invokes the loadTrainSchedule function to ensure that the most up to date train schedules have been received
        loadTrainSchedule();
        
        // Creates a unique train identifier by counting the number of trains in the Firebase database and then adding 1
        trainId = "train" + (trainCount + 1);

        // Creates a new train object to be added to the Firebase database
        var newTrain = {};

        // Creates a new train record using the train unique identifer set above
        var ref =  database.ref("/trains" + trainId);
        ref.child(trainId).set(newTrain);

        // Sets the new train record's data from the arguments of the function
        ref = database.ref("/trains/" + trainId);
        ref.set(
        {
            trainName: name,
            destination: destination,
            frequency: frequency,
            firstTrain: firstTrainTime
        });
        
    }

    // Function invoked to start the auto update of the train schedule board every 30 seconds
    // Uses the setInterval function
    function startAutoUpdate()
    {
        autoUpdate = setInterval(autoUpdate, 30000);

        function autoUpdate()
        {
            console.log("============================================");
            console.log("==      TRAIN SCHEDULE BOARD UPDATED      ==");
            console.log("============================================");
            
            loadTrainSchedule();
        }  
    }

    // Function invoked to stop the auto update of the train schedule board every 30 seconds
    // Uses the clearInterval function
    function stopAutoUpdate()
    {
        clearInterval(autoUpdate);
    }

    // Begin initial load of train schedule data; start auto update timer and button listener for adding new trains
    console.log("===========================================");
    console.log("==      TRAIN SCHEDULE BOARD LOADED      ==");
    console.log("===========================================");

    // Invokes loadTrainSchedule function to retrieve and display train schedule data
    loadTrainSchedule();

    // Invokes startAutoUpdate function to automatically update the train schedule board every 30 seconds
    startAutoUpdate();

    // jQuery listener that calls the addNewTrain function when the button is clicked
    $("#new-train-btn").on("click", function(event)
    {
        // Prevents the page from reloading when the button is clicked
        event.preventDefault();

        // Retrieves the train name entered by used from form and logs it to the console for debugging purposes
        var newName = $("#new-train-name").val();
        console.log("New Train Name: " + newName);

        // Retrieves the train destination entered by used from form and logs it to the console for debugging purposes
        var newDestination = $("#new-train-destination").val();
        console.log("New Train Destination: " + newDestination);

        // Retrieves the train frequency entered by used from form and logs it to the console for debugging purposes
        var newFrequency = $("#new-train-frequency").val();
        console.log("New Train Frequency: " + newFrequency);

        // Retrieves the first train time entered by used from form and logs it to the console for debugging purposes
        var newFirstTrainTime = $("#new-train-time").val();
        console.log("New First Train Time: " + newFirstTrainTime);

        // Invokes the addNewTrain function with the user's inputs as arguments/parameters
        addNewTrain(newName, newDestination, newFrequency, newFirstTrainTime);

        // Relaods the train schedule with the new train added
        loadTrainSchedule();
    });

    
    












});
