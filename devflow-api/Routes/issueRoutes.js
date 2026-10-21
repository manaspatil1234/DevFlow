import express from "express"
import { createIssue, deleteIssue, getAllIssues, getIssueById, updateIssues,assignIssue } from "../Controllers/issueController.js"
import { authenticate } from "../middleware/authMiddleware.js"
import { getActivities,getAllActivities } from "../Controllers/activityController.js";

const router = express.Router()

router.post("/",authenticate,createIssue)
router.get("/",authenticate,getAllIssues)

// Global activity route MUST come before /:id
router.get("/activity", authenticate, getAllActivities);

router.get('/:id',authenticate,getIssueById)
router.patch("/:id",authenticate,updateIssues)
router.patch("/:id/assignee", authenticate, assignIssue);
router.delete("/:id",authenticate,deleteIssue)
router.get("/:issueId/activities", authenticate, getActivities);

export {router as issueRoutes}