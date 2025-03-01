const express = require('express');
const cors = require('cors');
const app = express();
const bcrypt = require('bcrypt');

app.use(cors());
app.options('*', cors());

const bodyParser = require('body-parser');
const mysql = require('mysql');

//app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

const mysql_con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ois'
});

mysql_con.connect();

app.listen(8000, () => {
  console.log('Server listens port 8000');
});

/**
 * user e-mail and password check
 */
app.route('/authenticate').post((req, res) => {
  let user_email = req.body.email;
  let user_password = req.body.password;

  mysql_con.query('SELECT * FROM ois.user WHERE email=?', user_email, function(
    err,
    results
  ) {
    if (err) {
      throw err;
    } else {
      if (results.length > 0) {
        bcrypt.compare(user_password, results[0].password, function(
          err,
          compareResult
        ) {
          if (err) throw err;

          if (compareResult) {
            res.send({
              data: results[0],
              message: 'User Succesfully Authenticated'
            });
          } else {
            res.send({
              data: [],
              message: 'User Authenticated Failed!'
            });
          }
        });
      } else {
        res.send({
          data: [],
          message: 'Email does not exists'
        });
      }
    }
  });
});

app.route('/getenumtypes').get((req, res) => {
  mysql_con.query(
    "SHOW COLUMNS FROM ois.user WHERE Field = 'gender' or Field = 'blood_type'",
    function(err, result) {
      if (err) {
        throw err;
      } else {
        res.send({
          data: result
        });
      }
    }
  );
});

app.route('/postnewuser').post((req, res) => {
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) throw err;

    req.body.password = hash;
    mysql_con.query('INSERT INTO ois.user SET ? ', req.body, function(
      err,
      results
    ) {
      if (err) {
        return res.send({
          error: true,
          data: [],
          message: 'Email exists'
        });
      } else {
        return res.send({
          error: false,
          data: results,
          message: 'Registration successful'
        });
      }
    });
  });
});
