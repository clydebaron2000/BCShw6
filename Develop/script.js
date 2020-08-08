const APIKey = "bc401651d6a9a9e281fca78c05aa65bd";
var windowWidth = $(window).width();
var windowHeight = $(window).height();
var iconSize;
//modded
var city = "San Diego, CA";
var unit = "imperial";
var renderCount = 0;

function renderPage(cityState, country = "USA", units = "metric", count = 7, hourlyFurtureForecast = 24) {
    clearPage();
    console.log("RenderCount:      " + (++renderCount));
    var tempUnits, distanceUnits, iconSize;
    if (windowWidth > 800)
        iconSize = "@2x";
    else
        iconSize = "";
    tempUnits = ((units === "imperial") ? "F" : "C");
    distanceUnits = ((units === "imperial") ? "MPH" : "KMH");
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/weather?q=" + cityState + country + "&units=" + units + "&appid=" + APIKey,
        method: "GET"
    }).then(function(response) {
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/onecall?lat=" + response.coord.lat + "&lon=" + response.coord.lon + "&units=" + units + "&appid=" + APIKey,
            method: "GET"
        }).then(function(response) {
            var today = response.daily.shift(); //remove first element
            // today = response.current;
            $('#todayHeader').text(moment(today.dt * 1000).format('dddd, MMMM Do, YYYY'));
            var dailyData = response.daily;
            dailyData.length = count;
            for (day of dailyData) {
                var card = $("<div class='futureDay card' >");
                card.append($("<div class='card-title'>").text(moment(day.dt * 1000).format("MM/DD/YY")));
                var card_body = $("<div class='card-body'>");
                card_body.append($("<p>").text("UVI: " + day.uvi));
                card_body.append($("<img src='http://openweathermap.org/img/wn/" + day.weather[0].icon + iconSize + ".png'>"))
                card_body.append($("<p>").text("Temp (°" + tempUnits + "): " + day.temp.max + "/" + day.temp.min));
                card_body.append($("<p>").text("Humidity: " + day.humidity + "%"));
                card.append(card_body);
                $('.forecast').append(card);
            }
            var hourlyData = response.hourly;
            hourlyData.length = hourlyFurtureForecast;
            var labels = [];
            var data = [];
            for (hour of hourlyData) {
                labels.push(moment(hour.dt * 1000).format('dd hA'));
                data.push(hour.temp);
            }
            $("#cityName").text(city);
            var todayInfo = $("<div id='todayInfo'>");
            todayInfo.append($("<p>").text("Temperature (°" + tempUnits + "): " + today.temp.max + "/" + today.temp.min));
            todayInfo.append($("<p>").text("Current Temp (°" + tempUnits + "): " + data[0]));
            todayInfo.append($("<p>").text("UVI: " + today.uvi));
            todayInfo.append($("<p>").text("Humidity: " + today.humidity + "%"));
            todayInfo.append($("<p>").text("Wind Speed: " + today.wind_speed + " " + distanceUnits));
            $("#today").append(todayInfo);
            var chart = $("<div id='chart'>").append($("<label for='chartjs-0'>").append($("<h2>").text("24-Hour Forecast:")));
            chart.append($("<canvas id='chartjs-0' class='chartjs' style='display: block;float:right;height:100px'>"));
            $("#today").append(chart);
            new Chart(document.getElementById("chartjs-0"), { "type": "line", "data": { "labels": labels, "datasets": [{ "label": "Temperature (°" + tempUnits + ")", "data": data, "fill": false, "borderColor": "rgb(75, 192, 192)", "lineTension": 0.1 }] }, "options": {} });
        });
    });
}

function clearPage() {
    $(".forecast").empty();
    $("#today").empty();
    $("#cityName").empty();
    console.log("page Cleared"); //
}

renderPage(city, "USA", unit);

$(window).on("resize", function() {
    if ($(this).width() !== windowWidth || $(this).height() !== windowHeight) {
        console.log("resized");
        windowWidth = $(this).width();
        windowHeight = $(this).height();
        //do things
        clearPage();
        if (windowWidth > 800)
            iconSize = "@2x";
        else
            iconSize = "";
        renderPage(city, "USA", unit);
    }
});
// Create CODE HERE to calculate the temperature (converted from Kelvin)
// Hint: To convert from Kelvin to Fahrenheit: F = (K - 273.15) * 1.80 + 32