
import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getTeamMembers,
  addTeamMember,
} from "../Controllers/teamMemberController.js";

const router = express.Router();

router.use(authenticate);

router.get("/:teamId/members",authenticate, getTeamMembers);
router.post("/:teamId/members",authenticate, addTeamMember);

export default router;
