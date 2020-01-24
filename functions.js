var mysql = require("mysql");
var inquirer = require("inquirer");
var consoleTable = require ("console.table");

//this function passes the connection data into the function class
var connection = {};
function passConnection(passedConnection)
{
  connection = passedConnection;
}
passConnection();

//This function auto-starts and establishes
//1. a root employee
//2. a copy of the employee table that is used for cross-checks (employeeList)
//3. the opening grid of all users
//4. the initial inquery menu of options
function start ()
{
  //checks to see if the employee table is empty.
  //if it is, a root employee is added so that other employees have a placeholder
  //employee to mark as manager.
  addRootEmployee();

  var query  = "DROP TABLE IF EXISTS employeeList ";
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

//this is the main navigation function. it gets re-called at the end of each selection so that the menu re-builds itself
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
    //this switch covers all 11 options
    switch (answer.action) 
    {
      case "Add department":
        inquirer.prompt(
          {
            name: "departmentName",
            type: "input",
            message: "Enter the new department's name.",
            //checking to see user returned without an entry (or just one space as an entry)
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
              //checking to see user returned without an entry (or just one space as an entry)
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
              //checking to see user entered a number
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
              //this embedded function gets all department entries and returns them as a selection list
              choices: async function() 
              {
                var choiceArray = [];
                var results  = await getAll ("department");
                //because the selection list doesn't support display v. actual values, we have to cut add actual id out of the display
                //NOTE: once the option is selected and passed to the function, the function will need to cut the ID back off for usage
                for (var i = 0; i < results.length; i++) 
                {
                  var string1 = results[i].id.toString();
                  var string2 = ">> ";
                  var string3 = results[i].name;
        
                  var option = string1.concat(string2,string3);
                  choiceArray.push(option);
                }

                //if the department table is empty, then display a message and exit.
                //Unfortunately, there is no way to gracefully exit and return the main selection choices, so user must exit.
                if (choiceArray.length > 0)
                {return choiceArray}
                else
                {
                  console.log();
                  console.log("You must add departments before adding a role.");
                  console.log("This entry will not be saved.");
                  console.log();
                  exit();
                }
              },
              message: "Select the department ID associated with this role.",
              //if any value is entered other than from the selection list, do not accept it
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
              //checking to see user returned without an entry (or just one space as an entry)
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
              //checking to see user returned without an entry (or just one space as an entry)
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
                //because the selection list doesn't support display v. actual values, we have to cut add actual id out of the display
                //NOTE: once the option is selected and passed to the function, the function will need to cut the ID back off for usage
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

                //if the department table is empty, then display a message and exit.
                //Unfortunately, there is no way to gracefully exit and return the main selection choices, so user must exit.
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
              //if any value is entered other than from the selection list, do not accept it
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
                //because the selection list doesn't support display v. actual values, we have to cut add actual id out of the display
                //NOTE: once the option is selected and passed to the function, the function will need to cut the ID back off for usage

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
              //this function checks to see if the ID exists in the employees table
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
                //this function checks to see if the ID exists in the employees table
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
                //because the selection list doesn't support display v. actual values, we have to cut add actual id out of the display
                //NOTE: once the option is selected and passed to the function, the function will need to cut the ID back off for usage
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
                  //this function checks to see if the ID exists in the employees table
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
                //because the selection list doesn't support display v. actual values, we have to cut add actual id out of the display
                //NOTE: once the option is selected and passed to the function, the function will need to cut the ID back off for usage
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
                  //function checks the entered ID against the manager_id column to make sure no employee is left with an orphaned manager ID
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
                  //this function checks to see if the ID exists in the employees table
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
    //displays results in console
    console.table(res);
    //re-launches the main selection menu
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
    //displays results in console
    console.table(res);
    //re-launches the main selection menu
    ask()
  });
}

//each time the start function runs, it copies the employee table so that it can query against its own data
//that table is called "employeeList"
//this function runs after the inputEmployeeID has been validated in inquirer
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
  query += "WHERE employee.id = ?;"
    
  connection.query(query,[inputEmployeeID], function(err, res) 
  {
    console.log ();
    console.log ();
    //displays results in console
    console.table(res);
    //re-launches the main selection menu
    ask();
  });
}

function addDepartment(inputDepartmentName)
{
  query = "INSERT INTO department (name) VALUES (?);";

  connection.query(query,[inputDepartmentName], function(err, res) 
  {
    console.log (inputDepartmentName + " has been added as a department.");
    console.log ();
    //re-launches the main selection menu
    ask()
  });
}

function addRole(inputRoleName, inputRoleSalary, inputDepartmentID)
{
  //the ID has to be cut off the display string sent by inquierer
  var sliceIndex = inputDepartmentID.indexOf(">>");
  var inputDepartmentID = inputDepartmentID.slice(0, sliceIndex);

    query = "INSERT INTO role (title, salary, department_id) "
    query += "VALUES (? , ? , ?); ";

    connection.query(query, [inputRoleName,inputRoleSalary,inputDepartmentID], function(err, res) 
    {
      console.log (inputRoleName + " has been added as a role.");
      console.log ();
      //re-launches the main selection menu
      ask()
    });
  //});
}

function addEmployee(inputEmpFirst, inputEmpLast, inputEmpRole, inputEmpManager)
{
  //the ID has to be cut off the display string sent by inquierer
  var sliceIndex = inputEmpRole.indexOf(">>");
  var inputEmpRole = inputEmpRole.slice(0, sliceIndex);

  var sliceIndex2 = inputEmpManager.indexOf(">>");
  var inputEmpManager = inputEmpManager.slice(0, sliceIndex2);

  //just in case something goes wrong in the status, enter the "admin root" as manager
  if(inputEmpManager == "pending")
  {
    inputEmpManager = 0
  }
  
  query = "INSERT INTO employee (first_name, last_name, role_id, manager_id) "
  query += "VALUES (?, ?, ?, ?);";

  connection.query(query, [inputEmpFirst,inputEmpLast,inputEmpRole,inputEmpManager], function(err, res) 
  {
    console.log (inputEmpFirst + " " + inputEmpLast + " has been added as an employee.");
    console.log ();
    //re-launches the main selection menu
    ask()
  });
}

function updateEmployeeRole(updateEmpID, updateNewRoleID)
{
  //the ID has to be cut off the display string sent by inquierer
  var sliceIndex = updateNewRoleID.indexOf(">>");
  var updateNewRoleID = updateNewRoleID.slice(0, sliceIndex);

  query = "UPDATE employee SET employee.role_id = ? WHERE employee.id = ?;";

  connection.query(query, [updateNewRoleID,updateEmpID], function(err, res) 
  {
    console.log ("The role for ID " + updateEmpID + " has been updated.");
    console.log ();
    //re-launches the main selection menu
    ask()
  });
}

//this function closes the connection and exits
function exit()
{
  console.log("Exiting ...");
  connection.end();
  process.exit();
}


function updateEmployeeManager(updateEmpID, updateNewManagerID)
{
  //the ID has to be cut off the display string sent by inquierer
  var sliceIndex = updateNewManagerID.indexOf(">>");
  var updateNewManagerID = updateNewManagerID.slice(0, sliceIndex);

  query = "UPDATE employee SET employee.manager_id = ? WHERE employee.id = ?;";

  connection.query(query, [updateNewManagerID,updateEmpID], function(err, res) 
  {
    console.log ("Manager ID " + updateNewManagerID + " is set as the manager for employee ID" + updateEmpID + ".");
    console.log ();
    //re-launches the main selection menu
    ask()
  });
}

function deleteEmployee(inputEmpID)
{
  query = "DELETE FROM employee WHERE employee.id = ?;";
  connection.query(query,[inputEmpID], function(err, res) 
  {
    console.log (inputEmpID + " has been deleted as an employee.");
    console.log ();
    //re-launches the main selection menu
    ask()
  });
}

//this function requires a promise so that async-await can be used when it is run
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

//this function requires a promise so that async-await can be used when it is run
function confirmEmployeeID(inputEmployeeID)
{
  return new Promise(resolve => 
  {
    query  = "SELECT employee.id FROM employee WHERE employee.id = ?;"
    connection.query(query,[inputEmployeeID], function(err, res) 
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

//this function requires a promise so that async-await can be used when it is run
function confirmNoReports(inputManagerID)
{
  return new Promise(resolve => 
  {
      query  = "SELECT employee.manager_id FROM employee WHERE employee.manager_id = ?;"
      connection.query(query, [inputManagerID], function(err, res) 
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

//this function runs with "start" and checks to see if any employee exists. It will always run unless the tables have been seeded with data.
//this is needed so that there is at least one option in the manager drop-down for adding employees (otherwise, the user cannot proceed)
async function addRootEmployee()
{
  var isFirstEmployee = await getAll("employee");

  //it is checking to see if there is at least one row in the return, if not, it creates an admin user with no manager.
  if (isFirstEmployee.length < 1)
  {
    query = "INSERT INTO employee (first_name, last_name) VALUES ('Admin' , 'Root'); ";

    connection.query(query, function(err, res) 
    {
      console.log();;
    });
  };
}


module.exports = {start, passConnection}