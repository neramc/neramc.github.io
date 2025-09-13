import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";


const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
const BUCKET = process.env.BUCKET || "slides";


function hasAnyRole(event){
const token = (event.headers.authorization || "").replace("Bearer ", "");
try { return !!jwt.verify(token, process.env.JWT_SECRET); } catch { return false; }
}


export const handler = async (event) => {
if (event.httpMethod !== "GET") return { statusCode: 405, body: "Method Not Allowed" };
if (!hasAnyRole(event)) return { statusCode: 403, body: "forbidden" };


const params = new URLSearchParams(event.rawQuery || event.queryStringParameters);
const name = (params.get ? params.get("name") : event.queryStringParameters?.name) || "";
if (!name) return { statusCode: 400, headers:{"content-type":"application/json"}, body: JSON.stringify({ error: "name required" }) };


const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { persistSession: false } });
const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(name, 60);
if (error) return { statusCode: 500, headers:{"content-type":"application/json"}, body: JSON.stringify({ error: error.message }) };


return { statusCode: 200, headers:{"content-type":"application/json"}, body: JSON.stringify({ url: data.signedUrl }) };
};