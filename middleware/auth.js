const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token =
    req.cookies.token ||
    req.body.token ||
    req.header("Authorization").replace("Bearer ", "")

  // Authorization - This is the key created in headers with value - Bearer <token>
  // so token can be fetched from here

  if (!token) {
    return res.status(403).send("The token is missing");
  }

  try {
    // verifying token
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    console.log(decode); // payload which was sent is coming like _id and email
    req.user = decode;
    // information from the db like name of user
  } catch (error) {
    return res.status(401).send("Invalid token");
  }
  return next();
};

module.exports = auth;