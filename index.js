const express = require('express');
const cors = require('cors')
const app = express()
const port = 4200;
const MongoClient = require('mongodb').MongoClient;
const admin = require('firebase-admin');
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.q83cw.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;  
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

require('dotenv').config();
app.use(cors());
app.use(express.json());


app.use(express.urlencoded({extended: false}));
app.get('/', (req, res) => {
  res.send('Hello World!')
})

const serviceAccount = require('./config/burj-alarab-auth-firebase-adminsdk-d4t59-9e2a06edb8.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



 
client.connect(err => {
  const collection = client.db("burjAlArab").collection("bookings");

app.post("/addBooking", (req, res)=> {
    const newBooking = req.body;
    collection.insertOne(newBooking)
    .then(result => console.log(result)) 
})


//ID Verification 
app.get("/bookings",(req,res)=>{
    const barear = req.headers.authorization;

    if(barear && barear.startsWith('Barear ')){
        const idToken = barear.split(' ')[1];
        admin.auth().verifyIdToken(idToken)
    .then(function (decodedToken){
        const tokenEmail = decodedToken.email;
        const queryEmail = req.query.email;
        console.log(tokenEmail, queryEmail)
        if(tokenEmail == queryEmail ){
            collection.find({email: req.query.email }).toArray((err, documents) => {
                res.send(documents)
            })
        }
        else{
            res.status(401).send("Un-authorized Access!!")
        }
        
    })
    }
    else{
        res.status(401).send("Un-authorized Access!!")
    }

    
})

  // perform actions on the collection object
  console.log("server ready")
});

app.listen(port)