const mongoose = require("mongoose")
require("dotenv").config()
mongoose.connect(process.env.DB_CONNECTION_URL)
    .then(() => { console.log("dataBase Connected Successfully") })
    .catch((error) => {
        console.log(error)
        console.log("DB not connected")
    })

