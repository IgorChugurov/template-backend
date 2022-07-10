import dbConfig from "./app/config/db.config.js";

import mongoose from "mongoose";
import fs from "fs";

import { initRolesData } from "./app/config/roles.config.js";
import bcrypt from "bcryptjs";

const { USER_NAME, EMAIL, PASSWORD, PHONE } = process.env;

fs.readdirSync("./app/models").forEach(async (file) => {
  if (file !== "index.js") {
    await import("./app/models/" + file);
  }
});

mongoose
  .connect(dbConfig.url)
  .then(() => {
    console.log("Connected to the database!");
    setTimeout(() => {
      initial();
    }, 500);
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

async function initial() {
  const Role = mongoose.model("role");
  const User = mongoose.model("user");
  try {
    const count = await Role.estimatedDocumentCount();

    if (count === 0) {
      //https://mongoosejs.com/docs/api.html#model_Model.create
      await Role.create([
        {
          name: "user",
          rule: initRolesData.user,
        },
        {
          name: "moderator",
          rule: initRolesData.moderator,
        },
        {
          name: "admin",
          rule: initRolesData.admin,
        },
        {
          name: "notAuth",
          rule: initRolesData.notAuth,
        },
      ]);
      console.log("Roles were added!");
    }
    const adminRole = await Role.findOne({ name: "admin" });

    const userCount = await User.findOne({ role: adminRole._id });

    if (!userCount) {
      console.log("First user is adding");
      return createNewUser(adminRole._id);
    }

    // Checking if email changed in .env
    const userValid = await User.findOne({ email: EMAIL, role: adminRole._id });

    if (!userValid) {
      await User.deleteMany({ role: adminRole._id });
      console.log("User email is updating");
      return createNewUser(adminRole._id);
    }

    // Checking if password changed in .env
    const validPass = bcrypt.compareSync(PASSWORD, userValid.password);
    if (!validPass) {
      console.log("validPass", validPass);
      userValid.password = PASSWORD;
      return userValid.save();
    }
  } catch (err) {
    console.log(err);
  }
  async function createNewUser(adminRoleId) {
    await User.create([
      {
        phone: PHONE,
        name: USER_NAME,
        email: EMAIL,
        password: PASSWORD,
        role: adminRoleId,
      },
    ]);
  }
  /*mongoose.model('user').deleteMany({}, function (err,res){
         console.log(err,res)
     })*/
  /* mongoose.model('role').deleteMany({}, function (err,res){
         console.log(err,res)
     })*/
}
