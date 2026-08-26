import request from "supertest";
import app from "../src/index";

describe("Open Plate API", () => {

    let plateId: string;

    describe("POST /api/v1/plate", () => {

        test("creates a new plate", async () => {

            const response = await request(app)
                .post("/api/v1/plate")
                .send({
                    fileName: "google chrome passwords.csv"
                });

            expect(response.status).toBe(201);

            expect(response.body).toHaveProperty("id");
            expect(response.body).toHaveProperty("generatedName");

            expect(response.body.generatedName).toContain("gogl");
            expect(response.body.generatedName).toContain("chrm");
            expect(response.body.generatedName).toContain("pswd");

            plateId = response.body.id;

        });

        test("returns 400 when fileName is missing", async () => {

            const response = await request(app)
                .post("/api/v1/plate")
                .send({});

            expect(response.status).toBe(400);

            expect(response.body).toEqual({
                error: "fileName is required"
            });

        });

        test("returns 400 when fileName is empty", async () => {

            const response = await request(app)
                .post("/api/v1/plate")
                .send({
                    fileName: ""
                });

            expect(response.status).toBe(400);

        });

    });

    describe("GET /api/v1/plate/:id", () => {

        test("retrieves an existing plate", async () => {

            const response = await request(app)
                .get(`/api/v1/plate/${plateId}`);

            expect(response.status).toBe(200);

            expect(response.body.id).toBe(plateId);
            expect(response.body.rawName).toBe(
                "google chrome passwords.csv"
            );

            expect(response.body.generatedName).toContain(
                "gogl"
            );

        });

        test("returns 404 for an unknown UUID", async () => {

            const response = await request(app)
                .get("/api/v1/plate/00000000-0000-0000-0000-000000000000");

            expect(response.status).toBe(404);

            expect(response.body).toEqual({
                error: "Plate not found"
            });

        });

    });

});