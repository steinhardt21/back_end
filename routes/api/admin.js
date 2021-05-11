const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose')
const User = require('../../models/User');
const Collaborator = require('../../models/Collaborator')
const checkObjectId = require('../../middleware/checkObjectId');
const Position = require('../../models/Position');
const Industry = require('../../models/Industry');
const Development_Stage = require('../../models/Development_Stage')
const Analysis_Question = require('../../models/Analysis_Question');
const Project = require('../../models/Project');
const Call_Project = require('../../models/Call_Project');
const Profile = require('../../models/Profile')
const Profile_Industry = require('../../models/Profile_Industry')
const Project_Owner = require('../../models/Project_Owner')
const Candidacy = require('../../models/Candidacy')
const Project_Industry = require('../../models/Project_Industry')


router.post('/updatestateproject/:id', auth, async(req, res) => {
   
  try {
    console.log(req.body.stato)
    console.log(req.body)
    let project = await Project.findByIdAndUpdate(
      {_id: req.params.id},
      {Status: req.body.stato}
    )
    
    const idProj = new mongoose.Types.ObjectId(project._id)
    let calls = await Call_Project.find({Project: idProj})

    console.log('my calls')
    console.log(calls)
    console.log('-------------')

    if(calls != null){
        const listCalls = await Promise.all(calls.map(async (call, id) => {
           await Call_Project.findByIdAndUpdate(call._id,
                {Status: req.body.stato})
        }))  
       
    }

    res.json(project)
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})

router.get('/usersdata', async(req, res) => {
    try{
        const users = await User.find().lean()
        const profiles = await Profile.find().populate('Position').lean()
        const profile_industry = await Profile_Industry.find().populate('Industry').lean()
        const project_owner = await Project_Owner.find().lean()
        const call_project = await Call_Project.find().lean()
        const canidacies = await Candidacy.find().lean()

        users.map((user) => {

            for(let i=0; i<profiles.length; i++) {
                if((user._id).toString() === (profiles[i].User).toString()) {
                    user.Profile = profiles[i]

                    for(let t=0; t<profile_industry.length; t++) {
                        if((profiles[i]._id).toString() === (profile_industry[t].Profile).toString()) {
                            user.Industry = profile_industry[t].Industry
                            break
                        }
                    }

                    break
                }
            }

            let countProjects = 0
            let callCreated = 0

            for(let p=0; p<project_owner.length; p++) {
                if((project_owner[p].User).toString() === (user._id).toString()) {
                    countProjects++

                    for(let c=0; c<call_project.length; c++) {
                        if((call_project[c].Project).toString() === (project_owner[p].Project).toString()) {
                            callCreated++
                        }
                    }
                }
            }

            user.Projects = countProjects
            user.CallCreated = callCreated

            let numberCandidatures = 0
            let numberCandidaturesAccepted = 0
            let numberCandidaturesWaiting = 0
            let numberCandidaturesRejected = 0

            canidacies.map((candidature) => {
              if((candidature.User).toString() === (user._id).toString()) {
                  numberCandidatures++

                  if(candidature.Status === 'Valutazione') {
                    numberCandidaturesWaiting++
                  }
                  if(candidature.Status === 'Accettato') {
                    numberCandidaturesAccepted++
                  }
                  if(candidature.Status === 'Rifiutato') {
                    numberCandidaturesRejected++
                  }

              }
            })

            user.numberCandidatures = numberCandidatures
            user.numberCandidaturesAccepted = numberCandidaturesAccepted
            user.numberCandidaturesRejected = numberCandidaturesRejected
            user.numberCandidaturesWaiting = numberCandidaturesWaiting
        })

        // console.log(users)
        

        res.json(users)
    }
    catch(err)
    {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

router.get('/callsdata', async(req, res) => {
    try{
        const call_project = await Call_Project.find().populate('Project').populate('Position').populate({path:'Project', populate: {path: 'Development_Stage'}}).lean()
        const project_owner = await Project_Owner.find().populate('User').lean()
        const listProjectIndustry = await Project_Industry.find().populate('Industry')
        const candidacies = await Candidacy.find().lean()

        console.log('CALLS_DATA')
        call_project.map((call) => {
            console.log('CALLLL', call)
            for(let p=0; p<project_owner.length; p++) {
              if((call.Project._id).toString() === (project_owner[p].Project).toString()) {
                call.Founder = project_owner[p].User
                // console.log('owner', project_owner[p].User)
                break
              }
            }

            for(let t=0; t<listProjectIndustry.length; t++) {
                if((call.Project?._id).toString() === (listProjectIndustry[t].Project).toString()) {
                  call.Industry = listProjectIndustry[t].Industry
                  break
                }
              }

            if(call.City_Presence_Required) {
                call.Presence_Required = 'Si'
            } else {
                call.Presence_Required = 'No'
            }


              let numberCandidatures = 0
            let numberCandidaturesAccepted = 0
            let numberCandidaturesWaiting = 0
            let numberCandidaturesRejected = 0

            candidacies.map((candidature) => {
              if((candidature.Call_Project).toString() === (call._id).toString()) {
                  numberCandidatures++

                  if(candidature.Status === 'Valutazione') {
                    numberCandidaturesWaiting++
                  }
                  if(candidature.Status === 'Accettato') {
                    numberCandidaturesAccepted++
                  }
                  if(candidature.Status === 'Rifiutato') {
                    numberCandidaturesRejected++
                  }

              }
            })

            call.numberCandidatures = numberCandidatures
            call.numberCandidaturesAccepted = numberCandidaturesAccepted
            call.numberCandidaturesRejected = numberCandidaturesRejected
            call.numberCandidaturesWaiting = numberCandidaturesWaiting
              
        })

        console.log('CALL')
        console.log(call_project)
        res.json(call_project)
    }
    catch(err)
    {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

router.get('/candidatures-data', async(req, res) => {
    try{
        const candidacies = await Candidacy
                                    .find()
                                    .populate('User')
                                    .populate('Call_Project')
                                    .populate({path: 'Call_Project', populate: {path: 'Project'}})
                                    .lean()
        const profiles = await Profile.find().populate('Position').lean()
        const profile_industry = await Profile_Industry.find().populate('Industry').lean()
        const project_owner = await Project_Owner.find().populate('User').lean()


        candidacies.forEach((candidacy) => {
            for(let i=0; i<profiles.length; i++) {
                if((candidacy.User._id).toString() === (profiles[i].User).toString()) {
                    candidacy.ProfileCandidate = profiles[i]
    
                    for(let t=0; t<profile_industry.length; t++) {
                        if((profiles[i]._id).toString() === (profile_industry[t].Profile).toString()) {
                            candidacy.IndustryCandidate = profile_industry[t].Industry
                            console.log('Industry', profile_industry[t].Industry)
                            
                            break
                        }
                    }    
                    break
                }
            }

            console.log('candidate', candidacy.IndustryCandidate)

            for(let i=0; i<project_owner.length; i++) {
                if((candidacy.Call_Project.Project._id).toString() === (project_owner[i].Project).toString()) {
                    candidacy.OwnerUser = project_owner[i].User

                    for(let j=0; j < profiles.length; j++) {
                        if((project_owner[i].User._id).toString() === (profiles[j].User).toString()) {
                            candidacy.OwnerProfile = profiles[j]

                          for(let t=0; t<profile_industry.length; t++) {
                            if((profiles[j]._id).toString() === (profile_industry[t].Profile).toString()) {
                                candidacy.OwnerIndustry = profile_industry[t].Industry
                                break
                            }
                           }    
                           break
                        }
                    }

                    break
                }
            }
          
        })   
        res.json(candidacies)
    }
    catch(err)
    {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})



// @route  GET api/admin/users
// @desc   Get all the registered users
// @access Private 

router.get('/users', async(req, res) => {
    try{
        const users = await User.find()
        res.json(users)
    }
    catch(err)
    {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})


// @route    POST api/admin/auth
// @desc     Authenticate user & get token
// @access   Private
router.post(
    '/auth',
    [
        check('email', 'Please include a valid e-mail').isEmail(),
        check('password', 'Password is required').exists()
    ],
    async(req, res) => {

        console.log("Control started");

        const errors = validationResult(req);

        if(!errors.isEmpty())
        {return res.status(400).json({errors: errors.array()})}

        const {email, password} = req.body

        try {
            console.log("Controllo credenziali collaborator")
            let user = await Collaborator.findOne({email})
            
            if(!user){
                return res 
                        .status(400)
                        .json({errors:[{msg:'Credenziali invalide'}]})
            }
            
            const isMatch = await bcrypt.compare(password, user.password)

            if(!isMatch){
                return res
                    .status(400)
                    .json({errors: [{msg: 'Credenziali invalide'}]})
            }

            console.log("test")
            console.log("id" + user.id)

            const payload = {
                user: {
                    id: user.id
                }
            }
            console.log("test2 - first")

            console.log(payload)

            console.log("test2 - before")

            jwt.sign(
                payload,
                config.get('jwtToken'),
                {expiresIn:'5 days'},
                (err, token) => {
                    if(err) throw err;
                    console.log("My token " + token)
                    res.json({token})
                }
            );

        } catch (err) {
            console.error(err.message)
            res.status(500).send('Sever error')
        }
    }
)

// @route    GET api/admin/auth
// @desc     Get user by token
// @access   Private
router.get(
    '/auth',
    auth,
    async(req, res) => {
        
    console.log("inside collaborator 1")
       // console.log(req.user.id)
      //  console.log("hello")
      //  console.log("inside collaborator 2")
      //console.log(req)

    try {
            const collaborator = await Collaborator.findById(req.user.id).select('-password');
           
            //console.log("I am actually inside");
            res.json(collaborator);
        } catch (err) {
            // console.log("ERR I am actually inside");
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);


//@route     api/users
//@desc     Test route
//@access   Public
router.post('/register', [
    check('name', 'Name is require')
        .not()
        .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
        'password',
        'Please eneter a password with 6 or more characters'
    ).isLength({min: 6})
], async (req, res) => {
    
    const errors = validationResult(req)

    if(!errors.isEmpty())
    {
        return res.status(400).json({errors: errors.array()})
    }
    
    const { name, email, password } = req.body;
    const role = "administrator";

    try{
        // See if user exists
        let user = await Collaborator.findOne({ email });

        if(user){
            res.status(400).json({ errors: [{msg: 'User already exists'}]})
        }

        user = new Collaborator({
            name,
            email,
            password,
            role
        })

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt); // Hash the password

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


// @route    POST api/admin/position
// @desc     Insertion of a new position
// @access   Private
router.post(
    '/position',
    auth,
    async(req, res) => {
    
    const newPosition= req.body.data;

    const newPos = new Position({
        Position: newPosition
    })

    try {
        const position = await newPos.save();
        res.json(position)
    }
    catch(err)
    {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})


// @route    GET api/admin/position
// @desc     Get all the positions
// @access   Private
router.get('/position', auth, async(req, res) => {
    try{
        const positions = await Position.find();
        res.json(positions);
    }
    catch(err)
    {
        res.status(500).send('Server Error');
    }
})

// @route    POST api/admin/industry
// @desc     Insertion of a new industry
// @access   Private
router.post('/industry', auth, async(req, res) => {

    const newIndustry = req.body.data;

    const newInd = new Industry({
        Industry: newIndustry
    })

    try{
        const industry = await newInd.save();
        res.json(industry);
    }
    catch(err)
    {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})


// @route    GET api/admin/industry
// @desc     Get all the industries
// @access   Private
router.get('/industry', auth, async(req, res) => {
    try{
        const industries = await Industry.find();
        res.json(industries);
    }
    catch(err)
    {
        res.status(500).send('Server Error');
    }
})




//-----
// @route    POST api/admin/devstage
// @desc     Insertion of a new development stage
// @access   Private
router.post('/devstage', auth, async(req, res) => {

    const receivedDevStage = req.body.data;

    const newDevStage= new Development_Stage({
        Development_Stage: receivedDevStage
    })

    try{
        const devStage = await newDevStage.save();
        res.json(devStage);
    }
    catch(err)
    {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})


// @route    GET api/admin/industry
// @desc     Get all the industries
// @access   Private
router.get('/devstage', auth, async(req, res) => {
    try{
        const devStage = await Development_Stage.find();
        res.json(devStage);
    }
    catch(err)
    {
        res.status(500).send('Server Error');
    }
})


//-----
// @route    POST api/admin/analysis-question
// @desc     Insertion of a new development stage
// @access   Private
router.post('/analysis-question', auth, async(req, res) => {

    const receivedQuestion = req.body.data;

    console.log("Test")

    const newAnalysisQuestion = new Analysis_Question({
        Question: receivedQuestion
    })

    try{
        const analysisQuestion = await newAnalysisQuestion.save();
        res.json(analysisQuestion);
    }
    catch(err)
    {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})


// @route    GET api/admin/industry
// @desc     Get all the industries
// @access   Private
router.get('/analysis-question', auth, async(req, res) => {
    try{
        const analysisQuestions = await Analysis_Question.find();
        res.json(analysisQuestions);
    }
    catch(err)
    {
        res.status(500).send('Server Error');
    }
})

//@route GET api/admin/projects/pending
//@desc
//@access Private
router.get('/projects/pending', auth, async(req, res) => {
  try {
    const pendingProjects = await Project.find({Status: 'PENDING'}).populate('Development_Stage')
    res.json(pendingProjects)
  } catch (err) {
    res.status(500).send('Server Error');
  }
})


module.exports = router;