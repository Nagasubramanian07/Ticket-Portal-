CREATE TABLE IF NOT EXISTS tickets (
  id            SERIAL PRIMARY KEY,
  ticket_number TEXT NOT NULL,
  ticket_date   DATE NOT NULL,
  description   TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'Open',
  closed_date   DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
