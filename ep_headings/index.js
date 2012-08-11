var eejs = require('ep_etherpad-lite/node/eejs/');
var Changeset = require("ep_etherpad-lite/static/js/Changeset");
exports.eejsBlock_editbarMenuLeft = function (hook_name, args, cb) {
    args.content = args.content + eejs.require("ep_headings/templates/editbarButtons.ejs");
    return cb();
}

function getFontSize(header) {
    var fontSize = "2.0";
    switch (header) {
    case "h1":
        fontSize = "2.0";
        break;
    case "h2":
        fontSize = "1.5";
        break;
    case "h3":
        fontSize = "1.17";
        break;
    case "h4":
        fontSize = "";
        break;
    case "h5":
        fontSize = "0.83";
        break;
    case "h6":
        fontSize = "0.75";
        break;
    }
    return fontSize;
}
// line, apool,attribLine,text
exports.getLineHTMLForExport = function (hook, context) {
    var header = _analyzeLine(context.attribLine, context.apool);
    if (header) {
        var fontSize = getFontSize(header);
        return "<" + header + " style=\"font-size: " + fontSize + "em;line-height: 0.5em;\">" + context.text.substring(1) + "</" + header + ">";
    }
}

function _analyzeLine(alineAttrs, apool) {
    var header = null;
    if (alineAttrs) {
        var opIter = Changeset.opIterator(alineAttrs);
        if (opIter.hasNext()) {
            var op = opIter.next();
            header = Changeset.opAttributeValue(op, 'heading', apool);
        }
    }
    return header;
}
