'use strict';

var fs = require('fs');
var utils = require('./utils');

// writes down file content.
function createIndexFileContent(fd, name, pluralName, types, cb) {
  var TAB = '    ';
  var NL = '\r\n';

  var text = 'extends ../layout' + NL + NL + 'block content' + NL + NL +
    TAB + 'h2 ' + utils.capitalize(pluralName.toLowerCase()) + NL +
    TAB + 'p View ' + pluralName + ' or ' + NL +
    TAB + TAB + 'a(href="/' + pluralName + '/edit") Add a ' + name + NL + NL +
    TAB + 'table' + NL +
    TAB + TAB + 'tr' + NL;

  for (var i = 0; i < types.length; i++) {
    var current = types[i];
    var line = TAB + TAB + TAB + 'td ';
    line = line + utils.capitalize(current.name.toLowerCase());
    line = line + NL;
    text = text + line;
  }
  text = text +
    TAB + TAB + TAB + 'td Actions' + NL +
    TAB + TAB + 'each ' + name + ' in ' + pluralName + NL +
    TAB + TAB + TAB + 'tr' + NL;

  for (var i = 0; i < types.length; i++) {
    var current = types[i];
    var line = TAB + TAB + TAB + TAB +
      'td #{' + name + '.' + current.name + '}' + NL;
    text = text + line;
  };

  text = text + TAB + TAB + TAB + TAB + 'td' + NL +
    // helpers not working smoothly in many enviroments, use it later
    //TAB + TAB + TAB + TAB + TAB + '<%= link_to(\'Edit\', \'' + pluralName + '/\'+' + pluralName + '[i]._id) %>' + NL +
    TAB + TAB + TAB + TAB + TAB + 'a(href="' + pluralName + '/\" + ' + name + '._id) Edit' + NL;

  var buf = new Buffer(text);
  fs.write(fd, buf, 0, buf.length, null, cb);
}

function createFormFileContent(fd, name, pluralName, types, cb) {
  var TAB = '    ';
  var NL = '\r\n';

  var text = 'extends ../layout' + NL + NL + 'block content' + NL + NL +
    TAB + 'h2 ' + utils.capitalize(name) + ' form' + NL +
    TAB + 'if ' + name + NL +
    TAB + TAB + 'p Edit ' + name + NL +
    TAB + TAB + '- var ' + name + 'passed = true' + NL +
    TAB + 'else' + NL +
    TAB + TAB + '- var ' + name + 'passed = false' + NL + NL +
    TAB + 'if ' + name + NL +
    TAB + TAB + '- var myAction = "/' + pluralName + '/" + ' + name + '._id + "?_method=PUT"' + NL +
    TAB + 'else' + NL +
    TAB + TAB + '- var myAction = "/' + pluralName + '"' + NL +
    TAB + TAB + '- ' + name + ' = {}' + NL +
    TAB + 'form(name="' + name + 'form", method="post", action=myAction)' + NL +
    TAB + TAB + 'table' + NL;

  for (var i = 0; i < types.length; i++) {
    var current = types[i];
    var line = '';
    line = line + TAB + TAB + TAB + 'tr' + NL +
    TAB + TAB + TAB + TAB + 'td ' + utils.capitalize(current.name) + NL +
      TAB + TAB + TAB + TAB + TAB + 'input(type="text", name="' + current.name +
      '", value=' + name + '.' + current.name + ')' + NL;
    text = text + line;
  };

  text = text + TAB + TAB + TAB + 'tr' + NL + 
    TAB + TAB + TAB + TAB + 'td' + NL +
    TAB + TAB + TAB + TAB + TAB + 'input(type="submit", value="Save")' + NL + NL +
    TAB + 'if ' + name + 'passed' + NL +
    TAB + TAB + 'form(method="post", action="/' + pluralName + '/" + ' + name + '._id + "?_method=DELETE")' + NL +
    TAB + TAB + TAB + 'input(type="submit", value="Delete")' + NL;

  var buf = new Buffer(text);
  fs.write(fd, buf, 0, buf.length, null, cb);
}

function generateViews(name, pluralName, types, cb) {
  utils.generateDirectory('views', function(err) {
    if (err) {
      return cb(err);
    }
    utils.generateDirectory('views/' + pluralName, function(er) {
      if (err) {
        return cb(err);
      }
      var indexName = 'views/' + pluralName + '/index.pug';
      utils.createOrClearFile(indexName, function(err, fd) {
        if (err) {
          return cb(err);
        }
        createIndexFileContent(fd, name, pluralName, types, function(err, data) {
          if (err) {
            return (cb(err));
          }
          fs.close(fd, function(err) {
            if (err) {
              return cb(err);
            }
            var formName = 'views/' + pluralName + '/edit.pug';
            utils.createOrClearFile(formName, function(err, fd) {
              createFormFileContent(fd, name, pluralName, types, function(err) {
                if (err) {
                  return cb(err);
                }
                fs.close(fd, cb);
              });
            });
          });
        });
      });
    });
  });
}

module.exports = {
  generateViews: generateViews
};
