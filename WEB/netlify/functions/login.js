import jwt from "jsonwebtoken";


export const handler = async (event) => {
if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };


const { username, password } = JSON.parse(event.body || "{}");


const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;
const STAFF_USER = process.env.STAFF_USER;
const STAFF_PASS = process.env.STAFF_PASS;
const JWT_SECRET = process.env.JWT_SECRET;


let role = null;
if (username === ADMIN_USER && password === ADMIN_PASS) role = "admin";
if (username === STAFF_USER && password === STAFF_PASS) role = "staff";


if (!role) {
return { statusCode: 401, headers:{"content-type":"application/json"}, body: JSON.stringify({ error: "invalid credentials" }) };
}


const token = jwt.sign({ role }, JWT_SECRET, { expiresIn: "1h" });
return { statusCode: 200, headers:{"content-type":"application/json"}, body: JSON.stringify({ token }) };
};