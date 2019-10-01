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
//  2nd: You need a token to access a route, it needs to be
// authenticated

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
// @desc   Create or update user profile
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
      // If there are errors from not empty field, we want to return response
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

    // We need to get the users being submit ID into the profileFields
    // As we know we have an access to the USER model / Schema
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
    // Note how we initialize profileFields.social = {}
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

    // Find and update profiles if they are found
    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });
        return res.json(profile);
      }

      // There should be an else statement but since this is simplre return we can
      // just for go the else statement
      else {
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
      }

      // CREATE PROFILE if they are not found.
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Errror");
    }
  }
);
module.exports = router;
