const pool = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authHelper = require("../helpers/authHelper");

exports.login = async (req, res) => {
  const { user_name, password } = req.body;
  try {
    const [userResult] = await pool.query(
      "SELECT * FROM `User` WHERE user_name = ?",
      [user_name]
    );
    if (userResult.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = userResult[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = authHelper.generateToken(user.id);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.register = async (req, res) => {
  const { user_name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO `User` (user_name, email, password) VALUES (?, ?, ?)",
      [user_name, email, hashedPassword]
    );
    res.status(201).json({ id: result.insertId, user_name, email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
