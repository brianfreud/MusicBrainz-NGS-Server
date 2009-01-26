/*----------------------------------------------------------------------------\
|                              Musicbrainz.org                                |
|                 Copyright (c) 2005 Stefan Kestenholz (keschte)              |
|-----------------------------------------------------------------------------|
| This software is provided "as is", without warranty of any kind, express or |
| implied, including  but not limited  to the warranties of  merchantability, |
| fitness for a particular purpose and noninfringement. In no event shall the |
| authors or  copyright  holders be  liable for any claim,  damages or  other |
| liability, whether  in an  action of  contract, tort  or otherwise, arising |
| from,  out of  or in  connection with  the software or  the  use  or  other |
| dealings in the software.                                                   |
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - |
| GPL - The GNU General Public License    http://www.gnu.org/licenses/gpl.txt |
| Permits anyone the right to use and modify the software without limitations |
| as long as proper  credits are given  and the original  and modified source |
| code are included. Requires  that the final product, software derivate from |
| the original  source or any  software  utilizing a GPL  component, such  as |
| this, is also licensed under the GPL license.                               |
|                                                                             |
| $Id: GcLabelHandler.js 9118 2007-05-10 11:29:27Z luks $
\----------------------------------------------------------------------------*/

/**
 * Label specific GuessCase functionality
 **/
function GcLabelHandler() {
	mb.log.enter("GcLabelHandler", "__constructor");

	// ----------------------------------------------------------------------------
	// register class/global id
	// ---------------------------------------------------------------------------
	this.CN = "GcLabelHandler";
	this.GID = "gc.label";

	// ----------------------------------------------------------------------------
	// member variables
	// ---------------------------------------------------------------------------
	this.UNKNOWN = "[unknown]";
	this.NOLABEL = "[unknown]";

	// ----------------------------------------------------------------------------
	// member functions
	// ---------------------------------------------------------------------------

	/**
	 * Guess the label name given in string is, and
	 * returns the guessed name.
	 *
	 * @param	is		the inputstring
	 * @returns os		the processed string
	 **/
	this.process = function(is) {
		mb.log.enter(this.GID, "process");
		is = gc.artistmode.preProcessCommons(is);
		var w = gc.i.splitWordsAndPunctuation(is);
		gc.o.init();
		gc.i.init(is, w);
		while (!gc.i.isIndexAtEnd()) {
			this.processWord();
			mb.log.debug("Output: $", gc.o._w);
		}
		var os = gc.o.getOutput();
		os = gc.artistmode.runPostProcess(os);
		return mb.log.exit(os);
	};


	/**
	 * Checks special cases of labels
	 * - empty, unknown -> [unknown]
 	 * - none, no label, not applicable, n/a -> [no label]
	 **/
	this.checkSpecialCase = function(is) {
		mb.log.enter(this.GID, "checkSpecialCase");
		if (is) {
			if (!gc.re.LABEL_EMPTY) {
				// match empty
				gc.re.LABEL_EMPTY = /^\s*$/i;
				// match "unknown" and variants
				gc.re.LABEL_UNKNOWN = /^[\(\[]?\s*Unknown\s*[\)\]]?$/i;
				// match "none" and variants
				gc.re.LABEL_NONE = /^[\(\[]?\s*none\s*[\)\]]?$/i;
				// match "no label" and variants
				gc.re.LABEL_NOLABEL = /^[\(\[]?\s*no[\s-]+label\s*[\)\]]?$/i;
				// match "not applicable" and variants
				gc.re.LABEL_NOTAPPLICABLE = /^[\(\[]?\s*not[\s-]+applicable\s*[\)\]]?$/i;
				// match "n/a" and variants
				gc.re.LABEL_NA = /^[\(\[]?\s*n\s*[\\\/]\s*a\s*[\)\]]?$/i;
			}
			var os = is;
			if (is.match(gc.re.LABEL_EMPTY)) {
				return mb.log.exit(this.SPECIALCASE_UNKNOWN);

			} else if (is.match(gc.re.LABEL_UNKNOWN)) {
				return mb.log.exit(this.SPECIALCASE_UNKNOWN);

			} else if (is.match(gc.re.LABEL_NONE)) {
				return mb.log.exit(this.SPECIALCASE_UNKNOWN);

			} else if (is.match(gc.re.LABEL_NOLABEL)) {
				return mb.log.exit(this.SPECIALCASE_UNKNOWN);

			} else if (is.match(gc.re.LABEL_NOTAPPLICABLE)) {
				return mb.log.exit(this.SPECIALCASE_UNKNOWN);

			} else if (is.match(gc.re.LABEL_NA)) {
				return mb.log.exit(this.SPECIALCASE_UNKNOWN);
			}
		}
		return mb.log.exit(this.NOT_A_SPECIALCASE);
	};


	/**
	 * Delegate function which handles words not handled
	 * in the common word handlers.
	 *
	 * - Handles VersusStyle
	 *
	 **/
	this.doWord = function() {
		mb.log.enter(this.GID, "doWord");
		mb.log.debug('Guessing Word: #cw');
		if (this.doVersusStyle()) {
		} else if (this.doPresentsStyle()) {
		} else {
			// no special case, append
			gc.o.appendSpaceIfNeeded();
			gc.i.capitalizeCurrentWord();
			mb.log.debug('Plain word: #cw');
			gc.o.appendCurrentWord();
		}
		gc.f.resetContext();
		gc.f.number = false;
		gc.f.forceCaps = false;
		gc.f.spaceNextWord = true;
		return mb.log.exit(null);
	};

	/**
	 * Reformat pres/presents -> presents
	 *
	 * - Handles DiscNumberStyle (DiscNumberWithNameStyle)
	 * - Handles FeaturingArtistStyle
	 * - Handles VersusStyle
	 * - Handles VolumeNumberStyle
	 * - Handles PartNumberStyle
	 *
	 **/
	this.doPresentsStyle = function() {
		if (!this.doPresentsRE) {
			this.doPresentsRE = /^(presents?|pres)$/i;
		}
		if (gc.i.matchCurrentWord(this.doPresentsRE)) {
			gc.o.appendSpace();
			gc.o.appendWord("presents");
			if (gc.i.isNextWord(".")) {
				gc.i.nextIndex();
			}
			return true;
		}
		return false;
	};

	/**
	 * Guesses the sortname for labels
	 **/
	this.guessSortName = function(is) {
		mb.log.enter(this.GID, "guessSortName");
		is = gc.u.trim(is);

		// let's see if we got a compound label
		var collabSplit = " and ";
		collabSplit = (is.indexOf(" + ") != -1 ? " + " : collabSplit);
		collabSplit = (is.indexOf(" & ") != -1 ? " & " : collabSplit);

		var as = is.split(collabSplit);
		for (var splitindex=0; splitindex<as.length; splitindex++) {
			var label = as[splitindex];
			if (!mb.utils.isNullOrEmpty(label)) {
				label = gc.u.trim(label);
				var append = "";
				mb.log.debug("Handling label part: $", label);

				var words = label.split(" ");
				mb.log.debug("words: $", words);

				// handle some special cases, like The and Los which
				// are sorted at the end.
				if (!gc.re.SORTNAME_THE) {
					gc.re.SORTNAME_THE = /^The$/i; // match The
					gc.re.SORTNAME_LOS = /^Los$/i; // match Los
				}
				var firstWord = words[0];
				if (firstWord.match(gc.re.SORTNAME_THE)) {
					append = (", The" + append); // handle The xyz -> xyz, The
					words[0] = null;
				} else if (firstWord.match(gc.re.SORTNAME_LOS)) {
					append = (", Los" + append); // handle Los xyz -> xyz, Los
					words[0] = null;
				}

				mb.log.debug('Sorted words: $, append: $', words, append);
				var t = [];
				for (i=0; i<words.length; i++) {
					var w = words[i];
					if (!mb.utils.isNullOrEmpty(w)) {
						// skip empty names
						t.push(w);
					}
					if (i < words.length-1) {
						// if not last word, add space
						t.push(" ");
					}
				}

				// append string
				if (!mb.utils.isNullOrEmpty(append)) {
					t.push(append);
				}
				label = gc.u.trim(t.join(""));
			}
			if (!mb.utils.isNullOrEmpty(label)) {
				as[splitindex] = label;
			} else {
				delete as[splitindex];
			}
		}
		var os = gc.u.trim(as.join(collabSplit));
		mb.log.debug('Result: $', os);
		return mb.log.exit(os);
	};

	// exit constructor
	mb.log.exit();
}
GcLabelHandler.prototype = new GcHandler;