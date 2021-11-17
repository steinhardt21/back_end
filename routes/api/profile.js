const express = require('express');
const axios = require('axios');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
// bring in normalize to give us a proper url, regardless of what user entered
const normalize = require('normalize-url');
const checkObjectId = require('../../middleware/checkObjectId');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Project = require('../../models/Project');
const Project_Industry = require('../../models/Profile_Industry');

const moment = require('moment');
const Profile_Industry = require('../../models/Profile_Industry');
const Skill = require('../../models/Skill')
const Profile_Skill = require('../../models/Profile_Skill')

// @route    GET api/profile/me
// @desc     Get current users profile
// @access   Private
router.get('/me', auth, async (req, res) => {
  try {

    const profile = await Profile.findOne({
      User: req.user.id
    })//.populate('Position', ['Position'])
    .populate('User', ['Name'])
    .populate('Position', ['Position'])
    //
    //.populate('Position');
    res.json(profile);


  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
router.post(
  '/',
  [
    auth
    // [
    //   check('status', 'Status is required').not().isEmpty(),
    //   check('skills', 'Skills is required').not().isEmpty()
    // ]
  ],
  async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    /**NOTE:
     * 
     * I spent several time to understand why I cannot save the date immediately in the
     * MongoDB. I found the answer here:https://stackoverflow.com/questions/42375823/javascript-how-to-save-a-date-in-mongodb-document-in-isodate-format
     * 
     * The real problem is I've been sending this to the API as an stringified JSON object 
     * though it was set as a new Date() object it get stringified.
     * console.log('START DATE')
     *  console.log(req.body.Date_Of_Birth)
     * console.log(moment(req.body.Date_Of_Birth).format())
     *  const profileFields = {
           User: req.user.id,
           Date_Of_Birth: req.body.Date_Of_Birth,
           City_Living: req.body.City_Living,
           Completed: true
    };
     */
    
    //Management of the Date
   const dateReceived = new Date(req.body.Birthday);
 

    //Build a profile
    const profileFields = {
        User: req.user.id,
        Birthday: req.body.Birthday,
        City_Living: req.body.City_Living,
        Biography: req.body.Biography,
        Position: req.body.Position,
        Completed: true,
        Telephone: req.body.Telephone,
        // Temporary situation
        Skills: req.body.Skills.split(',').map((skill) => ' ' + skill.trim())
    }

    
    console.log('profileFields')
    console.log(profileFields)

    try {

    let profile = await Profile.findOneAndUpdate(
        { User: req.user.id },
        { $set: profileFields },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

    
    /********Adition of the Industry************** */
    let addIndustry = await Profile_Industry.findOneAndUpdate(
      {Profile: profile._id},
      {
        Profile: profile._id,
        Industry: req.body.Industry
      },
      {new: true, upsert: true, setDefaultsOnInsert: true}
    );

    /******************************************** */
    /********Adition of the Skills************** */
    // if(Array.isArray(req.body.Skills))
    // {
    //   console.log('Nothing')
    // }
    // else {const skills = req.body.Skills.split(',').map((skill) => ' ' + skill.trim());

    //   console.log('After')
    //   console.log(skills)
    // }
    

    

    /******************************************** */


    console.log('Profile, Im here')
    console.log(profile)
     return res.json(profile);
    
        
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    GET api/profile
// @desc     Get all profiles
// @access   Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public
router.get('/user/:user_id', checkObjectId('user_id'),async ({ params: { user_id } }, res) => {

    try {
      const profile = await Profile.findOne({ User: user_id}).populate('User', ['Name', 'Surname', 'Email', 'Date']);
      console.log(profile)

      if (!profile) return res.status(400).json({ msg: 'Profile not found' });

      return res.json(profile);
      
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Server error' });
    }
  }
);

// @route    GET api/profile/industry/:profileId
// @desc     Get In by user ID
// @access   Private
router.get('/industry/:profileId', auth, async({params:{profileId}}, res) => {
  try{
      const industries = await Profile_Industry.findOne({Profile: profileId}).populate('Industry');
      return res.json(industries)
  }catch(err){
      return res.status(500).json({msg:'Server Error'})
  }
})

// @route    DELETE api/profile
// @desc     Delete profile, user & posts
// @access   Private
router.delete('/', auth, async (req, res) => {
  try {
    // Remove user posts
    await Project.deleteMany({ user: req.user.id });
    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // Remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/profile/experience
// @desc     Add profile experience
// @access   Private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'From date is required and needs to be from the past')
        .not()
        .isEmpty()
        .custom((value, { req }) => (req.body.to ? value < req.body.to : true))
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const foundProfile = await Profile.findOne({ user: req.user.id });

    foundProfile.experience = foundProfile.experience.filter(
      (exp) => exp._id.toString() !== req.params.exp_id
    );

    await foundProfile.save();
    return res.status(200).json(foundProfile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required').not().isEmpty(),
      check('degree', 'Degree is required').not().isEmpty(),
      check('fieldofstudy', 'Field of study is required').not().isEmpty(),
      check('from', 'From date is required and needs to be from the past')
        .not()
        .isEmpty()
        .custom((value, { req }) => (req.body.to ? value < req.body.to : true))
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    DELETE api/profile/education/:edu_id
// @desc     Delete education from profile
// @access   Private

router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const foundProfile = await Profile.findOne({ user: req.user.id });
    foundProfile.education = foundProfile.education.filter(
      (edu) => edu._id.toString() !== req.params.edu_id
    );
    await foundProfile.save();
    return res.status(200).json(foundProfile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
// router.get('/github/:username', async (req, res) => {
//   try {
//     const uri = encodeURI(
//       `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
//     );
//     const headers = {
//       'user-agent': 'node.js',
//       Authorization: `token ${config.get('githubToken')}`
//     };

//     const gitHubResponse = await axios.get(uri, { headers });
//     return res.json(gitHubResponse.data);
//   } catch (err) {
//     console.error(err.message);
//     return res.status(404).json({ msg: 'No Github profile found' });
//   }
// });

module.exports = router;
