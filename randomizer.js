var idCount = 0;
var dest = "search-results";

function buildStringAndSearch() {
    let type = $("#film-type").val();
    if (type != "movie" && type != "show") {
        alert("Please select a film type.");
    } else {
        let platformString = $("#streaming-platform").val() == "''" ? "" : "?platform=" + $("#streaming-platform").val();
        let resultString = type + platformString;
        console.log(resultString);
        document.getElementById("search-results").innerHTML = "";
        loadRVResults(resultString,$("#amount").val(),dest);
    }
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