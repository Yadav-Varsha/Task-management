const express = require("express"); // Import Express
const mysql = require("mysql2"); // Import MySQL
const cors = require("cors"); // Import CORS

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json()); // ✅ Ensure JSON parsing middleware is used before defining routes

// ✅ MySQL Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root@123",
  database: "form_db",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed: " + err.message);
  } else {
    console.log("✅ Connected to MySQL Database");
  }
});

// ✅ Get All Tasks
app.get("/tasks", (req, res) => {
  db.query("SELECT * FROM tasks ORDER BY id ASC", (err, results) => {
    if (err) {
      console.error("❌ Error fetching tasks:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.json(results);
    }
  });
});

// ✅ Get Single Task
app.get("/tasks/:taskId", (req, res) => {
  const taskId = req.params.taskId;
  if (!taskId) return res.status(400).json({ error: "Task ID is required" });

  const query = `SELECT * FROM tasks WHERE id = ?`;
  db.query(query, [taskId], (err, results) => {
    if (err) {
      console.error("❌ Database Error:", err);
      res.status(500).json({ error: "Database error" });
    } else if (results.length === 0) {
      res.status(404).json({ error: "Task not found" });
    } else {
      res.json(results[0]);
    }
  });
});

// ✅ Add New Task
app.post("/tasks", (req, res) => {
  const {
    task_owner = "Unknown",
    task_name,
    description,
    start_date,
    due_date,
    priority,
    status,
  } = req.body;

  if (!task_name || !description || !priority || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  console.log("📥 Received New Task:", req.body);

  const sql = `
    INSERT INTO tasks (task_owner, task_name, description, start_date, due_date, priority, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [task_owner, task_name, description, start_date, due_date, priority, status],
    (err, result) => {
      if (err) {
        console.error("❌ Database Insert Error:", err);
        return res.status(500).json({ error: err.message });
      }

      console.log("✅ Task Added with ID:", result.insertId);
      res.json({ message: "Task added successfully", taskId: result.insertId });
    }
  );
});

// ✅ Update Task (Fixed)
app.put("/tasks/:id", (req, res) => {
  const taskId = req.params.id;
  if (!taskId) return res.status(400).json({ error: "Task ID is required" });

  let { task_name, task_owner, start_date, due_date, priority, status } = req.body;

  // Ensure NULL values are handled correctly
  task_owner = task_owner && task_owner.trim() !== "" ? task_owner : null;
  start_date = start_date && start_date.trim() !== "" ? start_date : null;
  due_date = due_date && due_date.trim() !== "" ? due_date : null;

  console.log("🔄 Updating Task:", {
    taskId,
    task_name,
    task_owner,
    start_date,
    due_date,
    priority,
    status,
  });

  const sql = `
    UPDATE tasks 
    SET task_name = ?, task_owner = ?, start_date = ?, due_date = ?, priority = ?, status = ? 
    WHERE id = ?`;

  db.query(
    sql,
    [task_name, task_owner, start_date, due_date, priority, status, taskId],
    (err, result) => {
      if (err) {
        console.error("❌ Database Update Error:", err);
        return res.status(500).json({ error: "Database update failed" });
      }

      console.log("✅ Database Update Success:", result);

      if (result.affectedRows === 0) {
        console.warn("⚠ No rows updated. Check if the ID exists.");
        return res.status(404).json({ error: "Task not found or no changes made" });
      }

      res.json({ message: "Task updated successfully", updatedTask: req.body });
    }
  );
});

// ✅ Delete Task
app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Task ID is required" });

  db.query("DELETE FROM tasks WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("❌ Database Delete Error:", err);
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  });
});

// ✅ Start the Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
