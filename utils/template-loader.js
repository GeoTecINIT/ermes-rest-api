var _ = require('underscore');
var fs = require('fs');
var path = require('path');

var templates = new Map();

function loadTemplate(kind, name) {
  return new Promise((resolve, reject) => {
    var template = templates.get(name);

    if (template) {
      return resolve(template);
    }
    fs.readFile(path.resolve('./templates/' + kind +'/'+ name + '.html'), 'utf8', (err, data) => {
      if (err) {
        return reject(err);
      }
      var template = _.template(data);
      templates.set(name, template);
      return resolve(template);
    });
  });
}

function compileSpecificTemplate(kind, name, params) {
  return loadTemplate(kind, name).then((template) => {
    return loadTemplate(kind, 'base').then((baseTemplate) => {
      return baseTemplate({template, params});
    });
  });
}

/*
  Kind-specific
 */

function compileMailTemplate(name, params) {
  return compileSpecificTemplate('email', name, params);
}

/*
  Exports
 */

module.exports = {
  loadTemplate,
  compileMailTemplate
};