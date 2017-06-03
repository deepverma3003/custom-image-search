const express = require('express');
const pg = require('pg');
var datetime = require('node-datetime');
var https = require('https');
var request = require('request');
var querystring = require('querystring');

var app = express();

const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/urls';
var result = [];

app.get('/api/imagesearch/:query', function(req, res){
	var query = req.params.query;
	const size = req.params.offset || 10;
	var currentTime = datetime.create().format('m/d/y H:M');
	console.log("query: "+query);
	console.log("size: "+size);
	console.log(currentTime);
	console.log(process.env.IMGUR_API_KEY);

	pg.connect( connectionString, function(err, client, done){
		if(err){
			done();
			console.log("error");
			console.log(err);
			return;
		}
		console.log("connection successful");
		var data = client.query('insert into image_search(query, created_at) values($1, $2)',[query, currentTime]);

		data.on('end', function(){
			done();
		});
	});

	var options = {
		url: "https://api.imgur.com/3/gallery/search/?q=" + querystring.escape(query) +'&offset='+ size,
		headers: {"Authorization": 'Client-ID ' + process.env.IMGUR_API_KEY }
	}

	function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);

            res.send(info.data.map(makeList));

        }
    }

    function makeList(img){
    	return {
    		"title" : img.title,
    		"link" : img.link
    	};
    }

    request(options, callback);

});

app.get('/api/latest/imagesearch', function(req, res){
	pg.connect( connectionString, function(err, client, done){
		if(err){
			done();
			console.log("error");
			console.log(err);
			return;
		}
		console.log("connection successful");
		var data = client.query('select * from image_search limit 10');

		data.on('row', function(row){
			result.push(row);
		});

		data.on('end', function(){
			done();
			return res.send(result);
		});
	});

});

var port = 3000 || 8080;

  app.listen(port, function() {
    console.log('Node.js listening on port ' + port);
  });
