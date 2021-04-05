const express = require('express')
const router = express.Router()
const {check, validationResult} = require('express-validator')
const User = require('../../models/User')
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const auth = require('../../middleware/auth');
const Position = require('../../models/Position');
const Industry = require('../../models/Industry');
const Development_Stage = require('../../models/Development_Stage');
const Analysis_Question = require('../../models/Analysis_Question');
const ContactUser = require('../../models/Contact_User')


//@route  api/users/update
//@desc   Update of Name,Surname, Email of the user
//@access Private
router.post('/update', auth, async(req, res) => {
    
    const errors = validationResult(req);
    if(!errors.isEmpty()) { return res.status(400).json({errors:errors.array()})}
    
    //Update profile
    const userFields = {
        Name: req.body.Name,
        Surname: req.body.Surname,
        Email: req.body.Email
    }
    
    try{
        let userUpdate = await User.findOneAndUpdate(
            {_id: req.user.id},
            {$set: userFields},
            {new: true}
        );

        return res.json(userUpdate)
    }catch(err){
        res.status(500).send("Server Error");
    }


})

//@route     api/users
//@desc     Test route
//@access   Public
router.post('/', 
    //     [
    // check('name', 'Name is require')
    //     .not()
    //     .isEmpty(),
    // check('email', 'Please include a valid email').isEmail(),
    // check(
    //     'password',
    //     'Please eneter a password with 6 or more characters'
    // ).isLength({min: 6})
    //     ],
    async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors: errors.array()})
    }
    
    //const { Name, Surname, Email, Password } = req.body
    console.log(req.body)

    try{
        // See if user exists
        console.log("Error is HERE")
        let user = await User.findOne({ Email: req.body.EmailRegister });

        if(user){
            res.status(400).json({ errors: [{msg: 'User already exists'}]})
        }

        user = new User({
            Name: req.body.Name,
            Surname: req.body.Surname,
            Email: req.body.EmailRegister,
            Password: req.body.Password_1
        })

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        user.Password = await bcrypt.hash(req.body.Password_1, salt); // Hash the password

        await user.save() // save in the dabase

        // Return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        }
        
        jwt.sign(
            payload, 
            config.get('jwtToken'),
            {expiresIn: 360000}, //expiration of the login
            (err, token) => {
                if(err) throw err;
                res.json({token})
            })
    }
    catch(err){
        console.error(err.message)
        res.status(500).send("Server error")
    }
});


// router.get('/:id', auth, async({params: {id}}, res) =>{
//     try {
//         const userData = await User.findById(id).select('name')
        
//         // console.log(userData)

//         res.json(userData)

//     } catch (err) {
//         console.error(err.message);
//         res.status(500).json({ msg: 'Server error' });
//     }
// });

/***
 * NOTE: the following was not working becaue of the previous one!
 * It is strange: the previous one is wrong and it compromised the 
 * following one too
 */

// @route    GET api/users/positions
// @desc     Get all the positions
// @access   Private
router.get('/positions', auth, async(req, res) => {
    
    try{
        const position = await Position.find().sort({ Position: 1 });
        res.json(position);
    }
    catch(err)
    {
        res.status(500).send('Server Error');
    }
})


// @route    GET api/users/industries
// @desc     Get all the industries
// @access   Private
router.get('/industries', auth, async(req, res) => {
    try{
        const industries = await Industry.find().sort({Industry: 1});
        res.json(industries);
    }
    catch(err)
    {
        res.status(500).send('Server Error');
    }
})

// @route    GET api/users/dev-stages
// @desc     Get all the dev-stages
// @access   Private
router.get('/dev-stages', auth, async(req, res) => {
    try{
        const dev_stages = await Development_Stage.find().sort({Development_Stage: 1});
        res.json(dev_stages);
    }
    catch(err)
    {
        res.status(500).send('Server Error');
    }
})

// @route    GET api/users/analysis-questions
// @desc     Get all the analysis questions
// @access   Private
router.get('/analysis-questions', auth, async(req, res) => {
    try{
        const analysis_questions = await Analysis_Question.find();
        res.json(analysis_questions);
    }
    catch(err)
    {
        res.status(500).send('Server Error');
    }
})


// @route GET api/users/usercontact
// @desc Save contacts of the user
// @access Public
router.post('/contactuser', async(req, res) => {
  try {
    const newContactUser = new ContactUser({
        user: req.body.Name,
        email: req.body.Email
    })
    
    const savedContact = await newContactUser.save()
    console.log(savedContact)
    res.json(savedContact)
  } catch (err) {
    res.status(500).send('Server Error')
  }
})

module.exports = router