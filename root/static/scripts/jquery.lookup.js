/** Shit to do:
 *
 * o Correct GID link after lookup
 * o Better support for initial-locked state
 * o Allow "new artist" choice
 * o Pagination
 * o Show more information in search results
 *
 */

(function() {

$.fn.extend({
    autocomplete: function(options) {
        return this.each(function() {
            new $.autocomplete(this, options);
        });
    },
    entitySelector: function(options) {
        return this.each(function() {
            new $.entitySelector(this, options);
        });
    },
    select: function(callback) {
        return this.bind('autocomplete.select', callback);
    },
    reset: function() {
        return this.trigger('autocomplete.reset');
    }
});

$.autocomplete = function(input, options)
{
    var settings = {
        type: 'artist',
        artistBase: '/artist/',
        ajaxBase: '/ajax/',
        initial_object: {name: ''},
        formatResult: formatResult,
    };
    jQuery.extend(settings, options);

    var $query = $(input).val(settings.initial_object.name);
    $query.focus(show)
//        .blur(function() { hide(); })
        .val(settings.initial_query);

    var $search = $('<button/>').text('Search').blur(hide);

    // Main results box (show/hide depending on $input focus)
    var $resultsBox = $('<div/>').addClass('ajax-lookup').css('position', 'absolute').hide()
        .mouseover(function() { dontHide = true }).mouseout(function() { dontHide = false })
        .appendTo($query.parent());

    // Hold search results
    var $results = $('<ul>').appendTo($resultsBox);

    // Support for the "create new" row
    var $createNew = createSearchResult(0, settings.initial_object, format2).appendTo($results).unbind('click').click(function() {
        confirmSelection({ name: settings.initial_object.name });
    });
    settings.initial_object.name.length > 0 ? $createNew.show() : $createNew.hide();

    // Options box - for the lookup button
    $('<div>').addClass('options').append($search).appendTo($resultsBox);

    var dontHide = false;
    var currentIndex = -1;
    var currentSelection = null;

    $query.keydown(function(event) {
        if (event.keyCode == 27)
            hide(true);
        else if (event.keyCode == 40)
            moveIndex(1);
        else if (event.keyCode == 38)
            moveIndex(-1);
        else if (event.keyCode == 13) {
            event.preventDefault();
            currentSelection.click();
        }
    }).keyup(function() {
        if ($query.val())
            $createNew.show().html(format2({ name: $query.val() }));
        else
            $createNew.hide();
    });

    // Perform lookup
    $search.click(function(event) {
        event.preventDefault();

        currentSelection = null;
        currentIndex = -1;

        var query = $query.val();
        var url = settings.ajaxBase + "search?type=" + settings.type + "&query=" + query;
        clearResults();
        $results.append($('<li>').text('Searching...'));
        $query.focus();

        $.getJSON(url, function(data) {
            clearResults();

            if (data.hits > 0)
            {
                $.each(data.results, function(i, result) {
                    $results.append(createSearchResult(i + 1, result));
                });
            }
            else
            {
                $results.append($('<li>').text('No results'));
            }
        });
    });

    $query.bind('autocomplete.reset', function() {
        clearResults();
        $createNew.hide();
        hide();
        $query.val("");
        currentSelection = null;
        currentIndex = -1;
    });

    function clearResults()
    {
        $('li:not(:first)', $results).remove();
    }

    function moveIndex(amount) {
        allLi = $('li.result', $results);
        if(allLi.length == 0) return;
        
        currentIndex += amount;
        if (currentIndex >= allLi.length) currentIndex = allLi.length - 1;
        if (currentIndex < 0) currentIndex = 0;

        allLi.removeClass('hover');
        currentSelection = $(allLi[currentIndex]).addClass('hover');
    }

    function select(i) {
        allLi = $('li.result', $results);
        if (i >= allLi.length || i < -1) return;

        allLi.removeClass('hover');
        currentIndex = i;
        currentSelection = i == -1 ? null : $(allLi[currentIndex]).addClass('hover');
    }

    function createSearchResult(index, result, format)
    {
        text = format ? format(result) : settings.formatResult(result);

        var link = $('<li>').addClass('result').append(text).click(function(event) {
                confirmSelection(result);
            })
            .mouseover(function() { select(index); })
            .mouseout(function()  { select(-1); }).show();

        return link;
    }

    function confirmSelection(result)
    {
        $resultsBox.hide();
        $createNew.text("");
        $query.val(result.name).trigger('autocomplete.select', [ result ]);
        currentSelection = null;
        currentIndex = -1;
    }

    function formatResult(result) {
        str = "<strong>" + result.name + "</strong>";
        if(result.sort_name || result.comment) {
            str += '<br /><span style="font-size: small"> ';
            if(result.sort_name) str += result.sort_name + " ";
            if(result.comment) str += "(" + result.comment + ")";
            str += "</span>";
        }

        return str;
    }

    function format2(result) {
        return "Add <strong>" + result.name + "</strong> as a new artist";
    }

    function show()
    {
        inp = $query.get(0);
        $resultsBox.css({
            width: $query.width(),
            left: $query.offset().left,
            top: $query.offset().top + inp.offsetHeight
        }).show();
    };

    function hide(force)
    {
        if(!dontHide || force)
        {
            $resultsBox.hide();
        }
    }
}

$.entitySelector = function(input, options)
{
    options = jQuery.extend({}, {
        initial_object: null,
        makeLink: function(result) { return "/artist/" + result.gid },
    }, options);

    var $idInput = $(input).hide();
    var $query = $('<input>').insertAfter(input).autocomplete(options).hide().addClass('entity-selector');

    // Link to the artist, when the user has made a selection.
    var $artistLink = options.initial_object.gid ? $('<a>').attr('href', options.makeLink(options.initial_object)) : $('<span>');
    $artistLink.insertAfter($idInput).text(options.initial_object.name);
    var $toggle = $('<input type="checkbox">').insertBefore($artistLink).toggleButton()
        .on(function() { $artistLink.hide(); $query.show() })
        .off(function() { $artistLink.show(); $query.hide(); });

    $query.select(function(e, result) {
        $query.hide();
        $toggle.toggleOff();

        if(result.id)
        {
            newLink = $('<a>').attr('href', options.makeLink(result));
            $idInput.val(result.id);
        }
        else
        {
            newLink = $('<span>');
            $idInput.val('');
        }
        
        $artistLink.replaceWith(newLink);
        $artistLink = newLink;

        $artistLink.text(result.name).show();
        $idInput.trigger(e, result);
    });
};

})(jQuery);
