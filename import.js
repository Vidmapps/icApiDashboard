var express 				= require("express");
var app						= express();
var Intercom 	            = require('intercom-client');
var bodyParser 			    = require("body-parser");
var mongoose 			    = require("mongoose");

app.set ("view engine", "ejs");
app.use (bodyParser.urlencoded({extended:true}));
app.use (express.static('public'));

  //=============== SCHEMA SETUP ======================
  var remarkSchema = new mongoose.Schema({
    name: String,
    remark: String,
    image_url: String,
  });

var dbRemark = mongoose.model("dbRemark", remarkSchema);
module.exports = mongoose.model("dbRemark", remarkSchema);

//=============== Tokens ======================
var client = new Intercom.Client({ 
    token: 'dG9rOmZjMTc1MDhhXzIwNTZfNDE3ZF9iOGM1XzczYjdmMzQ5Y2E1ZDoxOjA=' 
});

//=============== Remarks Importer ======================
//mongoose.connect("mongodb://localhost/ic_dashboard", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect("mongodb+srv://vidmantas:desrainis@cluster0-kzxsw.mongodb.net/test?retryWrites=true&w=majority", {
  useNewUrlParser: true, 
	useUnifiedTopology: true,
	useCreateIndex: true
}).then (() => {
    console.log("Connected to DB!");
    let myRemarks = [];
    let aux = function (res, currentPage) { 
        const promises = res.body.conversations.map((conversation, index) => {
          return new Promise((resolve) => {
            client.conversations.find({ id: conversation.id }, (response) => {
              if (response.body.conversation_rating.remark !== null && 
                response.body.conversation_rating.rating > 4) {
                console.log(response.body.conversation_rating.rating)
                const adminID = response.body.conversation_rating.teammate.id;
                client.admins.find(adminID, convs => {            
                  resolve({
                    name: convs.body.name,
                    remark: response.body.conversation_rating.remark,
                    image_url: convs.body.avatar.image_url,
                  });
                });
              } else {
                resolve(null);
              };
            });
          })
        });
        Promise.all(promises).then((remarks) => {
          let remarksToInsert = remarks.filter((remark) => remark !== null);
          if (remarksToInsert.length > 0) {
            remarksToInsert.forEach((remark) => {
              dbRemark.findOne(remark, '_id', { lean: true }, function (err, foundRemark) {
                console.log(err);
                console.log(foundRemark);
                if (foundRemark === null) {
                  dbRemark.create(remark, function(err) {
                    if(err){
                      console.log("Erroras");
                      console.log(err);
                    } else {
                      console.log("Created");
                    }
                  });
                }
              });
            });
          }
          myRemarks.push(...remarksToInsert);
          if (myRemarks.length < 8 && currentPage < 40 ) {
            client.nextPage(res.body.pages, (newRes) => {
              aux(newRes, currentPage); 
              console.log(res.body.pages)
            }); 
          } else {
            console.log("Finished");
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
}).catch(err => {
	console.log('ERROR:', err.message);
});



