import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const STATUSES = ["Open", "In Progress", "On Hold", "Closed"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;
let ready = null;

function init() {
  if (!ready) {
    ready = sql`CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      ticket_number TEXT NOT NULL,
      ticket_date DATE NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Open',
      closed_date DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`.catch((e) => { ready = null; throw e; });
  }
  return ready;
}

export default async function handler(req, res) {
  try {
    const key = process.env.APP_PASSWORD;
    if (key && req.headers["x-app-key"] !== key) {
      return res.status(401).json({ error: "unauthorized" });
    }
    await init();

    if (req.method === "GET") {
      const rows = await sql`
        SELECT id, ticket_number AS num,
               to_char(ticket_date, 'YYYY-MM-DD') AS date,
               description AS "desc", status,
               to_char(closed_date, 'YYYY-MM-DD') AS closed
        FROM tickets ORDER BY ticket_date DESC, id DESC`;
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const b = req.body || {};
      const num = String(b.num || "").trim().slice(0, 60);
      const desc = String(b.desc || "").trim().slice(0, 2000);
      if (!num || !desc || !DATE.test(b.date || "") || !STATUSES.includes(b.status)) {
        return res.status(400).json({ error: "invalid entry" });
      }
      const closed = b.status === "Closed" && DATE.test(b.closed || "") ? b.closed : null;
      const rows = await sql`
        INSERT INTO tickets (ticket_number, ticket_date, description, status, closed_date)
        VALUES (${num}, ${b.date}, ${desc}, ${b.status}, ${closed})
        RETURNING id, ticket_number AS num,
                  to_char(ticket_date, 'YYYY-MM-DD') AS date,
                  description AS "desc", status,
                  to_char(closed_date, 'YYYY-MM-DD') AS closed`;
      return res.status(201).json(rows[0]);
    }

    const id = parseInt(req.query.id, 10);
    if (!id) return res.status(400).json({ error: "missing id" });

    if (req.method === "PATCH") {
      const b = req.body || {};
      if (!STATUSES.includes(b.status)) return res.status(400).json({ error: "invalid status" });
      const closed = b.status === "Closed" && DATE.test(b.closed || "") ? b.closed : null;
      await sql`UPDATE tickets SET status = ${b.status}, closed_date = ${closed} WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      await sql`DELETE FROM tickets WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return res.status(405).json({ error: "method not allowed" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server error" });
  }
}
