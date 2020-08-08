//-----


//----
var APIKey = "bc401651d6a9a9e281fca78c05aa65bd";
// Here we are building the URL we need to query the database
var city = "San Diego,CA,USA";
var count = 6;
var units = "imperial";
var units2 = "metic";
var weatherByCity = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=" + units + "&appid=" + APIKey;
var unitLabel;
unitLabel = ((units === "imperial") ? "F" : "C");
// var forecast16ByCityID = "https://api.openweathermap.org/data/2.5/forecast/daily?id=5814647&cnt=16&appid=" + APIKey;

//
// We then created an AJAX call
$.ajax({
    url: weatherByCity,

    method: "GET"
}).then(function(response) {
    console.log(response);
    var latitude = response.coord.lat;
    var longitude = response.coord.lon;
    var id = response.id;
    var weather = response.weather; //array , main:clear,desc:clearsky,icon01n
    var main = response.main;
    var temp = main.temp; //in F
    var humid = main.humidity; //whole percentage
    var feelsLike = main.feels_like; //in F
    var uviByCoordinates = "https://api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&cnt=" + count + "&lon=" + longitude + "&appid=" + APIKey;
    $.ajax({
        url: uviByCoordinates,

        method: "GET"
    }).then(function(response) {
        console.log(response);
    });
    var forecast5ByCityID = "https://api.openweathermap.org/data/2.5/forecast?id=" + id + "&appid=" + APIKey;
    $.ajax({
        url: forecast5ByCityID,

        method: "GET"
    }).then(function(response) {
        console.log(response);
    });
    var hourlyForecast = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&units=" + units + "&appid=" + APIKey;
    $.ajax({
        url: hourlyForecast,

        method: "GET"
    }).then(function(response) {
        console.log("hourly:");
        console.log(response);
        var hourlyData = response.hourly;
        hourlyData.length = 25;
        var labels = [];
        var data = [];
        for (hour of hourlyData) {
            // var iconID = hour.weather[0].icon;
            // var img = $("<img src= 'http://openweathermap.org/img/wn/" + iconID + "@2x.png'>")
            // console.log(img);
            labels.push(moment(hour.dt * 1000).format('dd hA'));
            data.push(hour.temp);
        }
        new Chart(document.getElementById("chartjs-0"), { "type": "line", "data": { "labels": labels, "datasets": [{ "label": "Temperature (°" + unitLabel + ")", "data": data, "fill": false, "borderColor": "rgb(75, 192, 192)", "lineTension": 0.1 }] }, "options": {} });
    });


    //append as the last thing.
});