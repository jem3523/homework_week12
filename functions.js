var mysql = require("mysql");
var inquirer = require("inquirer");
var consoleTable = require ("console.table");

var connection = {};
function passConnection(passedConnection)
{
  connection = passedConnection;
}
passConnection();

//This function auto-starts and establishes
//1. a root employee
//2. a copy of the employee table that is used for cross-check
//3. the opening grid of all users
//4. the initial inquery menu of options
function start ()
{
  //checks to see if the employee table is empty.
  //if it is, a root employee is added so that other employees have a placeholder
  //employee to mark as manager.
  addRootEmployee();

  var query  = "DROP TABLE IF EXISTS employeelist ";
    query += "CREATE TABLE employeeList LIKE employee ";
    query += "INSERT INTO employeeList  SELECT * FROM employee;";
    
  connection.query(query, function(err, res) 
  {
    query  = "SELECT employee.id, employee.first_name, employee.last_name, ";
    query += "role.title, role.salary, ";
    query += "department.name 'department', ";
    query += "concat (employeeList.first_name, ' ', employeeList.last_name) 'manager' ";
    query += "FROM (((employee ";
    query += "LEFT JOIN role ON employee.role_id = role.ID) ";
    query += "LEFT JOIN department ON role.department_id = department.ID) ";
    query += "LEFT JOIN employee AS employeeList ON employee.manager_id = employeeList.ID);";

    connection.query(query, function(err, res) 
    {
      console.log ();
      console.log ();
      console.table(res);
      ask();
    });
  });
}

function ask()
{ 
  inquirer.prompt(
  {
    name: "action",
    type: "rawlist",
    message: "What would you like to do?",
    choices: [
      "Add department",
      "Add role",
      "Add employee",
      "View departments",
      "View roles",
      "View employee",
      "View all employees",
      "Update employee role",
      "Update employee manager",
      "Delete employee",
      "Exit"
    ]
  })
  .then(function(answer) 
  {
    switch (answer.action) 
    {
      case "Add department":
        inquirer.prompt(
          {
            name: "departmentName",
            type: "input",
            message: "Enter the new department's name.",
            validate: function(value) 
            {
              if (value === null || value =="") 
              {return false}
              return true;
            }
          })
          .then(function(answer) 
          {
            addDepartment(answer.departmentName);
          })
        break;
        
      case "Add role":
        inquirer.prompt(
          [
            {
              name: "roleName",
              type: "input",
              message: "Enter the new role's title.",
              validate: function(value) 
              {
                if (value === null || value =="" || value ==" ") 
                {return false}
                return true;
              }
            },
            {
              name: "roleSalary",
              type: "input",
              message: "Enter the new role's salary. (Do NOT add commas or decimals.)",
              validate: function(value) 
              {
                if (isNaN(value) === false) 
                {return true;}
                return false;
              }
            },
            {
              name: "departmentID",
              type: "list",
              choices: async function() 
              {
                var choiceArray = [];
                var results  = await getAll ("department");
                for (var i = 0; i < results.length; i++) 
                {
                  var string1 = results[i].id.toString();
                  var string2 = ">> ";
                  var string3 = results[i].name;
        
                  var option = string1.concat(string2,string3);
                  choiceArray.push(option);
                }

                if (choiceArray.length > 0)
                {return choiceArray}
                else
                {
                  console.log();
                  console.log("You must add departments before adding a role.");
                  console.log("This entry will not be saved.");
                  console.log();
                  exit();
                  //return choiceArray = [];
                }
              },
              message: "Select the department ID associated with this role.",
              validate: function(value) 
              {
                if (value === undefined) 
                {return false;}
                return true;
              }
            }
          ])
          .then(function(answer2) 
          {
            addRole(answer2.roleName, answer2.roleSalary, answer2.departmentID);
          })
        break;

      case "Add employee":
        inquirer.prompt(
          [
            {
              name: "empFirst",
              type: "input",
              message: "Enter the new employee's first name.",
              validate: function(value) 
              {
                if (value === null || value =="" || value ==" ") 
                {return false}
                return true;
              }
            },
            {
              name: "empLast",
              type: "input",
              message: "Enter the new employee's last name.",
              validate: function(value) 
              {
                if (value === null || value =="" || value ==" ") 
                {return false}
                return true;
              }
            },
            {
              name: "empRole",
              type: "list",
              choices: async function() 
              {
                var choiceArray = [];
                var results  = await getAll ("role");
                for (var i = 0; i < results.length; i++) 
                {
                  var string1 = results[i].id.toString();
                  var string2 = ">> ";
                  var string3 = results[i].title;
                  var string4 = " >> Dept: ";
                  var string5 = results[i].department_id
        
                  var option = string1.concat(string2,string3,string4,string5);
                  choiceArray.push(option);
                }

                if (choiceArray.length > 0)
                {return choiceArray}
                else
                {
                  console.log();
                  console.log("You must add roles before adding an employee.");
                  console.log("This entry will not be saved.");
                  console.log();
                  exit();
                  //return choiceArray = []
                }
              },
              message: "Select the new employee's role.",
              validate: function(value) 
              {
                if (value === undefined) 
                {return false;}
                return true;
              }
            },
            {
              name: "empManager",
              type: "list",
              message: "Selct the new employee's manager.",
              choices: async function() 
              {
                var choiceArray = [];
                var results  = await getAll ("employee");

                for (var i = 0; i < results.length; i++) 
                {
                  var string1 = results[i].id.toString();
                  var string2 = ">> ";
                  var string3 = results[i].first_name;
                  var string4 = " ";
                  var string5 = results[i].last_name;
        
                  var option = string1.concat(string2,string3,string4,string5);
                  choiceArray.push(option);
                }

                return choiceArray;
              },
            }
          ])
          .then(function(answer) 
          {
            addEmployee(answer.empFirst, answer.empLast, answer.empRole, answer.empManager);
          })
        break;

      case "View departments":
        viewDepartment();
        break;

      case "View roles":
        viewRole();
        break;

      case "View employee":
        inquirer.prompt(
          {
            name: "employeeID",
            type: "input",
            message: "Enter the employee's ID.",
            validate: async function(value) 
            {
              var isThere = await confirmEmployeeID(value);
              //console.log("returned: " + isThere)
              if (isThere === true)
              {
                return true;
              };
              console.log();
              console.log ("Not a valid employee ID. Please try again.")
              console.log();
              return false;
            }
          })
          .then(function(answer) 
          {
            viewEmployee(answer.employeeID);
          })
        break;
      
        case "View all employees":
          start();
          break;

      case "Update employee role":
        inquirer.prompt(
          [
            {
              name: "empID",
              type: "input",
              message: "Enter the employee's ID.",
              validate: async function(value) 
              {
                var isThere = await confirmEmployeeID(value);
                //console.log("returned: " + isThere)
                if (isThere === true)
                {
                  return true;
                };
                console.log();
                console.log ("Not a valid employee ID. Please try again.")
                console.log();
                return false;
              }
            },
            {
              name: "newRoleID",
              type: "list",
              choices: async function() 
              {
                var choiceArray = [];
                var results  = await getAll ("role");
                for (var i = 0; i < results.length; i++) 
                {
                  var string1 = results[i].id.toString();
                  var string2 = ">> ";
                  var string3 = results[i].title;
                  var string4 = " >> Dept: ";
                  var string5 = results[i].department_id
        
                  var option = string1.concat(string2,string3,string4,string5);
                  choiceArray.push(option);
                }
                return choiceArray;
              },
              message: "Select the new role."
            },

          ])
          .then(function(answer) 
          {
            updateEmployeeRole(answer.empID, answer.newRoleID);
          })
        break;

        case "Update employee manager":
          inquirer.prompt(
            [
              {
                name: "empID",
                type: "input",
                message: "Enter the employee's ID.",
                validate: async function(value) 
                {
                  var isThere = await confirmEmployeeID(value);
                  //console.log("returned: " + isThere)
                  if (isThere === true)
                  {
                    return true;
                  };
                  console.log();
                  console.log ("Not a valid employee ID. Please try again.")
                  console.log();
                  return false;
                }
              },
              {
                name: "newManagerID",
                type: "list",
                choices: async function() 
                {
                  var choiceArray = [];
                  var results  = await getAll ("employee");
                  for (var i = 0; i < results.length; i++) 
                  {
                    var string1 = results[i].id.toString();
                    var string2 = ">> ";
                    var string3 = results[i].first_name;
                    var string4 = " ";
                    var string5 = results[i].last_name;
          
                    var option = string1.concat(string2,string3,string4,string5);
                    choiceArray.push(option);
                  }
                  return choiceArray;
                },
                message: "Select the new manager."
              },
  
            ])
            .then(function(answer) 
            {
              updateEmployeeManager(answer.empID, answer.newManagerID);
            })
          break;

          case "Delete employee":
            inquirer.prompt(
              {
                name: "employeeID",
                type: "input",
                message: "Enter the employee's ID.",
                validate: async function(value) 
                {
                  var hasNoReports = await confirmNoReports(value);
                  //console.log("returned: " + hasNoReports)
                  if (hasNoReports === false)
                  {
                    console.log();
                    console.log ("This employee is listed as manager for other employees.")
                    console.log ("Update the direct reports to another manager before deletion.")
                    console.log();
                    exit();
                    return false;
                  }; 

                  var isThere = await confirmEmployeeID(value);
                  //console.log("returned: " + isThere)
                  if (isThere === true)
                  {
                    return true;
                  };
                  console.log();
                  console.log ("Not a valid employee ID. Please try again.")
                  console.log();
                  return false;
                }
              })
              .then(function(answer) 
              {
                deleteEmployee(answer.employeeID);
              })
            break;

      case "Exit":
        exit();
        break;
    }
  });
}

function viewRole() 
{
  query = "SELECT role.id, role.title, role.salary, department.name 'department' "
  query += "FROM (role ";
  query += "LEFT JOIN department ON role.department_id = department.id) ;";

  connection.query(query, function(err, res) 
  {
    console.log ();
    console.log ();
    console.table(res);
    ask()
  });
}

function viewDepartment()
{
  query = "SELECT * "
  query += "FROM (department);";

  connection.query(query, function(err, res) 
  {
    console.log ();
    console.log ();
    console.table(res);
    ask()
  });
}

function viewEmployee(inputEmployeeID)
{
  query  = "SELECT employee.id, employee.first_name, employee.last_name, ";
  query += "role.title, role.salary, ";
  query += "department.name 'department', ";
  query += "concat (employeeList.first_name, ' ', employeeList.last_name) 'manager' ";
  query += "FROM (((employee ";
  query += "LEFT JOIN role ON employee.role_id = role.ID) ";
  query += "LEFT JOIN department ON role.department_id = department.ID) ";
  query += "LEFT JOIN employee AS employeeList ON employee.manager_id = employeeList.ID) ";
  query += "WHERE employee.id = " + inputEmployeeID + ";"
    
  connection.query(query, function(err, res) 
  {
    console.log ();
    console.log ();
    console.table(res);
    ask();
  });
}

function addDepartment(inputDepartmentName)
{
  query = "INSERT INTO department (name) "
  query += "VALUES ('" + inputDepartmentName + "');";

  connection.query(query, function(err, res) 
  {
    console.log (inputDepartmentName + " has been added as a department.");
    console.log ();
    ask()
  });
}

function addRole(inputRoleName, inputRoleSalary, inputDepartmentID)
{
  var sliceIndex = inputDepartmentID.indexOf(">>");
  var inputDepartmentID = inputDepartmentID.slice(0, sliceIndex);

    query = "INSERT INTO role (title, salary, department_id) "
    query += "VALUES ('" + inputRoleName + "' , '" + inputRoleSalary + "' , '" + inputDepartmentID + "'); ";

    connection.query(query, function(err, res) 
    {
      console.log (inputRoleName + " has been added as a role.");
      console.log ();
      ask()
    });
  //});
}

function addEmployee(inputEmpFirst, inputEmpLast, inputEmpRole, inputEmpManager)
{
  var sliceIndex = inputEmpRole.indexOf(">>");
  var inputEmpRole = inputEmpRole.slice(0, sliceIndex);

  var sliceIndex2 = inputEmpManager.indexOf(">>");
  var inputEmpManager = inputEmpManager.slice(0, sliceIndex2);

  if(inputEmpManager == "pending")
  {
    inputEmpManager = 0
  }
  
  query = "INSERT INTO employee (first_name, last_name, role_id, manager_id) "
  query += "VALUES ('" + inputEmpFirst + "' , '" + inputEmpLast + "' , '" + inputEmpRole + "' , '" + inputEmpManager + "'); ";

  connection.query(query, function(err, res) 
  {
    console.log (inputEmpFirst + " " + inputEmpLast + " has been added as an employee.");
    console.log ();
    ask()
  });
}

function updateEmployeeRole(updateEmpID, updateNewRoleID)
{
  var sliceIndex = updateNewRoleID.indexOf(">>");
  var updateNewRoleID = updateNewRoleID.slice(0, sliceIndex);

  query = "UPDATE employee ";
  query += "SET employee.role_id = '" + updateNewRoleID + "' ";
  query += "WHERE employee.id = '" + updateEmpID+ "';";

  connection.query(query, function(err, res) 
  {
    console.log ("The role for ID " + updateEmpID + " has been updated.");
    console.log ();
    ask()
  });
}

function exit()
{
  console.log("Exiting ...");
  connection.end();
  process.exit();
}

function getAll (tableName)
{
  return new Promise(function(resolve, reject) 
  {
    query = "SELECT * FROM (" + tableName + ");";
    connection.query(query, function(error, results)
    {
      if (error) throw error;
      resolve(results);
    });
  })
}

function updateEmployeeManager(updateEmpID, updateNewManagerID)
{
  var sliceIndex = updateNewManagerID.indexOf(">>");
  var updateNewManagerID = updateNewManagerID.slice(0, sliceIndex);

  query = "UPDATE employee ";
  query += "SET employee.manager_id = '" + updateNewManagerID + "' ";
  query += "WHERE employee.id = '" + updateEmpID+ "';";

  connection.query(query, function(err, res) 
  {
    console.log ("Manager ID " + updateNewManagerID + " is set as the manager for employee ID" + updateEmpID + ".");
    console.log ();
    ask()
  });
}

function deleteEmployee(inputEmpID)
{
  query = "DELETE FROM employee WHERE employee.id = '" +  inputEmpID + "'; ";
  connection.query(query, function(err, res) 
  {
    console.log (inputEmpID + " has been deleted as an employee.");
    console.log ();
    ask()
  });
}

function confirmEmployeeID(inputEmployeeID)
{
  return new Promise(resolve => 
  {
    query  = "SELECT employee.id FROM employee WHERE employee.id = " + inputEmployeeID + ";"
    connection.query(query, function(err, res) 
    {
      if (err) {throw err};
      if (res.length > 0)
      {var noReports = true} //this employee exits.
      else
      {var noReports = false} //this employee does not exist.
      resolve(noReports)
    });
  })
}

function confirmNoReports(inputManagerID)
{
  return new Promise(resolve => 
  {
      query  = "SELECT employee.manager_id FROM employee WHERE employee.manager_id = '" + inputManagerID + "';"
      connection.query(query, function(err, res) 
      {
        if (err) {throw err};
        if (res.length < 1)
        {
          var noReports = true //this employee can be deleted.
        }
        else
        {
          var noReports = false //this employee still has direct reports.
        }
        resolve(noReports);
      });
  })
}

async function addRootEmployee()
{
  var isFirstEmployee = await getAll("employee");

  if (isFirstEmployee.length < 1)
  {
    query = "INSERT INTO employee (first_name, last_name) VALUES ('Admin' , 'Root'); ";

    connection.query(query, function(err, res) 
    {
      console.log();;
    });
  };
}

function timedExit(miliseconds)
{
  return new Promise(resolve => 
  {
    setInterval(function()
    {exit()},
     miliseconds);
  })
}

module.exports = {start, passConnection}