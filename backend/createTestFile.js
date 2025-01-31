const XLSX = require('xlsx');

// Get current month's start and end dates
const now = new Date('2025-01-26T17:53:34+05:30'); // Using the provided current time
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();
const startOfMonth = new Date(currentYear, currentMonth, 1);
const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

// Sample data with both valid and invalid entries
const data = [
    // Valid entries
    {
        'Name': 'John Doe',
        'Amount': 1500,
        'Date': '26.01.25',
        'Verified': 'Yes'
    },
    {
        'Name': 'Jane Smith',
        'Amount': 2500,
        'Date': '15.01.25',
        'Verified': 'No'
    },
    // Missing Name (mandatory field)
    {
        'Name': '',
        'Amount': 3000,
        'Date': '20.01.25',
        'Verified': 'Yes'
    },
    // Invalid Amount (not a number)
    {
        'Name': 'Bob Wilson',
        'Amount': 'invalid',
        'Date': '22.01.25',
        'Verified': 'Yes'
    },
    // Amount zero (must be greater than zero)
    {
        'Name': 'Alice Brown',
        'Amount': 0,
        'Date': '23.01.25',
        'Verified': 'Yes'
    },
    // Invalid date (outside current month)
    {
        'Name': 'Charlie Davis',
        'Amount': 2000,
        'Date': '15.02.25',
        'Verified': 'No'
    },
    // Invalid date format
    {
        'Name': 'Eve Johnson',
        'Amount': 1800,
        'Date': '2025-01-24',
        'Verified': 'Yes'
    },
    // Invalid Verified value
    {
        'Name': 'Frank Miller',
        'Amount': 2200,
        'Date': '25.01.25',
        'Verified': 'Invalid'
    }
];

// Create a new workbook
const workbook = XLSX.utils.book_new();

// Convert the data to a worksheet
const worksheet = XLSX.utils.json_to_sheet(data);

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'January Data');

// Write the workbook to a file
XLSX.writeFile(workbook, 'test_validation.xlsx');

console.log('Test file created: test_validation.xlsx');
