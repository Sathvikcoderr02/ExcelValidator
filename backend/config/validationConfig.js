const validationRules = {
    default: {
        columns: {
            Name: {
                required: true,
                type: 'string',
                field: 'name'
            },
            Amount: {
                required: true,
                type: 'number',
                min: 0,
                field: 'amount'
            },
            Date: {
                required: true,
                type: 'date',
                validate: (date) => {
                    const currentDate = new Date();
                    const inputDate = new Date(date);
                    return (
                        inputDate.getMonth() === currentDate.getMonth() &&
                        inputDate.getFullYear() === currentDate.getFullYear()
                    );
                },
                errorMessage: 'Date must be within the current month',
                field: 'date'
            },
            Verified: {
                required: false,
                type: 'boolean',
                transform: (value) => value?.toLowerCase() === 'yes',
                field: 'verified'
            }
        }
    },
    // Example of a custom sheet configuration
    specialSheet: {
        columns: {
            Name: {
                required: true,
                type: 'string',
                field: 'name'
            },
            Amount: {
                required: true,
                type: 'number',
                min: 0,
                field: 'amount'
            },
            'Invoice Date': {
                required: true,
                type: 'date',
                validate: (date) => {
                    const currentDate = new Date();
                    const inputDate = new Date(date);
                    const lastMonth = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
                    return inputDate >= lastMonth;
                },
                errorMessage: 'Date must not be older than previous month',
                field: 'date'
            },
            'Receipt Date': {
                required: false,
                type: 'date',
                field: 'receiptDate'
            },
            Verified: {
                required: false,
                type: 'boolean',
                transform: (value) => value?.toLowerCase() === 'yes',
                field: 'verified'
            }
        }
    }
};

module.exports = validationRules;
