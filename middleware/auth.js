const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = function(req, res, next){

    
  console.log("Middleware 1")
    //Get token from header
    const token = req.header('x-auth-token')

    console.log("Middleware 2 ")
    //console.log(req)

    if(!token){
      console.log("ERRRROR")
        return res.status(401).json({msg: 'No token, authorization denied'})
    }
    console.log("Middleware 3 ")
    
     // Verify token
     try {
         jwt.verify(token, config.get('jwtToken'), (error, decoded) => {
              if (error) {
                return res.status(401).json({ msg: 'Token is not valid' });
              } else {
               
                req.user = decoded.user;

                console.log("inside middleware 1")
                
              //  console.log(req.user.id)
                
                console.log("inside middleware 2")


                next();
              }
            });
      } catch (err) {
        console.error('something wrong with auth middleware');
        res.status(500).json({ msg: 'Server Error' });
      }
}