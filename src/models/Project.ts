import mongoose, {Schema, Document, SchemaDefinition} from "mongoose";

export type ProjectType = Document & {
    projectName: string;
    clientName: string;
    description: string;
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
    }
})

const Project = mongoose.model('Project', ProjectSchema);
export default Project;