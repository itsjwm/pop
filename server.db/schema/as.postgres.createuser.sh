#!/bin/bash
# Run as the postgres user 
# # sudo su - postgres

echo "
create user itsjwm with password 'itsjwm';
ALTER USER itsjwm WITH SUPERUSER;
create database pop;
grant all privileges on database pop to itsjwm;
" | psql
