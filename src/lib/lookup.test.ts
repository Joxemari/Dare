import { describe, it, expect } from "vitest";
import { findDare, findCard } from "./lookup";

describe("findDare", () => {
  it("encuentra un dare normal por id", () => {
    expect(findDare("out-the-door")?.id).toBe("out-the-door");
  });

  it("encuentra también los wildcards (van en el mismo pool)", () => {
    expect(findDare("w-sunset-swim")?.id).toBe("w-sunset-swim");
  });

  it("devuelve undefined si el id no existe", () => {
    expect(findDare("no-existe")).toBeUndefined();
  });
});

describe("findCard", () => {
  it("encuentra una carta del tarot por id", () => {
    expect(findCard("fool")?.id).toBe("fool");
  });

  it("devuelve undefined para null/undefined sin lanzar", () => {
    expect(findCard(null)).toBeUndefined();
    expect(findCard(undefined)).toBeUndefined();
  });
});
