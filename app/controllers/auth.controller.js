import config from "../config/auth.config.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import generator from "generate-password";
import axios from "axios";
const controller = {};
const { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_USER_ID, EMAILJS_ACCESSTOKEN } =
  process.env;

controller.signup = async (req, res, next) => {
  const User = req.User;
  req.successMessage = "User was registered successfully!";
  User.createOne(req, res, next);
};
/**
 * сначала проверяем является ли имя phone, then email and last name.
 * */
controller.signin = async (req, res, next) => {
  try {
    const User = req.User;
    const condition = {};
    const re = /.+@.+\..+/i;
    /**
     * определяем  ключ регистрации - по телефону имени или почте
     * */

    const key = /^\d{8}$/.test(
      (req.body.name || req.body.username || req.body.email || req.body.phone).trim(),
    )
      ? "phone"
      : re.test((req.body.name || req.body.username || req.body.email || req.body.phone).trim())
      ? "email"
      : "name";

    condition[key] = req.body.name || req.body.username || req.body.email || req.body.phone;
    if (key === "email") {
      condition[key] = condition[key].toLowerCase();
    }

    const user = await User.findOne(condition).populate("role", "-__v");

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }
    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!",
      });
    }
    const authority = user.role.name.toLowerCase();
    const token = jwt.sign({ id: user.id, role: authority }, config.secret, {
      expiresIn: config.expiresIn,
    });

    res.status(200).send({
      id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: authority,
      accessToken: token,
    });
  } catch (err) {
    console.log(err);
    return next(err);
  }
};
controller.forceLogin = async (req, res, next) => {
  try {
    const user = await req.User.findById(req.params.id);
    if (!user) {
      return res.status(400).send({
        message: "No such user",
      });
    }
    // Create token for login in as user
    var token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: config.expiresIn,
    });
    return res.send({
      id: req.params.id,
      email: user.email,
      accessToken: token,
    });
  } catch (err) {
    return next({
      message: err.message || "Some error occurred while signing in.",
    });
  }
};

controller.reserPassword = async (req, res, next) => {
  try {
    const user = await req.User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send({
        message: "Wrong email",
      });
    }
    if (user.role === "admin") {
      return res.status(403).send({
        message: "You can't change admin password",
      });
    }
    // Variables resetKey and resetKeyDate are used for limiting lifetime of the reset password link
    // In the server file there is running process that checks all users every 10 seconds
    // and resets resetKeyDate and resetKey to null if the link has expired
    user.resetKey = null;
    user.resetKeyDate = null;
    const key = generator.generate({
      length: 20,
      numbers: true,
      lowercase: true,
      uppercase: true,
      strict: true,
    });
    // TODO: if key duplicate in DB, It is possible that password would be changing for wrong user
    user.resetKey = key;
    // Seting the link lifetime 10 minutes
    user.resetKeyDate = new Date(+new Date() + 10 * 60 * 1000);
    // Saving resetKey and resetKeyDate to DB
    await user.save();
    // Hashing user's data for creating reset password link
    var hashedId = jwt.sign({ key: key }, config.secret);
    // Creating reset password link
    const resetUrl = req.headers.host + "/resetpasswordform/" + hashedId;
    // Creating data for sending email letter with reset password link via emailJS
    var data = {
      service_id: SERVICE_ID,
      template_id: TEMPLATE_ID,
      user_id: USER_ID,
      accessToken: ACCESSTOKEN,
      template_params: {
        to_email: req.body.email,
        resetUrl: resetUrl,
      },
    };
    // Send email to user via emailJS
    const result = await axios.post("https://api.emailjs.com/api/v1.0/email/send", data);
    return res.send(result.data);
  } catch (err) {
    console.log(err);
    return next({
      message: err.message || "Some error occurred while creating reset password link.",
    });
  }
};

controller.checkResetKey = (req, res, next) => {
  // If ok - showing the reset password field
  return res.send({ message: "Ok" });
};

controller.changePassword = async (req, res, next) => {
  try {
    // Updating password and resetting reset Key and resetKeyDate values
    const user = await req.User.findByIdAndUpdate(req.userId, {
      password: req.body.password,
      resetKey: null,
      resetKeyDate: null,
    });
    if (!user) {
      return res.status(404).send({
        message: `Cannot change user's password. Maybe user was not found!`,
      });
    } else {
      return res.send({ message: "User's password was updated successfully." });
    }
  } catch (err) {
    return next({
      message: err.message || "Some error occurred while updating user's password.",
    });
  }
};

export default controller;
