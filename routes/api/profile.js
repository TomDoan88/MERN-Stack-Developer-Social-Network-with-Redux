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
//   2nd: You need a token to access a route, it needs to be authenticated
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
// @desc   CREATE OR UPDATE PROFILE
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

    // If users exist: UPDATE
    // If users do not exist: CREATE

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
//@desc   GET profile by USERID
//@access PUBLIC

// 1st: Get the user Exact ID
// 2nd: Find that userID
// Add the name and avatar related to the user you just got by using populate method
// NOTE:
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate("user", ["name", "avatar"]);
    if (!profile) return res.status(400).json({ msg: "Profile not Found" });
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    //  I wanted to let users know the specific error cause and not generic server error
    //  hence we are using conditional with err.kind
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

// @route  PUT api/profile/ experience
// @desc   ADD profile experience
// @access PRIVATE
// MENTAL NOTE: We are just updating part of the profile
// experience is just an {} inside of another object.

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required")
        .not()
        .isEmpty(),
      check("company", "Company is required")
        .not()
        .isEmpty(),
      check("from", "Title is required")
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
    const { title, company, location, from, to, current, description } = req.body;

    const newExp = { title, company, location, from, to, current, description };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp); // unshift because latest data appear first.

      profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route  DELETE  api/profile/ experience/:exp_id
// @desc   DELETE  experience from profile
// @access PRIVATE

// Get profile -> Identify which experience  needs remove by get index, and then cut it out
// Return json.
// Save the profile
// Mental Note: await need to be used when finding the Profile / Users

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    // Get / identify priofile we are targeting.
    const profile = await Profile.findOne({ user: req.user.id });

    // Loop through experience. get index of the parameter being passed in hence req.params.exp_id
    const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex, 1);

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route  PUT api/profile/education
// @desc   ADD profile education
// @access PRIVATE

router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required")
        .not()
        .isEmpty(),
      check("degree", "Degree is required")
        .not()
        .isEmpty(),
      check("fieldofstudy", "fieldofstudy is required")
        .not()
        .isEmpty()
    ]
  ],
  // Validate the result inside of (req, res)
  // Check for error if there is error return erorr
  // Destrucure data in the

  // Code to execute in try
  // find where the req originate from with Profile.findOne()
  // Then access object and assign new data in there
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array });
    }
    const { school, degree, fieldofstudy, from, to, current, description } = req.body;
    const newEducation = { school, degree, fieldofstudy, from, to, current, description };
    //
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEducation);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route  DELETE  api/profile/education
// @desc   DELETE profile education
// @access PRIVATE

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
