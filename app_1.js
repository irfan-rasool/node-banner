'use strict'

let orig          = require('fs')
  , fs            = require('graceful-fs')
  , sleep         = require('sleep')
  , csv           = require('fast-csv')
  , request       = require("request-promise")
  , path          = require('path')
  , mkdirp        = require('mkdirp')
  , Promise       = require("promise")
  , _             = require('lodash')
  , numberofFiles = 0
  , csvData       = [];

fs.gracefulify(orig);

let createPromise = new Promise((resolve, reject) => {
    fs.createReadStream('./bannersImageUrls1.csv').pipe(csv())
        .on('data', (data) => {
            if (data[0] && data[1] && data[2]) {
                csvData.push({ "advertiserId": data[0], "websiteId": data[1], "url": data[2] });
            }
        })
        .on("end", () => {
            resolve(csvData);
        })
        .on("error", () => {
            reject();
        })
});

createPromise
    .then((files) => {
        _.map(files, (item) => {
            getAllFiles(item)
                .then( (data) => {
                    console.log('item ', item, data);
                });
            numberofFiles % 30 === 0 ? sleep.sleep(10) : true;
        });
    });

function getAllFiles(file) {
    numberofFiles++;
    console.log(file, 'numberofFiles ==>', numberofFiles);
    return new Promise((resolve, reject) => {
        let filePath = "images/" + file.advertiserId + "/" + file.websiteId;
        let fileNameArray = file.url.split("/");
        let fileName = fileNameArray.filter((n) => {
            return n != ""
        })[3];
        let extension = path.extname(fileName);
        fs.exists(filePath, (err, exists) => {
            if (err) {
                reject();
            } else if (!exists) {
                mkdirp(filePath, (err, res) => {
                    if (err) {
                        reject();
                    } else {
                        filePath = filePath + "/" + fileName;
                        getFile(file.url, filePath, () => {
                            resolve(file.url + ' is saved.');
                        });

                    }
                });
            } else {
                resolve();
            }
        });

    });
}

function getFile(url, path, callback) {
    return new Promise((resolve, reject) => {
        request(url)
            .pipe(fs.createWriteStream(path))
            .on('close', () => {
                resolve(callback());
            });
    });
}
