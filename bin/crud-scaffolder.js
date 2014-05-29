#!/usr/bin/env node

var pluralize = require('pluralize');
var modelGenerator = require('../lib/model-generator');

var args = process.argv.slice(2);
if(!args.length) {
    showUsage('To use, provide at least the model name.');
}

// Take the first arg as model name
var name = args.shift();
var pluralName = pluralize.plural(name);

console.log('Preparing data for model ', name + ', pluralized: ', pluralName + '.');

// Parse arguments to set types
var types = [];

// if we don't get any, just add a name field.
if(!args.length) {
    types.push({
        name: 'name',
        type: 'String'
    });
}

var allowedTypes = ['objectid', 'string', 'number', 'date', 'boolean', 'array']
// if we get arguments, generate from what we've got.
args.forEach(function(field) {
    var boundary = field.lastIndexOf(':'); // we support colons in field names. Who cares?
    var fieldName = field;
    var fieldType = 'string';
    if(boundary > -1) {
        fieldName = field.substr(0, boundary);
        fieldType = field.substr(boundary + 1);
    }
    if(!fieldName.length) {
        showUsage('Please set the correct name for the field ' + field);
    }
    if(!fieldType.length) {
        showUsage('Please set field type for field ' + fieldName);
    }
    if(allowedTypes.indexOf(fieldType.toLowerCase()) === -1) {
        showUsage('Property type ' + fieldType + ' not allowed for field ' + fieldName);
    }
    types.push({
        name: fieldName,
        type: capitalize(fieldType.toLowerCase())
    });

})

console.log('Fields: ', types);


function showUsage(err) {
    console.log('Mongoose CRUD Scaffolder version 0.1.0\r\n');
    if (err) {
        console.log('Error: ', err + '\r\n');
    }
    console.log('Example:\r\n    ' + process.argv[1].substr(process.argv[1].lastIndexOf('/') + 1) + ' user firstName lastName age:Number\r\n');
    console.log('Supported data types (case insensitive): ObjectId, String, Boolean, Number, Date, Array.');
    console.log('For detailed, see https://github.com/zladuric/mongoose-crud-scaffolder.');
    if(err) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}
function capitalize (str) {
    return str.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};