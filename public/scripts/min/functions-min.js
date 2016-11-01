function Poster(t,e,r,a,o,n){this.title=t,this.caption=e,this.year=r,this.urls=a,this.largePosterUrl=o,this.abstract=n}const prefixes=["prefix poster: <http://uib.no/info310/posterOntology#> ","prefix owl: <http://www.w3.org/2002/07/owl#> ","prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ","prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> ","prefix dbpediaOntology: <http://dbpedia.org/ontology/>","prefix dbpediaProp: <http://dbpedia.org/property/>","prefix prov: <http://www.w3.org/ns/prov#>","prefix dbpedia: <http://dbpedia.org/resource/>"].join(" "),queryEndpoint="http://localhost:8080/ds/?query=",format="&format=json";$(function(){function t(t){if(t&&t.length>0){console.log("Actor list",t);var e=$.map(t,function(t,e){return'<li><a href="'+t.actorWikiPage.value+'">'+t.actorName.value+"</a></li>"});return e}throw"No actors present"}function e(t){if(t){var e=$(".posters");e.html("<h2>Movie Poster(s)</h2>");for(var r=0;r<t.length;r++){var o=t[r],n=a(o,null);e.append(n)}}}function r(t,e){return"<img class='img-responsive' src=\""+t+'" alt="'+e+'">'}function a(t,e){var a=r(t,e);return"<div class='col-xs-12 col-sm-8 col-md-8 col-lg-6'><a href=\""+t+'">'+a+" </a></div>"}function o(t){if(t){for(var e=[],r=0;r<t.length;r++)e.push(t[r].url.value);return e}}function n(t){var r=prefixes+'SELECT distinct ?name ?year ?caption ?poster ?abstract ?dbpediaUrl ?budget ?actorName ?directorName ?actorWikiPage WHERE { ?poster a dbpediaOntology:Film;         a poster:Poster;         poster:title "'+t+'";         poster:title ?name;         poster:year ?year;         poster:caption ?caption;         owl:sameAs ?dbpediaUrl .  OPTIONAL {  SERVICE <http://dbpedia.org/sparql/> {  ?dbpediaUrl a dbpediaOntology:Film;  dbpediaOntology:abstract ?abstract .  OPTIONAL {  ?dbpediaUrl dbpediaOntology:starring ?actors;  dbpediaProp:budget ?budget;  dbpediaOntology:director ?director .  ?actors rdfs:label ?actorName .  ?actors prov:wasDerivedFrom ?actorWikiPage .  ?director rdfs:label ?directorName .  }}  FILTER (langMatches(lang(?abstract), "EN"))  FILTER (langMatches(lang(?actorName), "EN"))  FILTER (langMatches(lang(?directorName), "EN"))  }}',a=queryEndpoint+encodeURIComponent(r)+format;$.get(a,function(t){l.populateData(t)});var n=prefixes+"SELECT ?url WHERE { ?poster a poster:Poster;          poster:posterUrl ?url;          poster:title "+JSON.stringify(t)+" }",i=queryEndpoint+encodeURIComponent(n)+format;$.get(i,function(t){const r=o(t.results.bindings);e(r)})}function i(){$("tbody tr").on("click",function(t){t.preventDefault();const e=$(this).data("postername");n(e)})}var l={searchBtnClick:function(){$("#searchBtn").on("click",function(t){t.preventDefault();var e=$("#nameSearch").val();if(0===e.length)$("legend").html("Search cannot be empty");else{$(".multipleHitTable tbody").html("");var r=prefixes+'SELECT DISTINCT ?name ?year ?caption WHERE { ?poster a poster:Poster;  poster:title ?name;  rdfs:label ?name;  poster:year ?year;  poster:caption ?caption .  FILTER(contains(?name, "'+e+'"))}  ORDER BY DESC(?year) ',a=queryEndpoint+encodeURIComponent(r)+format;$.get(a,function(t){if(1==t.results.bindings.length){const e=t.results.bindings[0].name.value;n(e)}else t.results.bindings.length>1&&(l.showMultipleHitList(t.results.bindings),i())})}})},populateData:function(e){var r=e.results.bindings,a=null;if($(".posterStats").html(""),0==r.length)$("legend").html("No results for "+$("#nameSearch").val());else if(r.length>0){const o=r[0],n=o.name.value,i=o.caption.value,l=o.year.value;var s,p,c,d=null;try{s=o.abstract.value,p=o.directorName.value,c=t(r)}catch(t){s="No abstract available"}a=new Poster(n,i,l,null,null,s),$(".posterData").html(""),$(".posterData").append("<h1>"+i+"</h1><p>"+s+"</p>"),$(".posterStats").append("<h3>Actors</h3><ul></ul>"),$.each(c,function(t,e){$(".posterStats ul").append(e)})}},showMultipleHitList:function(t){$("legend").html("There was multiple hits for "+$("#nameSearch").val()),$("legend").append("<p>Select your desired poster from the list</p>");var e=$(".results");$(".multipleHitTable").removeClass("hide");var r=$(".multipleHitTable tbody");$.each(t,function(t,e){r.append('<tr data-postername="'+e.name.value+'"><td>'+e.name.value+"</td><td>"+e.caption.value+"</td><td>"+e.year.value+"</td></tr>")})}};l.searchBtnClick()});