const express = require('express');
const router = express.Router();
const multer = require('multer');
const fileValidationService = require('../services/fileValidationService');
const Record = require('../models/Record');
const { Op } = require('sequelize');
const path = require('path');
const XLSX = require('xlsx');
const auth = require('../middleware/auth');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// File filter to only allow Excel files
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only Excel files are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload endpoint
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Basic validation - check if file has data
    if (!data || data.length === 0) {
      return res.status(400).json({ message: 'Excel file is empty' });
    }

    // Store the data in memory or database for later retrieval
    req.app.locals.excelData = {
      filename: req.file.filename,
      data: data,
      sheetName: sheetName
    };

    res.status(200).json({
      message: 'File uploaded successfully',
      filename: req.file.filename,
      rowCount: data.length
    });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ message: 'Error processing file', error: err.message });
  }
});

// Get data endpoint
router.get('/data/:filename', auth, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    res.json({ data });
  } catch (err) {
    console.error('Error retrieving data:', err);
    res.status(500).json({ message: 'Error retrieving data', error: err.message });
  }
});

// Validate data endpoint
router.post('/validate', auth, async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No data to validate',
        errors: ['No data provided']
      });
    }

    const errors = [];
    const requiredColumns = ['Name', 'Amount', 'Date', 'Verified'];
    
    // Check if all required columns are present
    const firstRow = data[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    if (missingColumns.length > 0) {
      return res.json({
        success: false,
        sheetName: req.app.locals.excelData?.sheetName || 'Unknown',
        errors: [`Missing required columns: ${missingColumns.join(', ')}`]
      });
    }

    // Get current month's start and end dates
    const now = new Date('2025-01-26T18:39:26+05:30'); // Using the provided current time
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Validate each row
    data.forEach((row, index) => {
      const rowNum = index + 1;

      // Check mandatory fields (Name, Amount, and Date)
      if (!row['Name']) {
        errors.push(`Row ${rowNum}: Name is required`);
      }

      // Validate Amount
      if (!row['Amount']) {
        errors.push(`Row ${rowNum}: Amount is required`);
      } else if (isNaN(row['Amount'])) {
        errors.push(`Row ${rowNum}: Amount must be a number`);
      } else if (parseFloat(row['Amount']) <= 0) {
        errors.push(`Row ${rowNum}: Amount must be greater than zero`);
      }

      // Validate Date
      if (!row['Date']) {
        errors.push(`Row ${rowNum}: Date is required`);
      } else {
        const dateStr = row['Date'].toString();
        const dateRegex = /^(\d{2})\.(\d{2})\.(\d{2})$/;
        const match = dateStr.match(dateRegex);
        
        if (!match) {
          errors.push(`Row ${rowNum}: Date must be in DD.MM.YY format`);
        } else {
          const [_, day, month, year] = match;
          const fullYear = 2000 + parseInt(year);
          const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
          
          // Check if date is valid
          if (isNaN(date.getTime()) || 
              date.getDate() !== parseInt(day) || 
              date.getMonth() !== parseInt(month) - 1 || 
              date.getFullYear() !== fullYear) {
            errors.push(`Row ${rowNum}: Invalid date value`);
          }
          // Check if date is in current month
          else if (date < startOfMonth || date > endOfMonth) {
            errors.push(`Row ${rowNum}: Date must be within the current month (January 2025)`);
          }
        }
      }

      // Validate Verified (if present)
      if (row['Verified'] && !['Yes', 'No'].includes(row['Verified'])) {
        errors.push(`Row ${rowNum}: Verified must be either 'Yes' or 'No'`);
      }
    });

    if (errors.length > 0) {
      return res.json({
        success: false,
        sheetName: req.app.locals.excelData?.sheetName || 'Unknown',
        errors: errors
      });
    }

    res.json({
      success: true,
      message: 'All data is valid'
    });
  } catch (err) {
    console.error('Validation error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error validating data',
      error: err.message 
    });
  }
});

// Import valid rows
router.post('/import', async (req, res) => {
    try {
        const { records, sheetName } = req.body;

        if (!Array.isArray(records) || records.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid records to import'
            });
        }

        // Add sheet name to each record
        const recordsWithSheet = records.map(record => ({
            ...record,
            sheetName
        }));

        // Import records in batches
        const batchSize = 100;
        const results = [];
        
        for (let i = 0; i < recordsWithSheet.length; i += batchSize) {
            const batch = recordsWithSheet.slice(i, i + batchSize);
            const imported = await Record.bulkCreate(batch);
            results.push(...imported);
        }

        res.json({
            success: true,
            message: `Successfully imported ${results.length} records`,
            data: {
                imported: results.length,
                total: records.length
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Delete a row
router.delete('/record/:id', async (req, res) => {
    try {
        const result = await Record.destroy({
            where: {
                id: req.params.id
            }
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Record not found'
            });
        }

        res.json({
            success: true,
            message: 'Record deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Get records with pagination
router.get('/records', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Record.findAndCountAll({
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                records: rows,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(count / limit),
                    totalRecords: count
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Export validated data endpoint
router.post('/export', auth, async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: 'No data to export' });
    }

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Add some styling to the header row
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const headerStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: "CCCCCC" } }
    };

    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[address]) continue;
      worksheet[address].s = headerStyle;
    }

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Validated Data');

    // Generate a unique filename
    const filename = `validated-data-${Date.now()}.xlsx`;
    const filePath = path.join(__dirname, '../exports', filename);

    // Ensure exports directory exists
    if (!fs.existsSync(path.join(__dirname, '../exports'))) {
      fs.mkdirSync(path.join(__dirname, '../exports'));
    }

    // Write the file
    XLSX.writeFile(workbook, filePath);

    // Send the file
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Delete the file after sending
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Error deleting file:', unlinkErr);
        }
      });
    });
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ message: 'Error exporting data', error: err.message });
  }
});

module.exports = router;
