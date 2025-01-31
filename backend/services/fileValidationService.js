const xlsx = require('xlsx');
const validationRules = require('../config/validationConfig');

class FileValidationService {
    validateFile(buffer) {
        try {
            const workbook = xlsx.read(buffer, { type: 'buffer' });
            const results = {};

            for (const sheetName of workbook.SheetNames) {
                const sheet = workbook.Sheets[sheetName];
                const data = xlsx.utils.sheet_to_json(sheet);
                results[sheetName] = this.validateSheet(data, sheetName);
            }

            return results;
        } catch (error) {
            throw new Error(`File processing error: ${error.message}`);
        }
    }

    validateSheet(data, sheetName) {
        const rules = validationRules[sheetName] || validationRules.default;
        const errors = [];
        const validRows = [];

        data.forEach((row, index) => {
            const rowErrors = this.validateRow(row, rules.columns, index + 2); // +2 because Excel starts at 1 and has header row
            if (rowErrors.length > 0) {
                errors.push(...rowErrors);
            } else {
                validRows.push(this.transformRow(row, rules.columns));
            }
        });

        return {
            valid: errors.length === 0,
            errors,
            validRows,
            totalRows: data.length
        };
    }

    validateRow(row, rules, rowNumber) {
        const errors = [];

        for (const [columnName, rule] of Object.entries(rules)) {
            const value = row[columnName];

            if (rule.required && (value === undefined || value === '')) {
                errors.push({
                    row: rowNumber,
                    column: columnName,
                    message: `${columnName} is required`
                });
                continue;
            }

            if (value !== undefined && value !== '') {
                const validationError = this.validateValue(value, rule, columnName);
                if (validationError) {
                    errors.push({
                        row: rowNumber,
                        column: columnName,
                        message: validationError
                    });
                }
            }
        }

        return errors;
    }

    validateValue(value, rule, columnName) {
        switch (rule.type) {
            case 'number':
                if (isNaN(value)) return `${columnName} must be a number`;
                if (rule.min !== undefined && value < rule.min) {
                    return `${columnName} must be greater than ${rule.min}`;
                }
                break;
            case 'date':
                const date = new Date(value);
                if (isNaN(date.getTime())) return `${columnName} must be a valid date`;
                if (rule.validate && !rule.validate(date)) {
                    return rule.errorMessage || `${columnName} validation failed`;
                }
                break;
            case 'boolean':
                if (typeof value !== 'boolean' && !['yes', 'no'].includes(value.toLowerCase())) {
                    return `${columnName} must be Yes or No`;
                }
                break;
        }
        return null;
    }

    transformRow(row, rules) {
        const transformedRow = {};

        for (const [columnName, rule] of Object.entries(rules)) {
            const value = row[columnName];
            if (value !== undefined && value !== '') {
                if (rule.transform) {
                    transformedRow[rule.field] = rule.transform(value);
                } else {
                    transformedRow[rule.field] = value;
                }
            }
        }

        return transformedRow;
    }
}

module.exports = new FileValidationService();
