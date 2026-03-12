/**
 * Vercel Serverless Function Entry Point
 * This file exports the Express app as a serverless function handler
 */

require('dotenv').config({ path: `${__dirname}/../.env` });

const express = require('express');
const path = require('path');

// Load the main app
const app = require(path.join(__dirname, '../backend/src/app.js'));

// Export for Vercel
module.exports = app;
