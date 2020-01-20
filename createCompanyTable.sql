DROP DATABASE IF EXISTS company_db;
CREATE DATABASE company_db;

USE company_db;
CREATE TABLE department(
id INTEGER NOT NULL AUTO_INCREMENT,
name VARCHAR(30) NOT NULL,
primary key (id)
);

CREATE TABLE role(
id INTEGER NOT NULL AUTO_INCREMENT,
title VARCHAR(30) NOT NULL,
salary DECIMAL NOT Null,
department_id INTEGER,
primary key (id)
);

CREATE TABLE employee(
id INTEGER NOT NULL AUTO_INCREMENT,
first_name VARCHAR(30) NOT NULL,
last_name VARCHAR(30) NOT NULL,
role_id INTEGER,
manager_id INTEGER,
primary key (id)
); 
