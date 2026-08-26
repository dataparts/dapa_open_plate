import { parseFileName } from "../src/nameParser";

describe("parseFileName()", () => {

    test("parses Google Chrome passwords", () => {

        const result = parseFileName("google chrome passwords.csv");

        expect(result).toEqual({
            place: "gogl",
            persona: "chrm",
            purpose: "pswd",
            extras: [],
            extension: "csv"
        });

    });

    test("removes stop words", () => {

        const result = parseFileName(
            "the google chrome passwords.csv"
        );

        expect(result.place).toBe("gogl");
        expect(result.persona).toBe("chrm");
        expect(result.purpose).toBe("pswd");

    });

    test("extracts extension", () => {

        const result = parseFileName("instagram followers.xlsx");

        expect(result.extension).toBe("xlsx");

    });

    test("supports filenames without extension", () => {

        const result = parseFileName("notes");

        expect(result.extension).toBe("");

    });

    test("stores additional words as extras", () => {

        const result = parseFileName(
            "google chrome passwords backup final.csv"
        );

        expect(result.extras).toEqual([
            "bckp",
            "fnl"
        ]);

    });

});