import { Router, Request, Response } from "express";
import { createPlate } from "./plateService";
import { savePlate, getPlate } from "./db";

const router = Router();

/**
 * @openapi
 * /api/v1/plate:
 *   post:
 *     summary: Generate a standardized Open Plate filename
 *     description: Takes a raw filename, generates a standardized filename, stores it, and returns its UUID.
 *     tags:
 *       - Plate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileName
 *             properties:
 *               fileName:
 *                 type: string
 *                 example: google chrome passwords.csv
 *     responses:
 *       201:
 *         description: Plate created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 550e8400-e29b-41d4-a716-446655440000
 *                 generatedName:
 *                   type: string
 *                   example: dapa_gogl_chrm_pswd_usen_6811.csv
 *       400:
 *         description: Invalid request.
 */
router.post(
    "/api/v1/plate",
    (req: Request, res: Response): void => {

        const { fileName } = req.body;

        if (
            typeof fileName !== "string" ||
            fileName.trim().length === 0
        ) {
            res.status(400).json({
                error: "fileName is required"
            });
            return;
        }

        const plate = createPlate(fileName);

        savePlate(plate, fileName);

        res.status(201).json({
            id: plate.id,
            generatedName: plate.generatedName
        });
    }
);

/**
 * @openapi
 * /api/v1/plate/{id}:
 *   get:
 *     summary: Retrieve a stored Open Plate record
 *     description: Returns a previously generated plate using its UUID.
 *     tags:
 *       - Plate
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the stored plate.
 *     responses:
 *       200:
 *         description: Plate retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 rawName:
 *                   type: string
 *                 generatedName:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Plate not found.
 *       400:
 *         description: Invalid plate id.
 */
router.get(
    "/api/v1/plate/:id",
    (req: Request, res: Response): void => {

        const id = req.params.id;

        if (!id || Array.isArray(id)) {
            res.status(400).json({
                error: "Invalid plate id"
            });
            return;
        }

        const plate = getPlate(id);

        if (!plate) {
            res.status(404).json({
                error: "Plate not found"
            });
            return;
        }

        res.json(plate);
    }
);

export default router;