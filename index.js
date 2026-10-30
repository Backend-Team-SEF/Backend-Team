require("dotenv").config()
const express = require("express")
const app = express()
const port = process.env.PORT || 3000
const errorHandler = require("./middleware/error.middleware");
const routers = require("./routes/index.route")
const cookieParse = require("cookie-parser")
app.use(cookieParse())
require("./DB/connection")
app.use(express.json())
app.use("/api", routers)
app.use(errorHandler)


app.listen(port, () => {
    console.log(`server run on port ${port} Successfully`)
})