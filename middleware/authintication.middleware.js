const User = require("../models/user.model") 
const jwt = require("jsonwebtoken")


const authintication = async (req, res, next) => {
  try{  let token = req?.cookies?.access_token?.split(" ")[1]
    if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader?.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            }
        }
    if (!token) {
         return res.status(401).send({
           success: false,
           message: "Token is required",
            });
        }
    const decode = jwt.verify(token, process.env.SECRET_KEY)
    if (!decode) {
        return res.status(401).send({ message: "token is requierd" })
    }
    const user = await User.findById(decode.id).select("-password -tokens")
    if (!user) {
        return res.status(401).send({ message: "UN Authorized User" })
    }
    req.user = user
    next()}
    catch(error){
         res.status(401).send({ message: error.message })
    }
}
const AminAuthintication = [
    authintication,
    (req, res, next) => {
        if (req.user.role !== "Admin") {
            return res.status(403).send({
                success: false,
                message: "Access denied. Admin only",
            });
        }

        next();
    },
];

module.exports = {
    authintication,
    AminAuthintication
}