var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var CONTACTS_COLLECTION = "contacts";

var app = express();
app.use(bodyParser.json());

var distDir=__dirname+"/dist/mean-contactlist-angular/";
app.use(express.static(distDir));

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/practica1", function (err, client) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = client.db();
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 3000, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// CONTACTS API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
  }
  
  /*  "/api/contacts"
   *    GET: finds all contacts
   *    POST: creates a new contact
   */
  
  app.get("/api/contacts", function(req, res) {
    db.collection(CONTACTS_COLLECTION).find({}).toArray(function(err, docs){
        if (err){
            handleError(res, err.message, "Fallo obteniendo los documentos");
        }
        else
        {
            res.status(200).json(docs);
        }
    })
  });
  
  app.post("/api/contacts", function(req, res) {
      var newConctac=req.body;
      newConctac.createDate= new Date();

      if (!req.body.name){
          handleError(res, "Usuario invalido", "debes enviar un nombre", 400);
      }
      else{
          db.collection(CONTACTS_COLLECTION).insertOne(newConctac, function(err, doc){
              if (err){
                  handleError(res, err.message, "Falla al crear el nuevo contacto");
              }
              else{
                  res.status(201).json(doc.ops[0]);
              }
          })
      }
  });
  
  /*  "/api/contacts/:id"
   *    GET: find contact by id
   *    PUT: update contact by id
   *    DELETE: deletes contact by id
   */
  
  app.get("/api/contacts/:id", function(req, res) {
      db.collection(CONTACTS_COLLECTION).findOne({ _id:new ObjectID(req.params.id )}, function (err, doc){
          if (err){
              handleError(res, err.message, 'Fallo al obtener el contacto');
          }
          else{
              res.status(200).json(doc);
          }
      });
  });
  
  app.put("/api/contacts/:id", function(req, res) {
      var updateDoc=req.body;
      delete updateDoc._id;
      var newvalues = { $set: updateDoc };
      db.collection(CONTACTS_COLLECTION).updateOne({ _id: new ObjectID(req.params.id)}, newvalues, function(err, doc){
          if (err){
            handleError(res, err.message, err.message);
          }
          else
          {
            updateDoc._id=req.params.id;
            res.status(200).json(updateDoc);    
          }
      });
  });
  
  app.delete("/api/contacts/:id", function(req, res) {
      db.collection(CONTACTS_COLLECTION).deleteOne({_id:new ObjectID(req.params.id)}, function(err, result){
        if (err){
            handleError(res, err.message, "Falló al borrar");
        }
        else{
            res.status(200).json(req.params.id);
        }
      });
  });
