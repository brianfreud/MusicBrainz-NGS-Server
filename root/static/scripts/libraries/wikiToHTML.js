/*
  @author: Brian Schweitzer (BrianFreud)
  @license: GPL v2.0 http://www.gnu.org/licenses/gpl-2.0.html
  @version: 0.1 beta
  
  Can extend String or be used stand alone - just change the flag at the top of the script.
*/
function convertToMarkup(processingString) {
    var i = 0,
        x = '',
        listDepth = 0,
        listType = [];
    function convertToMarkupCallback(str) {
        switch (str) {
        case '<p>':
        case '</p>':
        case '\n</p>':
        case '\n<p>':
            return '\n';
        case '<em>':
            return "''";
        case '\n<em>':
            return "\n''";
        case '\n</em>':
            return "\n''";
        case '</em>':
            return "''";
        case '<strong>':
            return "'''";
        case '\n<strong>':
            return "\n'''";
        case '\n</strong>':
            return "\n'''";
        case '</strong>':
            return "'''";
        case '\n<h1>':
            return "\n= ";
        case '</h1>':
            return " =";
        case '\n<h2>':
            return "\n== ";
        case '</h2>':
            return " ==";
        case '\n<h3>':
            return "\n=== ";
        case '</h3>':
            return " ===";
        case '\n<h4>':
            return "\n==== ";
        case '</h4>':
            return " ====";
        case '\n<h5>':
            return "\n===== ";
        case '</h5>':
            return " =====";
        case '\n<h6>':
            return "\n====== ";
        case '</h6>':
            return " ======";
        case '</a>':
        case '\n</a>':
            return "]";
        case '\n<hr>':
            return "\n----";
        case '<hr>':
            return "----\n";
        case '\n<ul>':
        case '<ul>':
            listDepth++;
            listType[listDepth] = "ul";
            return "";
        case '\n<ol>':
        case '<ol>':
            listDepth++;
            listType[listDepth] = "ol";
            return "";
        case '\n<br>':
            return "\n";
        case '\n</ol>':
        case '</ol>':
        case '\n</ul>':
        case '</ul>':
            listDepth--;
            return '';
        case '\n</li>':
        case '</li>':
            return "";
        case '<br>':
        case '<code>':
            return "";
        case '</pre>':
        case '</code>':
        case '\n</code>':
            return "\n";
        case '\n<li>':
        case '<li>':
            x = "";
            for (var i = 0; i < listDepth; i++) {
                x = x + "    ";
            }
            if (listType[listDepth] == "ol") {
                return '\n' + x + "a. ";
            } else {
                return '\n' + x + "* ";
            }
        case '\n<pre>':
            return "\n        ";
        default:
            x = "";
            if (str.slice(0, 4) == "\n<li" || str.slice(0, 4) == "<li ") {
                for (i = 0; i < listDepth; i++) {
                    x = x + "    ";
                }
                return '\n' + x + str.split('"')[1] + ". ";
            } else return str;
        }
    }
    function makeURL(str) {
        x = str.slice(1, str.length);
        return "\n[" + x + "|" + x + "]";
    }
    function clearRedundantLists(str) {
        switch (str) {
        case '</ol><ol>':
        case '</ol>\n<ol>':
            return '';
        case '</ul><ul>':
        case '</ul>\n<ul>':
            return '';
        case '</ul></li></ul>':
        case '</ul></li></ol>':
            return '</ul>';
        case '</ol></li></ol>':
        case '</ul></li></ol>':
            return '</ol>';
        default:
            return str;
        }
    }
    if (processingString.length > 0) {
        processingString = processingString.replace(/\[/g, "&#91;")
                                           .replace(/\]/g, "&#93;");
        x = processingString.split(/<a href=\"/);
        // Detect which type of anchor we have
        processingString = x[0];
        if (x.length > 1) {
            for (i = 1; i < x.length; i++) {
                x[i] = x[i].replace(/">/, "|");
                processingString = processingString + "[" + x[i];
            }
        }
        // Strip the first <p> without adding a newline
        processingString = processingString.replace('<p>', "")
        // Catch the 2 cases that can cause ''''''''
                                           .replace(/<\/strong><\/em><strong>/g, "''")
                                           .replace(/<\/em><\/strong><em>/g, "'''")
        // Keep spaces before lists
                                           .replace(/<\/p><.?l>/g, "\n<ol>")
                                           .replace(/<\/p><ul>/g, "\n<ul>")
        // Text::WikiFormat doesn't do block-level indents
                                           .replace(/\n */g, "\n")
        // Convert everything else
                                           .replace(/\n?<.*?>/g, convertToMarkupCallback)
        // Text::WikiFormat converts alt-255 into space
                                           .replace(/ /g, " ")
        // Linkify those naked urls Text::WikiFormat currently misses
                                           .replace(/\n\b((ftp|https?):\/\/\S*)/g, makeURL)
                                           .replace(/\n\n\n/g, '\n\n');
        // Strip whitespace off the end
        while (processingString.length > 0 && processingString.charAt(processingString.length - 1).match(/\s/)) {
            processingString = processingString.slice(0, processingString.length - 1);
        }
    }
    return processingString;
}
function convertToHTML(processingString) {
    var i = 0;
    var lastDepth = 0;
    var lasttype = "";
    var listTypes = [];
    var currentDepth = 0;
    var inList = false;
    function addPreAndLists(str, p1, p2) {
        var d = 0;
        // Fix where the user added an extra 1-3 spaces.
        // ----------------------------------------------------------------------------------
        // Normalizing levels here means the generated HTML will not
        // be 100% 1:1 with Text::WikiFormat-generated HTML.  However,
        // Text::WikiFormat adds meaningless </ul><ul> and </ol><ol> tags where
        // they have no semantic markup or HTML meaning; doing it this way
        // is ultimately less confusing for the user, by making depth errors in
        // nested lists much easier to spot - the depth difference between '3
        // spaces vs 4 spaces' is much more obvious when rerendered in
        // markup as '0 spaces vs 4 spaces'.
        // ----------------------------------------------------------------------------------
        while ((str.length - 4) % 4 > 0) {
            str = str.slice(1, str.length);
        }
        // ----------------------------------------------------------------------------------
        // Pre + Code, can only happen at 8 spaces in
        if (str.match(/\s{8}[^   ..|\* ..|\d\d?\. ?.]/) != null) {
            str = '<pre><code>' + str.slice(str.length - 4, str.length);
            return str;
        }
        // ----------------------------------------------------------------------------------
        // Now it can only be *, #., or ##. where # can be a number or letter
        // If it's *, it's an UL.  Otherwise it's an OL.
        currentDepth = str.split('    ').length - 1;
        var y = "";
        switch (str.split('    ')[currentDepth].slice(0, 1)) {
        case '*':
            if (currentDepth == lastDepth) {
                if (lasttype == 'ol') y = '</ol><ul>';
                else if (lasttype == '') y = '<ul>';
            } else if (currentDepth > lastDepth) {
                y = '<ul>';
                listTypes[listTypes.length] = 'ul>';
                lastDepth = currentDepth;
            } else if (currentDepth < lastDepth) {
                for (d = lastDepth; d > currentDepth; d--) {
                    y = y + '</' + listTypes.pop();
                }
            }
            y = y + '<li>' + str.slice(str.length - 2);
            lasttype = 'ul';
            break;
        default:
            if (currentDepth == lastDepth) {
                if (lasttype == 'ul') y = '</ul><ol>';
                else if (lasttype == '') y = '<ol>';
            } else if (currentDepth > lastDepth) {
                listTypes[listTypes.length] = 'ol>';
                y = '<ol>';
                lastDepth = currentDepth;
            } else if (currentDepth < lastDepth) {
                for (d = lastDepth; d > currentDepth; d--) {
                    y = y + '</' + listTypes.pop();
                }
            }
            var z = str.slice(str.length - 3).split(' ')[1];
            if (z == undefined) z = "";
            y = y + '<li>' + z;
            lasttype = 'ol';
            break;
        }
        return y;
    }
    function convertToHTMLHeadersCallback(str) {
        function selector(inputStr) {
            switch (inputStr) {
            case '\n=':
            case '<p>=':
            case '=</p>':
            case '=':
                return 'h1>';
            case '\n==':
            case '<p>==':
            case '==</p>':
            case '==':
                return 'h2>';
            case '\n===':
            case '<p>===':
            case '===</p>':
            case '===':
                return 'h3>';
            case '\n====':
            case '<p>====':
            case '====</p>':
            case '====':
                return 'h4>';
            case '\n=====':
            case '<p>=====':
            case '=====</p>':
            case '=====':
                return 'h5>';
            case '\n======':
            case '<p>======':
            case '======</p>':
            case '======':
                return 'h6>';
            }
        }
        var x = str.split(' ');
        x[0] = '<' + selector(x[0]);
        x[(x.length - 1)] = '</' + selector(x[(x.length - 1)]);
        str = x.join("");
        return str;
    }
    function fixLists(str) {
        var x = str.slice(0, 7);
        var y = str.slice(7, str.length - 4);
        y = y.replace(/></g, '>\n<');
        switch (x) {
        case '<p><ul>':
            x = '<ul>\n';
            break;
        case '<p><ol>':
            x = '<ol>\n';
            break;
        case '</ol><p>':
            x = '</ol>';
            break;
        case '</ul><p>':
            x = '</ul>';
            break;
        }
        x = x + y;
        return x;
    }
    function fixHeaders(str) {
        return str + '\n';
    }
    function fixEndOfLists(str) {
        var v = str.slice(0, 5);
        v = v + '\n<p>';
        var w = str.slice(5, str.length - 6);
        var y = str.slice(str.length - 1);
        if (y == '\n') {
            // Only happens if we have a list, then a single text block, then a new list
            str = v + w + '</p>' + y;
        } else {
            str = v + w + '<br>' + y;
        }
        return str;
    }
    function fixBreakType(str) {
        return '\n<p>' + str.slice(5, str.length);
    }
    function fixBr(str) {
        return str.slice(0, 1) + '<br>\n';
    }
    function fixPostHrBreak(str) {
        return '<hr>\n<p>' + str.slice(9, str.length - 4) + '</p>';
    }
    function lastFix(str) {
        return '</p>' + str.slice(8, str.length);
    }
    function ILied(str) {
        switch (str) {
        case '<li>\n':
            return '<li>';
        case '<p>\n':
            return '<p>';
        }
    }
    function preCorrectLists(str) {
        return str.slice(0, 1) + '\n<li';
    }
    if (processingString.length > 0) {
        processingString = processingString.replace(/.<li/g, preCorrectLists);
        var zzz = processingString.split('\n');
        processingString = "";
        for (i = 0; i < zzz.length; i++) {
            if (zzz[i].split(/\s{4}\s*..../).length == 1) {
                // close lists
                if (inList === true) {
                    for (d = listTypes.length; d > 0; d--) {
                        if (d == 1) zzz[i] = '</' + listTypes.shift() + '\n\n' + zzz[i];
                        else zzz[i] = '</' + listTypes.shift() + zzz[i];
                    }
                    lastDepth = 0;
                }
            } else {
                zzz[i] = zzz[i].replace(/\s{4}\s*..../g, addPreAndLists);
                inList = true;
            }
            switch (zzz[i].slice(0, 4)) {
            case '<pre':
                zzz[i] = '\n' + zzz[i] + '</code></pre>';
                break;
            case '<li>':
            case '<ol>':
            case '<ul>':
                // Including the next two adds an incorrect </li>, but it blocks paragraphizing of the
                // last <li> and the line following the closing tag of a list.
            case '</ol':
            case '</ul':
            case '<li ':
                zzz[i] = zzz[i] + '</li>';
                break;
            default:
            }
            // Take care of non-<p> line breaks
            if (i < zzz.length - 1 && zzz[i].match(/^[\w|"|']/) != null && zzz[i].match(/^[\w|"|']/) != null && zzz[i].length > 0 && zzz[i + 1].length > 0) processingString = processingString

            + zzz[i] + '<br>';
            else if (i < zzz.length - 1 && zzz[i].match(/>$/) != null && zzz[i].match(/^</) != null) processingString = processingString + zzz[i];
            else if (zzz[i].match(/-{4}/) != null) processingString = processingString + '<hr>';
            else processingString = processingString + zzz[i] + '\n';
        }
        processingString = processingString.replace(/\n\n/g, "</p>\n<p>");
        processingString = processingString.replace(/\n/g, "<br>");
        // Add the surrounding <p>
        processingString = '<p>' + processingString + '</p>';
        // Link both types of anchors
        var x = processingString.split(/\[/);
        if (x.length > 1) {
            processingString = x[0];
            for (i = 1; i < x.length; i++) {
                if (x[i].indexOf('|') > -1) {
                    var y = x[i].split(/\|/);
                    x[i] = '<a href="' + y[0] + '">' + y[1].replace(/\]/, '</a>');
                } else {
                    x[i] = '<a href="' + x[i] + '">' + x[i] + '</a>';
                }
                processingString = processingString + x[i];
            }
        }
        // Distinguish and convert '' and '''
        var bold = false;
        var italics = false;
        // Using the <X> later to clear unwanted linebreaks
        for (i = 0; i < processingString.length; i++) {
            if (processingString.charAt(i) == "'") {
                if (processingString.charAt(i + 1) == "'") {
                    if (processingString.charAt(i + 2) == "'") {
                        if (bold == false) {
                            processingString = processingString.slice(0, i) + '<strong><X>' + processingString.slice((i + 3));
                            i += 3;
                            bold = true;
                        } else {
                            processingString = processingString.slice(0, i) + '</strong><X>' + processingString.slice((i + 3));
                            i += 3;
                            bold = false;
                        }
                    } else {
                        if (italics == false) {
                            processingString = processingString.slice(0, i) + '<em><X>' + processingString.slice((i + 2));
                            i += 2;
                            italics = true;
                        } else {
                            processingString = processingString.slice(0, i) + '</em><X>' + processingString.slice((i + 2));
                            i += 2;
                            italics = false;
                        }
                    }
                }
            }
        }
        // Strip whitespace off the end of the string
        while (processingString.length > 0 && processingString.charAt(processingString.length - 1).match(/\s/)) {
            processingString = processingString.slice(0, processingString.length - 1);
        }
        // Scrub the results so they match the HTML shortcuts and line-breaks Text::WikiFormat uses
        // ----------------------------------------------------------------------------------------------------------------
        processingString = processingString.replace(/<p><\/p>\n<p>/g, '<p>')
                                           .replace(/<\/h\d>/g, fixHeaders)
                                           .replace(/.<br>/g, fixBr)
        // Cheaper to use <X> here than loop on <strong> and <em>
                                           .replace(/\n?<X>\n?/g, '')
                                           .replace(/\n<ol>/g, '<ol>')
                                           .replace(/\n<ul>/g, '<ul>')
                                           .replace(/<\/p>\n?<br>/g, '</p>')
                                           .replace(/<p>\n<hr>/g, '<hr>')
                                           .replace(/\n<br>.*<\/p>/g, fixBreakType)
                                           .replace(/\n<br>/g, '<br>\n')
                                           .replace(/<hr><br>\n.*<br>/g, fixPostHrBreak)
                                           .replace(/<br>\n\n/g, '<br>\n')
                                           .replace(/<\/p>\n<p><(o|u)l>\n<li>/g, lastFix)
                                           .replace(/<(li|p)>\n/g, ILied)
                                           .replace(/<\/p>\n\n/g, '</p>\n')
                                           .slice(0, processingString.length - 5)
        // code blocks tend to grow tags
                                           .replace(/\n?<p>\n?<br>\n?<pre>\n?/g, '\n<pre>')
                                           .replace(/\n?<\/pre>\n?<br>\n?<\/ol>\n?(<\/li>)?\n?/g, '</pre>\n')
                                           .replace(/<\/pre>\n<br>/g, '</pre>')
                                           .replace(/=<br>/g, '=\n')
                                           .replace(/<p>=/g, '=')
                                           .replace(/=<\/p>/g, '=')
                                           .replace(/(<p>={1,6}\s.+=\s{1,6}<\/p>)|(^={1,6}\s.+\s={1,6}$)/gm, convertToHTMLHeadersCallback)
        // Next two lines prevent lists from collapsing over multiple conversions
                                           .replace(/<\/p><ul>/g, '<\/p>\n<ul>')
                                           .replace(/<\/p><ol>/g, '<\/p>\n<ol>');
    }
    return processingString;
}
