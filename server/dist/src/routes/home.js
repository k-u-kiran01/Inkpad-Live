"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const board = (0, express_1.Router)();
board.get('/api/:id', (req, res) => {
    //return all blogs of that id
});
board.post('/api/:id', (req, res) => {
    // create a new board for this user id
});
board.delete('/api/:id', (req, res) => {
});
exports.default = board;
