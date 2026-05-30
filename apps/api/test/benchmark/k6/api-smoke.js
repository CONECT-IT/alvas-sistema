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

const BASE_URL = __ENV.API_URL || "http://127.0.0.1:3000";

export function setup() {
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, {
    username: "admin",
    clave: "admin123",
  });
  check(loginRes, { "login ok": (r) => r.status === 200 });
  return { sessionToken: loginRes.json("token") };
}

export default function (data) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${data.sessionToken}`,
  };

  const endpoints = [
    { name: "pipeline", url: "/api/ventas/pipeline" },
    { name: "contratos", url: "/api/ventas/contratos" },
    { name: "citas", url: "/api/ventas/citas" },
    { name: "clientes", url: "/api/ventas/clientes" },
    { name: "propiedades", url: "/api/propiedades" },
    { name: "usuarios", url: "/api/usuarios" },
    { name: "captaciones", url: "/api/captaciones/pendientes" },
    { name: "reportes", url: "/api/reportes/general" },
  ];

  const ep = endpoints[__ITER % endpoints.length];
  const res = http.get(`${BASE_URL}${ep.url}`, { headers });

  check(res, {
    [`${ep.name} status 200`]: (r) => r.status === 200,
    [`${ep.name} body json`]: (r) => r.headers["Content-Type"]?.includes("json"),
  });
}
