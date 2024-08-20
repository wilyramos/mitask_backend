import type { Request, Response } from "express";
import Note, {INote} from "../models/Note";
import { Types } from "mongoose";


type NoteParams = {
    noteId: Types.ObjectId
}

export class NoteController {
    static createNote = async (req: Request<{}, {}, INote>, res: Response) => {
        const { content } = req.body
        const note = new Note()
        note.content = content
        note.createBy = req.user.id
        note.task = req.task.id

        req.task.notes.push(note.id)

        try {
            await Promise.all([note.save(), req.task.save()])
            res.send("Note created successfully")
        } catch (error) {
            res.status(500).json({error: 'Internal server error'})
        }
    }

    static getTaskNotes = async (req: Request, res: Response) => {
          
        try {
            const notes = await Note.find({task: req.task.id})
            res.json(notes)
        } catch (error) {
            res.status(500).json({error: 'Internal server error'})

        }
    }

    static deleteNote = async (req: Request<NoteParams> , res: Response) => {
        
        const { noteId } = req.params
        const note = await Note.findById(noteId)

        if(!note) {
            const error = new Error('Note not found')
            res.status(404).json({error: error.message})
        }

        if(note.createBy.toString() !== req.user.id) {
            const error = new Error('You are not authorized to delete this note')
            res.status(403).json({error: error.message})
        }

        req.task.notes = req.task.notes.filter( note => note.toString() !== noteId.toString())

        try {
            await Promise.allSettled([req.task.save(), note.deleteOne()]) // Delete note and delete reference
            res.send("Note deleted successfully")
        } catch (error) {
            res.status(500).json({error: 'Internal server error'})
            
        }

    }
}