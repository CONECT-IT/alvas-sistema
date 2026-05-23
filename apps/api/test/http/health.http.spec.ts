import { describe, expect, it } from "bun:test";
import app from "../../src/main";

describe("http / health", () => {
  it("responde estado operativo sin levantar un servidor real", async () => {
    const res = await app.request("/health");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      status: "ok",
      service: "alvas-api",
    });
  });
});
