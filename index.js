require("dotenv").config()
const express = require("express")
const app = express()
const port = process.env.PORT || 3000
const routers = require("./routes/index.route")
const cookieParse = require("cookie-parser")
const swaggerUi = require("swagger-ui-express")
const swaggerDocument = require("./docs/swagger.json")
app.use(cookieParse())
require("./DB/connection")
app.use(express.json())
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use("/api", routers)


app.listen(port, () => {
    console.log(`server run on port ${port} Successfully`)
})