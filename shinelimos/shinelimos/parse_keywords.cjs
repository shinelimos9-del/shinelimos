const xlsx = require('xlsx');
const fs = require('fs');

const workbook = xlsx.readFile('public/doucment/Shinelimos Keywords (1).xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
console.log(JSON.stringify(data, null, 2));
