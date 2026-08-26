import {
    createPlate,
    generateDateCode,
    generatePlateName,
} from "../src/plateService";

import { parseFileName } from "../src/nameParser";

describe("plateService", () => {

    afterEach(() => {
        delete process.env.PLATFORM;
    });

    describe("generateDateCode()", () => {

        test("generates the correct date code", () => {

            const date = new Date("2026-08-11");

            expect(generateDateCode(date)).toBe("26811");

        });

        test("removes leading zeros correctly", () => {

            const date = new Date("2026-01-05");

            expect(generateDateCode(date)).toBe("2615");

        });

    });

    describe("generatePlateName()", () => {

        test("creates the expected Open Plate filename", () => {

            const parsed = parseFileName(
                "google chrome passwords.csv"
            );

            const date = new Date("2026-08-11");

            expect(
                generatePlateName(parsed, date)
            ).toBe(
                "dapa_gogl_chrm_pswd_usen_26811.csv"
            );

        });

        test("uses NAKF when no extension exists", () => {

            const parsed = parseFileName("notes");

            const date = new Date("2026-08-11");

            expect(
                generatePlateName(parsed, date)
            ).toBe(
                "dapa_nts_usen_26811.NAKF"
            );

        });

        test("uses PLATFORM environment variable when provided", () => {

            process.env.PLATFORM = "demo";

            const parsed = parseFileName(
                "google chrome passwords.csv"
            );

            const date = new Date("2026-08-11");

            expect(
                generatePlateName(parsed, date)
            ).toBe(
                "demo_gogl_chrm_pswd_usen_26811.csv"
            );

        });

    });

    describe("createPlate()", () => {

        test("creates a complete Plate record", () => {

            const plate = createPlate(
                "google chrome passwords.csv"
            );

            expect(plate.id).toBeDefined();

            expect(typeof plate.id).toBe("string");

            expect(plate.rawName).toBe(
                "google chrome passwords.csv"
            );

            expect(
                plate.generatedName.startsWith(
                    "dapa_gogl_chrm_pswd"
                )
            ).toBe(true);

            expect(plate.parsed.place).toBe("gogl");
            expect(plate.parsed.persona).toBe("chrm");
            expect(plate.parsed.purpose).toBe("pswd");

        });

    });

});