-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  color VARCHAR(50),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO users (username, password) VALUES
('admin', '$2b$10$UfS6Ng/K7fXYZEpmn1vVquGI/5Jowv6p0nbZ9alsCcSMiePS5vY5q'),
('simon', '$2b$10$XwaET9ut.CaUFCxILM0vU.8QOzbIFBkkk3niesixOHOXTV65C2gnK');
