const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

//-------------midddleware--------------------------------

app.use( cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}) );


app.use(express.json({limit: "16kb"}))

app.use(express.urlencoded({
    extended: true, 
    limit: "16kb"
}));

app.use(express.static("public"))

app.use(cookieParser());


//-------------routes--------------------------------

app.get("/", (req,res) => {res.status(200).send("Code Running")})

const userRouter = require('./routes/user.route.js')
const attendanceRoutes = require('./routes/attendance.route.js')
const sabhaUserRoutes = require('./routes/sabhaUser.route.js')
const mandalRoutes = require('./routes/mandal.route.js')
const zoneRoutes = require('./routes/zone.route.js')
const roleRoutes = require('./routes/role.route.js')
const designationRoutes = require('./routes/designation.route.js')

app.use('/api/v1/users', userRouter)

app.use("/api/attendance", attendanceRoutes);
app.use("/api/sabhaUser", sabhaUserRoutes);
app.use("/api/mandal", mandalRoutes);
app.use("/api/zone", zoneRoutes);
app.use("/api/role", roleRoutes);
app.use("/api/designation", designationRoutes);


module.exports = app;