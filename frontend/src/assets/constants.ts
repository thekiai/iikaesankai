export const mainColor = "#5170ff"
export const subColor = "#e0ba33"

const DEV_ENDPOINT = "https://api-h3sm47ypsa-uc.a.run.app"
const PROD_ENDPOINT = "https://iikaesankai.com"

const hostname = window.location.hostname
export const API_ENDPOINT = hostname === "localhost" ? `http://localhost:8003` : DEV_ENDPOINT
export const ENV_NAME = hostname === "localhost" ? "local" : API_ENDPOINT.includes("dev") ? "dev" : "prod"
