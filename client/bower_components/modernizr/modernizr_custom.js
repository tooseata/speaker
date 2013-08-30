// getUserMedia
// http://www.whatwg.org/specs/web-apps/current-work/multipage/video-conferencing-and-peer-to-peer-communication.html
// By Eric Bidelman
Modernizr.addTest('getusermedia', !!Modernizr.prefixed('getUserMedia', navigator));

// Mozilla Audio Data API
// https://wiki.mozilla.org/Audio_Data_API
// by Addy Osmani
Modernizr.addTest('audiodata', !!(window.Audio));

// Web Audio API
// https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html
// By Addy Osmani
Modernizr.addTest('webaudio', !!(window.webkitAudioContext || window.AudioContext));

/* modernizr-test.js
 * Daniel Ott
 * 3 March 2011
 * Custom Tests using Modernizr's addTest API
 */
 
/* iOS
 * There may be times when we need a quick way to reference whether iOS is in play or not.
 * While a primative means, will be helpful for that.
 */
Modernizr.addTest('ipad', function () {
  return !!navigator.userAgent.match(/iPad/i);
});
 
Modernizr.addTest('iphone', function () {
  return !!navigator.userAgent.match(/iPhone/i);
});
 
Modernizr.addTest('ipod', function () {
  return !!navigator.userAgent.match(/iPod/i);
});
 
Modernizr.addTest('appleios', function () {
  return (Modernizr.ipad || Modernizr.ipod || Modernizr.iphone);
});
 
/* CSS position:fixed
 * Not supported in older IE browsers, nor on Apple's iOS devices.
 * Actually the token example on the Modernizr docs. http://www.modernizr.com/docs/
 */
Modernizr.addTest('positionfixed', function () {
    var test    = document.createElement('div'),
        control = test.cloneNode(false),
        fake = false,
        root = document.body || (function () {
            fake = true;
            return document.documentElement.appendChild(document.createElement('body'));
        }());
 
    var oldCssText = root.style.cssText;
    root.style.cssText = 'padding:0;margin:0';
    test.style.cssText = 'position:fixed;top:42px'; 
    root.appendChild(test);
    root.appendChild(control);
    
    var ret = test.offsetTop !== control.offsetTop;
 
    root.removeChild(test);
    root.removeChild(control);
    root.style.cssText = oldCssText;
    
    if (fake) {
        document.documentElement.removeChild(root);
    }
    
    /* Uh-oh. iOS would return a false positive here.
     * If it's about to return true, we'll explicitly test for known iOS User Agent strings.
     * "UA Sniffing is bad practice" you say. Agreeable, but sadly this feature has made it to
     * Modernizr's list of undectables, so we're reduced to having to use this. */
    return ret && !Modernizr.appleios;
});
