
import express from "express";
import {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
} from "../Controllers/teamController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.post("/", createTeam);
router.get("/", getAllTeams);
router.get("/:id", getTeamById);
router.patch("/:id", updateTeam);
router.delete("/:id", deleteTeam);

export default router;
