var express = require('express');
var router = express.Router();
const db = require('../database');

router.post('/getuserlog',(req, res)=>{
    const token = req.body.token;
    const getUser = `SELECT username from users WHERE token = $1`;
    db.query(getUser,[token]).then((results)=>{
        if(results.length === 0){
            res.json({
                msg: "badToken"
            })
        }else{
            const username = results[0].username;
            const getUserLog = `SELECT * FROM log where username = $1`;
            db.query(getUserLog,[username]).then((results)=>{
                res.json(results);
            })
        }
    })
})

router.get('/trash/:id',(req, res)=>{

    const deleteQuery = `DELETE FROM log WHERE id = $1`;
    db.query(deleteQuery,[req.params.id]).then((results)=>{
        res.json({
            msg: "deleted"
        })
    })
})

module.exports = router;