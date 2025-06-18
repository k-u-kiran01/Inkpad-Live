"use strict";
// import { error } from "console"
// import express  from "express"
// import { measureMemory } from "vm"
// const errorMiddleware = (err, req, res, next)=>{
//     try{
//         let error= {...err }
//         error.message= err.message
//         console.error(err)
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware = (err, req, res, next) => {
    try {
        let error = Object.assign({}, err);
        error.message = err.message;
        console.error(err);
        // Mongoose bad ObjectId
        if (err.name === 'CastError') { // Fixed typo: 'CasrError' → 'CastError'
            const message = 'Resource not found'; // Fixed typo: 'Resourde' → 'Resource'
            error = new Error(message);
            error.statusCode = 404;
        }
        // Mongoose duplicate key error
        if (err.code === 11000) {
            const message = 'Duplicate field value entered';
            error = new Error(message);
            error.statusCode = 400;
        }
        // Mongoose validation error
        if (err.name === 'ValidationError' && err.errors) {
            const message = Object.values(err.errors).map(val => val.message);
            error = new Error(message.join(', '));
            error.statusCode = 400;
        }
        res.status(error.statusCode || 500).json({ success: false, error: error.message || 'Server Error' });
    }
    catch (catchError) {
        next(catchError);
    }
};
exports.default = errorMiddleware;
