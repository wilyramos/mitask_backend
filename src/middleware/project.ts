import type { Request, Response, NextFunction } from 'express';
import Project, { IProject } from '../models/Project';

declare global {
    namespace Express {
        interface Request {
            project: IProject
        }
    }
}


export async function projectExists(req: Request, res: Response, next: NextFunction) {
    // Check if project exists
    try {
        const { projectId } = req.params;        
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({error: 'Project not found'});
        }
        
        req.project = project;

        next();
    } catch (error) {
        res.status(500).json({error: 'Server error'});
    }
}