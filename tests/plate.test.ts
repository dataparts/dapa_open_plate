import fs from "fs";
import path from "path";
import request from "supertest";
import { closeDatabase } from "../src/db";
import { createApp } from "../src/index";

describe("plate API", () => {
  const dbPath = path.resolve(process.cwd(), "data", "plate.test.db");
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    process.env.DB_PATH = dbPath;
    process.env.PLATFORM = "dapa";
    app = createApp();
  });

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-08-11T10:00:00.000Z"));
    closeDatabase();
    for (const suffix of ["", "-shm", "-wal"]) {
      const candidate = `${dbPath}${suffix}`;
      if (fs.existsSync(candidate)) {
        fs.rmSync(candidate, { force: true });
      }
    }
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  afterAll(() => {
    closeDatabase();
  });

  it("creates a standardized file name and returns its id", async () => {
    const response = await request(app)
      .post("/api/v1/plate")
      .send({ rawName: "google chrome passwords.csv" });

    expect(response.status).toBe(201);
    expect(response.body.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    expect(response.body.generatedName).toBe("dapa_gogl_chrm_pswd_usen_6811.csv");
  });

  it("fetches a saved record by id", async () => {
    const createResponse = await request(app)
      .post("/api/v1/plate")
      .send({ rawName: "google chrome passwords.csv" });

    const getResponse = await request(app).get(`/api/v1/plate/${createResponse.body.id}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual({
      id: createResponse.body.id,
      rawName: "google chrome passwords.csv",
      generatedName: "dapa_gogl_chrm_pswd_usen_6811.csv",
      createdAt: "2026-08-11T10:00:00.000Z"
    });
  });

  it("uses nakf when the input has no extension", async () => {
    const response = await request(app)
      .post("/api/v1/plate")
      .send({ rawName: "amazon firefox document" });

    expect(response.status).toBe(201);
    expect(response.body.generatedName).toBe("dapa_amzn_frfx_dcmt_usen_6811.nakf");
  });
});
