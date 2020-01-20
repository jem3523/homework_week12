USE company_db;
DROP TABLE IF EXISTS employeelist;
CREATE TABLE employeeList LIKE employee;
INSERT INTO employeeList  SELECT * FROM employee;

SELECT employee.id, employee.first_name, employee.last_name, 
role.title, role.salary, 
department.name "department",
concat (employeeList.first_name, " ", employeeList.last_name) "manager"
FROM ((employee 
LEFT JOIN role ON employee.role_id = role.ID) 
LEFT JOIN department ON role.department_id = department.ID) 
LEFT JOIN employee AS employeeList ON employee.manager_id = employeeList.ID;



