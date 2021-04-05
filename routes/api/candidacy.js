const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Project  = require('../../models/Project');
const User = require('../../models/User');
const CandidateProject = require('../../models/Candidacy')
const checkObjectId = require('../../middleware/checkObjectId');
const Profile = require('../../models/Profile')
const Project_Industry = require('../../models/Project_Industry')

// @route    POST api/candidacy/update/status
// @desc     Update the status of the candidature
// @access   Private
router.post('/update/status', async(req, res) => {
  try {
     const date = new Date(Date.now()).toISOString()

     const candidacyUpdated = await CandidateProject.updateOne({'_id' :  req.body.idCandidature}, {
       $set: {
         Status: req.body.Status, 
         Feedback: req.body.Feedback.formData, 
         Date_Closed: date
       }
     })

     console.log(candidacyUpdated)

    return res.json(candidacyUpdated)     
  }catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
  
})


// @route    GET api/candidacy/users/:id
// @desc     Get all candidacies for a call
// @access   Private
router.get('/users/:id', async (req, res) => {
  try {
    
    const candidates = await CandidateProject.find(
      {Call_Project: req.params.id}
          )
        .populate('Call_Project')
        .populate('User')
        .sort({Date_Inserted:-1})
        .lean()


        // const candidates = await CandidateProject.find(
        //   {
        //     $and:[
        //       {Call_Project: req.params.id},
        //       {$or: [{Status: "Valutazione"}, {Status:"Accettato"}]}
        //     ]
        //   })
        //     .populate('Call_Project')
        //     .populate('User')
        //     .lean()
    
    const candidatesInformation = await Promise.all(candidates.map(async (candidature) => {
      //Get profile
      let profile = await Profile.find({User:candidature.User._id})
                                .populate('Position')
                                .lean() // NOTE: mongoose query results are not extensible
                                
      candidature.Profile = profile[0]
      return candidature
    }))

    res.json(candidatesInformation)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
  
});

// @route    GET api/candidacy/users/:id
// @desc     Get all candidacies for a call
// @access   Private
router.get('/users/summary/:id', async (req, res) => {
  try {
    
    const candidates = await CandidateProject.find({Call_Project: req.params.id})
        .populate('Call_Project')
        .populate('User')
        .lean()
    
    let candidatesInformation = []   
    candidatesInformation = await Promise.all(candidates.map(async (candidature) => {
      //Get profile
      let profile = await Profile.find({User:candidature.User._id})
                                .populate('Position')
                                .lean() // NOTE: mongoose query results are not extensible
                                
      candidature.Profile = profile[0]
      return candidature
    }))

    

    res.json({'data': candidatesInformation, 'candidatureId' : req.params.id})

  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
  
});

// @route GET api/candidacy/update
// @desc     Update candidacy by id
// @access   Private
router.post('/update', auth, async(req, res) => {
  try {
    const candidacyUpdated = await CandidateProject.findByIdAndUpdate({_id: req.body.idCandidature},
     {Motivational_Letter: req.body.Motivational_Letter}, {
       new: true,
       upsert: true
     })
    return res.json(candidacyUpdated)
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})

// @route GET api/candidacy/usercandidature/id
// @desc     Get candidacy user by id
// @access   Private
router.get('/usercandidature/:id', async(req, res) => {
  try{
    console.log(req.params.id)
    const candidacyById = await CandidateProject.findById(req.params.id)
    console.log(candidacyById)
    res.json(candidacyById);
  }
  catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})

// @route    GET api/candidacy/user
// @desc     Get all the candidacies that belongs to a user
// @access   Private
router.get('/user', auth, async(req, res) => {

  console.log("I am here")

  try{

    //List Project and Industry
    const listProjectIndustry = await Project_Industry.find().populate('Industry')
    var i
    var flag


    //Get all the candidacies that belong to the user
    const listCandidacies = await CandidateProject.find({User: req.user.id}).populate('Call_Project').populate({path:'Call_Project', populate: {path: 'Project', populate: 'Development_Stage'}}).populate({path:'Call_Project', populate: {path: 'Position'}}).lean()
    // const listProjectsId = await Project_Owner.find({User: req.user.id}).populate('Project').populate({path:'Project', populate: {path: 'Development_Stage'}})


    //Add Industry for each project
    listCandidacies.map(project => {

      // call.Project._id 
      // 
      i = 0
      flag = true

      while(flag && i<listProjectIndustry.length) 
      {

        // console.log('**3', project.Project._id, listProjectIndustry[i].Project)

        if(JSON.stringify(project.Call_Project.Project._id) === JSON.stringify(listProjectIndustry[i].Project)) 
        {
          // Add field
          project.Industry = listProjectIndustry[i].Industry.Industry
          flag = false
        }
        i++
      }
    })

    // const 
    res.json(listCandidacies)

  }catch(err)
  {
    res.status(500).send('Server Error');
  }
})

// @route    POST api/candidacy
// @desc     Create a Candidature
// @access   Private
router.post(
    '/', auth ,
    async(req, res) => {
      
      try {

        let newCandidacy = new CandidateProject({
          User: req.user.id,
          Call_Project: req.body.idCandidature,
          Motivational_Letter: req.body.Motivational_Letter
        })


        const saveNewCandidacy = await newCandidacy.save();

        res.json(saveNewCandidacy)
        
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }

    }
)

// @route    GET api/candidacy/id
// @desc     Get all candidacies of a certain project
// @access   Private

router.get('/candidatures_user', auth, async (req, res) => {
  try {
    
    const projectsCandidature = await CandidateProject.find({user:req.user.id}).populate('project', ['title', 'text']);
    
    console.log(projectsCandidature)
    
    res.json(projectsCandidature)
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route    GET api/candidacy/id
// @desc     Get all candidacies of a certain project
// @access   Private
router.get('/:id', auth, async ({params: {id}}, res) => {
  try {

    // console.log(id)

    const candidacies = await CandidateProject.find({project:id, status_candidacy:{ $in: ["Pending","ACCEPTED"]}}).populate('user', ['name', 'avatar']);

    // console.log(candidacies)

    // if (!candidacies) return res.status(400).json({ msg: 'Profile not found' });

   res.json(candidacies);
  

  } catch (err) {
      console.error(err.message);
       res.status(500).json({ msg: 'Server error' });
  }
})





// @route    POST api/candidacy/update_status
// @desc     Update the status of a candidacy
// @access   Private
router.post(
  '/update_status', auth,
  async(req, res) => {

    const {
      candidacyId,
      new_status
    } = req.body

    try {

      //  console.log("sono qui")
      //  console.log(candidacyId)

      const candidacy = await CandidateProject.findByIdAndUpdate(
        {_id: candidacyId},
        {status_candidacy: new_status})


      res.json(candidacy)
      
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }

  }
)

module.exports = router;