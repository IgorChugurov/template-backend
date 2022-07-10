export const createOne = async function(req, res, next){
    const Model = this;
    try {
        // Create an object
        const item = new Model(req.body);
        // Save object in the database
        const result = await item.save(item);
        return res.send(result);
    }catch (err){
        return next({
            message:
                err.message || "Some error occurred while creating the object."
        })
    }
};
export const getAll = async function(req, res, next){
    try{
        const Model = this;
        let paginationData;
        if(!req || !req.paginationData){
            paginationData = { offset :0, limit : 10000 }
        } else {
            paginationData = req.paginationData;
        }
        let { page, limit, offset, condition } = {...paginationData}
        const totalDocs = await Model.countDocuments(condition);
        const totalPages = Math.ceil(totalDocs/limit);
        if(page>totalPages){page=1;offset=0}
        if(req.onlyForOwner){
            if(!condition){condition = {}}
            condition.owner = req.userId
        }
        const docs = await Model.find(condition).limit(limit).skip(offset).populate(req.populate);
        const result = {
            totalItems: totalDocs,
            items: docs,
            currentPage: page,
            perPage:limit,
            totalPages:totalPages
        }
        if(typeof res !=="undefined" && res.send){
            return res.send(result);
        }else{
            return docs
        }
    }catch(err){
        return next(err)
    };
};
export const getOne = async function(req, res, next){
    try {
        const Model = this;
        const id = req.params.id;
        const data = await Model.findById(id).populate(req.populate);
        if (!data){
            return res.status(404).send({ message: "Not found object with id " + id });
        }else{
            if(req.onlyForOwner && data.owner.toString() === req.userId){
                return res.status(404).send({ message: "Not found object with id " + id });
            }
            return res.send(data);
        }
    }catch (err){
        return next({ message:
                err.message || "Error retrieving object with id=" + id })
    }
};
export const updateOne = async function(req, res, next){
    try{
        const Model = this;
        const id = req.params.id;
        /**
         * runValidators: true - turn on the validation of the fields
         * */
        if(req.onlyForOwner){
            const item = await Model.findOne({_id: id, owner: req.userId})
            if (!item){
                return res.status(404).send({ message: "Not found object with id " + id });
            }

        }
        return res.send(data);
        const data = await Model.findByIdAndUpdate(id, req.body, { runValidators: true });
        if (!data) {
            res.status(404).send({
                message: `Cannot update object with id=${id}. Maybe object was not found!`
            });
        } else {
            res.send({ message: "Object was updated successfully." })
        };
    }catch(err){
        return next({
            message:
                err.message || "Error updating object with id=" + id
        });
    };
};
export const deleteOneDoc = async function(req, res, next){
    try{
        const Model = this;
        const id = req.params.id;
        const data = await Model.findByIdAndRemove(id)
        if (!data) {
            res.status(404).send({
                message: `Cannot delete object with id=${id}. Maybe object was not found!`
            });
        } else {
            res.send({
                message: "Object was deleted successfully!"
            });
        };
    }catch(err){
        return next({
            message:
                err.message || "Could not delete object with id=" + id
        });
    };
};
export const deleteAll= async function(req, res, next){
    try{
        const Model = this;
        let query = {};
        try{
            if(req.query.ids){
                let ids=[];
                if (req.query.ids && typeof req.query.ids ==='string') {
                    query = {_id:{$in:JSON.parse(req.query.ids)}};
                }
            }
        }catch(err){
            res.status(404).send({
                message: "Wrong ids were passed for removing objects."
            });
        }
        const data = await Model.deleteMany(query)
        if (!data) {
            res.status(404).send({
                message: "Some error occurred while removing objects."
            });
        } else {
            res.send({
                message: `${data.deletedCount} Objects were deleted successfully!`
            });
        };
    }catch(err){
        return next({
            message:
                err.message || "Some error occurred while removing all objects."
        });
    };
};
