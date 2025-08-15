const jwt = require("jsonwebtoken");
const User = require("../models/User");


const tokenExtractor = async (request, response, next) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    try {
      const token = authorization.replace("Bearer ", "");
      const decodedToken = jwt.verify(token, process.env.SECRET);
      if (!decodedToken.id || !decodedToken.email) {
        return response.status(401).json({ error: "token missing or invalid" });
      }
      const user = await User.findById(decodedToken.id);
      if (!user) {
        return response.status(401).json({ error: "user not found" });
      }
      request.user = {
        id: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles
      };
      next();
    } catch (error) {
      next(error);
    }
  } else {
    return response.status(401).json({ error: "token missing or invalid" });
  }
};

module.exports = tokenExtractor;
