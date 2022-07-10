import mongoose from "mongoose";
import {createOne, getAll, getOne, updateOne, deleteOneDoc, deleteAll} from "./prototype.model.js";

const schema = mongoose.Schema({
    text: {
        type: String,
        trim: true,
        required: [true, "Text is required!"],
        min: [3, 'Text must be at least 3 characters, got {VALUE}.'],
        max: [500, 'Max size of text 500 characters, got {VALUE}'],
    },
    answer: {
        type: String,
        trim: true,
        min: [2, 'Text must be at least 2 characters, got {VALUE}.'],
        max: [500, 'Max size of text 500 characters, got {VALUE}'],
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "User is required!"]
    }
},{
    timestamps :true
});
schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});
schema.statics = {
    createOne: createOne,
    getAll: function(req, res, next){
        req.populate='user';
        getAll.call(this, req, res, next)
    },
    getOne: function(req, res, next){
        req.populate='user';
        getOne.call(this, req, res, next)
    },
    updateOne: updateOne,
    deleteOneDoc: deleteOneDoc,
    deleteAll: deleteAll
}
mongoose.model("comment", schema);