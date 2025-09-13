import jwt from "jsonwebtoken";


export const handler = async (event) => {
const auth = event.headers.authorization || "";
const token = auth.replace("Bearer ", "");


try {
const decoded = jwt.verify(token, process.env.JWT_SECRET);
return { statusCode: 200, headers:{"content-type":"application/json"}, body: JSON.stringify({ valid: true, role: decoded.role }) };
} catch {
return { statusCode: 200, headers:{"content-type":"application/json"}, body: JSON.stringify({ valid: false }) };
}
};