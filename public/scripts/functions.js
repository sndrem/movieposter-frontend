// Prefixes for the Sparql queries
const prefixes = ["prefix poster: <http://uib.no/info310/posterOntology#> ",
"prefix owl: <http://www.w3.org/2002/07/owl#> ",
"prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ",
"prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> ",
"prefix dbpediaOntology: <http://dbpedia.org/ontology/>",
"prefix dbpedia: <http://dbpedia.org/resource/>"].join(" ");

const queryEndpoint = "http://localhost:8080/ds/?query=";
const format = "&format=json";
// var countryNameUrl = endpoint + "?query=" + encodeURIComponent(countryNameQuery) + "&format=json";


function Poster(title, caption, year, urls, largePosterUrl, abstract) {
    this.title = title;
    this.caption = caption;
    this.year = year;
    this.urls = urls;
    this.largePosterUrl = largePosterUrl;
    this.abstract = abstract;
}

$(function() {
    var app = {
        searchBtnClick: function() {
            $("#searchBtn").on('click', function(event) {
                event.preventDefault();
                // Store value of search from input field
                var search = $("#nameSearch").val();

                // check if search is empty
                if(search.length === 0) {
                    // Search is empty, render message to user
                    $("legend").html("Search cannot be empty");
                } else {
                    $(".multipleHitTable tbody").html("");
                    // Search is not empty, proceed to check for data in the triple store
                    var nameQuery = prefixes
                                  + "SELECT DISTINCT ?name ?year ?caption "
                                  + "WHERE { ?poster a poster:Poster; "
                                                + " poster:title ?name; "
                                                + " rdfs:label ?name; "
                                                + " poster:year ?year; "
                                                + " poster:caption ?caption . "
                                                + " FILTER(strStarts(?name, \"" + search + "\"))} "
                                                + " ORDER BY DESC(?year) ";
                    var nameQueryUrl = queryEndpoint + encodeURIComponent(nameQuery) + format;
                    $.get(nameQueryUrl, function(data) {
                        console.log(data);
                        if(data.results.bindings.length > 0) {
                            app.showMultipleHitList(data.results.bindings);
                            addClickEventsToTableRows();
                        }
                        // app.populateData(data);
                        /*optional stuff to do after success */
                    });

                }
            });
        },
        populateData: function(data) {
            var results = data.results.bindings;
            var poster = null;
            if(results.length == 0) {
                $("legend").html("No results for " + $("#nameSearch").val());
            } else if (results.length > 0) {
                const posterData = results[0];
                console.log("Poster data: ", posterData);
                const title = posterData.name.value;
                const caption = posterData.caption.value;
                const year = posterData.year.value;
                var abstract = null;
                try {
                    abstract = posterData.abstract.value;
                } catch(error) {
                    console.log(error);
                    console.log("No abstract for " + title);
                }
                poster = new Poster(title, caption, year, null, null, abstract);

                appendImages(poster.urls);
                $(".posterData").html("");
                $(".posterData").append("<h1>" + caption + "</h1><p>" + abstract + "</p>")
            }
        },

        showMultipleHitList: function(multipleHits) {
            $("legend").html("There was multiple hits for " + $("#nameSearch").val());
            $("legend").append("<p>Select your desired poster from the list</p>");
            var $results = $(".results");
            $(".multipleHitTable").removeClass('hide');
            var $tableBody = $(".multipleHitTable tbody");
            $.each(multipleHits, function(index, val) {
                 /* iterate through array or object */
                 $tableBody.append("<tr data-postername=\"" + val.name.value + "\">"
                                + "<td>" + val.name.value + "</td>"
                                + "<td>" + val.caption.value + "</td>"
                                + "<td>" + val.year.value + "</td>"
                                + "</tr>");
            });
        }
    };

    app.searchBtnClick();

    // Helper methods

    // Method to append all image urls to the site
    function appendImages(posterUrls) {
        if(posterUrls) {
            var $imageSection = $(".posters");
            for(var i = 0; i < posterUrls.length; i++) {
                var url = posterUrls[i];
                var image = createImageTag(url, null);
                $imageSection.append(image);
            }    
        }
        
    }

    // Returns an image tag
    function createImageTag(posterUrl, altText) {
        return "<img class='img-responsive' src=\"" + posterUrl + "\" alt=\"" + altText + "\">";;
    }

    // Fetches all urls for a given poster
    function getPosterUrls(posterData) {
        if(posterData) {
            var urls = [];
            for(var i = 0; i < posterData.length; i++) {
                urls.push(posterData[i].url.value);
            }
            return urls;    
        }
        
    }

    function addClickEventsToTableRows() {
        $("tbody tr").on('click', function(event) {
            event.preventDefault();
            const posterName = $(this).data('postername');
            var posterQuery = prefixes
                            + "SELECT distinct ?name ?year ?caption ?actors ?poster ?abstract ?dbpediaUrl "
                            + "WHERE { "
                            + "?poster a dbpediaOntology:Film; "
                            + "        a poster:Poster; "
                            + "        poster:title \"" + posterName + "\"; "
                            + "        poster:title ?name; "
                            + "        poster:year ?year; "
                            + "        poster:caption ?caption; "
                            + "        owl:sameAs ?dbpediaUrl . "
                            + " OPTIONAL { "
                            + "     SERVICE <http://dbpedia.org/sparql/> { "
                            + "             ?dbpediaUrl a dbpediaOntology:Film; "
                            + "             dbpediaOntology:abstract ?abstract . "
                            + " } "
                            + " filter (langMatches(lang(?abstract), \"EN\")) "
                            + "}} ";


            var posterQueryUrl = queryEndpoint + encodeURIComponent(posterQuery) + format;
            $.get(posterQueryUrl, function(data) {
                console.log(data);
                app.populateData(data);
            });
        });
    }
});
