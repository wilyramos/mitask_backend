import mongoose, {Schema, Document, PopulatedDoc, Types} from "mongoose";
import { ITask } from "./Task";
import { IUser } from "./User";

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

const Project = mongoose.model<IProject>('Project', ProjectSchema);
export default Project;