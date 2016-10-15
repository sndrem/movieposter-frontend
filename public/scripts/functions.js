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
                } else {
                    // Search is not empty, proceed to check for data in the triple store
                }
            });             
        }
    };
});