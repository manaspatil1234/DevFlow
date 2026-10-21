
import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
    createComment,
    getComments
} from "../Controllers/commentController.js";

const router = express.Router();

router.post("/:issueId/comments", authenticate, createComment);
router.get("/:issueId/comments", authenticate, getComments);

export default router;
