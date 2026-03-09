const fs = require("fs");
var parser = require("xml2json");
let dict = [];

fs.readFile("./db/kanjidic2.xml", function (err, data) {
  var json = JSON.parse(parser.toJson(data));

  console.log("to json ->", json);
  fs.writeFileSync("./db/kanjidic2.json", JSON.stringify(json, null, 2));
  // throw Error()
});
