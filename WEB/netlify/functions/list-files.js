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
if (!hasAnyRole(event)) return { statusCode: 403, body: "forbidden" };


const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { persistSession: false } });
const { data, error } = await supabase
.storage
.from(BUCKET)
.list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });


if (error) return { statusCode: 500, headers:{"content-type":"application/json"}, body: JSON.stringify({ error: error.message }) };


const files = (data || [])
.filter(f => f.name.endsWith(".pptx"))
.map(f => ({ name: f.name, created_at: f.created_at }));


return { statusCode: 200, headers:{"content-type":"application/json"}, body: JSON.stringify({ files }) };
};