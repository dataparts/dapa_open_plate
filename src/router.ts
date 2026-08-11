import { Router } from "express";
import { createPlate, getPlate } from "./plateService";

export const router = Router();

/**
 * @openapi
 * /api/v1/plate:
 *   post:
 *     summary: Generate and store a standardized file name
 *     tags:
 *       - plate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rawName
 *             properties:
 *               rawName:
 *                 type: string
 *                 example: google chrome passwords.csv
 *     responses:
 *       201:
 *         description: File name generated and stored
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - id
 *                 - generatedName
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 generatedName:
 *                   type: string
 *                   example: dapa_gogl_chrm_pswd_usen_6811.csv
 *       400:
 *         description: Invalid request body
 */
router.post("/plate", (req, res) => {
  try {
    const { rawName } = req.body as { rawName?: unknown };

    if (typeof rawName !== "string" || !rawName.trim()) {
      return res.status(400).json({ error: "rawName must be a non-empty string" });
    }

    const result = createPlate(rawName);
    return res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create plate";
    return res.status(400).json({ error: message });
  }
});

/**
 * @openapi
 * /api/v1/plate/{id}:
 *   get:
 *     summary: Fetch a generated file name record by ID
 *     tags:
 *       - plate
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Plate record found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - id
 *                 - rawName
 *                 - generatedName
 *                 - createdAt
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 rawName:
 *                   type: string
 *                 generatedName:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Plate record not found
 */
router.get("/plate/:id", (req, res) => {
  const record = getPlate(req.params.id);

  if (!record) {
    return res.status(404).json({ error: "Plate record not found" });
  }

  return res.json(record);
});
