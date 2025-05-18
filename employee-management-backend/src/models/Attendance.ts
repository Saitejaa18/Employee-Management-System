import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  employee: mongoose.Schema.Types.ObjectId;
  date: string; // YYYY-MM-DD
  present: boolean;
}

const AttendanceSchema: Schema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: String, required: true },
  present: { type: Boolean, default: false },
});

AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema); 