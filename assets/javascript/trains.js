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

    // Initializes the variables to populate the train schedule table on load of of the application and when new trains are added
    var trainCount = 0;

    function loadTrainSchedule()
    {
        $("#scheduled-trains").empty();

        // Loop to populate the train schedule table on load of the application
        var ref = database.ref("/trains");
        ref.once("value")
            .then(function(snapshot)
            {
                trainCount = snapshot.numChildren();
                console.log("There are "+snapshot.numChildren()+" trains scheduled.");

                if (trainCount > 0)
                {   
                    for(i = 0; i < trainCount; i++)
                    {                  
                        trainNum = i + 1;
                        trainId = "train" + trainNum;
                        var data = snapshot.toJSON();
                        var train = data[trainId];
                        console.log(data[trainId]);

                        var firstTrain = moment(train.firstTrain, "hh:mm").subtract(1, "years");
                        
                        console.log("Train Name: " + train.trainName);
                        console.log("Destination: " + train.destination);
                        console.log("Frequency: " + train.frequency);
                        console.log("First Train: " + moment(firstTrain).format("hh:mm"));
                        
                        // Calculates the time since first train to determine how long until the next train
                        var timeSinceFirstTrain = moment().diff(moment(firstTrain), "minutes");
                        console.log("Time Since First Train: " + timeSinceFirstTrain);

                        var minsSinceLastTrain = timeSinceFirstTrain % train.frequency;
                        console.log("Time Since Last Train: " + minsSinceLastTrain);

                        var minsUntilNextTrain = train.frequency - minsSinceLastTrain;
                        var nextTrainTime = moment(moment().add(minsUntilNextTrain, "minutes")).format("hh:mm");


                        var trainRow = $("<tr>");
                        var nameCol = $("<th>");
                        var destinationCol = $("<td>");
                        var frequencyCol = $("<td>");
                        var nextArrivalCol = $("<td>");
                        var minsAwayCol = $("<td>");  

                        nameCol.attr("scope","row");
                        nameCol.text(train.trainName);

                        destinationCol.text(train.destination);
                        frequencyCol.text(train.frequency);

                        nextArrivalCol.text(nextTrainTime);
                        minsAwayCol.text(minsUntilNextTrain);

                        $(trainRow).append(nameCol);
                        $(trainRow).append(destinationCol);
                        $(trainRow).append(frequencyCol);
                        $(trainRow).append(nextArrivalCol);
                        $(trainRow).append(minsAwayCol);

                        $("#scheduled-trains").append(trainRow);
                    }
                }
            });
    }

    function addNewTrain (name, destination, frequency, firstTrainTime)
    {
        trainId = "train" + (trainCount + 1);
        var newTrain = {};

        var ref =  database.ref("/trains" + trainId);
        ref.child(trainId).set(newTrain);

        ref = database.ref("/trains/" + trainId);
        ref.set(
        {
            trainName: name,
            destination: destination,
            frequency: frequency,
            firstTrain: firstTrainTime
        });
        
    }

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

    function stopAutoUpdate()
    {
        clearInterval(autoUpdate);
    }

    console.log("===========================================");
    console.log("==      TRAIN SCHEDULE BOARD LOADED      ==");
    console.log("===========================================");


    // Begin initial load of train schedule data; start auto update timer and button listener for adding new trains
    
    loadTrainSchedule();

    startAutoUpdate();

    $("#new-train-btn").on("click", function(event)
    {
        event.preventDefault();

        var newName = $("#new-train-name").val();
        console.log(newName);
        var newDestination = $("#new-train-destination").val();
        console.log(newDestination);
        var newFrequency = $("#new-train-frequency").val();
        console.log(newFrequency);
        var newFirstTrainTime = $("#new-train-time").val();
        console.log(newFirstTrainTime);

        addNewTrain(newName, newDestination, newFrequency, newFirstTrainTime);

        loadTrainSchedule();
    });

    
    












});
