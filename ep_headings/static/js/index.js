var _, $, jQuery;

var $ = require('ep_etherpad-lite/static/js/rjquery').$;
var _ = require('ep_etherpad-lite/static/js/underscore');
var headingClass = 'heading';
var cssFiles = ['ep_headings/static/css/editor.css'];

// All our tags are block elements, so we just return them.
var tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7'];
var aceRegisterBlockElements = function(){
  return tags;
}

// Bind the event handler to the toolbar buttons
var postAceInit = function(hook, context){
  var hs = $('.heading-selection');
  hs.on('change', function(){
    var value = $(this).val();
    var intValue = parseInt(value,10);
    if(!_.isNaN(intValue)){
      applyHeading(context, intValue);
    }
  })
  $('.ep_heading_n').click(function(){applyHeading(context,-1)});
  $('.ep_heading_h1').click(function(){applyHeading(context,0)});
  $('.ep_heading_h2').click(function(){applyHeading(context,1)});
  $('.ep_heading_h3').click(function(){applyHeading(context,2)});
  $('.ep_heading_h4').click(function(){applyHeading(context,3)});
  $('.ep_heading_h5').click(function(){applyHeading(context,4)});
  $('.ep_heading_h6').click(function(){applyHeading(context,5)});
  $('.ep_heading_m').click(function(){applyHeading(context,6)});
};


function applyHeading(context, heading){
  context.ace.callWithAce(function(ace){
    ace.ace_doInsertHeading(heading);
  },'insertheading' , true);
  $('.heading-selection').val("dummy");

  // give focus back to editor
  $('iframe[name="ace_outer"]').contents().find('iframe[name="ace_inner"]').contents().find("#innerdocbody").focus();
}

// Our heading attribute will result in a heaading:h1... :h6 class
function aceAttribsToClasses(hook, context){
  if(context.key == 'heading'){
    return ['heading:' + context.value ];
  }
}

// Here we convert the class heading:h1 into a tag
var aceDomLineProcessLineAttributes = function(name, context){
  var cls = context.cls;
  var domline = context.domline;
  var headingType = /(?:^| )heading:([A-Za-z0-9]*)/.exec(cls);
  var tagIndex;
  
  if (headingType) tagIndex = _.indexOf(tags, headingType[1]);
  
  if (tagIndex !== undefined && tagIndex >= 0){
    
    var tag = tags[tagIndex];
    var modifier = {
      preHtml: '<' + tag + '>',
      postHtml: '</' + tag + '>',
      processedMarker: true
    };
    return [modifier];
  }
  return [];
};

// Find out which lines are selected and assign them the heading attribute.
// Passing a level >= 0 will set a heading on the selected lines, level < 0 
// will remove it
function doInsertHeading(level){
  var rep = this.rep,
    documentAttributeManager = this.documentAttributeManager;
  if (!(rep.selStart && rep.selEnd) || (level >= 0 && tags[level] === undefined))
  {
    return;
  }
  
  var firstLine, lastLine;
  
  firstLine = rep.selStart[0];
  lastLine = Math.max(firstLine, rep.selEnd[0] - ((rep.selEnd[1] === 0) ? 1 : 0));
  _(_.range(firstLine, lastLine + 1)).each(function(i){
    if(level >= 0){
      documentAttributeManager.setAttributeOnLine(i, 'heading', tags[level]);
    }else{
      documentAttributeManager.removeAttributeOnLine(i, 'heading');
    }
  });
}


// Once ace is initialized, we set ace_doInsertHeading and bind it to the context
function aceInitialized(hook, context){
  var editorInfo = context.editorInfo;
  editorInfo.ace_doInsertHeading = _(doInsertHeading).bind(context);
}

function aceEditorCSS(){
  return cssFiles;
};

// Export all hooks
exports.aceRegisterBlockElements = aceRegisterBlockElements;
exports.aceInitialized = aceInitialized;
exports.postAceInit = postAceInit;
exports.aceDomLineProcessLineAttributes = aceDomLineProcessLineAttributes;
exports.aceAttribsToClasses = aceAttribsToClasses;
exports.aceEditorCSS = aceEditorCSS;
