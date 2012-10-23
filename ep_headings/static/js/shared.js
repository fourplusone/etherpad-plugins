var _ = require('ep_etherpad-lite/static/js/underscore');

var tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

var collectContentPre = function(hook, context){
  var tname = context.tname;
  var state = context.state;
  var lineAttributes = state.lineAttributes
  var tagIndex = _.indexOf(tags, tname);
  
  if(tagIndex >= 0){
    lineAttributes['heading'] = tags[tagIndex];
  }
  else {
    delete lineAttributes['heading'];
  }
};

exports.collectContentPre = collectContentPre;
