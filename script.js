var idCount = 0;

$(document).ready(function() {
 loadRVResults("movie",6,"movie-results");
 loadRVResults("show",6,"show-results");
});

function loadResultsRapid(id,RVFilmObject,destination) {
    //Rapid API Search
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://movie-database-imdb-alternative.p.rapidapi.com/?i="+ id + "&r=json",
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "movie-database-imdb-alternative.p.rapidapi.com",
		    "x-rapidapi-key": "00f5143491msh0bfce74005d8410p1b1993jsn6bce55e178d6"
        }
    }

    $.ajax(settings).done(function (response) {
        APIResult = response;
        console.log(response);
        buildContainer(RVFilmObject,APIResult,destination);
    });
}

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
        response.sort((a,b) => (a.popularity < b.popularity) ? 1 : -1);
        
        for (let i = 0; i < numberToGet; i++) {
            loadResultsRapid(response[i].imdb,response[i],destination);
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
function buildContainer(RVFilmObject, rapidFilmObject,injectionLocation) {
    let id = rapidFilmObject.imdbID + idCount;
    let childID = rapidFilmObject.imdbID + idCount + "child";
    idCount++;
    let streamingButtons = "";
    let netflixButton = "";

    // THERE IS A BETTER WAY OF THIS, hard coding the streaming platforms is not ideal!
    RVFilmObject.streaming_platform.forEach(platform => {
        if (platform.includes('netflix')) {
            netflixButton = "<div class='col-md-2'></div><div class='col-md-10'><form action='https://www.netflix.com/' method='get' target='_blank'><button type='submit' class='netflix-button'>Stream on Netflix</button></form></div>";
            streamingButtons = streamingButtons.concat(netflixButton);
        }
        if (platform.includes('hbo')) {
            HBOButton = "<div class='col-md-2'></div><div class='col-md-10'><form action='https://www.hbo.com/' method='get' target='_blank'><button type='submit' class='hbo-button'>Stream on HBO</button></form></div>";
            streamingButtons = streamingButtons.concat(HBOButton);
        }
        if (platform.includes('amazon_prime')) {
            primeButton = "<div class='col-md-2'></div><div class='col-md-10'><form action='https://www.primevideo.com/' method='get' target='_blank'><button type='submit' class='primevideo-button'>Stream on Prime</button></form></div>";
            streamingButtons = streamingButtons.concat(primeButton);
        }
    });
    console.log(streamingButtons);
    
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
            //Insert Streaming Platform Info and buttons
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