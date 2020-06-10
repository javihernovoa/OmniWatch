/******************* Global Variables **********************/

//Ensures even more unique identification for each movie
var idCount = 0;

//Used in the creation of cookies for the popular shows/movies
var movieCount = 0;
var showCount = 0;

//Determines whether the website needs to save the popular film data.
//This value is set to true if no cookie is found with the proper data.
var savePopularFilmData = false;


/****************** Site Initialization ********************/

$(document).ready(function() {
    getPopularFilmsCookie();
});

/**
 * Searches the cookies stored on this site to see if the visitor has been here within
 * the past two weeks. If not, no cookie can be found and we store a cookie on the visitor's
 * computer and make sure we know to save the film data in multiple cookies.
 */
function getPopularFilmsCookie() {
    var filmInfo = getCookie("popular-films");
    if (filmInfo != "loaded") {
        var d = new Date();
        //14 days = 1000ms * 60 sec * 60 min * 24 hours * 14 days
        d.setTime(d.getTime() + (14*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = "popular-films=loaded;" + expires + ";path=/";
        savePopularFilmData = true;
    }

    //Make queries to the RV CaseCompetition API
    loadRVResults("movie",6,"movie-results");
    loadRVResults("show",6,"show-results");
  }

  /**
   * Attempts to grab a cookie with 'cookieName'. If no cookie can be found, an empty
   * string is returned instead. Elsewise, the value of the cookie is returned.
   * 
   * @param cookieName The name of a cookie that is stored.
   */
  function getCookie(cookieName) {
    var decodedCookie = decodeURIComponent(document.cookie);
    var firstSplit = decodedCookie.split(';');
    for(var i = 0; i < firstSplit.length; i++) {
        let cookieVal = firstSplit[i].split('=');
        if (cookieVal[0] == " " + cookieName) {
            return cookieVal[1];
        }
    }
    return "";
  }


/****************** API Information Gathering *********************/

/**
 * Makes a query to the RAPID API database to grab extra movie info such as poster image,
 * actors, runtime, and genres. Then sends the information to the cookieless container-builder.
 * 
 * @param id The imdb identifier tag
 * @param RVFilmObject The value of a successful RV CaseCompetition API search
 * @param destination The HTML id of a div container the results will be stored in
 */
function loadResultsRapid(id,RVFilmObject,destination) {
    //Rapid API Search
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://movie-database-imdb-alternative.p.rapidapi.com/?i="+ id + "&r=json",
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "movie-database-imdb-alternative.p.rapidapi.com",
		    "x-rapidapi-key": "39aface514msh08c918df052a12fp1af962jsncc7918374a7b"
        }
    }

    $.ajax(settings).done(function (response) {
        APIResult = response;
        buildContainerCookieless(RVFilmObject,APIResult,destination);
    });
}

/**
 * Fetches data from the RV CaseCompetition API based on the 'searchInquiry' provided. 
 * Results are organized by popularity and then sent to one of two different HTML
 * container builders based on whether the site is being loaded with cookies or without.
 * 
 * @param searchInquiry The RV CaseCompetition API search string
 * @param numberToGet The Number of results to fetch
 * @param destination The HTML id of a div container the results will be stored in
 */
function loadRVResults(searchInquiry,numberToGet,destination) {
    // Searching via RV API
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://casecomp.konnectrv.io/" + searchInquiry,
        "method": "GET",
        "headers": {
        }
    }

    $.ajax(settings).done(function (response) {
        APIResult = response;

        //Sort the results by popularity
        response.sort((a,b) => (a.popularity < b.popularity) ? 1 : -1);
        
        //Identify whether movies have been grabbed or shows by whether or not
        //the rating is present.
        var identifier = "movie";
        if (response[0].rating == undefined) {
            identifier = "show";
        }

        //For each result, send it to the proper HTML container-builder (cookieless or with cookies)
        for (let i = 0; i < numberToGet; i++) {
            if (savePopularFilmData) {
                loadResultsRapid(response[i].imdb,response[i],destination);
            } else {
                buildContainerCookies(response[i],"popular-"+identifier+"-"+i, destination);
            }
        }
    });
}

/**
 * Takes the JSON object provided and dynamically creates an HTML container with bootstrap containing all
 * necessary pieces for formatting (Poster image, name, etc). Then injects the HTML into the website at the 
 * location provided.
 * 
 * @param RVFilmObject A JSON object containing the results of a successful RV-CaseComp API search.
 * @param rapidFilmObject A JSON object containing the results of a successful Rapid API (IMDB API) search.
 * @param injectionLocation An HTML id tag providing where the created HTML container is supposed to go.
 */
function buildContainerCookieless(RVFilmObject, rapidFilmObject,injectionLocation) {
    let id = rapidFilmObject.imdbID + idCount;
    let childID = rapidFilmObject.imdbID + idCount + "child";
    idCount++;
    let streamingButtons = "";
    let streamButtonList = "";
    let netflixButton = "";

    //Create a button that links to each streaming platform if that show/movie can be streamed there.
    RVFilmObject.streaming_platform.forEach(platform => {
        if (platform.includes('netflix')) {
            netflixButton = "<div class='col-md-2'></div><div class='col-md-10'><form action='https://www.netflix.com/' method='get' target='_blank'><button type='submit' class='netflix-button button-submit'>Stream on Netflix</button></form></div>";
            streamingButtons = streamingButtons.concat(netflixButton);
            streamButtonList = "netflix";
        }
        if (platform.includes('hbo')) {
            HBOButton = "<div class='col-md-2'></div><div class='col-md-10'><form action='https://www.hbo.com/' method='get' target='_blank'><button type='submit' class='hbo-button button-submit'>Stream on HBO</button></form></div>";
            streamingButtons = streamingButtons.concat(HBOButton);
            streamButtonList = "hbo";
        }
        if (platform.includes('amazon_prime')) {
            primeButton = "<div class='col-md-2'></div><div class='col-md-10'><form action='https://www.primevideo.com/' method='get' target='_blank'><button type='submit' class='primevideo-button button-submit'>Stream on Prime</button></form></div>";
            streamingButtons = streamingButtons.concat(primeButton);
            streamButtonList = "prime";
        }
    });
    
    //Dynamically create an HTML container with all information about the movie alongside a poster.
    let htmlContainer = 
    "<div class='col-md-4' 'col-sm-6' 'col-xs-12'>" +
        "<div class='item-container' id=" + id + " onclick=\"showExtraInfo('"+ childID +"')\">" +
            "<div class='row'>" +
                "<div class='col-md-12'>" +
                    "<div class='production-title'>" +
                    RVFilmObject.title +
                    "</div>" +
                "</div>" +
            "</div>" +
            "<div class='row'>" +
                "<div class='col-md-1'>" +
                    "" +
                "</div>" +
                "<div class='col-md-11'>" +
                    "<div class='img'>" +
                        "<img class='movie-img' src=" + rapidFilmObject.Poster + " alt=" + RVFilmObject.title + " Poster width='150' height='223'>" +
                    "</div>" +
                "</div>" +
            "</div>" +
        "</div>" +
        "<div class='watch-buttons'>" +
            "<div id='Stream-Sites'>"+streamingButtons+"</div>" +
        "</div>" + 
    "</div>" +
    "<div class='extraInfo'>" + 
        "<div class='row' id="+childID+" style='display: none;'>" +
            "<div class='col-md-12'>" +
                "<div class='extra-info'>" +
                    "<div id='Genres'> Genres: " + rapidFilmObject.Genre + "\n</div>" +
                    "<div id='Average_Rating'> Average Rating: " + RVFilmObject.vote_average + "\n</div>" +
                    "<div id='Runtime'> Runtime: " + rapidFilmObject.Runtime + "\n</div>" +
                    "<div id='Actors'> Actors: " + rapidFilmObject.Actors + "\n</div>" +
                    "<div id='Plot'> Plot: " + RVFilmObject.overview + "\n</div>" +
                "</div>" +
            "</div>" +
        "</div>" +
    "</div>";

    if (savePopularFilmData) {
        let d = new Date();
        //14 days = 1000ms * 60 sec * 60 min * 24 hours * 14 days
        d.setTime(d.getTime() + (14*24*60*60*1000));

        //Add the cookie data for the most popular movies. Cookie data stores all used results from the Rapid API
        let expires = "expires="+ d.toUTCString();
        let cookieID = RVFilmObject.rating != undefined ? "movie" : "show";

        let summary = RVFilmObject.overview;
        if (summary.search("\n\n") != -1) {
            summary = summary.substring(0,summary.search("\n\n"));
        }

        let cookieInfo = rapidFilmObject.Poster + "|<+>|" + rapidFilmObject.Genre + "|<+>|" + rapidFilmObject.Runtime +
             "|<+>|" + rapidFilmObject.Actors + "|<+>|" + RVFilmObject.title + "|<+>|" + RVFilmObject.vote_average + 
             "|<+>|" + summary + "|<+>|" + streamButtonList;
        
        //Actually set the cookie info
        if (cookieID == "movie") {
            document.cookie = "popular-" + cookieID + "-" + movieCount + "=" + cookieInfo + ";" + expires + ";path=/";
            movieCount++;
        } else {
            document.cookie = "popular-" + cookieID + "-" + showCount + "=" + cookieInfo + ";" + expires + ";path=/";
            showCount++;
        }
    }

    //Insert the HTML container into the specified area.
    $("#"+injectionLocation).append(htmlContainer);
}

/**
 * Uses the information provided by the stored cookies on the site to dynamically create an HTML container 
 * with bootstrap containing all necessary pieces for formatting (Poster image, name, etc). 
 * Then injects the HTML into the website at the 
 * location provided.
 * 
 * @param RVFilmObject A JSON object containing the results of a successful RV-CaseComp API search.
 * @param rapidFilmObject A JSON object containing the results of a successful Rapid API (IMDB API) search.
 * @param injectionLocation An HTML id tag providing where the created HTML container is supposed to go.
 */
function buildContainerCookies(RVFilmObject, cookieName, injectionLocation) {
    let id = RVFilmObject.imdb + idCount;
    let filmObject = getCookie(cookieName).split("|<+>|");
    let childID = RVFilmObject.imdb + idCount + "child";
    idCount++;
    let streamingButtons = "";
    let netflixButton = "";

    //Create a button that links to each streaming platform if that show/movie can be streamed there.
    if (filmObject[7] == "netflix") {
        netflixButton = "<div class='col-md-2'></div><div class='col-md-10'><form action='https://www.netflix.com/' method='get' target='_blank'><button type='submit' class='netflix-button button-submit'>Stream on Netflix</button></form></div>";
        streamingButtons = streamingButtons.concat(netflixButton);
    }
    else if (filmObject[7] == "hbo") {
        HBOButton = "<div class='col-md-2'></div><div class='col-md-10'><form action='https://www.hbo.com/' method='get' target='_blank'><button type='submit' class='hbo-button button-submit'>Stream on HBO</button></form></div>";
        streamingButtons = streamingButtons.concat(HBOButton);
    }
    else if (filmObject[7] == "prime") {
        primeButton = "<div class='col-md-2'></div><div class='col-md-10'><form action='https://www.primevideo.com/' method='get' target='_blank'><button type='submit' class='primevideo-button button-submit'>Stream on Prime</button></form></div>";
        streamingButtons = streamingButtons.concat(primeButton);
    }
    
    //Dynamically create an HTML container with all information about the movie alongside a poster.
    let htmlContainer = 
    "<div class='col-md-4' 'col-sm-6' 'col-xs-12'>" +
        "<div class='item-container' id=" + id + " onclick=\"showExtraInfo('"+ childID +"')\">" +
            "<div class='row'>" +
                "<div class='col-md-12'>" +
                    "<div class='production-title'>" +
                    filmObject[4] +
                    "</div>" +
                "</div>" +
            "</div>" +
            "<div class='row'>" +
                "<div class='col-md-1'>" +
                    "" +
                "</div>" +
                "<div class='col-md-11'>" +
                    "<div class='img'>" +
                        "<img class='movie-img' src=" + filmObject[0] + " alt=" + filmObject[4] + " Poster width='150' height='223'>" +
                    "</div>" +
                "</div>" +
            "</div>" +
        "</div>" +
        "<div class='watch-buttons'>" +
            "<div id='Stream-Sites'>"+streamingButtons+"</div>" +
        "</div>" + 
    "</div>" +
    "<div class='extraInfo'>" + 
        "<div class='row' id="+childID+" style='display: none;'>" +
            "<div class='col-md-12'>" +
                "<div class='extra-info'>" +
                    "<div id='Genres'> Genres: " + filmObject[1] + "\n</div>" +
                    "<div id='Average_Rating'> Average Rating: " + filmObject[5] + "\n</div>" +
                    "<div id='Runtime'> Runtime: " + filmObject[2] + "\n</div>" +
                    "<div id='Actors'> Actors: " + filmObject[3] + "\n</div>" +
                    "<div id='Plot'> Plot: " + filmObject[6] + "\n</div>" +
                "</div>" +
            "</div>" +
        "</div>" +
    "</div>";

    //Insert the HTML container into the specified area.
    $("#"+injectionLocation).append(htmlContainer);
}

/**
 * When the object invoking this function is clicked, display extra information about the movie/show
 * 
 * @param childID An ID identifying the child of the clicked node
 */
function showExtraInfo(childID) {
    let extraInfo = document.getElementById(childID);
    extraInfo.style.display === "none" ? extraInfo.style.display = "block" : extraInfo.style.display = "none";
}