const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const Profile = require("../../models/Profile");
const User = require("../../models/User");

// This route here is to update / create profiles
// @route  GET api/profile/me
// @desc   Get current users profile
// @access Private

//   1st: because users profile need to be authenticated
//  2nd: You need a token to access a route, it needs to be authenticated

// Refernce. We don't have a route me made up. This is added in the URL for /me

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(["user", "name", "avatar"]);

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route  POST  api/profile
// @desc   CREATE OR UPDATE USER PROFILE
// @access Private

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required")
        .not()
        .isEmpty(),
      check("skills", "Skill is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      // If there are data but errors, we want to return response
      return res.status(400).json({ error: error.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    // We need to make sure Bio was added before
    // we submit to the database
    // Build Profile Object

    // Initialzing profileFields as an empty Object for now
    // Because we will desstructure and shove the data in there
    // as we go along.

    // We need to get the users being submitted / requested ID into the profileFields object
    // We have an access to the USER model / Schema
    // Need to check for incoming data
    const profileFields = {};
    profileFields.user = req.user.id;

    if (company) {
      profileFields.company = company;
    }
    if (website) {
      profileFields.website = website;
    }
    if (location) {
      profileFields.location = location;
    }
    if (bio) {
      profileFields.bio = bio;
    }
    if (status) {
      profileFields.status = status;
    }
    if (githubusername) {
      profileFields.githubusername = githubusername;
    }
    // We need to turn skills into an array, trim the data regardless of space
    if (skills) {
      profileFields.skills = skills.split(",").map(skill => skill.trim());
    }
    console.log(profileFields.skills);

    // Now we can build the social object of the profileFields variable
    // Again we need to check for incoming data
    // Note how we initialize profileFields.social = another nested {} inside of profileField{}
    // because social will be an object contains various list and propertie

    profileFields.social = {};
    if (youtube) {
      profileFields.social.youtube = youtube;
    }
    if (twitter) {
      profileFields.social.twitter = twitter;
    }
    if (facebook) {
      profileFields.social.facebook = facebook;
    }

    if (linkedin) {
      profileFields.social.linked = linkedin;
    }

    if (instagram) {
      profileFields.social.instagram = instagram;
    }

    console.log(profileFields.social.instagram);
    console.log(profileFields.social.facebook);

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      // If there is a profile then update it
      if (profile) {
        profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });
        return res.json(profile);
      }

      // There should be an else statement but since this is simplre return we can
      // just for go the else statement

      // Mistake / Error to watch
      // we cannot use await Profile.save(),
      // it has to be an instance of Proflile
      // In this case it will be profile.save
      // CREATE PROFILE if there is no profile found / Save it and Send back
      else {
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Errror");
    }
  }
);

// @route   GET api/profile
// @desc    GET ALL PROFILES
// @access  Public

// Populate profiles with related users.
// Display profiles not related to users as well.

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route  GET api/profile/user/:user_id
//@desc   GET profile by userID not profileID
//@access PUBLIC

// 1st: Get the user Exact ID
// 2nd: Find that userID
// Add the name and avatar related to the user you just got by using populate method
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate("user", ["name", "avatar"]);
    if (!profile) return res.status(400).json({ msg: "Profile not Found" });
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    // I wanted to let users know the specific error cause and not have them to think
    // this is a server error, hence we are using conditional with err.kind
    if (err.kind == "Object ID") {
      return res.status(400).json({ msg: "Profile not Found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route  DELETE  api/profile
// @desc   DELETE  profile, user & posts
// @access PRIVATE

// If it's private we will need the AUTH middleware

router.delete("/", auth, async (req, res) => {
  try {
    // Remove Profile
    await Profile.findOneAndRemove({ user: req.params.id });

    // Remove User.
    // It's req.user.id because we are already targeting _id: object ???
    await User.findOneAndRemove({ _id: req.user.id });
    res.json("User deleted");
  } catch (err) {
    error.console(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
