const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();

const port = process.env.PORT || 5001;


// Middleware

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());



// Test Route

app.get("/", (req, res) => {
  res.send("StudyNook Server Running");
});




// MongoDB Connection

const uri = process.env.MONGO_URI;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});




async function run() {

  try {

    await client.connect();

    console.log("MongoDB Connected Successfully");


    const database = client.db("StudyNook");


    const usersCollection = database.collection("users");

    const bookingsCollection = database.collection("bookings");





    // ==========================
    // Register User
    // ==========================

    app.post("/users", async (req, res) => {

      try {

        const user = req.body;

        console.log("New User:", user);


        const result = await usersCollection.insertOne(user);


        res.send(result);


      } catch(error) {

        console.log(error);


        res.status(500).send({
          message: "Failed to save user"
        });

      }

    });







    // ==========================
    // Login User
    // ==========================

    app.post("/login", async (req,res)=>{

      try {

        const { email, password } = req.body;


        const user = await usersCollection.findOne({
          email,
          password
        });



        if(!user){

          return res.status(401).send({

            success:false,

            message:"Invalid Email or Password"

          });

        }



        res.send({

          success:true,

          message:"Login Successful",

          user

        });



      } catch(error){

        console.log(error);


        res.status(500).send({

          success:false,

          message:"Login Failed"

        });

      }

    });








    // ==========================
    // Save Booking
    // ==========================

    app.post("/bookings", async(req,res)=>{

      try{

        const booking = req.body;


        const result =
        await bookingsCollection.insertOne(booking);


        res.send(result);



      }catch(error){

        console.log(error);


        res.status(500).send({

          message:"Failed to save booking"

        });

      }

    });








    // ==========================
    // Get User Bookings
    // ==========================

    app.get("/bookings", async(req,res)=>{

      try {


        const email = req.query.email;



        const query = email
          ? { email: email }
          : {};



        const result = await bookingsCollection
          .find(query)
          .toArray();



        res.send(result);



      } catch(error) {


        console.log(error);


        res.status(500).send({

          message:"Failed to fetch bookings"

        });


      }

    });





  } catch(error){

    console.log(error);

  }

}









// Server Start

run()
  .then(() => {

    app.listen(port, () => {

      console.log(`Server running on port ${port}`);

    });

  })
  .catch(error => {

    console.log(error);

  });