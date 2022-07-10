import controller from "../controllers/controller.js";
import { verifyToken } from "../middlewares/authJwt.js"
import { checkAccessCreate, checkAccessDelete, checkAccessRead, checkAccessUpdate } from "../middlewares/checkPermission.js"
import express from 'express';
import mongoose from "mongoose";
const router = express.Router();

function getCollection(req, res, next) {
    const collectionName = req.params.collection;
    try{
        if(mongoose.model( collectionName )){
            req.collection = mongoose.model( collectionName );
            req.collectionName = collectionName;
            next();
        }else{
            next(new Error("collection doesn't exist"));
        }
    }catch (err){
        next(new Error("collection doesn't exist"));
    }
}

// Create a new Object
router.post("/:collection/", [getCollection, verifyToken, checkAccessCreate], controller.createOne);
// Get all Objects from the database
router.get("/:collection/", [getCollection, verifyToken, checkAccessRead], controller.getAll);
// Get a single Object with an id
router.get("/:collection/:id", [getCollection, verifyToken, checkAccessRead], controller.getOne);
// Update an Object by the id in the request
router.put("/:collection/:id", [getCollection, verifyToken, checkAccessUpdate], controller.updateOne);
// Delete an Object with the specified id in the request
router.delete("/:collection/:id", [getCollection, verifyToken, checkAccessDelete], controller.deleteOneDoc);
// Delete all Objects from the database
router.delete("/:collection/", [getCollection, verifyToken, checkAccessDelete], controller.deleteAll);
export default router;