// const {xml2json}  = require('xml-js');
// const xml = require('db/kanjidic2.xml')

fs = require('fs');
var parser = require('xml2json');
let dict = []

fs.readFile( './db/kanjidic2.xml', function(err, data) {
    // console.log(data)
// const json = xml2json(data);
    var json = JSON.parse(parser.toJson(data));

    console.log("to json ->", json);
    fs.writeFileSync('./db/kanjidic2.json', JSON.stringify(json, null, 2))
    // throw Error()
 });
