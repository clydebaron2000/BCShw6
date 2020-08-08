$(function() {
    const APIKey = "bc401651d6a9a9e281fca78c05aa65bd";
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();
    var iconSize;
    var iconIDArray;
    var savedCities = [];
    //modded
    var unit = "imperial";
    //test
    var renderCount = 0;
    //----
    function renderPage(cityState, country = "US", units = "metric", count = 7, hourlyFurtureForecast = 24) {
        if (windowWidth > 800)
            iconSize = "@2x";
        else
            iconSize = "";
        var tempUnits, distanceUnits;
        tempUnits = ((units === "imperial") ? "F" : "C");
        distanceUnits = ((units === "imperial") ? "MPH" : "KMH");
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/weather?q=" + cityState + "," + country + "&units=" + units + "&appid=" + APIKey,
            method: "GET",
            success: function(response) {
                if (response.sys.country !== country) {
                    console.log("not");
                    return false;
                }
                console.log("RenderCount:      " + (++renderCount));
                clearPage();
                $.ajax({
                    url: "https://api.openweathermap.org/data/2.5/onecall?lat=" + response.coord.lat + "&lon=" + response.coord.lon + "&units=" + units + "&appid=" + APIKey,
                    method: "GET"
                }).then(function(response) {
                    iconIDArray = [];
                    var today = response.daily.shift(); //remove first element
                    $('#todayHeader').text(moment(today.dt * 1000).format('dddd, MMMM Do, YYYY'));
                    $("#cityName").text(cityState).append($("<button class='btn save' value='" + cityState + "' style='float:right'>").append("<i class='far fa-star'>"));
                    iconIDArray.push(today.weather[0].icon);
                    $("#todayHeader").append($("<img class='icon' src='http://openweathermap.org/img/wn/" + today.weather[0].icon + iconSize + ".png'>"))
                    var todayInfo = $("<div id='todayInfo'>");
                    todayInfo.append($("<p>").text("Temperature (°" + tempUnits + "): " + today.temp.max + "/" + today.temp.min));
                    var labels = [];
                    var data = [];
                    var hourlyData = response.hourly;
                    hourlyData.length = hourlyFurtureForecast;
                    for (hour of hourlyData) {
                        labels.push(moment(hour.dt * 1000).format('dd hA'));
                        data.push(hour.temp);
                    }
                    todayInfo.append($("<p>").text("Current Temp (°" + tempUnits + "): " + data[0]));
                    todayInfo.append($("<p>").text("UVI: " + today.uvi));
                    todayInfo.append($("<p>").text("Humidity: " + today.humidity + "%"));
                    todayInfo.append($("<p>").text("Wind Speed: " + today.wind_speed + " " + distanceUnits));
                    $("#today").append(todayInfo);
                    var chart = $("<div id='chart'>").append($("<label for='chartjs-0'>").append($("<div id='graphLabel'>").text("24-Hour Forecast:")));
                    chart.append($("<canvas id='chartjs-0' class='chartjs' style='display: block;float:right;height:100px'>"));
                    $("#today").append(chart);

                    var dailyData = response.daily;
                    console.log(dailyData);
                    dailyData.length = count;
                    for (day of dailyData) {
                        var card = $("<div class='futureDay card'>");
                        card.append($("<div class='card-title'>").text(moment(day.dt * 1000).format("MM/DD/YY")));
                        var card_body = $("<div class='card-body'>");
                        card_body.append($("<p>").text("UVI: " + day.uvi));
                        iconIDArray.push(day.weather[0].icon);
                        card_body.append($("<img class='icon' src='http://openweathermap.org/img/wn/" + day.weather[0].icon + iconSize + ".png'>"))
                        card_body.append($("<p>").text("Temp (°" + tempUnits + "): " + day.temp.max.toFixed(1) + " / " + day.temp.min.toFixed(1)));
                        card_body.append($("<p>").text("Humidity: " + day.humidity + "%"));
                        card.append(card_body);
                        $('.forecast').append(card);
                    }
                    new Chart(document.getElementById("chartjs-0"), { "type": "line", "data": { "labels": labels, "datasets": [{ "label": "Temperature (°" + tempUnits + ")", "data": data, "fill": false, "borderColor": "rgb(75, 192, 192)", "lineTension": 0.1 }] }, "options": {} });
                });
                return true;
            },
            error: function(xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
                return false;
            }
        });
    }

    function clearPage() {
        $(".forecast").empty();
        $("#todayHeader").empty();
        $("#today").empty();
        $("#cityName").empty();
        console.log("page Cleared"); //
    }

    function responsiveIcons() {
        console.log(iconIDArray);
        if (windowWidth > 800)
            iconSize = "@2x";
        else
            iconSize = "";
        var i = 0;
        for (img of $(".icon")) {
            img.setAttribute("src", "http://openweathermap.org/img/wn/" + iconIDArray[i++] + iconSize + ".png")
        }
    }

    $("#form").submit(function(event) {
        event.preventDefault();
        var input = $("#userInput").val();
        console.log("userInput: " + input);
        const isRendered = renderPage(input, "US", unit);
        console.log("boolean: " + isRendered);
        if (isRendered) {
            console.log("Not Rendered");
        } else {
            console.log("rendered");
        }
    });

    $(".save").on("click", function() {
        console.log(("pressed"));
    });


    //initial
    renderPage("San Diego, CA", "US", unit);





    $(window).on("resize", function() {
        if ($(this).width() !== windowWidth || $(this).height() !== windowHeight) {
            console.log("resized");
            windowWidth = $(this).width();
            windowHeight = $(this).height();
            //do things
            responsiveIcons();
        }
    });
})