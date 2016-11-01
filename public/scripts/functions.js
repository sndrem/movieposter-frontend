// Prefixes for the Sparql queries
const prefixes = ["prefix poster: <http://uib.no/info310/posterOntology#> ",
"prefix owl: <http://www.w3.org/2002/07/owl#> ",
"prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ",
"prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> ",
"prefix dbpediaOntology: <http://dbpedia.org/ontology/>",
"prefix dbpediaProp: <http://dbpedia.org/property/>",
"prefix prov: <http://www.w3.org/ns/prov#>",
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
                                                + " FILTER(contains(?name, \"" + search + "\"))} "
                                                + " ORDER BY DESC(?year) ";
                    var nameQueryUrl = queryEndpoint + encodeURIComponent(nameQuery) + format;
                    $.get(nameQueryUrl, function(data) {
                        if(data.results.bindings.length == 1) {
                            const posterName = data.results.bindings[0].name.value;
                            getDbpediaPosterData(posterName);
                        } else if(data.results.bindings.length > 1) {
                            app.showMultipleHitList(data.results.bindings);
                            addClickEventsToTableRows();
                        }
                        /*optional stuff to do after success */
                    });

                }
            });
        },
        populateData: function(data) {
            var results = data.results.bindings;
            var poster = null;
            $(".posterStats").html("");
            if(results.length == 0) {
                $("legend").html("No results for " + $("#nameSearch").val());
            } else if (results.length > 0) {
                const posterData = results[0];
                const title = posterData.name.value;
                const caption = posterData.caption.value;
                const year = posterData.year.value;
                var abstract, director, actors, budget = null;
                try {
                    abstract = posterData.abstract.value;
                    director = posterData.directorName.value;
                    actors = getActors(results);
                } catch(error) {
                    abstract = "No abstract available";
                }
                poster = new Poster(title, caption, year, null, null, abstract);

                $(".posterData").html("");
                $(".posterData").append("<h1>" + caption + "</h1><p>" + abstract  + "</p>");
                $(".posterStats").append("<h3>Actors</h3><ul></ul>");
                $.each(actors, function(index, element) {
                    $(".posterStats ul").append(element);
                });
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

    // Method for fetching the names of all the actors and returning them as a ul element
    function getActors(actorList) {
        if(actorList && actorList.length > 0) {
            console.log("Actor list", actorList);
            var listElements =  $.map(actorList, function(item, index) {
                return "<li><a href=\"" + item.actorWikiPage.value + "\">" + item.actorName.value + "</a></li>";
            });
            return listElements;
        } else {
            throw "No actors present";
        }
    }


    // Method to append all image urls to the site
    function appendImages(posterUrls) {
        if(posterUrls) {
            var $imageSection = $(".posters");
            $imageSection.html("<h2>Movie Poster(s)</h2>");
            for(var i = 0; i < posterUrls.length; i++) {
                var url = posterUrls[i];
                var image = createBootstrapThumbnail(url, null);
                $imageSection.append(image);
            }
        }
    }

    // Returns an image tag
    function createImageTag(posterUrl, altText) {
        return "<img class='img-responsive' src=\"" + posterUrl + "\" alt=\"" + altText + "\">";;
    }

    // Returns a thumbnail html element with appropriate bootstrap classes
    function createBootstrapThumbnail(posterUrl, altText) {
        var imageTag = createImageTag(posterUrl, altText);
        return "<div class='col-xs-12 col-sm-8 col-md-8 col-lg-6'><a href=\"" + posterUrl + "\">" + imageTag + " </a></div>";
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

    function getDbpediaPosterData(posterName) {
        var posterQuery = prefixes
                            + "SELECT distinct ?name ?year ?caption ?poster ?abstract ?dbpediaUrl ?budget ?actorName ?directorName ?actorWikiPage "
                            + "WHERE { "
                            + "?poster a dbpediaOntology:Film; "
                            + "        a poster:Poster; "
                            + "        poster:title \"" + posterName + "\"; "
                            + "        poster:title ?name; "
                            + "        poster:year ?year; "
                            + "        poster:caption ?caption; "
                            + "        owl:sameAs ?dbpediaUrl . "
                            + " OPTIONAL { "
                            + " SERVICE <http://dbpedia.org/sparql/> { "
                            + " ?dbpediaUrl a dbpediaOntology:Film; "
                            + " dbpediaOntology:abstract ?abstract . "
                            + " OPTIONAL { "
                            + " ?dbpediaUrl dbpediaOntology:starring ?actors; "
                            + " dbpediaProp:budget ?budget; "
                            + " dbpediaOntology:director ?director . "
                            + " ?actors rdfs:label ?actorName . "
                            + " ?actors prov:wasDerivedFrom ?actorWikiPage . "
                            + " ?director rdfs:label ?directorName . "
                            + " }} "
                            + " FILTER (langMatches(lang(?abstract), \"EN\")) "
                            + " FILTER (langMatches(lang(?actorName), \"EN\")) "
                            + " FILTER (langMatches(lang(?directorName), \"EN\")) "
                            + " }}";

            var posterQueryUrl = queryEndpoint + encodeURIComponent(posterQuery) + format;
            $.get(posterQueryUrl, function(data) {
                app.populateData(data);
            });

            var urlQuery = prefixes
                        + "SELECT ?url "
                        + "WHERE { "
                        + "?poster a poster:Poster; "
                        + "         poster:posterUrl ?url; "
                        + "         poster:title " + JSON.stringify(posterName) + " "
                        + "}"
            var urlQueryUrl = queryEndpoint + encodeURIComponent(urlQuery) + format;
            $.get(urlQueryUrl, function(data) {
                const urls = getPosterUrls(data.results.bindings);
                appendImages(urls);
            });
    }

    function addClickEventsToTableRows() {
        $("tbody tr").on('click', function(event) {
            event.preventDefault();
            const posterName = $(this).data('postername');
            getDbpediaPosterData(posterName);
        });
    }
});
