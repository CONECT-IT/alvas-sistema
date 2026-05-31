import { check } from "k6";
import http from "k6/http";

export const options = {
  vus: 5,
  duration: "10s",
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.05"],
  },
};

const BASE_URL = __ENV.API_URL || "http://127.0.0.1:8787";

export function setup() {
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ username: "admin", clave: "admin123" }),
    { headers: { "Content-Type": "application/json" } },
  );
  check(loginRes, { "login ok": (r) => r.status === 200 });
  return { sessionToken: loginRes.json("data.authToken") };
}

export default function (data) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${data.sessionToken}`,
  };

  const endpoints = [
    { name: "pipeline", url: "/ventas/pipeline" },
    { name: "contratos", url: "/ventas/contratos" },
    { name: "citas", url: "/ventas/citas" },
    { name: "clientes", url: "/ventas/clientes" },
    { name: "propiedades", url: "/propiedades" },
    { name: "usuarios", url: "/usuarios" },
    { name: "captaciones", url: "/captaciones/pendientes" },
    { name: "reportes", url: "/reportes/general" },
  ];

  const ep = endpoints[__ITER % endpoints.length];
  const res = http.get(`${BASE_URL}${ep.url}`, { headers });

  check(res, {
    [`${ep.name} status 200`]: (r) => r.status === 200,
    [`${ep.name} body json`]: (r) => r.headers["Content-Type"]?.includes("json"),
  });
}
