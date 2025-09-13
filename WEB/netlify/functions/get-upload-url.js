import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";


const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
const BUCKET = process.env.BUCKET || "slides";


function getRole(event){
const token = (event.headers.authorization || "").replace("Bearer ", "");
try { return jwt.verify(token, process.env.JWT_SECRET).role; } catch { return null; }
}


export const handler = async (event) => {
if (event.httpMethod !== "GET") return { statusCode: 405, body: "Method Not Allowed" };
const role = getRole(event);
if (role !== "admin") return { statusCode: 403, body: "forbidden" };


const params = new URLSearchParams(event.rawQuery || event.queryStringParameters);
const name = (params.get ? params.get("name") : event.queryStringParameters?.name) || "";
if (!name || !name.endsWith(".pptx")) {
return { statusCode: 400, headers:{"content-type":"application/json"}, body: JSON.stringify({ error: "name is required and must end with .pptx" }) };
}


const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { persistSession: false } });
const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(name);
if (error) return { statusCode: 500, headers:{"content-type":"application/json"}, body: JSON.stringify({ error: error.message }) };


return { statusCode: 200, headers:{"content-type":"application/json"}, body: JSON.stringify({ url: data.signedUrl, path: data.path }) };
};