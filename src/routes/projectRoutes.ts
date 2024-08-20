import { Router } from "express";
import { body, param } from "express-validator";
import { ProjectController } from "../controllers/ProjectController";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { TeamMemberController } from "../controllers/TeamController";
import { ProjectExists } from "../middleware/project";
import { hasAuthorization, taskExists } from "../middleware/task";
import { taskBelongsToProject } from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { NoteController } from "../controllers/NoteController";



const router = Router()

router.use(authenticate) // Middleware para proteger las rutas que estan en el router

router.post('/', 
    body('projectName')
        .notEmpty().withMessage('Project name is required'),
    body('clientName')
        .notEmpty().withMessage('Client name is required'),
    body('description')
        .notEmpty().withMessage('Description is required'),
    handleInputErrors,
    ProjectController.createProject
)

router.get('/', ProjectController.getAllProjects)

router.get('/:id', 
    param('id').isMongoId().withMessage('Invalid project id'),
    handleInputErrors,
    ProjectController.getProjectById
)

router.put('/:id', 
    param('id').isMongoId().withMessage('Invalid project id'),
    body('projectName')
        .notEmpty().withMessage('Project name is required'),
    body('clientName')
        .notEmpty().withMessage('Client name is required'),
    body('description')
        .notEmpty().withMessage('Description is required'),
    
    handleInputErrors,
    
    ProjectController.updateProject
)

router.delete('/:id',
    param('id').isMongoId().withMessage('Invalid project id'),
    handleInputErrors,
    ProjectController.deleteProject
)


/** Routes for Tasks */

// router por parametros

router.param('projectId', ProjectExists) // Middleware to validate project exists

router.post('/:projectId/tasks',
    hasAuthorization,
    body('name')
        .notEmpty().withMessage('Task name is required'),
    body('description')
        .notEmpty().withMessage('Description is required'),
    handleInputErrors,    
    TaskController.createTask
)

router.get('/:projectId/tasks',
    TaskController.getProjectTasks
)

// middleware para validar que el id de la tarea sea valido

router.param('taskId', taskExists)
router.param('taskId', taskBelongsToProject)

router.get('/:projectId/tasks/:taskId',
    param('taskId').isMongoId().withMessage('Invalid task id'),
    handleInputErrors,
    TaskController.getTaskById
)

router.put('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('Invalid task id'),
    body('name')
        .notEmpty().withMessage('Task name is required'),
    body('description')
        .notEmpty().withMessage('Description is required'),
    handleInputErrors,
    TaskController.updateTask
)

router.delete('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('Invalid task id'),
    handleInputErrors,
    TaskController.deleteTask
)

router.post('/:projectId/tasks/:taskId/status',
    param('taskId').isMongoId().withMessage('Invalid task id'),
    body('status')
        .notEmpty().withMessage('Status is required')
        .isIn(['pending', 'on-hold', 'in-progress', 'under-review', 'completed']).withMessage('Invalid status'),
    handleInputErrors,
    TaskController.updateTaskStatus
)

/** Routes for teams */

router.post('/:projectId/team/find',
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email'),
    handleInputErrors,
    TeamMemberController.findMemberByEmail
)

router.get('/:projectId/team', TeamMemberController.getProjectTeam)

router.post('/:projectId/team',
    body('id')
        .isMongoId().withMessage('Invalid user id'),
    handleInputErrors,
    TeamMemberController.addMemberById
)

router.delete('/:projectId/team/:userId',
    param('userId')
        .isMongoId().withMessage('Invalid user id'),
    handleInputErrors,
    TeamMemberController.removeMemberById
)

/** Routes for notes */

router.post('/:projectId/tasks/:taskId/notes',
    body('content')
        .notEmpty().withMessage('Content is required'),
    handleInputErrors,
    NoteController.createNote
)

router.get('/:projectId/tasks/:taskId/notes',
    NoteController.getTaskNotes
)

router.delete('/:projectId/tasks/:taskId/notes/:noteId',
    param('noteId').isMongoId().withMessage('Invalid note id'),
    handleInputErrors,
    NoteController.deleteNote
)

export default router