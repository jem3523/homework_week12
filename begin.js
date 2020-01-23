var mysql = require("mysql");
var inquirer = require("inquirer");
var consoleTable = require ("console.table");
var pw = require ("./security"); 
var begin = require("./functions")

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
  begin.passConnection(connection);
  begin.start();
});
