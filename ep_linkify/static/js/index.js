/* Include the Security module, we will use this later to escape a HTML attribute*/
var Security = require('ep_etherpad-lite/static/js/security.js'); 

/* Define the regular expressions we will use to detect if a string looks like a reference to a pad IE [[foo]] */
var internalHrefRegexp = new RegExp(/\[\[([^\]]+)\]\]/g);

// Define a regexp to detect if we are in timeslider
var timesliderRegexp = new RegExp(/p\/[^\/]*\/timeslider/g);

/* Take the string and remove the first and last 2 characters IE [[foo]] returns foo */
var linkSanitizingFn = function(result){
  if(!result) return result;
  result.index = result.index + 2;
  var s = result[0];  
  result[0] = s
    .substr(2,s.length-4) // Skip the first two chars ([[) and omit the last ones (]])
    .replace(/\s+/g, '_'); // Every space will be replaced by an underscore
  return result;
};


/* CustomRegexp provides a wrapper around a RegExp Object which applies a given function to the result of the Regexp
  @param regexp the regexp to be wrapped
  @param sanitizeResultFn the function to be applied to the result. 
*/
var CustomRegexp = function(regexp, sanitizeResultFn){
  this.regexp = regexp;
  this.sanitizeResultFn = sanitizeResultFn;
};


CustomRegexp.prototype.exec = function(text){
  var result = this.regexp.exec(text); 
  return this.sanitizeResultFn(result);
}


/* getCustomRegexpFilter returns a linestylefilter compatible filter for a CustomRegexp
  @param customRegexp the CustomRegexp Object
  @param tag the tag to be filtered
  @param linestylefilter reference to linestylefilter module
*/
var getCustomRegexpFilter = function(customRegexp, tag, linestylefilter)
{
  var filter =  linestylefilter.getRegexpFilter(customRegexp, tag);
  return filter;
}


exports.aceCreateDomLine = function(name, context){
  var internalHref;
  var cls = context.cls;
  var domline = context.domline;
  
  // TODO find a more elegant way.
  var inTimeslider = (timesliderRegexp.exec(document.location.href) !== null);
  
  if (cls.indexOf('internalHref') >= 0) // if it already has the class of internalHref
  {
    cls = cls.replace(/(^| )internalHref:(\S+)/g, function(x0, space, url)
    {
      internalHref = url;
      return space + "url";
    });
  }
  
  if (internalHref)
  {
    var url = (inTimeslider ? '../' : './') + internalHref;
    var modifier = {
      extraOpenTags: '<a href="' + Security.escapeHTMLAttribute(url) +'">',
      extraCloseTags: '</a>',
      cls: cls
    }
    return [modifier];
  }
  return;
}

exports.aceGetFilterStack = function(name, context){
  var linestylefilter = context.linestylefilter;
  var filter = getCustomRegexpFilter(
    new CustomRegexp(internalHrefRegexp, linkSanitizingFn),
    'internalHref',
    linestylefilter
  );
  return [filter];
}
