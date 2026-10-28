// const { registerationScema, loginSchema } = require("../validation/authintichation.validation");

// function registeration(req, res, next) {
//     try {
//         const { error } = registerationScema.validate(req.body);
//         if (error) {
//             return res.status(400).send({
//                 message: error.details[0].message
//             });
//         }
//         next();

//     } catch (error) {
//         return res.status(500).send({
//             message: error.message
//         });
//     }
// }
// function login(req, res, next) {
//     try {
//         const { error } = loginSchema.validate(req.body);
//         if (error) {
//             return res.status(400).send({
//                 message: error.details[0].message
//             });
//         }
//         next();

//     } catch (error) {
//         return res.status(500).send({
//             message: error.message
//         });
//     }
// }
// module.exports ={
//     registeration,
//     login
// }
/////////////////////////////////////////////////////////////////

import { registerationScema, loginSchema } from "../validation/authintichation.validation.js";

function registeration(req, res, next) {
    try {
        const { error } = registerationScema.validate(req.body);

        if (error) {
            return res.status(400).send({
                message: error.details[0].message
            });
        }

        next();
    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
}

function login(req, res, next) {
    try {
        const { error } = loginSchema.validate(req.body);

        if (error) {
            return res.status(400).send({
                message: error.details[0].message
            });
        }

        next();
    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
}

export { registeration, login };