
let requests = [];

$(document).ready(function () {
	$('#city-form').on('submit', handleSubmit);
});

const handleSubmit = async (e) => {
	e.preventDefault();
	const city = $('#city').val().trim();
	const state = $('#state').val().trim();

	if (city && state) {
		// check to make sure state is a valid code
		if (validStateCodes.includes(state.toUpperCase())) {
			getLatLon(city, state);

			$('#city').val('');
			$('#state').val('');
		} else {
			alert('Please enter a valid state code');
		}
	}
};

async function getLatLon(city, state) {
	const url = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},usa&limit=5&appid=${apiKey}`;
	const response = await fetch(url);
	const data = await response.json();

	if (data.length > 0) {
		const lat = data[0].lat;
		const lon = data[0].lon;
		getForecast(lat, lon, city, state);
		buttonCheck(city, state);
	} else {
		alert('Please enter a valid city and state');
	}
}

const getForecast = async (lat, lon, city, state) => {
	const url = `http://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&contd=&appid=${apiKey}`;
	const response = await fetch(url);
	const data = await response.json();
	if (data) {
		if ($('.card').length > 0) {
			$('.card').remove();
		}

		generateWeather(data.current, city, state);
		generateForecast(data, city, state);
	}
};

const generateWeather = (data, city, state) => {
	console.log('weather', data);
	let name = `${city}, ${state}`;
	let temp = data.temp;
	let humidity = data.humidity;
	let windSpeed = data.wind_speed;
	let uvi = data.uvi;
	let weatherDescription = data.weather[0].description;

	let card = $('<div>').addClass('card p-10');
	let cardBody = $('<div>').addClass('card-body');
	let cardTitle = $('<h5>').addClass('card-title').text(name);
	let cardText = $('<p>').addClass('card-text').text(`Temperature: ${temp} °F`);
	let cardText2 = $('<p>')
		.addClass('card-text')
		.text(`Humidity: ${humidity} %`);
	let cardText3 = $('<p>')
		.addClass('card-text')
		.text(`Wind Speed: ${windSpeed} MPH`);
	let cardText4 = $('<p>')
		.addClass('card-text')
		.text(`Weather Description: ${weatherDescription}`);
	let cardText5 = $('<p>').addClass('card-text').text(`UV Index: ${uvi}`);
	let cardImg = $('<img>')
		.addClass('weather-icon')
		.attr(
			'src',
			`http://openweathermap.org/img/wn/${data.weather[0].icon}.png`
		);
	cardImg.attr('alt', weatherDescription);

	cardBody.append(
		cardTitle,
		cardText,
		cardText2,
		cardText3,
		cardText4,
		cardText5,
		cardImg
	);
	card.append(cardBody);
	$('.results').append(card);
};

const generateForecast = (data) => {
	console.log('forecast', data);
};

const buttonCheck = (city, state) => {
	//store city and state in local storage:
	let newRequest = {
		id: localStorage.length + 1,
		city,
		state,
	};

	const filterByCity = requests.filter(
		(request) => request.city.toLowerCase() === newRequest.city.toLowerCase()
	);

	//check to see if the city request is already in local storage

	if (localStorage.length > 0) {
		//create an array of lowercase city names from localStorage in the requests array

		const cityNames = requests.map((request) => request.city.toLowerCase());
		//check to see if the city is already in local storage
		if (cityNames.includes(newRequest.city.toLowerCase())) {
			return;
		} else {
			//if it is not, add the city to local storage and the requests array
			localStorage.setItem(newRequest.id, JSON.stringify(newRequest));
			requests.push(newRequest);
		}
	}

	if (filterByCity.length === 0) {
		requests.push(newRequest);

		localStorage.setItem(newRequest.id, JSON.stringify(newRequest));

		generateButtons(city, state);
	} else {
		alert('You have already searched for this city');
	}
};

const generateButtons = (city, state) => {
	const button = $('<button>');
	button.addClass('btn btn-secondary mx-2 city-button');
	button.text(city + ', ' + state);
	button.attr('data-city', city);
	button.attr('data-state', state);
	$('.search-buttons').append(button);
};

// load buttons from local storage if refresh page and add the objects to request array
if (localStorage.length > 0) {
	for (let i = 0; i < localStorage.length; i++) {
		let key = localStorage.key(i);
		let value = localStorage.getItem(key);
		let request = JSON.parse(value);
		requests.push(request);
		generateButtons(request.city, request.state);
		// create a clear local storage button and
		// add it to the page
	}
}

$('.search-buttons').on('click', '.city-button', function () {
	let city = $(this).attr('data-city');
	let state = $(this).attr('data-state');
	// replace the existing card with the new card
	$('.card').remove();
	getLatLon(city, state);
});

if (requests.length > 0) {
	let clearButton = $('<button>');
	clearButton.addClass('btn btn-danger clear-button my-2');
	clearButton.text('Clear Search History');
	$('#clear').append(clearButton);
}

$('.clear-button').on('click', () => {
	localStorage.clear();
	location.reload();
});

console.log(requests);
