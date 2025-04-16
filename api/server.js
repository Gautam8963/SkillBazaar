require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port =  3001;
const MongoConnection = require("./config/database");
const userRoutes = require("./routes/UserRoutes");
const freelancerRoutes = require("./routes/FreelancerRoutes");
const clientRoutes = require("./routes/ClientRoutes");
const chatRoutes = require("./routes/ChatRoutes");
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
MongoConnection();

app.use("/user", userRoutes);
app.use("/freelancer", freelancerRoutes);
app.use("/client", clientRoutes);
app.use("/chat", chatRoutes);

app.use("/ProfilePic", express.static(__dirname + "/uploads/Users_imgs"));
app.use("/ServicePic", express.static(__dirname + "/uploads/UsersServices"));

const PORT =  3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
