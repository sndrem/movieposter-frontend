$(function(){var n={searchBtnClick:function(){$("#searchBtn").on("click",function(n){n.preventDefault();var e=$("#nameSearch").val();0===e.length&&$("legend").html("Search cannot be empty")})}};n.searchBtnClick()});