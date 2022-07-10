import mongoose from "mongoose";
import {createOne, getAll, getOne, updateOne, deleteOneDoc, deleteAll} from "./prototype.model.js";

const schema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "Name is required!"],
    },
    rule : {},
});
schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});
schema.statics = {
    createOne: createOne,
    getAll: getAll,
    getOne: getOne,
    updateOne: updateOne,
    deleteOneDoc: deleteOneDoc,
    deleteAll: deleteAll
}
mongoose.model("role", schema);