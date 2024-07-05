const express = require("express");
const app = express();
const {
  connect,
  init,
  fetchCustomers,
  fetchRestaurants,
  fetchReservations,
  createReservation,
  destroyReservation,
} = require("./db");

app.use(express.json());

app.get("/api/customers", async (req, res, next) => {
  try {
    const customers = await fetchCustomers();
    res.send(customers);
  } catch (error) {
    next(error);
  }
});

app.get("/api/restaurants", async (req, res, next) => {
  try {
    const restaurants = await fetchRestaurants();
    res.send(restaurants);
  } catch (error) {
    next(error);
  }
});

app.get("/api/reservations", async (req, res, next) => {
  try {
    const reservations = await fetchReservations();
    res.send(reservations);
  } catch (error) {
    next(error);
  }
});

app.post("/api/customers/:id/reservations", async (req, res, next) => {
  const { id } = req.params;
  const { restaurant_id, date, party_count } = req.body;
  try {
    const reservation = await createReservation(
      id,
      restaurant_id,
      date,
      party_count
    );
    res.status(201).send(reservation);
  } catch (error) {
    next(error);
  }
});

app.delete(
  "/api/customers/:customer_id/reservations/:id",
  async (req, res, next) => {
    const { customer_id, id } = req.params;
    try {
      await destroyReservation(id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
);

app.use((err, req, res, next) => {
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

const startServer = async () => {
  try {
    await connect();
    await init();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

startServer();

module.exports = app;
