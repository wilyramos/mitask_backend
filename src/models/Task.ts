import mongoose, {Schema, Document, Types} from "mongoose";
import Note from "./Note";


// Define the task status
const taskStatus = {
    PENDING: 'pending',
    ON_HOLD: 'on-hold',
    IN_PROGRESS: 'in-progress',
    UNDER_REVIEW: 'under-review',
    COMPLETED: 'completed'
} as const

export type TaskStatus = typeof taskStatus[keyof typeof taskStatus];


export interface ITask extends Document {
    name: string;
    description: string;
    project: Types.ObjectId;
    status: TaskStatus;
    completedBy: {
        user: Types.ObjectId;
        status: TaskStatus;
    }[];
    notes: Types.ObjectId[]

}

export const TaskSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true,
        trim: true
    },

    project: {
        type: Types.ObjectId,
        ref: 'Project',
        required: true
    },

    status: {
        type: String,
        enum: Object.values(taskStatus),
        default: taskStatus.PENDING
    },
    completedBy: [
        {
            user: {
                type: Types.ObjectId,
                ref: 'User',
                default: null
            },
            status: {
                type: String,
                enum: Object.values(taskStatus),
                default: taskStatus.PENDING
            }
        }
    ],
    notes: [
        {
            type: Types.ObjectId,
            ref: 'Note'
        }
    ]
    
}, {timestamps: true});

// Middleware to delete all notes associated with a task

TaskSchema.pre('deleteOne', {document: true}, async function() {
    const taskId = this._id
    if(!taskId) return
    await Note.deleteMany({task: taskId})
})

const Task = mongoose.model<ITask>('Task', TaskSchema);
export default Task;