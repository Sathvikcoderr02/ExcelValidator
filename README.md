# Excel Validator

A full-stack web application for validating Excel files with specific data requirements. Built with React, Node.js, Express, and PostgreSQL.

## Features

- User Authentication (Register/Login)
- Excel File Upload and Validation
- Real-time Data Preview
- Detailed Validation Feedback
- Support for .xls, .xlsx, and .csv files
- Secure File Handling
- Responsive UI Design

## Project Structure

```
excel-validator/
├── backend/
│   ├── models/
│   │   └── Record.js
│   ├── routes/
│   │   └── fileRoutes.js
│   ├── services/
│   │   └── fileValidationService.js
│   ├── middleware/
│   │   └── auth.js
│   ├── uploads/          # Uploaded files directory
│   ├── createValidFile.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   └── DataTable.jsx
│   │   └── App.jsx
│   └── package.json
└── package.json
```

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=excel_validator
DB_USER=postgres
DB_PASSWORD=Sathvik@02
JWT_SECRET=your_jwt_secret_key_here
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd excel-validator
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```
The server will run on http://localhost:5000

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```
The frontend will run on http://localhost:5173

## Excel File Requirements

The application validates Excel files with the following requirements:

### Required Columns
- Name (string, required)
- Amount (number, required, must be > 0)
- Date (string, required, format: DD.MM.YY)
- Verified (string, optional, must be 'Yes' or 'No')

### Validation Rules
1. All required columns must be present
2. Name field cannot be empty
3. Amount must be a positive number
4. Date must be:
   - In DD.MM.YY format
   - A valid date
   - Within the current month
5. Verified (if present) must be either 'Yes' or 'No'

## Testing

A sample valid Excel file can be generated using:
```bash
cd backend
node createValidFile.js
```
This will create `valid_test.xlsx` in the backend directory that meets all validation requirements.

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### File Operations
- POST `/api/files/upload` - Upload Excel file
- GET `/api/files/data/:filename` - Get data from uploaded file
- POST `/api/files/validate` - Validate file data

## Security Features

1. JWT Authentication
2. File type validation
3. File size limits (5MB max)
4. Secure file storage
5. Input validation
6. Error handling

## Error Handling

The application provides detailed error messages for:
- Invalid file types
- File size exceeds limit
- Missing required columns
- Invalid data formats
- Authentication errors
- Server errors

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Create a new Pull Request

