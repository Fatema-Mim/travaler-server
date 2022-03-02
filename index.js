const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cqu9q.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const database = client.db('tourMange');
        const packageCollection = database.collection('packages');
        const reviweCollection = database.collection('reviews');
        const bookedPackagesCollection = database.collection('bookedPackages');
        const userCollection = database.collection('users');



        //Get APT
        app.get('/packages', async(req,res)=>{
            const cursor = packageCollection.find({});
            const packages = await cursor.toArray();
            res.send(packages);
        })
        // Get one API
        app.get('/packages/:id' , async(req, res)=>{
            const id = req.params.id;
            const query ={_id:ObjectId(id)};
            const package = await packageCollection.findOne(query);
            console.log('load user with id ', id);
            res.send(package);
        })
        // POST API 
        app.post('/packages', async (req , res) =>{
            const newPackages = req.body;
            const result = await packageCollection.insertOne(newPackages);
            console.log('new package :',req.body);
            console.log('add package :',result);
            res.json(result)
            
        })
        // Delete
        app.delete('/packages/:id',async(req,res)=>{
            const result = await packageCollection.deleteOne({
                _id:ObjectId(req.params.id),
            });
            res.send(result);
        })



        // POST API for review
        app.post('/reviews' , async(req,res) =>{
            const newReview = req.body;
            console.log(newReview);
            const result = await reviweCollection.insertOne(newReview);
            console.log('new review' , req.body);
            console.log('add review', result);
            res.json(result)
        })
        app.get('/reviews', async (req, res) => {
            const cursor = reviweCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })
        // bookedPackages
        app.post('/bookedPackages', async (req, res) => {
            const newBooked = req.body;
            console.log(newBooked);
            const result = await bookedPackagesCollection.insertOne(newBooked);
            console.log('new Booked', req.body);
            console.log('add Booked', result);
            res.json(result)
        })
        // get
        app.get('/bookedPackages', async (req, res) => {
            const cursor = bookedPackagesCollection.find({});
            const bookedPackagesAdmin = await cursor.toArray();
            res.send(bookedPackagesAdmin);
        })
        // delete
        app.delete('/bookedPackages/:id',async(req,res)=>{
            const result = await bookedPackagesCollection.deleteOne({
                _id:ObjectId(req.params.id),
            });
            res.send(result);
        })
        // update
        app.put("/bookedPackages/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };

            bookedPackagesCollection.updateOne(filter, {
                $set: {
                    status: "Confirm"
                },
            })
                .then((result) => {
                    res.send(result);
                });

        });

         // find user admin or not
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            console.log("my admin ", isAdmin)
            res.json({ admin: isAdmin });
        })
        // USER
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = await userCollection.insertOne(newUser);

            console.log('hitting the post', result);
            res.json(result);
        })
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            console.log('hitting the post', result);
            res.json(result);
        })

    }
    finally{

    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`listening  port ${port}`)
})