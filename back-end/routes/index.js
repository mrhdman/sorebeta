var express = require('express');
var router = express.Router();
const pgp = require('pg-promise')();
const config = require('../config');
const connection = config.pg;
const db = pgp(connection);
const bcrypt = require('bcrypt-nodejs');
const randToken = require('rand-token');


router.get('/login'),(req,res)=>{
  const selectQuery = `SELECT * FROM users WHERE username = $1`;
  const pgPromise = db.query(selectQuery,[req.user.username]);
  pgPromise.then((data)=>{
    if(data.length === 0){
      console.log("Not Found")
      const insertQuery = `INSERT into users (username) VALUES ($1) returning id`;
      db.query(insertQuery,[req.user.username]).then((id)=>{
        const payload = {id, username: req.user.username}
        const token = jwt.sign(payload, config.jwtSecret, {expiresIn: "1d"});
        sendToken(res, token);
      }).catch((error)=>{
        res.json(error)
      })
    }else{
      console.log("Found")
      const payload = {id: data.id, username: data.username};
      const token = jwt.sign(payload, config.jwtSecret, {expiresIn: "1d"});
      console.log(token)
      sendToken(res, token);
    }
  }).catch((error)=>{
    res.json(error)
  })
}

function sendToken(res,token){
  res.send(
    `
    <script>
      window.opener.postMessage(
        {
          payload: ${JSON.stringify(token)},
          status: 'success'
        },
        window.opener.location
      );
    </script>
    `
  )
}

router.post('/register',(req, res)=>{
  // checking if the username exists
  const checkUsernameQuery = `SELECT * FROM users WHERE USERNAME = $1`;
  db.query(checkUsernameQuery,[req.body.username]).then((results)=>{
    // console.log(results);a
    if(results.length === 0){
      // user doesn't exist.. let's add them.
      // const password = bcrypt.hashSync(req.body.password);
      const insertUserQuery = `INSERT INTO users (username,password,token) VALUES ($1,$2,$3)`;
      const token = randToken.uid(50);
      const hash = bcrypt.hashSync(req.body.password);
      db.query(insertUserQuery,[req.body.username,hash,token,]).then(()=>{
        res.json({
          msg: "userAdded",
          token,
          username: req.body.username
        });
      })
    }else{
      // User already exists
      res.json({msg: "userExists"})
    }
  }).catch((error)=>{
    if(error){throw error;}
  })
})

router.post('/login', (req, res)=>{
  const username = req.body.username;
  const password = req.body.password;
  // Get the row with this username from PG
  const selectUserQuery = `SELECT * FROM users WHERE username = $1`;
  db.query(selectUserQuery,[username]).then((results)=>{
    if(results.length === 0){
      res.json({
        msg: "badUser"
      })
    }else{
      // user exists.
      // check password
      const checkHash = bcrypt.compareSync(password, results[0].password);
      // checkHash is a bool
      if(checkHash){
        // match
        const token = randToken.uid(50);
        const updateTokenQuery = `UPDATE users SET token = $1
          WHERE username = $2`;
          db.query(updateTokenQuery,[token,username]).catch((error)=>{
            if (error){throw error};
          })
        res.json({
          msg: "loginSuccess",
          token,
          username
        })  
      }else{
        // bad password. Bye
        res.json({
          msg: "badPassword"
        })
      }
    }
  }).catch((error)=>{
    if(error){throw error}
  })
})

router.post('/workout/create',(req, res)=>{
      console.log(req.body)
      const insertWorkoutNameQuery = `INSERT INTO workouts (name,sets,reps,weight,notes,username) VALUES ($1,$2,$3,$4,$5,$6)`;
      db.query(insertWorkoutNameQuery,[req.body.name,req.body.sets,req.body.reps,req.body.weight,req.body.notes,req.body.username]).then(()=>{
        res.json({
          msg: "workoutAdded",
        });
    }).catch((error)=>{
    if(error){throw error}
  })
})

router.post('/timer/stopwatch',(req, res)=>{
  console.log(req.body)
  const insertLogQuery = `INSERT INTO log (name,llength,date,notes,username) VALUES ($1,$2,$3,$4,$5)`;
  db.query(insertLogQuery,[req.body.name,req.body.llength,req.body.todaysDate,req.body.notes,req.body.username]).then(()=>{
    res.json({
      msg: "logAdded",
    });
  }).catch((error)=>{
    if(error){throw error;}
  })
})

module.exports = router;
