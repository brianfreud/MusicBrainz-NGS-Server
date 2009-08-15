#!/bin/bash
rm ../root/static/scripts/CompressedJS.js
JQUERY="../root/static/scripts/jquery/jquery."
JQUERYUI="../root/static/scripts/jquery/jquery-ui/"
cat "$JQUERYUI"ui.core.js "$JQUERYUI"ui.position.js "$JQUERYUI"ui.stackfix.js "$JQUERYUI"ui.droppable.js "$JQUERYUI"ui.draggable.js "$JQUERYUI"ui.dialog.js "$JQUERYUI"effects.core.js "$JQUERYUI"effects.highlight.js  "$JQUERY"outerClick.js "$JQUERY"autogrow.js "$JQUERY"autotab.js "$JQUERY"bt.js "$JQUERY"corner.js "$JQUERY"dropshapdow.js "$JQUERY"firebugwrap.js "$JQUERY"floatingdiv.js "$JQUERY"hoverintent.js "$JQUERY"iff.js "$JQUERY"liveExtension.js "$JQUERY"ui.pxem.js "$JQUERY"lorem.js "$JQUERY"markitup.js "$JQUERY"outerHTML.js "$JQUERY"replace.js "$JQUERY"scrollTo.js "$JQUERY"selectboxes.js "$JQUERY"swap.js "$JQUERY"tablednd.js ../root/static/scripts/libraries/wikiToHTML.js > combined.js
java -jar yuicompressor-2.4.2/build/yuicompressor-2.4.2.jar --type js combined.js -o packed.js
mv packed.js ../root/static/scripts/CompressedJS.js
rm combined.js

