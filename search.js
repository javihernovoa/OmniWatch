/******************* Global Variables **********************/

//Ensures even more unique identification for each movie
var idCount = 0;

/******************* API Information Gathering **********************/

/**
 * Creates a search string for the RV Case Competition API and then loads a search with that search string.
 */
function buildStringAndSearch() {
    let type = $("#film-type").val();
    if (type != "movie" && type != "show") {
        alert("Please select a film type.");
    } else {
        let platformString = $("#streaming-platform").val() == "''" ? "" : "?platform=" + $("#streaming-platform").val();
        let resultString = type + platformString;
        document.getElementById("search-results").innerHTML = "";
        loadRVResults(resultString,$("#amount").val(),"search-results");
    }
}

/**
 * Performs a Rapid API search using the imdb identifier, then sends all the information to buildContainer()
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

        //Send all info to buildContainer to display the movie
        buildContainer(RVFilmObject,APIResult,destination);
    });
}

/**
 * Runs an API Request through the RV CaseCompetition API. The data is then sorted by popularity and
 * then the imdb identifier is used for each movie/show found (up to the requested numberToGet) to run
 * another API query, this time to the RAPID API (for more IMDB info).
 */
function loadRVResults(searchInquiry,numberToGet,destination) {
    if (numberToGet != 0) {
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

            //Delete any movies from the results that are before the specified date
            let numFound = 0;
            if ($("#date").val() != "''") {
                for (let i = 0; i < response.length; i++) {
                    if (parseInt(response[i].release_date.substring(0,4)) < $("#date").val()) {
                        delete response[i];
                    } else {
                        numFound++;
                    }

                    //Only search through for movies with the proper date while we have less than
                    //numberToGet total movies.
                    if (numFound >= numberToGet) {
                        break;
                    }
                }
            }
            
            //Take each result from the search and perform a RAPID API request with the data
            let extra = 0;
            if (response.length <= 0) {
                alert("No results found");
            } else {
                for (let i = 0; i < numberToGet; i++) {
                    while (response[i+extra] == undefined || response[i+extra] == null) {
                        extra++;
                        if (i+extra > response.length) {
                            break;
                        }
                    }

                    if (response[i+extra] != undefined && response[i+extra] != null) {
                        loadResultsRapid(response[i+extra].imdb,response[i+extra],destination);
                    }
                }
            }
        });
    }
}

/******************* Dynamic HTML Content Creation **********************/

/**
 * Takes the JSON object provided and dynamically creates an HTML container with bootstrap containing all
 * necessary pieces for formatting (Poster image, name, etc). Then injects the HTML into the website at the 
 * location provided.
 * 
 * @param RVFilmObject A JSON object containing the results of a successful RV-CaseComp API search.
 * @param rapidFilmObject A JSON object containing the results of a successful Rapid API (IMDB API) search.
 * @param injectionLocation An HTML id tag providing where the created HTML container is supposed to go.
 */
function buildContainer(RVFilmObject, rapidFilmObject,injectionLocation) {
    let id = rapidFilmObject.imdbID + idCount;
    let childID = rapidFilmObject.imdbID + idCount + "child";
    idCount++;
    let streamingButtons = "";
    let netflixButton = "";

    //Create a button that links to each streaming platform if that show/movie can be streamed there.
    RVFilmObject.streaming_platform.forEach(platform => {
        if (platform.includes('netflix')) {
            netflixButton = "<div class='col-md-2'></div><div class='col-md-10'><form action='https://www.netflix.com/' method='get' target='_blank'><button type='submit' class='netflix-button button-submit'>Stream on Netflix</button></form></div>";
            streamingButtons = streamingButtons.concat(netflixButton);
        }
        if (platform.includes('hbo')) {
            HBOButton = "<div class='col-md-2'></div><div class='col-md-10'><form action='https://www.hbo.com/' method='get' target='_blank'><button type='submit' class='hbo-button button-submit'>Stream on HBO</button></form></div>";
            streamingButtons = streamingButtons.concat(HBOButton);
        }
        if (platform.includes('amazon_prime')) {
            primeButton = "<div class='col-md-2'></div><div class='col-md-10'><form action='https://www.primevideo.com/' method='get' target='_blank'><button type='submit' class='primevideo-button button-submit'>Stream on Prime</button></form></div>";
            streamingButtons = streamingButtons.concat(primeButton);
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
                        "<img src=" + rapidFilmObject.Poster + " alt=" + RVFilmObject.title + " Poster width='150' height='223'>" +
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