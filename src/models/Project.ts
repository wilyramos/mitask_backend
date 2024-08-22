import mongoose, {Schema, Document, PopulatedDoc, Types} from "mongoose";
import Task, { ITask } from "./Task";
import { IUser } from "./User";
import Note from './Note'

export interface IProject extends Document {
    projectName: string;
    clientName: string;
    description: string;
    tasks: PopulatedDoc<ITask & Document>[]; // Array of tasks
    manager: PopulatedDoc<IUser & Document>; // Manager of the project
    team: PopulatedDoc<IUser & Document>[]; // Team members of the project
}

const ProjectSchema: Schema = new Schema({
    projectName: {
        type: String, 
        required: true, 
        trim: true // Remove white spaces
    },
    clientName: {
        type: String, 
        required: true, 
        trim: true
    },
    description: {
        type: String, 
        required: true, 
        trim: true
    },
    tasks: [{ 
        type: Types.ObjectId, 
        ref: 'Task' 
    }],
    manager: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    team: [{
        type: Types.ObjectId,
        ref: 'User'
    }]
    
},{timestamps: true});

// Middleware

ProjectSchema.pre('deleteOne', {document: true}, async function(){
    const projectId = this._id
    if(!projectId) return

    const tasks = await Task.find({project: projectId})
    for( const task of tasks){
        await Note.deleteMany({task: task._id})
    }

    await Task.deleteMany({project: projectId})
})

const Project = mongoose.model<IProject>('Project', ProjectSchema)
export default Project