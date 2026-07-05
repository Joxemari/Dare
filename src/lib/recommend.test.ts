import { describe, it, expect } from "vitest";
import { recommendJourney } from "./recommend";
import type { JourneyId } from "../types";

const ALL: JourneyId[] = ["iron", "pulse", "wild", "water"];

describe("recommendJourney", () => {
  it("energía baja → Still Water (recuperación)", () => {
    expect(recommendJourney({ state: "normal", energy: 2, active: ALL })).toBe("water");
    expect(recommendJourney({ state: "active", energy: 2, active: ALL })).toBe("water");
  });

  it("estado 'active' con energía → Iron Quiet (fuerza)", () => {
    expect(recommendJourney({ state: "active", energy: 8, active: ALL })).toBe("iron");
  });

  it("estado 'blocked' (aburrido/atascado) → Wild Ground", () => {
    expect(recommendJourney({ state: "blocked", energy: 6, active: ALL })).toBe("wild");
  });

  it("estado 'stressed' (overwhelmed) → Still Water", () => {
    expect(recommendJourney({ state: "stressed", energy: 6, active: ALL })).toBe("water");
  });

  it("normal con energía alta → Bright Pulse", () => {
    expect(recommendJourney({ state: "normal", energy: 8, active: ALL })).toBe("pulse");
  });

  it("returning tras pausa → arranque más suave activo", () => {
    expect(recommendJourney({ state: "active", energy: 9, active: ALL, returning: true })).toBe("water");
  });

  it("solo recomienda entre los Journeys ACTIVOS", () => {
    // 'active' preferiría iron, pero solo pulse y wild están activos → pulse
    expect(recommendJourney({ state: "active", energy: 8, active: ["pulse", "wild"] })).toBe("pulse");
  });

  it("sin Journeys activos, sugiere la preferencia principal", () => {
    expect(recommendJourney({ state: "active", energy: 8, active: [] })).toBe("iron");
  });

  it("ignora ids no-MVP en la lista de activos", () => {
    // ember/fire no son MVP; con solo esos activos cae a la sugerencia general
    expect(recommendJourney({ state: "normal", energy: 8, active: ["ember", "fire"] as JourneyId[] })).toBe("pulse");
  });
});
