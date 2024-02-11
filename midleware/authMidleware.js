const jwt = require('jsonwebtoken');

const authenticateToken=(req,res,next)=>{
    // try{
        const token = req.headers['authorization'];
        console.log("token",token);
        if(!token){
            return res.status(401).json({message:'Access denied'});
        }

        jwt.verify(token,'ict-dynamic-form',(err,decoded)=>{
            if(err){
                console.log("Error",err);
                console.error("error",err);
                return res.status(401).json({message:'Invalid token'});
                
            }
            req.userId = decoded.userId;
            next();
        });
    // };
    // catch(error){
        
    // }
};

module.exports = authenticateToken;