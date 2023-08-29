var express = require('express');
var app = express();
app.use(express.static("public"));
var admin=request("firebase-admin");
var {getFirestore} =require('firebase-admin/firestore');
const serviceAccount = require('./key.json'); 
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = getFirestore();

app.get('/signup', function (req, res) { 
     res.sendFile(__dirname+ "/public/"+"signup.html")  ;
})  
app.get('/signup',function(req,res){
  db.collection('login').add(
    {
      Name:req.query.Name,
      Email:req.query.Email,
      Password:req.query.Password
    }).then(()=>{
      res.send("you have successfully signed up....")
    })
})
app.get('/login', function (req, res) { 
  res.sendFile(__dirname+ "/public/"+"login.html")  ;
}) 

app.get('/login',function(req,res){
  db.collection('login').where("Email","==", req.query.Email)
  .where("Password","==", req.query.Password)
  .get()
  .then((docs)=>{
    if(docs.size>0){
      res.send("Logged in successfully");
    }
    else{
      res.send("User not found");
    }
 })
})

app.listen(3000, function () {  
console.log('running')  
})