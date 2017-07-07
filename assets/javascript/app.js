
//initialize firebase
var config = {
	apiKey: "AIzaSyBSk349ZdonVa8deEG0mnYiWtDIW_WNBV0",
    authDomain: "pick-up-game-f59ca.firebaseapp.com",
    databaseURL: "https://pick-up-game-f59ca.firebaseio.com",
    projectId: "pick-up-game-f59ca",
    storageBucket: "",
    messagingSenderId: "477205336108"
 };

 if (!firebase.apps.length) {
  firebase.initializeApp(config);
 }

//variable to reference the database
var database = firebase.database();

var cors = "https://cors-anywhere.herokuapp.com/";
var coordLat;
var coordLng;
var coordinates;
var queryURL;
var park;
// Default values
var address = "160 Spear St, San Francisco";
var radius = 5000;
var gameType = "Basketball+Court";

function hideDivs() {
  $("#join_one").hide();
  $("#join_message").hide();
  $("#org_one").hide();
  $("#org_form").hide();
  $("#org_message").hide();
  $("#landing").hide();
};

hideDivs();
$("#landing").show();
//on click of join button to search for a game after inputting the address

$('#join').on('click', function (event){
  hideDivs();
  $("#join_one").show();
  //pull from "game" object in firebase when searching for a game  
  //pull the address from the input box 
  address = $('#address').val().trim();
  getCoord(address);
  getGameList(coordLat,coordLng);
  //connect address and map
  renderGameMap(coordLat,coordLng);
});

//on click of organize button to receive the coordinates of the user address to get the list of parks
$('#organize').on('click', function(event){
  //display the form for user to fill out
  hideDivs();
  $("#org_form").show();
  console.log("clicked");
  //pull value from input box
  address = $("#address").val().trim();
  // Retrieve coordinates for the address entered
  getCoord(address);
    // Retrieve list of venues available for game
  getParkList(queryURL);
  renderParkMap(coordLat,coordLng);
});

$(".create").on('click',function(event){
  park = $(this).attr("data-park");
});
  //pull up table with input fields
  // $('.container').slideToggle("slow");
  //pull the values from the create form
$("#submit").on('click', function(){
  name = $('#name').val().trim();
  startTime = $('#startTime').val().trim();
  endTime = $('#endTime').val().trim();
  date = $('#date').val().trim();
  //push the new variables to the cloud 
  database.ref('games').push({
    name: name,
    park: park,
    startTime: startTime,
    endTime: endTime,
    date: date
  });
  // Hide Create div and show confirmation-message
  hideDivs();
  $("#confirmation-message").show();
});

function getCoord(address) {
  $.ajax({
    url: cors + "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" + address + "&key=AIzaSyDPEkigjm2_zBLC8qVTcHkuHtFZNjSY3Zk",
    method: "GET"
  }).done(function(response){
  //convert geo location address to coordinates
    coordLat = response.results[0].geometry.location.lat;
    coordLng = response.results[0].geometry.location.lng;
    coordinates = coordLat + "," + coordLng;
    console.log("Coordinates: ",coordinates)
    queryURL = cors + "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + coordinates + "&radius=" + radius + "&type=park&keyword=" + gameType + "&key=AIzaSyDPEkigjm2_zBLC8qVTcHkuHtFZNjSY3Zk";
    console.log("Query: ",queryURL);
    }); 
};

function getGameList(coordLat,coordLng) {
  database.ref('games').once("value", function (snapshot){
    console.log(snapshot);
  });
};


function renderGameMap(coordLat,coordLng) {

};

//function to get list of parks from google API
function getParkList(listURL) {
  $.ajax({
      url: listURL,
      method: "GET"
    }).done(function(response){
      console.log(response);
      var resultsDiv = $("<div>")
      var results = response.results
      for (var i = 0; i < results.length; i++) {
        var nameP = $("<p>");
        var openP = $("<p>");
        // var photo = $("<img>");
        console.log(results[i].name);
        nameP.append(results[i].name);
        if (results[i].opening_hours !== undefined) {
          openP.append(results[i].opening_hours.open_now);          
          console.log("Opening hours: ",results[i].opening_hours.open_now);      
        };
        // photo.attr("src","")
        resultsDiv.append(nameP);
        resultsDiv.append(openP);
        resultsDiv.append("<hr>");        
      }
      $("#resultsDiv").html(resultsDiv);
        console.log("Get list: Done")
    }); 
}

function renderParkMap(coordLat,coordLng) {
  var coordCenter = {lat: coordLat, lng: coordLng};
  map = new google.maps.Map(document.getElementById('map'), {
    center: coordCenter,
    zoom: 15
  });
  // Pull gamesList from Firebase
  var gamesList;
  // Create marker for each game nearby
  for (var i = 0; i < gamesList.length; i++) {
    var coords = gamesList[i]
    var marker = new google.maps.Marker({
      position: coords,
      map: map
    });
  };
};

// Construct map in div #map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 15
  });
}