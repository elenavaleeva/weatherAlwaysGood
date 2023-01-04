//Declare a variable to store the searched city
let city="";
// variable declaration
let searchCity = $("#search-city");
let searchButton = $("#search-button");
let clearButton = $("#clear-history");
let currentCity = $("#current-city");
let currentTemperature = $("#temperature");
let currentHumidty= $("#humidity");
let currentWSpeed=$("#wind-speed");
let currentUvindex= $("#uv-index");
let sCity=[];
// searches the city to see if it exists in the entries from the storage
function find(c){
    for (var i=0; i<sCity.length; i++){
        if(c.toUpperCase()===sCity[i]){
            return -1;
        }
    }
    return 1;
}
//Set up the API key
let APIKey="d1d1c7bcb9ef6d0effd63fca0dd08d01";
// Display the curent and future weather to the user after grabing the city form the input text box.
function displayWeather(event){
    event.preventDefault();
    if(searchCity.val().trim()!==""){
        city=searchCity.val().trim();
        currentWeather(city);
    }
}
// Here we create the AJAX call
function currentWeather(city){
    // Here we build the URL so we can get a data from server side.
    const queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response){

        // parse the response to display the current weather including the City name. the Date and the weather icon. 
        console.log(response);
        //Dta object from server side Api for icon property.
        const weathericon= response.weather[0].icon;
        const iconurl="https://openweathermap.org/img/wn/"+weathericon +"@2x.png";
        // The date format method is taken from the  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
        const date=new Date(response.dt*1000).toLocaleDateString();
        //parse the response for name of city and concanatig the date and icon.
        $(currentCity).html(response.name +"("+date+")" + "<img src="+iconurl+">");
        // parse the response to display the current temperature.
        // Convert the temp to fahrenheit

        const tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(currentTemperature).html((tempF).toFixed(2)+"&#8457");
        // Display the Humidity
        $(currentHumidty).html(response.main.humidity+"%");
        //Display Wind speed and convert to MPH
        const ws=response.wind.speed;
        const windsmph=(ws*2.237).toFixed(1);
        $(currentWSpeed).html(windsmph+"MPH");
        // Display UVIndex.
        //By Geographic coordinates method and using appid and coordinates as a parameter we are going build our uv query url inside the function below.
        UVIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if(response.cod==200){
            sCity=JSON.parse(localStorage.getItem("cityname"));
            console.log(sCity);
            if (sCity==null){
                sCity=[];
                sCity.push(city.toUpperCase()
                );
                localStorage.setItem("cityname",JSON.stringify(sCity));
                addToList(city);
            }
            else {
                if(find(city)>0){
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("cityname",JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }

    });
}
    // This function returns the UVIindex response.
function UVIndex(ln,lt){
    //lets build the url for uvindex.
    const uvqURL="https://api.openweathermap.org/data/2.5/uvi?appid="+ APIKey+"&lat="+lt+"&lon="+ln;
    $.ajax({
            url:uvqURL,
            method:"GET"
            }).then(function(response){
                $(currentUvindex).html(response.value);
            });
}

// Here we display the 5 days forecast for the current city.
function forecast(cityid){
    const dayover= false;
    const queryforcastURL="https://api.openweathermap.org/data/2.5/forecast?id="+cityid+"&appid="+APIKey;
    $.ajax({
        url:queryforcastURL,
        method:"GET"
    }).then(function(response){

        for (i=0;i<5;i++){
            const date= new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            const iconcode= response.list[((i+1)*8)-1].weather[0].icon;
            const iconurl="https://openweathermap.org/img/wn/"+iconcode+".png";
            const tempK= response.list[((i+1)*8)-1].main.temp;
            const tempF=(((tempK-273.5)*1.80)+32).toFixed(2);
            const humidity= response.list[((i+1)*8)-1].main.humidity;

            $("#fDate"+i).html(date);
            $("#fImg"+i).html("<img src="+iconurl+">");
            $("#fTemp"+i).html(tempF+"&#8457");
            $("#fHumidity"+i).html(humidity+"%");
        }

    });
}

//Daynamically add the passed city on the search history
function addToList(c){
    const listEl= $("<li>"+c.toUpperCase()+"</li>");
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value",c.toUpperCase());
    $(".list-group").append(listEl);
}
// display the past search again when the list group item is clicked in search history
function invokePastSearch(event){
    const liEl=event.target;
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        currentWeather(city);
    }

}

// render function
function loadlastCity(){
    $("ul").empty();
    const sCity = JSON.parse(localStorage.getItem("cityname"));
    if(sCity!==null){
        sCity=JSON.parse(localStorage.getItem("cityname"));
        for(i=0; i<sCity.length;i++){
            addToList(sCity[i]);
        }
        city=sCity[i-1];
        currentWeather(city);
    }

}
//Clear the search history from the page
function clearHistory(event){
    event.preventDefault();
    sCity=[];
    localStorage.removeItem("cityname");
    document.location.reload();

}
//Click Handlers
$("#search-button").on("click",displayWeather);
$(document).on("click",invokePastSearch);
$(window).on("load",loadlastCity);
$("#clear-history").on("click",clearHistory);













































// // function GetInfo(){
// //     const newName = document.getElementById("cityInput");
// //     const CityName = document.getElementById("cityName");
// //     CityName.innerHTML = "--"+newName.value+"--"
// // }

// let appId = 'a71e1dbc556af89167017b8f90cda21e';
// let units = 'imperial';
// let searchMethod ;

// function getSearchMethod(searchTerm) {
//     if(searchTerm.length === 5 && Number.parseInt(searchTerm) + "" === searchTerm)
//     searchMethod = 'zip';
//     else 
//     searchMethod = 'q';
// }

// function searchWeather(searchTerm) {
//     getSearchMethod(searchTerm);
//     fetch(`https://api.openweathermap.org/data/2.5/weather?q${searchMethod}=${searchTerms}&APPID=${appId}&units=${units}`)
//  .then(result => {
//     return result.json()
//   }) .then(result => {
//     init(result);
//   })
// }

// // function init(resultFromServer) {
// //   switch(resultFromServer.weather[0].main) {
// //     case 'Clear':
// //          document.body.style.background ='url("clear.jpg")';
// //     break;
// //     case 'Clouds':
// //          document.body.style.background ='url("cloud.jpg")';
// //     break;
// //     case 'Rain':
// //         case ' Drizzle':
// //             case 'Mist':
// //           document.body.style.background ='url("rain.jpg")';
// //     break;

// //     case 'Thunderstorm':
// //         document.body.style.background ='url("storm.jpg")';
// //         break;

// //         case 'Snow':
// //           document.body.style.background ='url("snow.jpg")';
// //         break;

// //         default:
// //             break;

// //   }


// let weatherDescriptionHeader = document.getElementById('weatherDescriptionHeader');
// let temperatureElement = document.getElementById('temp');
// let humidityElement = document.getElementById('humidity');
// let windSpeedElement = document.getElementById('day1WindSpeed');
// let cityHeader = document.getAnimations('cityName');
// let weatherIcon = document.getAnimations('img1');

// weatherIcon.src=' http://openweathermap.org/img/wn/' + resultFromServer.weather[0].icon + '.png';

// let resultDescription = resultFromServer.weather[0].description;
// weatherDescriptionHeader.innerText = resultDescription.charAt(0).toUpperCase() + resultDescription.slice(1);

// temperatureElement.innerHTML = Math.floor(resultFromServer.main.temp) + '°';
// windSpeedElement.innerHTML = 'Winds at' + Math.floor(resultFromServer.wind.speed) + 'm/s';
// cityHeader.innerHTML = resultFromServer.name;
// humidityElement.innerHTML = 'humidity levels at' + resultFromServer.main.humidity + ' %';




// document.getElementById("searchBtn").addEventListener('click',() => {
//  let searchTerm = document.getElementById("searchInput").value;
//  if(searchTerm)
//   searchWeather(searchTerm);
// })
















// fetch("https://api.openweathermap.org/data/2.5/forecast?lat=44.34&lon=10.99&appid=a71e1dbc556af89167017b8f90cda21e")
// .then(response => response.json())
// .then(data => {
//     for(i=0; i<5; i++){
//     document.getElementById("day" + (i+1)+ "Temp").innerHTML = "Temp:" + Number(data.list[i].main.temp -278.52).toFixed(1) + "°";
//     }

//     // for(i=0; i<5; i++){
//     // document.getElementById("day" + (i+1)+ "Max").innerHTML = "Max:" + Number(data.list[i].main.temp_max -288.53).toFixed(1) + "°";
//     // }

//     for(i=0; i<5; i++){
//         document.getElementById("day" + (i+1)+ "Wind").innerHTML = "Wind:" + Number(data.list[i].main.Wind -2.24).toFixed(1) + "M/R";
//     }

//     for(i=0; i<5; i++){
//         document.getElementById("day" + (i+1)+ "Max").innerHTML = "Man:" + Number(data.list[i].main.temp_max -288.53).toFixed(1) + "°";
//     }
// })

// function DefaultScreen() {
//     document.getElementById("cityInput").defaultValue = "London";
//     GetInfo()
// }

// const d = new Date();
// const weekday = ["Sunday", "Monday", " Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// const todayDate = dayjs().format('MM DD, YYYY');

// function CheckDay(day) {
//    if(day +d.getDay() > 6 ){
//     return day +d.getDay()-7;

//    }else {
//    return day +d.getDay();
//   }
// }

// for (i = 0; i < 5; i++){
//     document.getElementById("day" + (i+1)).innerHTML = weekday[CheckDay(i)] ;
// }

