import express, { Request, Response, NextFunction, Router, RequestHandler } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { Employee } from './models/Employee';
import { Attendance } from './models/Attendance';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const mongoUri = 'mongodb://127.0.0.1:27017/employee_management';

mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Simple in-memory session simulation (for demo)
let adminLoggedIn = false;

const router = Router();

// Admin login route (simple fixed credentials)
router.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin') {
    adminLoggedIn = true;
    res.json({ success: true, message: 'Admin logged in successfully' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  }
});

// Admin add employee
router.post('/api/admin/employees', (async (req: Request, res: Response) => {
  if (!adminLoggedIn) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }
    const existing = await Employee.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Employee with this email already exists' });
    }
    const newEmployee = new Employee({ name, email, attendanceMarked: false });
    await newEmployee.save();
    res.json({ success: true, employee: newEmployee });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}) as RequestHandler);

// Admin get employees list (sorted by attendanceMarked desc)
router.get('/api/admin/employees', (async (req: Request, res: Response) => {
  if (!adminLoggedIn) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try {
    const employees = await Employee.find().sort({ attendanceMarked: -1, name: 1 }).exec();
    res.json({ success: true, employees });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}) as RequestHandler);

// Employee login by email
router.post('/api/employee/login', (async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  try {
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(401).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, employeeId: employee._id, name: employee.name });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}) as RequestHandler);

// Employee mark attendance
router.post('/api/employee/attendance', (async (req: Request, res: Response) => {
  const { employeeId, attendanceMarked } = req.body;
  if (!employeeId) {
    return res.status(400).json({ success: false, message: 'Employee ID is required' });
  }
  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    employee.attendanceMarked = attendanceMarked === true;
    await employee.save();
    res.json({ success: true, message: 'Attendance updated', employee });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}) as RequestHandler);

// Employee marks attendance for today
router.post('/api/attendance/mark', async (req: Request, res: Response) => {
  const { employeeId } = req.body;
  if (!employeeId) {
    return res.status(400).json({ success: false, message: 'Employee ID is required' });
  }
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  try {
    const existing = await Attendance.findOne({ employee: employeeId, date: today });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Attendance already marked for today' });
    }
    const attendance = new Attendance({ employee: employeeId, date: today, present: true });
    await attendance.save();
    res.json({ success: true, message: 'Attendance marked' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin gets attendance list for a specific date
router.get('/api/attendance/list', async (req: Request, res: Response) => {
  if (!adminLoggedIn) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const date = req.query.date as string;
  if (!date) {
    return res.status(400).json({ success: false, message: 'Date is required (YYYY-MM-DD)' });
  }
  try {
    const attendance = await Attendance.find({ date }).populate('employee', 'name email');
    res.json({ success: true, attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin logout
router.post('/api/admin/logout', (req: Request, res: Response) => {
  adminLoggedIn = false;
  res.json({ success: true, message: 'Admin logged out' });
});

// Add new employee
router.post('/api/employee/add', (async (req: Request, res: Response) => {
  const { name, email, role, department, joinDate } = req.body;
  if (!name || !email || !role || !department || !joinDate) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  try {
    const employee = new Employee({ 
      name, 
      email, 
      role, 
      department,
      joinDate: new Date(joinDate)
    });
    await employee.save();
    res.json({ success: true, message: 'Employee added successfully' });
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(400).json({ success: false, message: 'Email already exists' });
    } else {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}) as RequestHandler);

app.use(router);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
