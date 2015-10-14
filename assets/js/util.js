var betterFadeIn = function (elem, time) {
	if (elem[0].style.display === '') {
		elem.fadeIn(time);
	} else {
		elem.animate({'padding':getCssStyle(elem, 'padding')}, 0);
		elem.animate({'margin':getCssStyle(elem, 'margin')}, 0);
		elem.animate({'height':getCssStyle(elem, 'height')}, time / 4, function () {
			elem.animate({'opacity':'100'}, time);
		});
	}
}

var betterFadeOut = function (elem, time) {
	elem.animate({'opacity':'0'}, time, function () {
		elem.animate({'padding':'0px'}, 0);
		elem.animate({'margin':'0px'}, 0);
		elem.animate({'height':'0px'}, time / 2);
	});
}

var getCssStyle = function(elem, cssProperty) {
	var elem = elem[0]; // first element in node list returned by jQuery
  var inlineCssValue = elem.style[cssProperty];

  // If the inline style exists remove it, so we have access to the original CSS
  if (inlineCssValue !== "") {
    elem.style[cssProperty] = null;
  }

  var cssValue = "";
  // For most browsers
  if (document.defaultView && document.defaultView.getComputedStyle) {
    cssValue = document.defaultView.getComputedStyle(elem, "").getPropertyValue(cssProperty);
  }
  // For IE except 5
  else if (elem.currentStyle){
    cssProperty = cssProperty.replace(/\-(\w)/g, function (strMatch, p1) {
      return p1.toUpperCase();
    });
    cssValue = elem.currentStyle[cssProperty];
  }

  // Put the inline style back if it had one originally
  if (inlineCssValue !== "") {
    elem.style[cssProperty] = inlineCssValue;
  }

  return cssValue;
}
