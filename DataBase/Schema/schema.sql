-- PostgreSql
-- Create Schema 
-- Command : psql -d guillaumedb -a -f schema.sql
-- run script : psql
-- TODO create a schema
-- CREATE SCHEMA presence;

-- CREATE TABLE presence.student (
CREATE TABLE student (
    id serial PRIMARY KEY,
    firstname varchar (50) NOT NULL,
    lastname varchar (50) NOT NULL,
    email varchar (50),
    sex varchar (1) NOT NULL
);
