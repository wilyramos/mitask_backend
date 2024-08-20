import type { Request, Response } from "express";
import Project from "../models/Project";
import Task from "../models/Task";


export class TaskController {

    static createTask = async (req: Request, res: Response) => {

        try {
            const task = new Task(req.body); // Create a new task
            task.project = req.project.id; // Assign req.project to task
            req.project.tasks.push(task.id); // Add task to req.project

            await Promise.allSettled([task.save(), req.project.save()]); // Save task and project
            res.send('task created');
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }

    }

    static getProjectTasks = async (req: Request, res: Response) => {
        try {
            const tasks = await Task.find({
                project: req.project.id
            }).populate('project'); // Populate project field
            res.json(tasks);
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    }

    static getTaskById = async (req: Request, res: Response) => {
        try {
            const task = await Task.findById(req.task.id)
                    .populate({path: 'completedBy.user', select: 'id name email'})
                    .populate({path: 'notes', populate: {path: 'createBy', select: 'id name email'}}); // Populate completedBy and notes fields
            res.json(task);
        } catch (error) {
            res.status(500).json({ error: 'Server errosssr' });
        }
    }

    static updateTask = async (req: Request, res: Response) => {
        try {
            req.task.name = req.body.name;
            req.task.description = req.body.description;
            await req.task.save();

            res.send('task updated');
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    }


    static deleteTask = async (req: Request, res: Response) => {
        try {

            req.project.tasks = req.project.tasks.filter(task => task.toString() !== req.task.id.toString()); // Remove task from project

            await Promise.allSettled([req.task.deleteOne(), req.project.save()]); // Delete task and save project

            res.send('task deleted');
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    }

    static updateTaskStatus = async (req: Request, res: Response) => {
        try {
            const { status } = req.body;
            req.task.status = status;

            // Create a new object with user and status fields using historial data
            const data = {
                user: req.user.id,
                status: status
            }

            req.task.completedBy.push(data); // Add new object to completedBy array
    
            await req.task.save();
            
            res.send('task status updated');

        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    }
}