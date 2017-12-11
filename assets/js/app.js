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


$('#question-section').hide();
$('#result-section').hide();

//Start Button is pressed - User filled out Zip
$('#zip-submit').click(function() {
	$('#question-section').show();
	displayQuestion(0);
})

//Submit Button is pressed
$('#question-section').on('click', '#question-submit', function() {
	var zipCode = $('#zip-input').val();
	console.log("Query Zip Code: ", zipCode); 
	queryZip(zipCode);
})



//Question functions

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

$('#question-section').on('click', '.question-buttons', function() {
	
	var chosen = $(this).attr('data-value');

	switch (questionNumber) {
		case 0:
			var feeling = chosen;
			console.log( 'Currently feeling: ' + chosen);
			questionNumber++;
			displayQuestion(questionNumber);
			break;
		case 1:
			var lookingFor = chosen;
			console.log('Looking for: ' + chosen)

			if (lookingFor === 'drinks') {
				questionNumber++;
				displayQuestion(questionNumber);
			}
			if (lookingFor === 'food') {
				questionNumber = 3;
				displayQuestion(questionNumber);
			}

			break;
		case 2:
			if (chosen === 'alcoholic') {
				var drinkChoice = 'bar';
			}
			if (chosen === 'caffeinated') {
				var drinkChoice = 'coffee';
			}
			if (chosen === 'healthy') {
				var drinkChoice = 'smoothies'
			}

			questionNumber++;
			displayQuestion(questionNumber);
			break;
		case 3:

			if (chosen === 'submit') {
				$('#result-section').show();
			}

			if (chosen === 'restart' ) {
				questionNumber = 0;
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
				types: ['restaurant', 'bar'],
				keyword: ['pizza', 'tacos']
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
		for (var i = 0; i < results.length; i++){
			createMarker(results[i]);
		}
	}
}

function createMarker(place) {
	var placeLoc = place.geometry.location;
	var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location
	});

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
}

//Interface
$('#start-button').click( function(){
	var zipCode = $('#zip-input').val();
	console.log("Query Zip Code: ", zipCode); 
	queryZip(zipCode);
})
