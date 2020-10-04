const e = require('express');
const express = require('express');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const employeesRouter = express.Router();

employeesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Employee WHERE is_current_employee = 1', (err, employees) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({ employees: employees });
        }
    })
});

employeesRouter.post('/', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    if (!name || !position || !wage) {
        res.status(400).send();
    } else {
        const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)';
        const values = {
            $name: name,
            $position: position,
            $wage: wage, 
            $isCurrentEmployee: isCurrentEmployee
        };
        db.run(sql, values, function(err) {
            if (err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (err, employee) => {
                    if (err) {
                        next(err);
                    } else {
                        res.status(201).json({ employee: employee });
                    }
                });
            }
        });
    }
});

employeesRouter.param('employeeId', (req, res, next, id) => {
    db.get(`SELECT * FROM Employee WHERE id = ${id}`, (err, employee) => {
        if (err) {
            next(err);
        } else if (employee) {
            req.employee = employee;
            next();
        } else {
            res.status(404).send();
        }
    });
});

employeesRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).json({ employee: req.employee})
});

employeesRouter.put('/:employeeId', (req, res, next) => {
    const id = req.employee.id;
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    if (!name || !position || !wage) {
        res.status(400).send();
    } else {
        const sql = 'UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE id = $id';
        const values = {
            $name: name, 
            $position: position,
            $wage: wage,
            $isCurrentEmployee: isCurrentEmployee,
            $id: id
        };
        db.run(sql, values, (err) =>  {
            if(err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Employee WHERE id = ${id}`, (err, employee) => {
                    if (err) {
                        next(err);
                    } else {
                        res.status(200).json({employee: employee});
                    }
                });
            }
        });
    }
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
    const id = req.employee.id;
    db.run(`UPDATE Employee SET is_current_employee = 0 WHERE id = ${id}`, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${id}`, (err, employee) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({employee: employee});
                }
            });
        }
    });
});

module.exports = employeesRouter;
