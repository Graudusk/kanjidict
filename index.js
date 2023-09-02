import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import https from "https";
import { v4 as uuidv4 } from "uuid";

import fs, { read } from "fs";
dotenv.config();

const URL = "https://play.ht/api/v1";
const ALLOWED_GRADES = ["1", "2", "3"];

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const parseCharacter = (character, verbose = false) => {
  let newCharacter = { ...character };

  newCharacter.meaning = character?.reading_meaning?.rmgroup?.meaning?.filter(
    (meaning) => {
      return typeof meaning === "string";
    }
  );

  newCharacter.reading = character?.reading_meaning?.rmgroup?.reading
    ?.filter((reading) => ["ja_on", "ja_kun"].includes(reading.r_type))
    .map((reading) => ({
      r_type: reading.r_type,
      text: reading.$t
        .replaceAll(".", "")
        .replaceAll("-", "")
        .replaceAll("―", "")
        .replaceAll("ー", ""),
    }));

  if (!verbose) {
    delete newCharacter.reading_meaning;
    delete newCharacter.query_code;
    delete newCharacter.dic_number;
    delete newCharacter.codepoint;
  }

  newCharacter.radical = Array.isArray(newCharacter.radical?.rad_value)
    ? newCharacter.radical?.rad_value?.map((rad_value) => rad_value.rad_type)
    : [newCharacter.radical?.rad_value?.rad_type];

  console.log(newCharacter);

  return newCharacter;
};

const port = process.env.PORT || 8080;

const app = express();
app.use(
  cors({
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Headers",
    ],
  })
);
app.use(express.urlencoded({ extended: false }));
app.set("trust proxy", true);
app.use(express.json());
app.use(express.static("audiofiles"));

app.get("/dictionary", async (req, res) => {
  const dict = fs.readFileSync("./db/kanjidic2.json");
  const json = JSON.parse(dict);

  return res.json(json);
});

const generateLiteralHash = (literal) => {
  var crypto = require("crypto");
  var hash = crypto.createHash("md5").update(literal).digest("hex");

  return hash;
};

const findLocalFile = async (text) => {
  const hash = generateLiteralHash(text);
  const fileDirectory = fs.readFileSync("audioFiles/directory.json", "utf8");
  const parsedData = JSON.parse(fileDirectory);
  const searchEntry = parsedData.entries.find((entry) => entry.hash === hash);

  if (searchEntry) {
    return searchEntry.path;
  }

  return null;
};

app.get("/generateAudioFiles", async (req, res) => {
  const dict = fs.readFileSync("./db/readings.json");
  const readings = await JSON.parse(dict);

  for (const reading of readings) {
    const { literal, text, r_type } = reading;
    const localFile = await findLocalFile(literal);

    console.log(localFile);

    if (localFile) {
      console.log('Local file found, skipping download...');
      // return res.send(localFile);
      continue;
    }

    const resp = await generateAudio(text);

    if (resp.status === "CREATED") {
      const audioFile = await pollForAudioFile(resp.transcriptionId);
      const localAudioFile = await downloadFile(
        audioFile.audioUrl,
        literal,
        text
      );

      return res.send(localAudioFile);
    }
  }
  res.json();
});

app.post("/generateAudio", async (req, res) => {
  const { literal, text } = req.body;
  const localFile = await findLocalFile(literal);

  if (localFile) {
    return res.send(localFile);
  }

  const resp = await generateAudio(text);

  if (resp.status === "CREATED") {
    const audioFile = await pollForAudioFile(resp.transcriptionId);
    const localAudioFile = await downloadFile(
      audioFile.audioUrl,
      literal,
      text
    );

    return res.send(localAudioFile);
  }
  return res.json(resp);
});

const generateAudio = async (text) => {
  console.log('Creating audio file for ${}')
  const data = {
    content: [text],
    voice: "Mizuki",
    globalSpeed: "75%",
  };
  const response = await fetch(URL + "/convert", {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    headers: {
      AUTHORIZATION: "Bearer 9f623c00a2964b2bbc943be7ff7f9967",
      "X-USER-ID": "CBBcGmkPfrhZWXPUjCofravDRvr2",
      accept: "text/event-stream",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
};

const saveFile = (text, filePath) => {
  const fileDirectory = fs.readFileSync("audioFiles/directory.json", "utf8");
  const parsedData = JSON.parse(fileDirectory);

  parsedData.entries.push({
    hash: generateLiteralHash(text),
    path: filePath,
    text,
  });

  fs.writeFileSync(
    "audioFiles/directory.json",
    JSON.stringify(parsedData, null, 2)
  );
};

const downloadFile = (url, text) => {
  console.log("Download started");
  console.log({ filePath });

  return new Promise((resolve, reject) => {
    const filePath = uuidv4() + "_.mp3";
    const file = fs.createWriteStream("audioFiles/" + filePath);
    const request = https.get(url, function (response) {
      response.pipe(file);

      file.on("finish", async () => {
        file.close();

        saveFile(text, filePath);

        console.log("Download Completed");

        resolve(filePath);
      });
    });
  });
};

const pollForAudioFile = (transcriptionId) => {
  let timer;
  const data = {
    transcriptionId,
  };

  return new Promise((resolve, reject) => {
    let inFlight = false;

    timer = setInterval(async () => {
      if (!inFlight) {
        inFlight = true;

        const response = await fetch(
          URL + "/articleStatus?" + new URLSearchParams(data),
          {
            headers: {
              AUTHORIZATION: "Bearer 9f623c00a2964b2bbc943be7ff7f9967",
              "X-USER-ID": "CBBcGmkPfrhZWXPUjCofravDRvr2",
              accept: "text/event-stream",
              "Content-Type": "application/json",
            },
          }
        );
        const jsonData = await response.json();

        inFlight = false;

        if (jsonData.converted) {
          clearInterval(timer);
          resolve(jsonData);
        }
      }
    }, 500);
  });
};

app.get("/randomCharacter", async (req, res) => {
  const dict = fs.readFileSync("./db/kanjidic2.json");
  const json = await JSON.parse(dict);
  const characters = json.kanjidic2.character.filter((character) => {
    return ALLOWED_GRADES.includes(character.misc.grade);
  });
  const character = characters[Math.floor(characters.length * Math.random())];

  return res.json(parseCharacter(character));
});

app.get("/fourRandomCharacters", async (req, res) => {
  const randomCharacters = [];
  const dict = fs.readFileSync("./db/kanjidic2.json");
  const json = await JSON.parse(dict);
  const characters = shuffle(
    json.kanjidic2.character.filter((character) => {
      return ALLOWED_GRADES.includes(character.misc.grade);
    })
  );

  for (let i = 0; i < 4; i++) {
    randomCharacters.push(parseCharacter(characters.pop()));
  }

  return res.json(randomCharacters);
});

const server = app.listen(port, process.env.HOST, function () {
  const host = server.address().address;
  const port = server.address().port;

  console.log("Web server listening at port %s", host, port);
});

export default server;
