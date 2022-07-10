import mongoose from "mongoose";
import fs from "fs";
// The static import statement is used to import read only live bindings which are exported by another module.
// We installed the external modules express, cors and wrote them in dependencies in the package.json file
import express from "express";
import cors from "cors";

import langConfig from "./app/config/lang.config.js";
import {roles} from "./app/config/roles.config.js";


await import("./initDb.js");


// Creating a variable to access the functions of the express module
const app = express();
// Creating a variable to setup options to a cors module
const corsOptions = {
    origin: "http://localhost:3033"
};

// Using cors as middleware in Express
app.use(cors(corsOptions));
// Parse requests of content-type - application/json
app.use(express.json());
// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));


app.use(function(req, res, next) {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
    );
    req.User = mongoose.model( 'user' );
    req.Role = mongoose.model( 'role' );
    req.roles = roles;
    req.lang = langConfig.lang;
    req.langArr = langConfig.langArr;
    next();
});

// Simple routes
app.get("/", (req, res) => {
    res.json({ message: "Welcome to REST API application." });
});

const { default: routeCollection } = await import("./app/routes/route.js");
app.use('/api/collections', routeCollection);

const { default: routeAuth } = await import("./app/routes/auth.route.js")
app.use('/api/auth', routeAuth);

// Set port, listen for requests
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

app.use( function (err, req, res, next) {
    res.status(500).send({
        message:
            err.message || "Some error occurred while run api request."
    });
    let date = new Date().toISOString().replace( /T/, ' ' ).replace( /\..+/, '' );
    let uri;
    try{
        uri=decodeURIComponent(req.url);
    }catch(err){
        uri=req.url;
    }
    let s = date + ' ' + err.stack + "\n" + 'path - ' + uri + ";\n" +'host '+req.hostname + "\n"
        +"-------------------------------------------------------------------------" + "\n";
    fs.appendFile( 'errors.log', s, function (err, data) {if (err) console.log(err);} );
} );