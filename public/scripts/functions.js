// Prefixes for the Sparql queries
const prefixes = ["prefix poster: <http://uib.no/info310/movieOntology#> ",
"prefix owl: <http://www.w3.org/2002/07/owl#> ",
"prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ",
"prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> ",
"prefix dbpedia: <http://dbpedia.org/resource/>"].join(" ");

const queryEndpoint = "http://localhost:3030/ds/?query=";
const format = "&format=json";
// var countryNameUrl = endpoint + "?query=" + encodeURIComponent(countryNameQuery) + "&format=json";



$(function() {
    var app = {
        searchBtnClick: function() {
            $("#searchBtn").on('click', function(event) {
                $(".col-xs-12").html("");
                event.preventDefault();
                // Store value of search from input field
                var search = $("#nameSearch").val();

                // check if search is empty
                if(search.length === 0) {
                    // Search is empty, render message to user
                    $("legend").html("Search cannot be empty");
                } else {
                    // Search is not empty, proceed to check for data in the triple store
                    var nameQuery = prefixes
                                  + "SELECT DISTINCT ?name ?year ?url ?caption "
                                  + "WHERE { ?poster a poster:poster; "
                                                + " poster:title " + "\"" + search + "\"; "
                                                + " rdfs:label ?name; "
                                                + " poster:year ?year; "
                                                + " poster:caption ?caption; "
                                                + " poster:posterUrl ?url . }";
                    var nameQueryUrl = queryEndpoint + encodeURIComponent(nameQuery) + format;
                    $.get(nameQueryUrl, function(data) {
                        app.populateData(data);
                        /*optional stuff to do after success */
                    });

                }
            });
        },
        populateData: function(data) {
            console.log(data);
            var results = data.results.bindings;
            if(results.length == 0) {
                $("legend").html("No results for " + $("#nameSearch").val());
            } else if (results.length == 1) {
                const posterData = results[0];
                const title = posterData.name.value;
                const caption = posterData.caption.value;
                const posterUrl = posterData.url.value;
                var image = createImageTag(posterUrl, title);
                $(".posters").append(image);
                $(".posterData").append("<h1>" + caption + "</h1>")
            } else {
                for(var i = 0; i < results.length; i++) {
                    var posterData = results[i];
                    const title = posterData.name.value;
                    const posterUrl = posterData.url.value;
                    const caption = posterData.caption.value;
                    var image = createImageTag(posterUrl, title);
                    $(".posters").append(image);
                    $(".posterData").html("<h1>" + caption + "</h1>")
                }
            }
        }
    };

    app.searchBtnClick();

    // Helper methods
    function createImageTag(posterUrl, altText) {
        return "<img class='img-responsive' src=\"" + posterUrl + "\" alt=\"" + altText + "\">";;
    }
});
