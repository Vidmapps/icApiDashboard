var express 				= require("express");
var app						  = express();
var Intercom 	      = require('intercom-client');
var bodyParser 			= require("body-parser");
var $               = require('jquery');
var mongoose 			  = require("mongoose");

//var dbRemark 							= require("./models/model");


//===============DATABASE CONFIG======================
//mongoose.connect("mongodb://localhost/ic_dashboard", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect("mongodb+srv://vidmantas:desrainis@cluster0-kzxsw.mongodb.net/test?retryWrites=true&w=majority", {
  useNewUrlParser: true, 
	useUnifiedTopology: true,
	useCreateIndex: true
}).then (() => {
	console.log("Connectect to DB!");
}).catch(err => {
	console.log('ERROR:', err.message);
});


//===============SCHEMA SETUP======================
var remarkSchema = new mongoose.Schema({
    name: String,
    remark: String,
    image_url: String,
  });

var dbRemark = mongoose.model("dbRemark", remarkSchema);
module.exports = mongoose.model("dbRemark", remarkSchema);
//===============DATABASE CONFIG======================

app.set ("view engine", "ejs");
app.use (bodyParser.urlencoded({extended:true}));
app.use (express.static('public'));


//======== TOKENS ========//
var client = new Intercom.Client({ 
    token: 'dG9rOmZjMTc1MDhhXzIwNTZfNDE3ZF9iOGM1XzczYjdmMzQ5Y2E1ZDoxOjA=' 
}); 
//======== TOKENS ========//

/*
///////////// WORKING Photo and name Finder ////////////////
app.get("/", function(req, res){
    client.conversations.find({ 
		id: '24937987100' }, convs => {
    const adminID = {tmid: convs.body.conversation_rating.teammate.id, full: convs.body};
    //const adminIds = JSON.stringify(convs)
	    client.admins.find(adminID.tmid, convs => {
        const adminPhoto = convs.body.avatar.image_url
        const adminName = JSON.stringify(convs.body.name)
        //console.log(adminIds);
       res.render("index", { adminPhoto: adminPhoto, adminName: adminName });
        });
    });
  });
///////////// WORKING Photo and name Finder ////////////////
*/

//======== Create MongoDB ========//
function addToMongoDB(){
  dbRemark.create({
    name: convs.body.name,
    remark: response.body.conversation_rating.remark,
    image_url: convs.body.avatar.image_url 
  }, function(err, dbremarks){
    if(err){
      console.log("Erroras");
      console.log(err);
    } else {
      console.log("Created");
    }
  });
};
//======== Create MongoDB ========//

//======== Find MongoDB ========//
function findMongoDB(){
  dbRemark.find({}, function(err, dbremarks){
    if(err){
      console.log("Erroras");
      console.log(err);
    } else {
      console.log(dbremarks);
    }
  });
};
//======== Find MongoDB ========//

 let myRemarks = [];


///======== REMARKS FUNCTION ========//
app.get("/", function(req, r){
  let aux = function (res, currentPage) { 
    const promises = res.body.conversations.map((conversation, index) => {
      return new Promise((resolve) => {
        client.conversations.find({ id: conversation.id }, (response) => {
          if (response.body.conversation_rating.remark !== null && response.body.conversation_rating.rating > 4) {
            console.log(response.body.conversation_rating.rating)
            const adminID = response.body.conversation_rating.teammate.id;
            client.admins.find(adminID, convs => {
              resolve({ name: convs.body.name, remark: response.body.conversation_rating.remark, image_url: convs.body.avatar.image_url });
/* //======== Create MongoDB ========//              
              dbRemark.create({
                name: convs.body.name,
                remark: response.body.conversation_rating.remark,
                image_url: convs.body.avatar.image_url 
              }, function(err, dbremarks){
                if(err){
                  console.log("Erroras");
                  console.log(err);
                } else {
                  console.log("Created");
                }
              });
//======== Create MongoDB ========// */
            });
          } else {
            resolve(null);
          };
        });
      })
    });
    Promise.all(promises).then((remarks) => {
      myRemarks.unshift(...remarks.filter((remark) => remark !== null));
      if (myRemarks.length < 8 && currentPage < 20 ) {
        client.nextPage(res.body.pages, (newRes) => {
          aux(newRes, currentPage); 

        }); 
      } else {
        r.render("index", { remarks: myRemarks });

        //======== Find MongoDB ========//
        //findMongoDB()
        //======== Find MongoDB ========//
      }
    });
  };

client.conversations.list({ 
      order: "desc",
      sort: "created_at",
      open: false,
    }, (response) => {
    aux(response, 0);
  });
}); 

/* app.get("/", function(req, r){ //GETting all remarks
  dbRemark.find({}, function(err, dbremarks){
		if(err){
			console.log("Erroras");
			console.log(err);
		} else {
			r.render("index", {remarks: dbremarks});
		}
	});
}); */


//IMPORTANT
app.listen(process.env.PORT, process.env.IP, function(){
  console.log('Server listening on port 3000'); 
});
//IMPORTANT

