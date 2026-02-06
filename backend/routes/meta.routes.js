import {Router} from 'express';
import {universities} from "../database/schema.js";
import {db} from "../config/db.js";

export const metaRouter = Router();

metaRouter.get('/universities', async (req, res) => {
    try {
        const Alluniversities = await db.select().from(universities);

        res.status(200).send({
            success : true,
            message : "successfully fetched",
            universities : Alluniversities
        });

    }
    catch(err){
        res.status(500).send({
            success : false,
            message : "internal Server error"
        })
    }
});



