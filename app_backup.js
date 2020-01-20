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
  start();
});


function start ()
{
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
      "Update employee role",
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
              message: "Enter the new role's title."
            },
            {
              name: "roleSalary",
              type: "input",
              message: "Enter the new role's salary."
            },
            {
              name: "departmentID",
              type: "input",
              message: "Enter the department ID associated with this role."
            }
          ])
          .then(function(answer2) 
          {
            console.log (answer2.roleName, answer2.roleSalary, answer2.departmentID)
            addRole(answer2.roleName, answer2.roleSalary, answer2.departmentID);
          })
        break;

      case "Add employee":
        inquirer.prompt(
          [
            {
              name: "empFirst",
              type: "input",
              message: "Enter the new employee's first name."
            },
            {
              name: "empLast",
              type: "input",
              message: "Enter the new employee's last name."
            },
            {
              name: "empRole",
              type: "input",
              message: "Select the new employee's role."
            },
            {
              name: "empManager",
              type: "input",
              message: "Select the new employee's manager."
            },

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
          })
          .then(function(answer) 
          {
            viewEmployee(answer.employeeID);
          })
        break;

      case "Update employee role":
        inquirer.prompt(
          [
            {
              name: "empID",
              type: "input",
              message: "Enter the new employee's ID."
            },
            {
              name: "newRoleID",
              type: "input",
              message: "Select the new role."
            },

          ])
          .then(function(answer) 
          {
            updateEmployeeRole(answer.empID, answer.newRoleID);
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
  query = "SELECT id "
  query += "FROM (department) ";
  query += "WHERE department.id = " + inputDepartmentID + ";"

  connection.query(query, function(err, res) 
  {
    if (err)
    {
      console.log(inputDepartmentID + " is not a know department ID.");
      console.log("Please try again.");
      //break;
    }

    query = "INSERT INTO role (title, salary, department_id) "
    query += "VALUES ('" + inputRoleName + "' , '" + inputRoleSalary + "' , '" + inputDepartmentID + "'); ";

    connection.query(query, function(err, res) 
    {
      console.log (inputRoleName + " has been added as a role.");
      console.log ();
      ask()
    });
  });
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

function updateEmployeeRole(updateEmpID, updateNewRoleID)
{
  query = "UPDATE employee ";
  query += "SET employee.role_id = '" + updateNewRoleID + "' ";
  query += "WHERE employee.id = '" + updateEmpID+ "';";

  connection.query(query, function(err, res) 
  {
    console.log ("The role for " + updateEmpID + " has been updated.");
    console.log ();
    ask()
  });
}

function exit()
{
  console.log("Exiting ...");
  process.exit();
}
