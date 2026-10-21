import express from "express"
import { createProject,getAllProjects,getProjectById,updateProject,deleteProject } from "../Controllers/projectController.js"
import { authenticate } from "../middleware/authMiddleware.js";
import {
    addProjectMember,getProjectMembers,removeProjectMember,updateProjectMemberRole
} from "../Controllers/projectController.js";

const router = express.Router();

router.post("/",authenticate,createProject)
router.get("/",authenticate,getAllProjects)
router.get("/:id",authenticate,getProjectById)
router.patch("/:id",authenticate,updateProject)
router.delete("/:id",authenticate,deleteProject)
router.post("/:projectId/members",authenticate,addProjectMember)
router.get("/:projectId/members", authenticate, getProjectMembers);
router.delete("/:projectId/members", authenticate, removeProjectMember);
router.patch(
  "/:projectId/members/:userId/role",
  authenticate,
  updateProjectMemberRole
);
export default router