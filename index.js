var express 				= require("express");
var app						  = express();
var bodyParser 			= require("body-parser");
var dbRemark 				= require("./import");

app.set ("view engine", "ejs");
app.use (bodyParser.urlencoded({extended:true}));
app.use (express.static('public'));

//=============== GET from MongoDB ======================
app.get("/", function(req, r){ //GETting all remarks
  dbRemark.find().sort({_id: -1}).then(function(dbremarks){
    r.render("index", {remarks: dbremarks});
	});
});

//=============== Server ======================
app.listen(process.env.PORT, process.env.IP, function(){
  console.log('Server listening on port 3000'); 
});
