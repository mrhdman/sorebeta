var express = require('express');
var router = express.Router();
const db = require('../database');

router.get('/getalltime',(req, res)=>{
    const logQuery = `SELECT * FROM log;`
    db.query(logQuery).then((results)=>{
        res.json(results)
        // console.log(results);
    }).catch((error)=>{
        if(error){throw error}
    })
})





module.exports = router;