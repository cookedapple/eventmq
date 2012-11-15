(function() {
  var VERSION, config, configPath, emptyHeaders, endHeaders, endParams, endpoint, flush, fs, http, log, pixel, pixelHeaders, querystring, record, serialize, server, store, url;
  var __hasProp = Object.prototype.hasOwnProperty;
  fs = require('fs');
  url = require('url');
  http = require('http');
  querystring = require('querystring');
  var connect = require('connect');
  mongo = require('mongodb');
  cmnfs = require('./functions.js')
  Server = mongo.Server,
  Db = mongo.Db;
  var db;

var generate_mongo_url = function(obj){
  obj.hostname = (obj.mongohost || 'ds037637.mongolab.com');
  obj.port = (obj.mongoport || 37637);
  obj.db = (obj.mongodb || 'evetmq');

  if(obj.mongouser && obj.mongopwd) {
    return "mongodb://" + obj.mongouser + ":" + obj.mongopwd + "@" + obj.mongohost+ ":" + obj.mongoport + "/" + obj.mongodb;
  }
  else{
    return "mongodb://" + obj.mongohost + ":" + obj.mongoport + "/" + obj.mongodb;
  }
}




  VERSION = '0.1.0';
  store = [];
  record = function(params) {
    var keyname;
    if (!(keyname = params.query == null ? undefined : params.query.key)) {
      return null;
    }

//	store[key] || (store[key] = 1);
//console.info(keyname);
//	console.info(JSON.stringify(store));
    return store.push({key: keyname});
  };
  serialize = function() {
    var data;
    data = {
      json: JSON.stringify(store)
    };
    store = [];
    if (config.secret) {
      data.secret = config.secret;
    }
    data.website = config.website || 'localhost'; 
    return querystring.stringify(data);
  };
  flush = function() {
    var data, request;
    log(store);
    if (!(config.endpoint)) {
		 data = serialize();
      return null;
    }
    data = serialize();
    endHeaders['Content-Length'] = data.length;
    request = endpoint.request('POST', endParams.pathname, endHeaders);
    request.write(data);
    request.end();
    return request.on('response', function(response) {
      return console.info('--- flushed ---');
    });
  };
  log = function(hash) {
    var _a, _b, hits, key;
    _a = []; _b = hash;
    for (i =0; i < hash.length; i++) {
//      if (!__hasProp.call(_b, key)) continue;
//      hits = _b[key];
		 hits = 1;
      _a.push(console.info("" + (hits) + ":\t" + (hash[i].key)));
	  db.collection('eventhits',function (err,collection) {
		  //console.info(cmnfs.toDecode64(hash[i].key));
				  collection.insert({
					  "host": "localhost",
					  "key": cmnfs.toDecode64(hash[i].key),
					  "hits": hits
				  }, {safe:true}, function(err, result) {
						  if(err) {
							console.info("Error while adding record to db, reason:" + err);
						  } else {
							  console.info("Record added to db");
						  }
				}); // end insert
	  });
    }    return _a;
  };
  server = http.createServer(function(req, res) {
    var params;
	var requrl = req.url;
//	console.info(requrl);
	if(requrl.indexOf('+') != -1) {
		requrl = cmnfs.encodeUrl('+','%2B',requrl);
		//requrl = cmnfs.encodeUrl(requrl);
	}
	//console.info(requrl);
    params = url.parse(requrl, true);
	//console.info(params);
    if (params.pathname === '/pixel.gif') {
      res.writeHead(200, pixelHeaders);
      res.end(pixel);
      record(params);
    } else {
      res.writeHead(404, emptyHeaders);
      res.end('');
    }
    return null;
  });
  configPath = process.argv[2];
  if (('-v' === configPath || '-version' === configPath || '--version' === configPath)) {
    console.log("EventTracker version " + (VERSION));
    process.exit(0);
  }
  if (!configPath || (('-h' === configPath || '-help' === configPath || '--help' === configPath))) {
    console.error("Usage: eventmq config.json");
    process.exit(0);
  }
  config = JSON.parse(fs.readFileSync(configPath).toString());
//  pixel = fs.readFileSync('pixel.gif');
  pixel = "R0lGODlhAQABAIABAP///wAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
  pixelHeaders = {
    'Cache-Control': 'private, no-cache, proxy-revalidate',
    'Content-Type': 'image/gif',
    'Content-Disposition': 'inline',
    'Content-Length': pixel.length
  };
  emptyHeaders = {
    'Content-Type': 'text/html',
    'Content-Length': '0'
  };
  if (config.endpoint) {
    console.info("Flushing hits to " + (config.endpoint));
    endParams = url.parse(config.endpoint);
    endpoint = http.createClient(endParams.port || 80, endParams.hostname);
    endHeaders = {
      'host': endParams.host,
      'Content-Type': 'application/x-www-form-urlencoded'
    };
  } else {
    //console.warn("No endpoint set. Hits won't be flushed, add \"endpoint\" to " + (configPath) + ".");
  }
  process.on('SIGUSR1', function() {
    console.log('Got SIGUSR1. Forcing a flush:');
    return flush();
  });
  process.on('uncaughtException', function(err) {
    return console.error("Uncaught Exception: " + (err));
  });
  var port = process.env.PORT || config.port;
  server.listen(port, function(){console.log("Node server listening on " + port);});
  setInterval(flush, config.interval * 1000);


  //  var server = new Server('localhost', 27017, {auto_reconnect: true});
/*  var server = new Server(config.mongohost, config.mongoport, {});
  db = new Db(config.mongodb, server);
  db.authenticate(config.mongouser, config.mongopwd);

  db.open(function(err, db) {
	if(!err) {
		console.log("We are connected to mongodb");
	}
  });
*/

var mongourl = generate_mongo_url(config);

//console.info("mongourl:" + mongourl);

  //  var server = new Server('localhost', 27017, {auto_reconnect: true});
//  var server = new Server('ds037637.mongolab.com', 37637, {auto_reconnect: false});
  //db = new Db('eventmq', server);

/*
  var server = new Server(config.mongohost, config.mongoport, {auto_reconnect: true});
  db = new Db(config.mongodb, server);
  console.info('db client created... opening connection....');
  db.open(function(err, db) {
	if(!err) {
		console.log("We are connected to mongodb");
		console.info('connection opened.... authenticating....');
		//db.authenticate('eventmq', 'eVentmQ', function(err,result){
			db.authenticate(config.mongouser, config.mongopwd, function(err,result){
				if(err) {
					console.info("Error while authenticating mongodb, reason:" + err);
				}
				if(result) {
					console.info("mongodb authenticated.. creating eventhits collection in db.... ");
						db.createCollection('eventhits',function (err,collection) {
							if(err) {
								console.log("Error while creating collection eventhits, reason: " + err);
							} else {
								console.log("Created collection 'eventhits' in db");
							}
					});
				}
		});
	}
  });
  */
console.log("Connecting to  db '" + config.mongodb + "'");

mongo.connect(mongourl, {}, function(error, db1) {
	console.log("Connected to '" + config.mongodb + "' database... ");
	db = db1;

	db.addListener("error", function(error) {
		console.log("Error connecting to MongoLab");
	});
});

/*
	var base64 = cmnfs.toStrToBase64("Hello World");
	console.log(base64);
	console.log(cmnfs.toBase64ToStr(base64));
*/

})();
