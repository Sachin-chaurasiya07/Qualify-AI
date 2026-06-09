import jwt from "jsonwebtoken"

const genToken = async (userId) => {
    try {
        const token = jwt.sign({userId} , process.env.JWT_SECRET , {expiresIn:"7D"})
        return token
        
    } catch (error) {
        
    }


}

export default genToken;

