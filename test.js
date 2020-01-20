var mysql = require("mysql");
var inquirer = require("inquirer");
var consoleTable = require ("console.table");

var connection = mysql.createConnection(
{
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Milroat@1",
  database: "company_db"
});

connection.connect(function(err) 
{
  if (err) throw err;
  //testing()
  start();
});

function start()
{
  inquirer.prompt(
  [
    {
      name: "empRole",
      type: "rawlist",
      choices: async function() 
      {
        var choiceArray = [];
        var results  = await getAllRoles ();
        for (var i = 0; i < results.length; i++) 
        {
          var string1 = results[i].id.toString();
          var string2 = ">> ";
          var string3 = results[i].title;
          var string4 = ">> Dept: ";
          var string5 = results[i].department_id

          console.log(string1)
          var option = string1.concat(string2,string3,string4,string5);
          choiceArray.push(option);
        }
        return choiceArray;
      },
      message: "Select the new employee's role."
    },
    {
      name: "empManager",
      type: "input",
      message: "Enter the manager unique ID."
    },
  ])
  .then(function(answer) 
  {
    addEmployee(answer.empRole, answer.empManager);
  })
}


function addEmployee(inputEmpFirst, inputEmpLast, inputEmpRole, inputEmpManager)
{
  query = "INSERT INTO employee (first_name, last_name, role_id, manager_id) "
  query += "VALUES ('" + inputEmpFirst + "' , '" + inputEmpLast + "' , '" + inputEmpRole + "' , '" + inputEmpManager + "'); ";

  connection.query(query, function(err, res) 
  {
    console.log (inputEmpFirst + " " + inputEmpLast + " has been added as an employee.");
    console.log ();
    ask()
  });
}


function getAllRoles ()
{
  return new Promise(function(resolve, reject) 
  {
    query = "SELECT * FROM (role);";
    connection.query(query, function(error, results)
    {
      if (error) throw error;
      resolve(results);
    });
  })
}

async function testing()
{
  var theGoods = await getAllRoles ();
  console.log ("wait for it ...")
  console.log (theGoods)
}