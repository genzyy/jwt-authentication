const express = require("express");   //express routes
const { check, validationResult } = require("express-validator/check");   //for validating emails
const bcrypt = require("bcryptjs");   //bcrypting passwords
const jwt = require("jsonwebtoken");    //json data parsing
const router = express.Router();    //only using router
const auth = require('../middleware/auth')    //adding middleware

const User = require("../model/User");    //user model

/**
 * @method - POST
 * @param - /signup
 * @description - User SignUp
 */

router.post(
  "/signup",
  [
    check("name", "Please Enter a Valid name").not().isEmpty(),   //name should not be empty
    check("email", "Please enter a valid email").isEmail(),   //validating email
    check("password", "Please enter a valid password").isLength({   //validating password length
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);   //if any errors in validation
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    //getting name, email and password from body
    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({   //fetching user from the database
        email,
      });
      //if user already exists then
      if (user) {
        return res.status(400).json({
          msg: "User Already Exists",
        });
      }

      //creating new user
      user = new User({
        name,
        email,
        password,
      });

      //bcrypting the password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      //awaiting for the user to get saved
      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };
      
      //assigning a token to current user
      jwt.sign(
        payload,
        "randomString",
        {
          expiresIn: 10000,
        },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            token,
          });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Error in Saving");
    }
  }
);

/**
 * @method - POST
 * @param - /login
 * @description - User Login
 */

router.post(
  "/login",
  [
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter a valid password").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({
        email,
      });
      if (!user)
        return res.status(400).json({
          message: "User Not Exist",
        });

      //checking if user entered a correct password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({
          message: "Incorrect Password !",
        });

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        "randomString",
        {
          expiresIn: 3600,
        },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            token,
          });
        }
      );
    } catch (e) {
      console.error(e);
      res.status(500).json({
        message: "Server Error",
      });
    }
  }
);

/**
 * @method - GET
 * @param - /me
 * @description -about page
 */

router.get("/me", auth, async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (e) {
    res.send({ message: "Error in Fetching user" });
  }
});

module.exports = router;
