const controller ={};
const getPagination = (query) => {
    let { page, perPage, condition } = query;
    page=Number(page)
    if(!page){page=1;}
    const limit = perPage ? +perPage : 3;
    const offset =  (page-1) * limit ;
    //console.log(`page ${page}, limit ${limit}, offset ${offset}, condition ${condition}`)
    return { page, limit, offset, condition };
};
// Create a single Object of the relevant model
controller.createOne = (req, res,next) => {
    // Validate request
    if (!req.body) {
        return res.status(400).send({
            message: "Data to create can not be empty!"
        });
    }
    if(typeof req.collection.createOne !=='function'){
        return next({
            message: "Collection has not a createOne function."
        })
    }
    return req.collection.createOne(req, res, next)
};
// Get all Objects of the relevant model from the database
controller.getAll = (req, res, next) => {
    if(typeof req.collection.getAll !=='function'){
        return next({
            message: "Collection has not a findAll function."
        })
    }
    req.paginationData = getPagination(req.query)
    return req.collection.getAll(req, res, next)
};
// Get a single Object of the relevant model with an id
controller.getOne = (req, res, next) => {
    if(typeof req.collection.getOne !=='function'){
        return next({
            message: "Collection has not a getOne function."
        })
    }
    return req.collection.getOne(req, res, next);
};
// Update a single Object of the relevant model by the id in the request
controller.updateOne = (req, res, next) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }
    if(typeof req.collection.updateOne !=='function'){
        return next({
            message: "Collection has not a updateOne function."
        })
    }
    return req.collection.updateOne(req, res, next)
};
// Delete a single Object of the relevant model with the specified id in the request
controller.deleteOneDoc = (req, res, next) => {
    if(typeof req.collection.deleteOneDoc !=='function'){
        return next({
            message : "Collection has not a deleteOneDoc function."
        })
    }
    return req.collection.deleteOneDoc(req, res, next);
};
// Delete all Objects of the relevant model from the database
controller.deleteAll = (req, res, next) => {
    if(typeof req.collection.deleteAll !=='function'){
        return next({
            message: "Collection has not a deleteAll function."
        })
    }
    return req.collection.deleteAll(req, res, next);
};
export default controller;