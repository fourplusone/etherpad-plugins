var Security = require('ep_etherpad-lite/static/js/security.js');

var internalHrefRegexp = new RegExp(/\[\[([^\]]+)\]\]/g);
var timesliderRegexp = new RegExp(/p\/[^\/]*\/timeslider/g);

var linkSanitizingFn = function(result){
  if(!result) return result;
  result.index = result.index + 2;
  var s = result[0];  
  result[0] = s
    .substr(2,s.length-4) // Skip the first two chars ([[) and omit the last ones (]])
    .replace(/\s+/g, '_'); // Every space will be replaced by an underscore
  return result;
};


var CustomRegexp = function(regexp, sanitizeResultFn){
  this.regexp = regexp;
  this.sanitizeResultFn = sanitizeResultFn;
};

CustomRegexp.prototype.exec = function(text){
  var result = this.regexp.exec(text); 
  return this.sanitizeResultFn(result);
}

var getCustomRegexpFilter = function(regExp, tag, sanitizeFn, linestylefilter)
{
  var customRegexp = new CustomRegexp(regExp, sanitizeFn);
  var filter =  linestylefilter.getRegexpFilter(customRegexp, tag);
  return filter
}


exports.aceCreateDomLine = function(name, context){
  
  var internalHref;
  var cls = context.cls;
  var domline = context.domline;
  
  // TODO find a more elegant way.
  var inTimeslider = (timesliderRegexp.exec(document.location.href) !== null);
  
  if (cls.indexOf('internalHref') >= 0)
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
    internalHrefRegexp,
    'internalHref',
    linkSanitizingFn,
    linestylefilter
  );
  
  return [filter];
}
