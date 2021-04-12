const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Project  = require('../../models/Project');
const User = require('../../models/User');
const checkObjectId = require('../../middleware/checkObjectId');
const Project_Owner = require('../../models/Project_Owner')
const Project_Industry = require('../../models/Project_Industry')
const Project_Analysis = require('../../models/Project_Analysis')
const Call_Project = require('../../models/Call_Project')

// @route    GET api/projects/usercalls
// @desc     Get all the calls created by the user
// @access   Private
router.get('/usercalls', auth, async(req, res) => {
  try{

    //List Project and Industry
    listProjectIndustry = await Project_Industry.find().populate('Industry')
    var i
    var flag

    //Get all the id of the projects that belong to the user
    const listProjectsId = await Project_Owner.find({User: req.user.id})

    const listCalls = await Promise.all(listProjectsId.map(async (project, index) => {
      
     var calls =   await Call_Project
                        .find({Project: project.Project})
                        .populate('Project')
                        .populate('Position')
                        .populate({path:'Project', populate: {path: 'Development_Stage'}})
                        .lean() // NOTE: mongoose query results are not extensible

    
    calls.map(call => {

      // call.Project._id 
      // 
      i = 0
      flag = true
      // console.log('***single call', call)

      while(flag && i<listProjectIndustry.length) 
      {

        // console.log('**3', call.Project._id, listProjectIndustry[i].Project)

        if(JSON.stringify(call.Project._id) === JSON.stringify(listProjectIndustry[i].Project)) 
        {
          // Add field
          call.Industry = listProjectIndustry[i].Industry.Industry
          flag = false
        }
        i++
      }
    })

    return calls
    
      
    }))
    
    res.json(listCalls)

  }catch(err)
  {
    res.status(500).send('Server Error');
  }
})


// @route    GET api/projects/user
// @desc     Get all the projects that belongs to a certain user
// @access   Private
router.get('/user', auth, async(req, res) => {

    try{
      //Get all the id of the projects that belong to the user
      const listProjectsId = await Project_Owner.find({User: req.user.id}).populate('Project').populate({path:'Project', populate: {path: 'Development_Stage'}}).lean() // NOTE: mongoose query results are not extensible

      
       //List Project and Industry
    listProjectIndustry = await Project_Industry.find().populate('Industry')

    var i
    var flag

    //Add Industry for each project
    listProjectsId.map(project => {

      // call.Project._id 
      // 
      i = 0
      flag = true

      while(flag && i<listProjectIndustry.length) 
      {

        if(JSON.stringify(project.Project._id) === JSON.stringify(listProjectIndustry[i].Project)) 
        {
          // Add field
          project.Industry = listProjectIndustry[i].Industry.Industry
          flag = false
        }
        i++
      }
    })
    
    console.log(listProjectsId)
      // const 
      res.json(listProjectsId)

    }catch(err)
    {
      res.status(500).send('Server Error');
    }
})



// @route    GET api/projects/public-calls
// @desc     Get publiv calls to show
// @access   Public
router.get('/public-calls', async(req, res) => {

  try{

    //Get all the calls
    var listCalls = await Call_Project
                        .find({Status: 'ACCEPTED'})
                        .populate('Project')
                        .populate('Position')
                        .populate({path:'Project', populate: {path: 'Development_Stage'}})
                        .lean() // NOTE: mongoose query results are not extensible
    
    
    //List Project and Industry
    listProjectIndustry = await Project_Industry.find().populate('Industry')

    var i
    var flag

    //Add Industry for each project
    listCalls.map(call => {

      // call.Project._id 
      // 
      i = 0
      flag = true

      while(flag && i<listProjectIndustry.length) 
      {

        if(JSON.stringify(call.Project._id) === JSON.stringify(listProjectIndustry[i].Project)) 
        {
          // Add field
          call.Industry = listProjectIndustry[i].Industry.Industry
          flag = false
        }
        i++
      }
    })

    // const 
    res.json(listCalls)

  }catch(err)
  {
    res.status(500).send('Server Error');
  }
})

// @route    GET api/projects/calls
// @desc     Get all the calls associated to the projects except the user's calls
// @access   Private
router.get('/calls', auth, async(req, res) => {

  try{

    //Get all the calls
    var listCalls = await Call_Project
                        .find({Status: 'ACCEPTED'})
                        .populate('Project')
                        .populate('Position')
                        .populate({path:'Project', populate: {path: 'Development_Stage'}})
                        .lean() // NOTE: mongoose query results are not extensible
    
    // https://stackoverflow.com/questions/47297976/mongoose-find-not-working-with-not-query
    //Project of the user that calls the API
    const listProjectsId = await Project_Owner.find({User : {"$ne" : req.user.id}}).select('Project -_id');

    console.log('firstCheck', listProjectsId)

    let resultTemp = []
    //Select the calls that NOT belong to the user's projects
    
    listProjectsId.map(element => (listCalls.map(call => {if(call.Project._id.toString() === element.Project.toString()) {resultTemp.push(call)}
                                                          })))
    // listProjectsId.forEach(element => console.log('the-element',element.Project))
    // listCalls.map(element => console.log('call', element.Project._id))

    console.log('test: ', resultTemp)
    console.log('filteredListCall: ', listCalls)

    //List Project and Industry
    listProjectIndustry = await Project_Industry.find().populate('Industry')

    var i
    var flag

    //Add Industry for each project
    resultTemp.map(call => {

      // call.Project._id 
      // 
      i = 0
      flag = true

      while(flag && i<listProjectIndustry.length) 
      {

        if(JSON.stringify(call.Project._id) === JSON.stringify(listProjectIndustry[i].Project)) 
        {
          // Add field
          call.Industry = listProjectIndustry[i].Industry.Industry
          flag = false
        }
        i++
      }
    })

    // const 
    res.json(resultTemp)

  }catch(err)
  {
    res.status(500).send('Server Error');
  }
})




// @route    POST api/posts
// @desc     Create a Project
// @access   Private
router.post('/', auth, async (req, res) => {

    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const projectFields = {
      Name: req.body.Name,
      Description: req.body.Description,
      Headquarter: req.body.Headquarter
    }

    // KEPT FOR OTHER POURPOUSES

    // const newProject = new Project({
    //   user: req.user.id,
    //   title,
    //   text,
    //   field,
    //   headquarter,
    //   development_stage,
    //   collaboration_types,
    //   positions_searched: Array.isArray(positions_searched)
    //     ? positions_searched
    //     : positions_searched.split(',').map((element) => ' ' + element.trim()),
    //   team_members: Array.isArray(team_members)
    //     ? team_members
    //     : team_members.split(',').map((element) => ' ' + element.trim()),
    //   skills_searched: Array.isArray(skills_searched)
    //     ? skills_searched
    //     : skills_searched.split(',').map((element) => ' ' + element.trim()),
    //   skills_searched: Array.isArray(skills_searched)
    //     ? skills_searched
    //     : skills_searched.split(',').map((element) => ' ' + element.trim())      
    // })

    try {
      
      // let project = await Project.findOneAndUpdate(
      //   {user: req.user.id},
      //   {$set: projectFields},
      //   {new:true, upsert: true}
      // )

    let project = new Project({
      Name: req.body.Name,
      Description: req.body.Description,
      Headquarter: req.body.Headquarter,
      Development_Stage: req.body.Development_Stage
    })
      
    const proj = await project.save();

    //Definition of the link between the creator of the project (owner) and the project itself
    let ownerProject = new Project_Owner({
      User: req.user.id,
      Project: proj._id
    })

    const resultOwnerProject = await ownerProject.save();

    let addIndustry = await Project_Industry.findOneAndUpdate(
      {Project: proj._id},
      {
        Project: proj._id,
        Industry: req.body.Industry
      },
      {new: true, upsert: true, setDefaultsOnInsert: true}
    );

    // Adition question analysis 
    for (const [key, value] of Object.entries(req.body.Analysis_Question)) {
      
      let addAnalysisQuestion = new Project_Analysis({
        Project: proj._id,
        Analysis_Question: key,
        Answer: value
      })
      
      const analysisQuest = await addAnalysisQuestion.save();

    }

    res.json(proj)

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

router.get('/owner/:id', auth, async (req,res) => {
  try {
    console.log('owner')
    const ownerProject = await Project_Owner.find({Project: req.params.id})
    res.json(ownerProject)
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})


// @route    GET api/projects
// @desc     Get all projects
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
   
    const projects = await Project.find().sort({ date: -1 });

    res.json(projects);
    
  } catch (err) {
   
    res.status(500).send('Server Error');
  }
});

// @route    GET api/projects/showcase
// @desc     Get all projects
// @access   Public
router.get('/showcase', async (req, res) => {
  try {
    // const projects = await Project
    //                               .find({"Status": "Draft"})
    //                               .sort({'Date_Inserted': -1})
    //                               .limit(3)
    //                               .populate('users', ['name']);

    const availableCalls = await Call_Project.find()
                                            .sort({'Date_Inserted': -1})
                                            .limit(3)
                                            .populate('Project')
                                            .populate('Position')
                                            .populate({path:'Project', populate: {path: 'Development_Stage'}})
                                            .lean() // NOTE: mongoose query results are not extensible

     //List Project and Industry
     listProjectIndustry = await Project_Industry.find().populate('Industry')
     var i
     var flag
 
 
     const listCalls = await Promise.all(availableCalls.map(async (call, index) => {
       
        
      i = 0
      flag = true
      // console.log('***single call', call)
 
       while(flag && i<listProjectIndustry.length) 
       {
 
         if(JSON.stringify(call.Project._id) === JSON.stringify(listProjectIndustry[i].Project)) 
         {
           // Add field
           call.Industry = listProjectIndustry[i].Industry.Industry
           flag = false
         }
         i++
       }
     
 
     return call
     
       
     }))











    res.json(listCalls);
   
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error - showcase');
  }
  
});

// @route    GET api/projects/showcase
// @desc     Get all projects
// @access   Public
router.get('/call/:id', async (req, res) => {
  try {
    
    var callInformation = await Call_Project
                                        .findById(req.params.id)
                                        .populate('Project')
                                        .populate('Position')
                                        .populate({path:'Project', populate: {path: 'Development_Stage'}})
                                        .lean() // NOTE: mongoose query results are not extensible
    
    const projectAnalysis = await Project_Analysis
                                        .find({Project: callInformation.Project._id })
                                        .populate('Analysis_Question')
    
    
    //List Project and Industry
    listProjectIndustry = await Project_Industry.find().populate('Industry')


    var i
    var flag

    //Add Industry for each project
    // callInformation.map(call => {

      // call.Project._id 
      // 
      i = 0
      flag = true

      while(flag && i<listProjectIndustry.length) 
      {

        if(JSON.stringify(callInformation.Project._id) === JSON.stringify(listProjectIndustry[i].Project)) 
        {
          // Add field
          callInformation.Industry = listProjectIndustry[i].Industry.Industry
          flag = false
        }
        i++
      }
    // })

    callInformation.ProjectAnalysis = projectAnalysis
    
    res.json(callInformation);


  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
  
});

// @route    GET api/projects/showcase
// @desc     Get all projects
// @access   Public
router.get('/showcase/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' })
    }

    
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
  
});

// @route    GET api/projects/showcase
// @desc     Get all projects
// @access   Public
router.get('/industry/:id', async (req, res) => {
  try {
    const projectIndustry = await Project_Industry.find({Project: req.params.id}).populate('Industry');
        
    res.json(projectIndustry);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
  
});



// @route    GET api/projects/:id
// @desc     Get project by ID
// @access   Private
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('Development_Stage')
      .lean(); // Call to the database

    const projectAnalysis = await Project_Analysis
                                        .find({Project: req.params.id })
                                        .populate('Analysis_Question')
    project.ProjectAnalysis = projectAnalysis
    
    console.log(project)
    
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' })
    }

    res.json(project);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    DELETE api/projects/:id
// @desc     Delete a project
// @access   Private
router.delete('/:id', [auth, checkObjectId('id')], async (req, res) => {
  try {

    console.log("I AM HERE - 2")

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'project not found' });
    }

    // Check user
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await project.remove();

    res.json({ msg: 'project removed' });
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});

// @route    PUT api/projects/like/:id
// @desc     Like a project
// @access   Private
router.put('/like/:id', [auth, checkObjectId('id')], async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    // Check if the project has already been liked
    if (project.likes.some(like => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'project already liked' });
    }

    project.likes.unshift({ user: req.user.id });

    await project.save();

    return res.json(project.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/projects/unlike/:id
// @desc     Unlike a project
// @access   Private
router.put('/unlike/:id', [auth, checkObjectId('id')], async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    // Check if the project has not yet been liked
    if (!project.likes.some(like => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'project has not yet been liked' });
    }

    // remove the like
    project.likes = project.likes.filter(
      ({ user }) => user.toString() !== req.user.id
    );

    await project.save();

    return res.json(project.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/projects/comment/:id
// @desc     Comment on a project
// @access   Private
router.post(
  '/comment/:id',
  [
    auth,
    checkObjectId('id'),
    [check('text', 'Text is required').not().isEmpty()]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const project = await Project.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      project.comments.unshift(newComment);

      await project.save();

      res.json(project.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    DELETE api/projects/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    // Pull out comment
    const comment = project.comments.find(
      comment => comment.id === req.params.comment_id
    );
    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }
    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    project.comments = project.comments.filter(
      ({ id }) => id !== req.params.comment_id
    );

    await project.save();

    return res.json(project.comments);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});


// @route    POST api/posts
// @desc     Create a Project
// @access   Private
router.post('/new-call', auth, async (req, res) => {

  console.log(req.body)
  try{
    let pos  = '6074b0c6e25f3348639fb03a'
    // if(req.body?.Position !== '') {
      pos = req.body.Position
    // } 


    let callProject = new Call_Project({
      Project: req.body.Project,
      Position: pos,
      Type_Colaboration: req.body.Type_Colaboration,
      City_Presence_Required: req.body.City_Presence_Required,
      Skills: req.body?.Skills.split(',').map((skill) => ' ' + skill.trim())
    })

    const saveCallProject = await callProject.save();
    res.json(saveCallProject)

  } catch (err) {
    res.status(500).send('Server Error');
  }

})



module.exports = router;
