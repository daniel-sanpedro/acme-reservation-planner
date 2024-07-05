const { Client } = require("pg");
const { v4: uuidv4 } = require("uuid");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const connect = async () => {
  try {
    await client.connect();
    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

const init = async () => {
  try {
    const SQL = `
      DROP TABLE IF EXISTS reservations;
      DROP TABLE IF EXISTS customers;
      DROP TABLE IF EXISTS restaurants;

      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS restaurants (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS reservations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        date DATE NOT NULL,
        party_count INTEGER NOT NULL,
        restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
        customer_id UUID REFERENCES customers(id) NOT NULL
      );

      INSERT INTO customers (name) VALUES
      ('Alice Johnson'),
      ('Bob Smith'),
      ('Carol Martinez'),
      ('David Lee'),
      ('Emily Zhang');

      INSERT INTO restaurants (name) VALUES
      ('Starry Night Cafe'),
      ('The Hungry Bear'),
      ('Ocean Breeze Bistro'),
      ('Mountain Peak Grill'),
      ('Golden Dragon Eatery');
    `;

    await client.query(SQL);
    console.log("Tables created and data seeded successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

const fetchCustomers = async () => {
  const result = await client.query("SELECT * FROM customers");
  return result.rows;
};

const fetchRestaurants = async () => {
  const result = await client.query("SELECT * FROM restaurants");
  return result.rows;
};

const fetchReservations = async () => {
  const result = await client.query("SELECT * FROM reservations");
  return result.rows;
};

const createReservation = async (
  customerId,
  restaurantId,
  date,
  partyCount
) => {
  const result = await client.query(
    "INSERT INTO reservations (customer_id, restaurant_id, date, party_count) VALUES ($1, $2, $3, $4) RETURNING *",
    [customerId, restaurantId, date, partyCount]
  );
  return result.rows[0];
};

const destroyReservation = async (reservationId) => {
  await client.query("DELETE FROM reservations WHERE id = $1", [reservationId]);
};

module.exports = {
  connect,
  init,
  fetchCustomers,
  fetchRestaurants,
  fetchReservations,
  createReservation,
  destroyReservation,
};
