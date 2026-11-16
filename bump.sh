#!/bin/sh
# Přidá k odkazům na CSS/JS v index.html číslo verze (čas), aby prohlížeče po nahrání načetly nové soubory.
v=$(date +%Y%m%d%H%M%S)
sed -i '' -E "s/(href=\"(styles|premium)\.css)(\?v=[0-9]+)?\"/\1?v=$v\"/g; s/(src=\"(config|script|animations)\.js)(\?v=[0-9]+)?\"/\1?v=$v\"/g" index.html
echo "verze $v"
