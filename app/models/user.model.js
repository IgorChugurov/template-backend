import mongoose from "mongoose";
import validator from "validator";
import { roles } from "../config/roles.config.js";
import {
  createOne,
  getAll,
  getOne,
  updateOne,
  deleteOneDoc,
  deleteAll,
} from "./prototype.model.js";
import bcrypt from "bcryptjs";
const validateIsEmail = function (email) {
  const re = /.+\@.+\..+/i;
  return re.test(email) && email.length < 70 && email.length > 6;
};
const validateName = function (name) {
  return name.length < 50 && name.length > 2;
};
const validatePassword = function (password) {
  if (
    validator.isStrongPassword(password, {
      minLength: 12,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    return true;
  } else {
    return false;
  }
};
const schema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required!"],
      validate: [validateName, "Please fill a valid name (2-50 chars)."],
      unique: true,
    },
    phone: {
      type: String,
      index: {
        unique: true,
        dropDups: true,
      },
      trim: true,
      required: [true, "Phone number is required!"],
      match: [/^\d{12}$/, "Please fill a valid phone number (8 digits)."],
    },
    email: {
      type: String,
      index: {
        unique: true,
        dropDups: true,
      },
      trim: true,
      lowercase: true,
      required: [true, "Email address is required!"],
      validate: [{ validator: validateIsEmail, msg: "Please fill a valid email address!" }],
    },
    password: String,
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "role",
    },
  },
  {
    timestamps: true,
  },
);
schema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id.toString();
  return object;
});
schema.statics = {
  createOne: async function (req, res, next) {
    const Model = this;
    const Role = req.Role;
    /* при регистрации пользователь по умолчанию получает роль user*/
    const userRole = await Role.findOne({ name: "user" });
    if (userRole) {
      req.body.role = userRole._id;
    }
    if (!req.body.password) {
      req.body.password = "12345678!eMail";
    }
    //req.body.password = bcrypt.hashSync(req.body.password, 8); in presave
    req.successMessage = "User was registered successfully!";
    await createOne.call(Model, req, res, next);
  },
  getAll: function (req, res, next) {
    req.populate = "role";
    getAll.call(this, req, res, next);
  },
  getOne: function (req, res, next) {
    req.populate = "role";
    getOne.call(this, req, res, next);
  },
  updateOne: async function (req, res, next) {
    try {
      const Model = this;
      const Role = req.Role;
      if (req.body.password) {
        req.body.password = bcrypt.hashSync(req.body.password, 8);
      }
      if (req.body.role) {
        const userForUpdate = await Model.getOne({ _id: req.params.id }).populate("role");
        if (!userForUpdate) {
          return res.status(500).send({
            message: `There is no user with this id!`,
          });
        }
        const operatorRole =
          req.user && req.user.role && req.user.role.name ? req.user.role.name : "user";
        const currentRole = userForUpdate.role ? userForUpdate.role.name : "user";
        const roleForSet = req.body.role;
        /*console.log(`operatorRole ${operatorRole}`)
                console.log(`currentRole ${currentRole}`)
                console.log(`roleForSet ${roleForSet}`)*/
        let checkErrorMessage;
        if (!roles.includes(roleForSet)) {
          checkErrorMessage = `Cannot change current role to ${roleForSet}!`;
        }
        if (req.params.id === req.userId && operatorRole === "admin") {
          const countAdmin = await Model.countDocuments({ role: req.user.role._id });
          if (countAdmin === 1) {
            checkErrorMessage = `At least one admin must be present!`;
          }
        }
        if (operatorRole === "moderator") {
          if (currentRole === "admin" || roleForSet === "admin") {
            checkErrorMessage = `Cannot change role to admin!`;
          }
        } else if (operatorRole !== "admin") {
          checkErrorMessage = `Cannot change role!`;
        }
        if (checkErrorMessage) {
          return res.status(500).send({
            message: checkErrorMessage,
          });
        }
        const userRole = await Role.getOne({ name: req.body.role });
        req.body.role = userRole._id;
      }
      await updateOne.call(Model, req, res, next);
    } catch (err) {
      return next(err);
    }
  },
  deleteOneDoc: async function (req, res, next) {
    const Model = this;
    const Role = req.Role;
    try {
      const operatorRole =
        req.user && req.user.role && req.user.role.name ? req.user.role.name : "user";
      if (operatorRole !== "admin" && operatorRole !== "moderator") {
        return res.status(500).send({
          message: `There is not permission for this action!!`,
        });
      }
      const adminRole = await Role.getOne({ name: "admin" });
      /* countAdmin всего админов*/
      const countAdmin = await Model.countDocuments({ role: adminRole._id });
      const deletingUser = await Model.getOne({ _id: req.params.id }).populate("role");
      if (
        countAdmin < 2 &&
        deletingUser &&
        deletingUser.role &&
        deletingUser.role.name === "admin"
      ) {
        return res.status(500).send({
          message: `Cannot delete last admin!`,
        });
      }
      if (
        deletingUser &&
        deletingUser.role &&
        deletingUser.role.name === "admin" &&
        operatorRole !== "admin"
      ) {
        return res.status(500).send({
          message: `Cannot delete admin!`,
        });
      }
      deleteOneDoc.call(Model, req, res, next);
    } catch (err) {
      return next(err);
    }
  },
  deleteAll: async function (req, res, next) {
    const Model = this;
    const Role = req.Role;
    if (!req.query.ids) {
      return res.status(500).send({
        message: `Cannot delete all users!`,
      });
    }
    try {
      let ids = JSON.parse(req.query.ids);
      const operatorRole =
        req.user && req.user.role && req.user.role.name ? req.user.role.name : "user";
      //625e624fea74d1ee301741ab
      if (operatorRole !== "admin" && operatorRole !== "moderator") {
        return res.status(500).send({
          message: `There is not permission for this action!`,
        });
      }
      const adminRole = await Role.getOne({ name: "admin" });
      /* countAdmin всего админов*/
      const countAdmin = await Model.countDocuments({ role: adminRole._id });
      /* get admins in deleting list*/
      const adminUsersInList = await Model.countDocuments({
        _id: { $in: ids },
        role: adminRole._id,
      });
      if (countAdmin - adminUsersInList < 1) {
        return res.status(500).send({
          message: `Cannot delete last admin!`,
        });
      }
      if (adminUsersInList && operatorRole !== "admin") {
        return res.status(500).send({
          message: `Cannot delete admin!`,
        });
      }
      await deleteAll.call(Model, req, res, next);
    } catch (err) {
      console.log(err);
      return next(err);
    }
  },
};

schema.pre("save", async function (next) {
  var self = this;
  const passwordValid = validatePassword(self.password);
  if (!passwordValid) {
    return next(new Error("Please fill a valid password!"));
  }
  self.password = await hashPass(self.password);
  next();
});
async function hashPass(password) {
  const salt = await bcrypt.genSalt(8);
  return await bcrypt.hash(password, salt);
}

// function getRandomPswd(len){
//     let str = "qwertyuiopasdfghjklzxcvbnmQWERTYU"
//     let pswd = ""
//     for (let i = 0; i<len; i++){
//         let j = Math.round(Math.random()*str.length)
//         pswd += str[j]
//     }
//     return pswd;
// }

mongoose.model("user", schema);
