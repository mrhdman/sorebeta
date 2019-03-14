var express = require('express');
var router = express.Router();
const db = require('../database');

router.get('/getWorkouts',(req, res)=>{
    const gameQuery = `SELECT * FROM workouts;`
    db.query(gameQuery).then((results)=>{
        res.json(results)
    }).catch((error)=>{
        if(error){throw error}
    })
})

module.exports = router;