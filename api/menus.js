const { json } = require('body-parser');
const express = require('express');
const menusRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const menuItemsRouter = require('./menuItems.js');

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

menusRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Menu', (err, menus) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({menus: menus});
        }
    });
});

menusRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;
    if (!title) {
        res.status(400).send();
    } else {
        db.run(`INSERT INTO Menu (title) VALUES ("${title}")`, function(err) {
            if (err) {
                next(err); 
            } else {
                db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, menu) => {
                    if (err) {
                        next(err);
                    } else {
                        res.status(201).json({menu: menu});
                    }
                });
            }
        });
    }
});

menusRouter.param('menuId', (req, res, next, id) => {
    db.get(`SELECT * FROM Menu WHERE id = ${id}`, (err, menu) => {
        if (err) {
            next(err);
        } else if (menu) {
            req.menu = menu;
            next();
        } else {
            res.status(404).send();
        }
    });
});

menusRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({menu: req.menu});
});

menusRouter.put('/:menuId', (req, res, next) => {
    const id = req.menu.id;
    const title = req.body.menu.title;
    if (!title) {
        res.status(400).send();
    } else {
        db.run(`UPDATE Menu SET title = "${title}" WHERE id = ${id}`, (err) => {
            if (err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Menu WHERE id = ${id}`, (err, menu) => {
                    if (err) {
                        next(err);
                    } else {
                        res.status(200).json({menu: menu});
                    }
                });
            }
        });
    }
});

menusRouter.delete('/:menuId', (req, res, next) => {
    const id = req.menu.id;
    db.get(`SELECT * FROM MenuItem WHERE menu_id = ${id}`, (err, menuItem) => {
        if (err) {
            next(err);
        } else if (menuItem) {
            res.status(400).send();
        } else {
            db.run(`DELETE FROM Menu WHERE id = ${id}`, (err) => {
                if (err) {
                    next(err);
                } else {
                    res.status(204).send();
                }
            });
        }
    });
});

module.exports = menusRouter;