const XLSX = require('xlsx');
const path = require('path');

// Create sample data that meets all validation requirements
const data = [
  {
    'Name': 'John Doe',
    'Amount': 1000,
    'Date': '15.01.25', // January 2025
    'Verified': 'Yes'
  },
  {
    'Name': 'Jane Smith',
    'Amount': 2500.50,
    'Date': '20.01.25',
    'Verified': 'No'
  },
  {
    'Name': 'Bob Johnson',
    'Amount': 750.25,
    'Date': '25.01.25',
    'Verified': 'Yes'
  }
];

// Create a new workbook and worksheet
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(data);

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Valid Data');

// Write the workbook to a file
const filePath = path.join(__dirname, 'valid_test.xlsx');
XLSX.writeFile(workbook, filePath);

console.log(`Valid test file created at: ${filePath}`);
