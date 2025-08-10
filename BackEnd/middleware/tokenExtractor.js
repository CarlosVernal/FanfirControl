const jwt = require("jsonwebtoken");
const User = require("../schema/userSchema");

//3 params for middleware
const tokenExtractor = async (request, response, next) => {
  //get authorization from header request
  const authorization = request.get("authorization");
  //check if authorization is not null and have the Bearer token format
  if (authorization && authorization.startsWith("Bearer ")) {
    try {
      //format the token deleting the Bearer
      const token = authorization.replace("Bearer ", "");
      //verify the token with the secret key
      const decodedToken = jwt.verify(token, process.env.SECRET);
      if (!decodedToken.id) {
        //chekc if the token exists and is valid
        return response.status(401).json({ error: "token missing or invalid" });
      }
      //find the user by id from the token
      const user = await User.findById(decodedToken.id);
      //check if the user exists
      if (!user) {
        return response.status(401).json({ error: "user not found" });
      }
      //add the user to the request
      request.user = user;
      next(); //continue to the next middleware or controller
    } catch (error) {
      next(error);
    }
  } else {
    return response.status(401).json({ error: "token missing or invalid" });
  }
};

module.exports = tokenExtractor;
