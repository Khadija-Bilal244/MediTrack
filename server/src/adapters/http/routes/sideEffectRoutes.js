import express from "express";
import { getSideEffects, logSideEffect, deleteSideEffect } from "../controllers/SideEffectController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/",     getSideEffects);
router.post("/",    logSideEffect);
router.delete("/:id", deleteSideEffect);

export default router;