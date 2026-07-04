import { describe, it, expect } from "vitest";
import { buildCardShareText, buildCardShareData, TAGLINE } from "./share";
import { TAROT } from "../data/tarot";
import type { TarotCard } from "../types";

const fool = TAROT.find((c) => c.id === "fool") as TarotCard;

describe("buildCardShareText", () => {
  it("incluye número, nombre y mensaje de la carta", () => {
    const txt = buildCardShareText(fool);
    expect(txt).toContain(fool.num);
    expect(txt).toContain(fool.name);
    expect(txt).toContain(fool.msg);
  });

  it("cierra con la tagline de marca", () => {
    expect(buildCardShareText(fool)).toContain(TAGLINE);
  });

  it("entrecomilla el mensaje con comillas tipográficas", () => {
    expect(buildCardShareText(fool)).toContain(`“${fool.msg}”`);
  });
});

describe("buildCardShareData", () => {
  it("separa título, texto y url para la Web Share API", () => {
    const url = "https://joxemari.github.io/Dare/";
    const data = buildCardShareData(fool, url);
    expect(data.title).toBe(`DARE — ${fool.name}`);
    expect(data.text).toBe(buildCardShareText(fool));
    expect(data.url).toBe(url);
  });
});
