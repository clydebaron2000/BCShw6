$(function() {
    var savedCities, iconSize, iconIDArray;
    const APIKey = "bc401651d6a9a9e281fca78c05aa65bd";
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();
    //modded
    var unit = "imperial";
    //geolocation
    // var currentLat, currentLong;
    // navigator.geolocation.getCurrentPosition(function(p) {
    //     currentLat = p.coords.latitude;
    //     currentLong = p.coords.longitude;
    //     console.log(currentLat);
    //     console.log(currentLong);
    //     console.log(p.coords.accuracy);
    //     $.ajax({
    //         url: "https://api.openweathermap.org/data/2.5/weather?lat=" + currentLat + "&lon=" + currentLong + "&appid=" + APIKey,
    //         method: "GET",
    //         success: function(response) {
    //             console.log(response);
    //         }
    //     });
    // });
    function renderPage(cityState, country = "US", units = "metric", count = 7, hourlyFurtureForecast = 24) {
        responsiveIcons();
        var tempUnits, distanceUnits;
        tempUnits = ((units === "imperial") ? "F" : "C");
        distanceUnits = ((units === "imperial") ? "MPH" : "KMH");
        console.log("requesting");
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/weather?q=" + cityState + "," + country + "&units=" + units + "&appid=" + APIKey,
            method: "GET",
            success: function(response) {
                console.log("recieved");
                if (response.sys.country !== country) {
                    $("#userInput").attr("style", "background:pink");
                    $(".input-group-text").attr("style", "background:pink");
                    $("#userInput").tooltip("enable");
                    $("#userInput").tooltip("show");
                }
                $.ajax({
                    url: "https://api.openweathermap.org/data/2.5/onecall?lat=" + response.coord.lat + "&lon=" + response.coord.lon + "&units=" + units + "&appid=" + APIKey,
                    method: "GET"
                }).then(function(response) {
                    clearPage();
                    $("#todayDiv").append(
                        $("<div class='card' id='today-card'>").append(
                            $("<div class='card-title' id='todayHeader'>"))
                        .append($("<div class='card-body' id='today'>"))
                    )
                    $("#userInput").tooltip("disable");
                    $("#userInput").attr("style", "background:white");
                    $(".input-group-text").attr("style", "background:white");
                    iconIDArray = [];
                    var today = response.daily.shift(); //remove first element
                    $('#todayHeader').text(moment(today.dt * 1000).format('dddd, MMMM Do, YYYY'));
                    $("#cityName").text(cityState).append($("<button class='btn save' value='" + cityState + "' style='float:right'>").append($("<h1>").append($("<i class='fa" + ((savedCities.includes(cityState)) ? "s" : "r") + " fa-star'>"))));
                    iconIDArray.push(today.weather[0].icon);
                    $(".save").on("click", function() { //save button functionality
                        var icon = $(this)[0].childNodes[0].childNodes[0];
                        if (icon.className === "far fa-star") { //save
                            icon.setAttribute("class", "fas fa-star");
                            //add to savedCities
                            savedCities.unshift($(this).val());
                            localStorage.setItem("savedCities", JSON.stringify(savedCities));
                            renderSavedCities();
                        } else { //unsave
                            icon.setAttribute("class", "far fa-star");
                            savedCities.splice(savedCities.indexOf($(this).val()), 1, );
                            localStorage.setItem("savedCities", JSON.stringify(savedCities));
                            renderSavedCities();
                        }
                    });
                    $("#todayHeader").append($("<img class='icon' data-toggle='tooltip' title='" + today.weather[0].description + "' src='http://openweathermap.org/img/wn/" + today.weather[0].icon + iconSize + ".png'>"))
                    var todayInfo = $("<div id='todayInfo'>");
                    todayInfo.append($("<p>").text("Temperature (°" + tempUnits + "): " + today.temp.max + "/" + today.temp.min));
                    var xAxisLables = [];
                    var tooltipLabels = [];
                    var data = [];
                    var hourlyData = response.hourly;
                    var houlyIcons = [];
                    var houlyIconDescription = [];
                    var hourlyWindSpeed = [];
                    hourlyData.length = hourlyFurtureForecast;
                    for (hour of hourlyData) {
                        //icons and icon descriptions for chart
                        var icon = new Image();
                        icon.src = "http://openweathermap.org/img/wn/" + hour.weather[0].icon + ".png";
                        icon.style = "width:10px; height:10px;";
                        houlyIcons.push(icon);
                        houlyIconDescription.push(hour.weather[0].description);
                        //wind
                        hourlyWindSpeed.push(hour.wind_speed);
                        //x axis labels
                        xAxisLables.push(moment(hour.dt * 1000).format('dd hA'));
                        //tooltip labels
                        tooltipLabels.push(moment(hour.dt * 1000).format('dddd, hA'));
                        //temp
                        data.push(hour.temp);
                    }
                    todayInfo.append($("<p>").text("Current Temp (°" + tempUnits + "): " + data[0]));
                    todayInfo.append($("<p>").text("UVI: ").append($("<span class='uvi' style='color:" + uviColor(today.uvi) + "'>").text(today.uvi)));
                    todayInfo.append($("<p>").text("Humidity: " + today.humidity + "%"));
                    todayInfo.append($("<p>").text("Wind Speed: " + today.wind_speed + " " + distanceUnits));
                    $("#today").append(todayInfo);
                    var chart = $("<div id='chart'>").append($("<label for='chartjs-0'>"));
                    chart.append($("<canvas id='chartjs-0' class='chartjs' style='display: block;float:right'>"));
                    $("#today").append(chart);

                    var dailyData = response.daily;
                    dailyData.length = count;
                    for (day of dailyData) {
                        var card = $("<div class='futureDay card'>");
                        card.append($("<div class='card-title'>").text(moment(day.dt * 1000).format("dd, MMMM Do")));
                        var card_body = $("<div class='card-body'>");
                        card_body.append($("<p>").text("UVI: ").append($("<span class='uvi' style='color:" + uviColor(day.uvi) + "'>").text(day.uvi)));
                        iconIDArray.push(day.weather[0].icon);
                        card_body.append($("<img class='icon' data-toggle='tooltip' title='" + day.weather[0].description + "' src='http://openweathermap.org/img/wn/" + day.weather[0].icon + iconSize + ".png'>"))
                        card_body.append($("<p>").text("Temp (°" + tempUnits + "): " + day.temp.max.toFixed(1) + " / " + day.temp.min.toFixed(1)));
                        card_body.append($("<p>").text("Humidity: " + day.humidity + "%"));
                        card.append(card_body);
                        $('.forecast').append(card);
                    }
                    new Chart(document.getElementById("chartjs-0"), {
                        "type": "line",
                        "data": {
                            "labels": xAxisLables,
                            "datasets": [{
                                    "label": "°" + tempUnits,
                                    "pointStyle": houlyIcons,
                                    pointHoverRadius: 20,
                                    pointHitRadius: 20,
                                    "data": data,
                                    "fill": false,
                                    "borderColor": "rgba(0, 0, 0,0)",
                                    "lineTension": 0.0
                                },
                                {
                                    "label": "Condition",
                                    "hidden": true,
                                    "data": tooltipLabels,
                                }
                            ]
                        },
                        "options": {
                            responsive: true,
                            title: {
                                display: true,
                                text: '24-Hour Forecast',
                                fontSize: 14,
                                fontStyle: 'bold',
                            },
                            legend: {
                                display: false
                            },
                            scales: {
                                yAxes: [{
                                    scaleLabel: {
                                        display: true,
                                        labelString: "Temperature (°" + tempUnits + ")"
                                    },
                                }]
                            },
                            tooltips: {
                                callbacks: {
                                    title: function(tooltipItem, data) {
                                        return tooltipLabels[tooltipItem[0]['index']];
                                    },
                                    label: function(tooltipItem, data) {
                                        return data['datasets'][0]['data'][tooltipItem['index']] + "°" + tempUnits;
                                    },
                                    afterLabel: function(tooltipItem, data) {
                                        var out = "";
                                        out += houlyIconDescription[tooltipItem['index']] + "\n";
                                        out += "Wind Speed: " + hourlyWindSpeed[tooltipItem['index']] + distanceUnits;
                                        return out;
                                    }
                                }
                            }
                        }
                    });
                    $('[data-toggle="tooltip"]').tooltip();
                });
                return true;
            },
            error: function(xhr, ajaxOptions, thrownError) {
                $("#userInput").attr("style", "background:pink");
                $(".input-group-text").attr("style", "background:pink");
                $("#userInput").tooltip("enable");
                $("#userInput").tooltip("show");
            }
        });
    }

    function uviColor(uvi) {
        if (uvi < 0) return "";
        if (uvi < 3) return "green";
        if (uvi < 6) return "yellow";
        if (uvi < 8) return "orange";
        if (uvi < 11) return "red";
        return "purple";
    }

    function clearPage() {
        $(".forecast").empty();
        $("#todayDiv").empty();
        $("#cityName").empty();
    }

    function responsiveIcons() {
        // set icon size
        if (windowWidth > 800)
            iconSize = "@2x";
        else
            iconSize = "";
        var i = 0;
        // if .icon class can be found
        for (img of $(".icon")) {
            //set all src to new size
            img.setAttribute("src", "http://openweathermap.org/img/wn/" + iconIDArray[i++] + iconSize + ".png")
        }
    }

    function renderSavedCities() {
        $("#savedCities").empty();
        var i = 0;
        for (city of savedCities) {
            $("#savedCities").append($("<li>").append(
                $("<button class='btn btn-light cityName'>").text(city).append(
                    (((++i) === 1) ? $("<i class='fas fa-home' style='margin-left:3px'>") : ""))));
        }
        //add functionality for all buttons
        $(".cityName").on("click", function() {
            renderPage($(this).text(), "US", unit);
        })
    }

    $("#unitButton").on('click', function() {
        var buttonVal = $('#units').text();
        if (buttonVal === "imperial")
            unit = "metric";
        else
            unit = "imperial";
        $("#units").text(unit);
        renderPage($("#cityName").text(), "US", unit);
    });

    $("#form").submit(function(event) {
        event.preventDefault();
        var input = $("#userInput").val();
        renderPage(input, "US", unit);
    });



    $(window).on("resize", function() {
        if ($(this).width() !== windowWidth || $(this).height() !== windowHeight) {
            windowWidth = $(this).width();
            windowHeight = $(this).height();
            //do things
            responsiveIcons();
        }
    });

    function init() {
        savedCities = JSON.parse(localStorage.getItem("savedCities"));
        if (savedCities === null || typeof(savedCities) !== "object") {
            savedCities = [];
            savedCities.push("San Diego, CA");
            localStorage.setItem("savedCities", JSON.stringify(savedCities));
        }
        $("#units").text(unit);
        renderSavedCities();
        renderPage(savedCities[0], "US", unit);
    }
    init();
})