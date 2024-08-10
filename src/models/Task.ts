import mongoose, {Schema, Document, SchemaDefinition} from "mongoose";

export interface ITask extends Document {
    taskName: string;
    description: string;

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
    }
})

const Task = mongoose.model<ITask>('Task', TaskSchema);
export default Task;