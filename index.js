const http = require("http");
const fs = require("fs");
const path = require("path");

// Mongo stuff
const {MongoClient} = require("mongodb");

async function findData(client) {
    const cursor = client.db("games").collection("gamedetails").find({});
    const results = await cursor.toArray();
    const js = JSON.stringify(results, null, 4);
    return js
}

async function getMongoData() {
    const uri = "mongodb+srv://q9OsTcxHhGxVw2QP:fedwuhu23rju980q0@cluster0.1xy5ovq.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(uri);
    let data = "";
    try {
        await client.connect();
        // This gets logged in the CMD output of the node server, NOT in the browser.
        console.log("Sucessfully connected to the MongoDB server.");
        data = await findData(client);
    } catch(e) {
        console.log("Failed to connect to the MongoDB server. See below for error output.\n")
        console.log(e);
    } finally {
        await client.close();
        // This gets logged in the CMD output of the node server, NOT in the browser.
        console.log("MongoDB server connection closed."); 
    }
    return data
}

http.createServer((req, res) => {
    if(req.url == "" || req.url == "/" || req.url == "/index.html") {
        fs.readFile(path.join(__dirname, "index", "index.html"), (err, content) => {
            if (err) throw (err);
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(content);
        });
    } else if (req.url == "/style.css") {
        fs.readFile(path.join(__dirname, "index", "style.css"), (err, content) => {
            if (err) throw (err);
            res.writeHead(200, {"Content-Type": "text/css"});
            res.end(content);
        });
    } else if (req.url.includes("jpg")) { // This has to be done differently because I am not writing statements for every image
        fs.readFile(path.join(__dirname, "index", req.url.slice(1, req.url.length)), (err, content) => {
            if (err || !content) {
                res.writeHead(404); // NOT FOUND
                res.end();
            } else {
                res.writeHead(200, {"Content-Type": "image/jpeg"});
                res.end(content);
            }
        });
    } else if (req.url.includes("png")) { // This has to be done differently because I am not writing statements for every image
        fs.readFile(path.join(__dirname, "index", req.url.slice(1, req.url.length)), (err, content) => {
            if (err || !content) {
                res.writeHead(404); // NOT FOUND
                res.end();
            } else {
                res.writeHead(200, {"Content-Type": "image/png"});
                res.end(content);
            }
        });
    } else if (req.url == "/api") {
        res.writeHead(200, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" // Allow all access points to avoid errors.
        }); // different content type
        getMongoData().then(content => {
            res.end(content);
        });
    } else {
        res.writeHead(404); // NOT FOUND LOL
        res.end();
    }
}).listen(5356, () => console.log("Great! Our server is running on port 5356."));