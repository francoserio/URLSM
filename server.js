var http = require('http');
var express = require('express');
var validUrl = require('valid-url');
var favicon = require('serve-favicon');
var app = express();
var mongo = require('mongodb').MongoClient;
var JSON = {
	"originalUrl": "",
	"newUrl": ""
};

app.use(express.static('public'));

app.use(favicon(__dirname + '/favicon.ico'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/new/:url(*)', function(req, res) {
	console.log(req.params['url']);
	mongo.connect('mongodb://localhost:27017/webpages', function(err, db){
		if (err) {
			console.log("Error: " + err);
		} else {
			console.log(req.originalUrl);
			if (req.params['url'] != "favicon.ico") {
				var collection = db.collection('colwebpages');
				console.log(req.params['url']);
				if (validUrl.isUri(req.params['url'])) {
					collection.find({}).sort({"newUrl" : -1}).limit(1).toArray(function (error2, docs) {
						if (error2) {
							console.log(error2);
						} else {
							if (docs.length != 0) {
								console.log(docs[0]['newUrl']);
								var newUrlNumber = parseInt(docs[0]['newUrl']) + 1;
								var url = req.params['url'];				
								var webpage = {
									originalUrl: req.params['url'],
									newUrl: newUrlNumber
								};
								JSON['originalUrl'] = req.get('host') + "/" + req.params['url'];
								JSON['newUrl'] = req.get('host') + "/" + newUrlNumber.toString();
								collection.insert([webpage], function(error, result) {
									if (error) {
										console.log(error);
									} else {
										res.json(JSON);
									}
								});
							} else {
								//it is the first item inserted
								var newUrlNumber = 1;
								var webpage = {
									originalUrl: req.params['url'],
									newUrl: newUrlNumber
								};
								JSON['originalUrl'] = req.get('host') + "/" + req.params['url'];
								JSON['newUrl'] = req.get('host') + "/" + newUrlNumber.toString();
								collection.insert([webpage], function(error, result) {
									if (error) {
										console.log(error);
									} else {
										res.json(JSON);
									}
								});
							}
							db.close();				
						}
					});
					// console.log(max);
					// var aleatoryNumber =  Math.floor(Math.random() * 1000);				
				} else {
					res.send('It seems that you picked a non-valid URL');
				}
			}
		}
	});
});

app.get('/:url(\\d+$)', function (req, res) { 
	console.log("entre numero solo");
	mongo.connect('mongodb://localhost:27017/webpages', function(err, db) {
		if (err) {
			console.log(err);
		} else {
			console.log(req.params['url']);
			var collection = db.collection('colwebpages');
			collection.find( { newUrl: parseInt(req.params['url']) } ).toArray(function(error, docs) {
			    if (error) {
			    	console.log(error);
			    } else {
			    	console.log(docs);
			    	if (docs.length != 0) {		    		
			    		var urlRedirigir = docs[0]['originalUrl'].toString();
			    		console.log(urlRedirigir);
			    		res.redirect(urlRedirigir);
			    	} else {
			    		res.send('That page is not in our database');
			    	}
			    }
			});			
		}		
	});
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
})
