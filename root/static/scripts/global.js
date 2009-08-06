$(function() {

    // Ratings
    $('span.star-rating a').click(function() {
        var ratingLink = $(this);
        var url = this.href + '&json=1';
        $.getJSON(url, function(data) {
            var currentRatingSpan = ratingLink.siblings('span');
            if (!currentRatingSpan.length) {
                currentRatingSpan = $('<span/>');
                ratingLink.parent().prepend(currentRatingSpan);
            }
            var rating;
            if (data.rating) {
                // Use the user rating
                currentRatingSpan.removeClass('current-rating');
                currentRatingSpan.addClass('current-user-rating');
                rating = data.rating;
            }
            else {
                // Removed user rating, use the average rating instead
                currentRatingSpan.removeClass('current-user-rating');
                currentRatingSpan.addClass('current-rating');
                rating = data.rating_average;
            }
            if (rating) {
                // Update the width if we have some ratings
                currentRatingSpan.css('width', rating + '%');
                currentRatingSpan.text(5 * rating / 100);
            }
            else {
                // No ratings, remove it
                currentRatingSpan.remove();
            }
            // Update links
            ratingLink.parent().children('a').each(function(i) {
                var originalRating = 100 * (1 + i) / 5;
                var newRating = data.rating == originalRating ? 0 : originalRating;
                var oldRatingMatch = this.href.match(/rating=([0-9]+)/);
                if (oldRatingMatch[1] != newRating) {
                    this.href = this.href.replace(oldRatingMatch[0], 'rating=' + newRating);
                }
            });
        })
        return false;
    });

});
