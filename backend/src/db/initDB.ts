import pool from "../config/db";

const initDB = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS conversations (
           id UUID PRIMARY KEY,
           created_at TIMESTAMP DEFAULT NOW()
        )
        `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender TEXT CHECK (sender IN ('user', 'ai')) NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
      )
        `);

    await pool.query(`
       CREATE TABLE IF NOT EXISTS knowledge_base (
       id SERIAL PRIMARY KEY,
       title TEXT NOT NULL UNIQUE,
       content TEXT NOT NULL
       ) 
        `);

    await pool.query(`
      INSERT INTO knowledge_base (title, content)
      VALUES
      ('Shipping Policy',
      'We ship within India and USA. Delivery takes 5-7 business days.'),  
        (
      'Return Policy',
      'Returns are accepted within 7 days of delivery if the product is unused.'
        ),
        (
      'Support Hours',
      'Customer Support is available Monday to Friday, 9am to 6pm IST.'
        )

        ON CONFLICT (title) DO NOTHING

        `);
  } catch (error: any) {
    console.error("Error creating table", error.message);
    process.exit(1);
  }
};

export default initDB;
