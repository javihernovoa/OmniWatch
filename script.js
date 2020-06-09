var idCount = 0;

function loadResultsRapid(id) {
    //Rapid API Search
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://movie-database-imdb-alternative.p.rapidapi.com/?i="+ id + "&r=json",
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "movie-database-imdb-alternative.p.rapidapi.com",
            "x-rapidapi-key": "e321e37e62msh449e67b19fa66b3p10fd04jsnf0a8cdeb8432"
        }
    }

    //
    $.ajax(settings).done(function (response) {
        APIResult = response;
        console.log(response);
        buildContainer(APIResult,"search-results");
    });
}

function loadRVResults(searchInquiry) {
    //Rapid API Search
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
        response.sort((a,b) => (a.popularity < b.popularity) ? 1 : -1)
        console.log(response);
    });
}

$(document).ready(function() {
    //loadResultsRapid("tt4154796");
    // let movieList = loadRVResults("movie");
    // $.when($.ajax(loadMovies())).then(function() {
    //     console.log(test)
    //     // movieList.sort((a,b) => (a.popularity > b.popularity) ? 1 : -1)
    // })
    // loadRVResults("movie").then((test) => {
    //     test
    //     console.log(test)
    // });
    let movieList = await loadRVResults("movie");
    let showList = await loadRVResults("show");
    
});

// function sortByPopularity(callback) {
//     $.get()
// }

/**
 * Takes the JSON object provided and dynamically creates an HTML container with bootstrap containing all
 * necessary pieces for formatting (Poster image, name, etc). Then injects the HTML into the website at the 
 * location provided.
 * 
 * @param movieObject A JSON object containing the results of a successful Rapid API (IMDB API) search.
 * @param injectionLocation An HTML id tag providing where the created HTML container is supposed to go.
 */
function buildContainer(filmObject,injectionLocation) {
    let id = filmObject.imdbID + idCount;
    let childID = filmObject.imdbID + idCount + "child";
    idCount++;
    let htmlContainer =
    "<div class='item-container' id=" + id + " onclick='displayExtraInfoOnClick("+filmObject+","+id+")" +
        "onmouseout='hideExtraInfo('" +filmObject+","+id+")>" + 
        "<div class='row'>" +
            "<div class='col-md-12'>" +
                "<div class='production-title'>" +
                    filmObject.Title +
                "</div>" +
            "</div>" +
        "</div>" +
        "<div class='row'>" +
            //Empty space to offset the poster
            "<div class='col-md-3'>" +
                "" +
            "</div>" +
            "<div class='col-md-9'>" +
                "<div class='img'>" +
                    "<img src=" + filmObject.Poster + " alt=" + filmObject.Title + " Poster width='150' height='223'>" +
                "</div>" +
            "</div>" +
        "</div>" +
        "<div class='row' onclick='showOrHide(" + childID + ")' id="+childID+" style='display: none;'>" +
            "<div class='col-md-3'>" +
                "<div class='extra-info'>" +
                    "Genres: " + filmObject.Genre + "\n" +
                    "Runtime: " + filmObject.Runtime + "\n" +
                    "Actors: " + filmObject.Actors + "\n" +
                    "Plot: " + filmObject.Plot + "\n" +
                "</div>" +
                "<div class='watch-buttons'>" +
                    
                //Insert Streaming Platform Info and buttons
                
                "</div>" + 
            "</div>";
        "</div>" +
    "</div>";

    $("#"+injectionLocation).append(htmlContainer);

    let extraInfoBox = document.getElementById(id+"child");
    document.getElementById(id).addEventListener("click",showOrHide());
}

function showOrHide(childID) {
    document.getElementById(childID).
    this.style.display === "none" ? this.style.display = "block" : this.style.display = "none";
}