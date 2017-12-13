  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyApq-PEfcIQwjR5iFBj9c0nq_y4DU_k-eE",
    authDomain: "mehungry-ccabf.firebaseapp.com",
    databaseURL: "https://mehungry-ccabf.firebaseio.com",
    projectId: "mehungry-ccabf",
    storageBucket: "mehungry-ccabf.appspot.com",
    messagingSenderId: "452624316526"
  };

  firebase.initializeApp(config);

// Assign the reference to the database to a variable named 'database'
var database = firebase.database();

var feeling;
var lookingFor;
var zipCode;

$('#question-section').hide();
$('#result-section').hide();

//Start Button is pressed - User filled out Zip
$('#zip-submit').click(function() {

	var isValidZip = /(^\d{5}$)|(^\d{5}-\d{4}$)/.test($('#zip-input').val());
	console.log(isValidZip);

	if (isValidZip === true) {
		$('#question-section').show();
		displayQuestion(0);
		zipCode = $('#zip-input').val();
		database.ref('zip').set(zipCode);
		console.log("Query Zip Code: " + zipCode); 
	}else{
		$('#zip-input').val('');
		$('#zip-input').attr('placeholder', 'enter a valid zip code')
	}

	
})

//Submit Button is pressed
$('#question-section').on('click', '#question-submit', function() {
	queryZip(zipCode);
})

$('#view-previous').click(function(){

	$('#result-section').show();

	database.ref('lookingFor').once('value').then(function(snapshot){
		console.log('Looking for: ' + snapshot.val());
		lookingFor = snapshot.val();
	});

	database.ref('feeling').once('value').then(function(snapshot){
		console.log('feeling: ' + snapshot.val());
		feeling = snapshot.val();
	});


	database.ref('zip').once('value').then(function(snapshot){
		console.log('Zip Code: ' + snapshot.val());
		zipCode = snapshot.val();
		queryZip(zipCode);
	});

})

//Startover Button is pressed
$('#result-section').on('click', '#startover-button', function() {
	zipcode = null;
	lookingFor = null;
	feeling = null;
	clearResults(markers);
	$('#result-section').hide();
	$('#question-section').hide();
	console.log('RESET');
})

//Question functions

var userQuery = {
		food: {
			happy: ['mexican food', 'burgers', 'breakfast', 'steak'],
			sad: ['italian food', 'chinese food', 'BBQ', 'sushi'],
			hungover: ['breakfast', 'diner', 'pizza'],
			stressed: ['icecream', 'fast food']
		},
		drinks: {
			alcoholic: ['bar', 'wine'],
			caffeinated: ['cafe', 'coffee shop'],
			healthy: ['smoothies', 'juices']
		}
}

var questions = [
	{
		question: 'How are you feeling?',
		choices: ['Great!', 'A little down...', 'Stressed!', 'Hung over...'],
		values: ['happy', 'sad', 'stressed', 'hungover']
	},
	{
		question: 'What are you looking for?',
		choices: ['Food', 'Drinks'],
		values: ['food', 'drinks']
	},
	{
		question: 'What kind of drinks in particular?',
		choices: ['Alcoholic', 'Caffeinated', 'Healthy'],
		values: ['alcoholic', 'caffeinated', 'healthy']
	},
	{
		question: 'Confirm these choices?',
		choices: ['Submit', 'Restart'],
		values: ['submit', 'restart']
	}

]



var questionNumber = 0;

database.ref('feeling').on("value", function(snapshot){
	feeling = snapshot.val();
})

database.ref('lookingFor').on("value", function(snapshot) {
	lookingFor = snapshot.val();
})



$('#question-section').on('click', '.question-buttons', function() {
	
	var chosen = $(this).attr('data-value');

	switch (questionNumber) {
		case 0:
			database.ref('feeling').set(chosen);
			feeling = chosen;
			console.log( 'Currently feeling: ' + chosen);
			questionNumber++;
			displayQuestion(questionNumber);
			break;
		case 1:
			database.ref('lookingFor').set(chosen);
			lookingFor = chosen;
			console.log('Looking for: ' + chosen);

			if ( chosen === 'drinks') {
				questionNumber++;
				displayQuestion(questionNumber);
			}
			if ( chosen === 'food') {
				questionNumber = 3;
				displayQuestion(questionNumber);
			}

			break;
		case 2:
			feeling = chosen;
			database.ref('feeling').set(chosen);

			questionNumber++;
			displayQuestion(questionNumber);
			break;
		case 3:

			if (chosen === 'submit') {

				console.log(userQuery[lookingFor][feeling]);
				$('#result-section').show();
				questionNumber = 0;
				displayQuestion(questionNumber);
			}

			if (chosen === 'restart' ) {
				questionNumber = 0;
				feeling = null;
				lookingFor = null;
				displayQuestion(questionNumber);
			}

			break;
	}

})

function displayQuestion(num) {

	console.log(num);

	$('#question-div').empty();

	$q = $('<h2>').addClass('display-2');
	$q.text(questions[num].question);
	$choices = $('<div>').addClass('form');
	
	$('#question-div').append($q);
	$('#question-div').append($choices);

	for ( var i=0; i< questions[num].choices.length; i++) {

		$b = $('<a>').addClass('btn btn-outline-primary btn-lg question-buttons');

		// In case of submit button - This is to add the ID of "question-submit" to move on to results
		if (num === 3 && i === 0) {
			$b.attr('id', 'question-submit');
			$b.addClass('js-scroll-trigger');
			$b.attr('href', '#result-section');
			}

		$b.attr('data-value', questions[num].values[i]);
		$b.text(questions[num].choices[i]);
		$choices.append($b);
	}

}

//Google Maps, Places, and Geocoder functions

var map;
var infoWindow;
var request;
var service;
var markers = [];
var geocoder;


function queryZip(loc) {
	geocoder = new google.maps.Geocoder();

	var center = new google.maps.LatLng(0,0);
	map = new google.maps.Map(document.getElementById('map-container'), {
		center: center,
		zoom: 13
	});

	geocoder.geocode( { 'address': loc}, function(results, status) {
		if (status == 'OK') {
			map.setCenter(results[0].geometry.location);
			clearResults(markers);
			callback();
			console.log(results);

			var newRequest = {
				location: results[0].geometry.location,
				radius: 4828,
				types: ['restaurant', 'bar', 'cafe'],
				keyword: userQuery[lookingFor][feeling]
			};
			
			infoWindow = new google.maps.InfoWindow();

			service = new google.maps.places.PlacesService(map);
			service.nearbySearch(newRequest, callback);

		} else {
			alert('Geocode was not successful for the following reason' + status);
		}
	});
}

function callback(results, status) {
	if(status == google.maps.places.PlacesServiceStatus.OK){
		for (var i = 0; i < 6; i++){
			createMarker(results[i]);
			var $li = $('<li>').addClass('result-item');
			$li.attr('data-result-num', i);
			$li.attr('data-result-name', results[i].name);
			$li.html('<span display="block"><h4>' + results[i].name + '</h4><h5>' + results[i].vicinity + '</h5></span><hr>')
			$('#result-list').append($li);
		}
	}
}

function createMarker(place) {
	var placeLoc = place.geometry.location;
	var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location
	});

	//Pushes each marker object into the markers array
	markers.push(marker);

	google.maps.event.addListener(marker, 'click', function() {
		infoWindow.setContent(place.name);
		infoWindow.open(map, this);
	})


	return marker;
}

function clearResults(markers){
	for (var m in markers) {
		markers[m].setMap(null);
	}
	markers = [];
	$('#result-list').empty();

}

//Opens up the marker info window when result items are clicked in the side bar via function listClick()
$('#result-section').on('click', '.result-item', function(){
	var clickedName = $(this).attr('data-result-name')
	var clickedNum = $(this).attr('data-result-num');
	listClick(clickedName, clickedNum);
})

function listClick(name, num){
	infoWindow.setContent(name);
	infoWindow.open(map, markers[num]);
}


