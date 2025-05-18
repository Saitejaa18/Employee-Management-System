import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployee extends Document {
  name: string;
  email: string;
  role: string;
  department: string;
  joinDate: Date;
  lastCheckIn: Date;
  attendanceMarked: boolean;
}

const EmployeeSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  joinDate: { type: Date, default: Date.now },
  lastCheckIn: { type: Date },
  attendanceMarked: { type: Boolean, default: false }
});

export const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);
