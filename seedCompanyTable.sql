USE company_db;
INSERT INTO department (name) VALUES ("IT");
INSERT INTO department (name) VALUES ("HR");
INSERT INTO department (name) VALUES ("Compliance");
INSERT INTO department (name) VALUES ("CEO");
SELECT * FROM department;

USE company_db;
INSERT INTO role (title, salary, department_ID) VALUES ("Manager", 100000, 1);
INSERT INTO role (title, salary, department_ID) VALUES ("Lead", 90000, 1);
INSERT INTO role (title, salary, department_ID) VALUES ("Worker", 80000, 1);
INSERT INTO role (title, salary, department_ID) VALUES ("Manager", 100000, 2);
INSERT INTO role (title, salary, department_ID) VALUES ("Lead", 90000, 2);
INSERT INTO role (title, salary, department_ID) VALUES ("Worker", 80000, 2);
INSERT INTO role (title, salary, department_ID) VALUES ("Manager", 80000, 3);
INSERT INTO role (title, salary, department_ID) VALUES ("CEO", 150000, 4);
SELECT * FROM role;

USE company_db;
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Mike", "Iles", 1, 8);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Mary", "Hill", 4, 8);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Mitch", "Woo", 7, 8);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Les", "Iles", 2, 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Larry", "Hill", 5, 2);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Will", "Iles", 3, 4);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Wanda", "Hill", 6, 5);
INSERT INTO employee (first_name, last_name, role_id) VALUES ("Carrie", "Clark", 8);
SELECT * FROM employee;
