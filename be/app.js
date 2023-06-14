const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const User = require("./model/user_modal");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.post("/users", (req, res) => {
  console.log(req.body);
  const { firstname, lastname, email, phone, gender, status, location } =
    req.body;
  const user = new User({
    firstname,
    lastname,
    email,
    phone,
    gender,
    status,
    location,
  });
  user
    .save()
    .then((savedUser) => {
      console.log("data added sucessfully");
      res.status(201).json({ data: "data added sucessfully" });
    })
    .catch((err) => res.status(400).json({ error: err.message }));
});

app.get("/users/:id", async(req, res) => {
  const { id } = req.params;
  const users = await User.findById(id)
  console.log(users);
  res.json({ data: users })

})

app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, phone, gender, status, location } =
    req.body;
  User.findByIdAndUpdate(
    id,
    { firstname, lastname, email, phone, gender, status, location },
    { new: true }
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(updatedUser);
    })
    .catch((err) => res.status(400).json({ error: err.message }));
});

app.delete("/users/:id", async (req, res) => {
  const userDelete = await User.findByIdAndDelete(req.params.id);
  if (userDelete) {
    res.status(200).json({
      success: true,
      message: "User Delete",
    });
  } else {
    res.status(401).json({
      success: false,
      message: "User not deleted",
    });
  }
});

app.get("/users", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search;

  const offset = (page - 1) * limit;

  const users = await User.find();
  const filteredUsers = search
    ? users.filter(
        (user) =>
          user.firstname.toLowerCase().includes(search.toLowerCase()) ||
          user.lastname.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  console.log(filteredUsers);
  const paginatedUsers = filteredUsers.slice(offset, offset + limit);

  res.json({
    data: paginatedUsers,
    page,
    limit,
    total: users.length,
  });
});

app.get("/api/users", (req, res) => {
  const search = req.query.search;
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );
  res.json(filteredUsers);
});

mongoose
  .connect("mongodb://localhost:27017/mernTask")
  .then(() => {
    console.log("Database Connected");
    app.listen(process.env.PORT, () => {
      console.log(`Server Is Running On http://localhost: ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log(err));
