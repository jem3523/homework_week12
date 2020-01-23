var mysql = require("mysql");
var pw = require ("./security"); 
var myFunction = require("./functions")

var connection = mysql.createConnection(
{
  host: "localhost",
  port: 3306,
  user: "root",
  password: pw,
  database: "company_db"
});

connection.connect(function(err) 
{
  if (err) throw err;
  myFunction.passConnection(connection);
  myFunction.start();
});
