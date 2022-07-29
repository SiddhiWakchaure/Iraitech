const express = require("express");
require("./db/mongoose.js");

// fetching all routes
const userRouter = require("./routers/user.js");
const userProfileRouter = require("./routers/userProfile.js");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); //parsing the incoming request
app.use(userRouter);
app.use(userProfileRouter);

app.listen(port, () => {
  console.log("Server is up on port " + port);
});
