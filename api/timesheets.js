const { json } = require('body-parser');
const express = require('express');
const timesheetsRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.get('/', (req, res, next) => {
    const employeeId = req.employee.id;
    db.all(`SELECT * FROM Timesheet WHERE employee_id = ${employeeId}`, (err, timesheets) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({timesheets: timesheets});
        }
    });
});

timesheetsRouter.post('/', (req, res, next) => {
    const employeeId = req.employee.id;
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    if (!hours || !rate || !date) {
        res.status(400).send();
    } else {
        const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)';
        const values = {
            $hours: hours,
            $rate: rate,
            $date: date,
            $employeeId: employeeId
        };
        db.run(sql, values, function(err) {
            if (err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (err, timesheet) => {
                    if (err) {
                        next(err);
                    } else {
                        res.status(201).json({timesheet: timesheet});
                    }
                });
            }
        });
    }
});

timesheetsRouter.param('timesheetId', (req, res, next, id) => {
    db.get(`SELECT * FROM Timesheet WHERE id = ${id}`, (err, timesheet) => {
        if (err) {
            next(err);
        } else if (timesheet) {
            req.timesheet = timesheet;
            next();
        } else {
            res.status(404).send();
        }
    });
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
    const id = req.timesheet.id;
    const employeeId = req.employee.id;
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    if (!hours || !rate || !date) {
        res.status(400).send();
    } else {
        const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE id = $id';
        const values = {
            $hours: hours,
            $rate: rate,
            $date: date,
            $employeeId: employeeId,
            $id: id
        };
        db.run(sql, values, function(err) {
            if (err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Timesheet WHERE id = ${id}`, (err, timesheet) => {
                    if (err) {
                        next(err);
                    } else {
                        res.status(200).json({timesheet: timesheet});
                    }
                });
            }
        });
    }
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
    const id = req.timesheet.id;
    db.run(`DELETE FROM Timesheet WHERE id = ${id}`, (err) => {
        if (err) {
            next(err);
        } else {
            res.status(204).send();
        }
    });
});












module.exports = timesheetsRouter;