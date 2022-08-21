let requests = [];
let today = new Date();
const options = {
	weekday: 'long',
	year: 'numeric',
	month: 'long',
	day: 'numeric',
};
const apiKey = '7d3b5ecf0d8366f0ec986b9a206a5530';
let currentDate = today.toLocaleDateString('en-US', options);
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
	const url = `http://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&contd=&appid=${apiKey}`;
	const response = await fetch(url);
	const data = await response.json();
	if (data) {
		if ($('.card').length > 0) {
			$('.card').remove();
		}

		generateWeather(data.current, city, state, currentDate);
		generateForecast(data.daily.slice(0, 5));
	}
};

const generateWeather = (data, city, state, today, index = 0) => {
	let indexDay = new Date();
	indexDay.setDate(indexDay.getDate() + index + 1);

	let day = indexDay.toLocaleDateString('en-US', options);
	let sourceCheck = typeof data.temp === 'object' ? true : false;
	let name =
		city === undefined && state === undefined ? '' : `${city}, ${state}`;
	let date = sourceCheck ? day : today;
	let temp = sourceCheck ? data.temp.day : data.temp;
	let humidity = data.humidity;
	let windSpeed = data.wind_speed;
	let uvi = data.uvi;
	let weatherDescription = data.weather[0].description;

	let card = $('<div>').addClass('card p-10 align-items-center text-center');
	sourceCheck
		? card.addClass('col-md-2 m-2 bg-info text-white border border-white')
		: card.addClass('bg-light border border-dark shadow');
	let cardBody = $('<div>').addClass('card-body');
	let cardTitle = $('<h5>').addClass('card-title').text(name);
	let cardDate = $('<h6>').addClass('card-subtitle mb-2 text-muted').text(date);
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

	let cardText5 = $('<p>')
		.addClass('card-text text-center')
		.text(`UV Index: ${uvi}`);

	if (!sourceCheck) {
		if (uvi > 7) {
			cardText5.addClass('bg-danger text-white');
		} else if (uvi > 5) {
			cardText5.addClass('bg-warning text-dark');
		} else {
			cardText5.addClass('bg-success text-white');
		}
	}
	let cardImg = $('<img>')
		.addClass('weather-icon')
		.attr(
			'src',
			`http://openweathermap.org/img/wn/${data.weather[0].icon}.png`
		);
	cardImg.attr('alt', weatherDescription);

	cardBody.append(
		cardTitle,
		cardDate,
		cardText,
		cardText2,
		cardText3,
		cardText4,
		cardText5,
		cardImg
	);
	card.append(cardBody);

	sourceCheck ? $('.five-day-forecast').append(card) : $('.today').append(card);
};

const generateForecast = (data) => {
	console.log('forecast', data);
	data.map((day, index) => {
		generateWeather(day, undefined, undefined, undefined, index);
	});
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
	button.addClass('btn btn-secondary m-2 city-button');
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
