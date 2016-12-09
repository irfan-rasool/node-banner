let orig = require('fs');
let fs = require('graceful-fs')
fs.gracefulify(orig);

let csv = require('fast-csv');
let request = require("request-promise");
let path = require('path');
let mkdirp = require('mkdirp');
let Promise = require("promise");

const csvData = [];

createPromise = new Promise( (resolve, reject) => {
  fs.createReadStream('./bannersImageUrls.csv').pipe(csv())
	.on('data',(data) => {
		if( data[0] && data[1] && data[2] ){
			csvData.push( { "advertiserId" : data[0], "websiteId" : data[1], "url" : data[2]} );
		}
		
	})
	.on("end", () => {
 		resolve( csvData );
	})
	.on("error", () => {
	 	reject();
	})
});

createPromise.then( ( files ) => {
    Promise.all( getAllFiles( files ) ).then( 
    	values => { 
		  console.log(values);
		}, 
		reason => {
		  console.log(reason);
		}
	); 

});

function getAllFiles(files) {
	const promises = [];

  	files.forEach( (file) => {
		let promise = new Promise( (resolve, reject) => {
			let filePath = "images/" + file.advertiserId + "/" + file.websiteId;
			let fileNameArray = file.url.split( "/" );
			let fileName = fileNameArray.filter( (n) => { return n != "" })[3]; 
            let extension = path.extname( fileName );
            
            if( extension === ".jpg" || extension === ".png" || extension === ".gif" || extension === ".jpeg" || extension === ".bmp" ){
            	fs.exists( filePath, ( err, exists ) => {
					if( err ){
						reject();
					}else if( !exists ){
						mkdirp( filePath, (err, res ) => {  
							if( err ){
								reject();
							}else{
								filePath = filePath + "/" + fileName;
								getFile( file.url, filePath, () => {
									resolve( file.name + ' is saved.');
								});
								
							    promises.push(promise);
							}
						});
					}else{
						resolve();
					}
				});
            }else{
            	resolve();
            }	
		    
	    });
    })
    return promises
}

function getFile(url, path, callback ) {
	request({
	    uri:url
	}).then((data) => {
		console.log( path );
	    let wstream = fs.createWriteStream(path);
	    wstream.write(data);
	    callback();
	})
	.catch(function (err) {
        callback();
    });
}




