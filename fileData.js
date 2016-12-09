
var request = require("request");
var promise  = require("promise");
let fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
let Promise = require("promise");

exports.getAllFiles = function(files) {
	const promises = [];

  	files.forEach( (file) => {
		let promise = new Promise( (resolve, reject) => {
			var filePath = "../images/" + file.advertiserId + "/" + file.websiteId;
			console.log( filePath );

			fs.exists( filePath, ( err, exists ) => {
				if( err ){
					reject();
				}else if( !exists ){
					mkdirp( filePath, (err, res ) => {  
						if( err ){
							reject();
						}else{
							var fileNameArray = file.url.split( "/" );
							fileName = fileNameArray.filter( (n) => { return n != "" })[2]; 

							filePath = filePath + "/" + fileName;

							getFile(file.url, filePath , () => {
						  	    resolve(file.name + ' is saved.');
						    });
						    promises.push(promise);
						}
					});
				}
			});
		    
	    });
    })
    return promises
}

function getFile(url, path, callback) {
  request({uri: 'http:'+url})
    .pipe(fs.createWriteStream(path))
      .on('close', () => {
        	callback();
      });
 }
