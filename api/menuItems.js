const { json } = require('body-parser');
const express = require('express');
const menuItemsRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.get('/', (req, res, next) => {
    const menuId = req.menu.id;
    db.all(`SELECT * FROM MenuItem WHERE menu_id = ${menuId}`, (err, menuItems) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({menuItems: menuItems});
        }
    });
});

menuItemsRouter.post('/', (req, res, next) => {
    const menuId = req.menu.id;
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description || 'NULL';
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    if (!name || !inventory || !price) {
        res.status(400).send();
    } else {
        const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)';
        const values = {
            $name: name,
            $description: description,
            $inventory: inventory,
            $price: price,
            $menuId: menuId
        };
        db.run(sql, values, function(err) {
            if (err) {
                next(err);
            } else {
                db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (err, menuItem) => {
                    if (err) {
                        next(err);
                    } else {
                        res.status(201).json({menuItem: menuItem});
                    }
                });
            }
        });
    }
});

menuItemsRouter.param('menuItemId', (req, res, next, id) => {
    db.get(`SELECT * FROM MenuItem WHERE id = ${id}`, (err, menuItem) => {
        if (err) {
            next(err); 
        } else if (menuItem) {
            req.menuItem = menuItem;
            next();
        } else {
            res.status(404).send();
        }
    });
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
    const id = req.menuItem.id;
    const menuId = req.menu.id;
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    if (!name || !inventory || !price) {
        res.status(400).send();
    } else {
        const sql = 'UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId WHERE id = $id';
        const values = {
            $name: name,
            $description: description,
            $inventory: inventory,
            $price: price,
            $menuId: menuId,
            $id: id
        };
        db.run(sql, values, function(err) {
            if (err) {
                next(err);
            } else {
                db.get(`SELECT * FROM MenuItem WHERE id = ${id}`, (err, menuItem) => {
                    if (err) {
                        next(err);
                    } else {
                        res.status(200).json({menuItem: menuItem});
                    }
                });
            }
        });
    }
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
    const id = req.menuItem.id;
    db.run(`DELETE FROM MenuItem WHERE id = ${id}`, (err) => {
        if (err) {
            next(err);
        } else {
            res.status(204).send();
        }
    });
});

module.exports = menuItemsRouter;