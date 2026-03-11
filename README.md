# Weather App

A simple weather application that displays current weather conditions and a short forecast for any city.  
The app fetches real-time data from the WeatherAPI service and presents it in a clean, responsive interface.

## Features

- Search weather by city name
- Get weather using current location
- Display current weather conditions
- Hourly forecast preview
- 5-day forecast overview
- Temperature unit switch (°C / °F)
- Sunrise and sunset times
- Wind speed, humidity, pressure, and visibility
- Responsive UI for different screen sizes

## Demo

You can search for any city to view the current weather conditions and upcoming forecast.

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript (ES Modules)
- WeatherAPI

No frontend frameworks are used. The goal of this project is to practice working with APIs and organizing client-side JavaScript code.

## Project Structure
weather-app/
│
├── index.html        # Main HTML layout
├── style.css         # Application styles
│
└── js/
    ├── main.js       # API calls & state management
    └── ui.js         # DOM rendering

- **main.js**  
Handles API requests, state management, and data processing.

- **ui.js**  
Responsible for rendering weather data to the DOM.

## API

Weather data is provided by:

https://www.weatherapi.com/

The application uses the following endpoints:

- `/current.json`
- `/forecast.json`

## Getting Started

1. Clone the repository


git clone https://github.com/your-username/weather-app.git


2. Navigate to the project folder


cd weather-app


3. Open `index.html` in your browser

No build step or package installation is required.

## Configuration

To run the project with your own API key:

1. Create a file named `.env` (or update the key directly in the code)


WEATHER_API_KEY=your_api_key_here


2. Replace the API key in `main.js`.

## Future Improvements

Possible enhancements for this project:

- Add weather icons based on condition codes
- Display hourly precipitation charts
- Improve error handling for invalid city names
- Add loading states while fetching data
- Cache the last searched city using localStorage

## License

This project is open source and available under the MIT License.

## Project Structure
