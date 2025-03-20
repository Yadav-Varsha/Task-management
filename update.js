// Fetch and display tasks
function fetchTasks() {
  fetch("http://localhost:5000/tasks", { cache: "no-store" }) // Disable caching
    .then((response) => response.json())
    .then((tasks) => {
      console.log("🔄 Fetching updated tasks:", tasks);

      const taskList = document.getElementById("taskList");
      taskList.innerHTML = ""; // Clear old tasks

      // Count task
      let totalTasks = tasks.length;
      let openTasks = tasks.filter((task) => task.status === "Open").length;
      let completedTasks = tasks.filter(
        (task) => task.status === "Completed"
      ).length;

      //Update task
      document.getElementById("totalTasks").innerText = totalTasks;
      document.getElementById("openTasks").innerText = openTasks;
      document.getElementById("completedTasks").innerText = completedTasks;

      tasks.forEach((task) => {
        const taskItem = document.createElement("li");
        taskItem.classList.add(
          "list-group-item",
          "d-flex",
          "justify-content-between",
          "align-items-center"
        );

        const dueDate = task.due_date
          ? new Date(task.due_date).toLocaleDateString("en-US", {
              weekday: "long",
            })
          : "No Due Date";

        taskItem.innerHTML = `
                <div class="col-4 col-md-3 d-flex align-items-center task-item" data-task-id="${
                  task.id
                }">
                    <input type="checkbox" class="form-check-input mx-3 ms-0">
                    <div>
                        <p class="mb-0 fw-semibold">${task.task_name}</p>
                        <p class="mb-0 ">${task.task_owner || "No Owner"}</p>
                        <small class="text-muted">${dueDate}</small>
                    </div>
                </div>
  
               <div class="col-12 col-sm-5 col-md-5 d-flex flex-column flex-md-row align-items-center justify-content-md-center gap-2 mt-2 mt-md-0">
          <span class="text-truncate">${
            task.task_owner || "Not Assigned"
          }</span>
          <button class="btn btn-primary btn-sm w-12 w-md-auto"
              onclick="showUpdateModal(${task.id}, '${task.task_name}', '${
          task.task_owner || ""
        }', '${task.start_date || ""}', '${task.due_date || ""}', '${
          task.priority || "Moderate"
        }', '${task.status || "Open"}')">
            Edit
          </button>
          <button class="btn btn-danger btn-sm w-12 w-md-auto" onclick="deleteTask(${
            task.id
          })">
            Delete
          </button>
        </div>
              `;

        taskList.appendChild(taskItem);
      });

      document.querySelectorAll(".task-item").forEach((item) => {
        item.addEventListener("click", function () {
          const taskId = this.getAttribute("data-task-id");
          window.location.href = `index2.html?taskId=${taskId}`;
        });
      });
    })
    .catch((error) => console.error("Fetch Tasks Error:", error));
}

// Function to show the pop-up modal for updating a task
function showUpdateModal(
  taskId,
  currentTaskName,
  currentTaskOwner,
  currentStartDate,
  currentDueDate,
  currentPriority,
  currentStatus
) {
  // Create the modal dynamically
  let modal = document.createElement("div");
  modal.id = "updateModal";
  modal.style.cssText =
    "position: fixed; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center;";

  modal.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 5px; width: 400px;">
            <h3>Update Task</h3>
            <input type="hidden" id="updateTaskId" value="${taskId}">
    
            <label>Task Name:</label>
            <input type="text" id="updateTaskName" class="form-control" value="${currentTaskName}"><br>
    
            <label>Task Owner:</label>
            <input type="text" id="updateTaskOwner" class="form-control" value="${currentTaskOwner}"><br>
    
            <label>Start Date:</label>
            <input type="date" id="updateStartDate" class="form-control" value="${formatDate(
              currentStartDate
            )}"><br>
    
            <label>Due Date:</label>
            <input type="date" id="updateDueDate" class="form-control" value="${formatDate(
              currentDueDate
            )}"><br>
    
            <label>Priority:</label>
            <select id="updatePriority" class="form-control">
                <option ${
                  currentPriority === "Low" ? "selected" : ""
                }>Low</option>
                <option ${
                  currentPriority === "Moderate" ? "selected" : ""
                }>Moderate</option>
                <option ${
                  currentPriority === "High" ? "selected" : ""
                }>High</option>
            </select><br>
    
            <label>Status:</label>
            <select id="updateStatus" class="form-control">
                <option ${
                  currentStatus === "Open" ? "selected" : ""
                }>Open</option>
                <option ${
                  currentStatus === "In Progress" ? "selected" : ""
                }>In Progress</option>
                <option ${
                  currentStatus === "Completed" ? "selected" : ""
                }>Completed</option>
            </select><br>
    
            <button onclick="updateTask()" class="btn btn-primary">Update Changes</button>
            <button onclick="closeModal()" class="btn btn-secondary">Cancel</button>
        </div>`;

  document.body.appendChild(modal);
}

// Ensure updateTask is globally accessible
window.updateTask = function () {
  const taskId = document.getElementById("updateTaskId").value;
  const updatedTask = {
    task_name: document.getElementById("updateTaskName").value.trim(),
    task_owner: document.getElementById("updateTaskOwner").value.trim() || null,
    start_date: document.getElementById("updateStartDate").value.trim() || null,
    due_date: document.getElementById("updateDueDate").value.trim() || null,
    priority: document.getElementById("updatePriority").value,
    status: document.getElementById("updateStatus").value,
  };

  console.log("🔹 Sending Data to Server:", JSON.stringify(updatedTask));

  fetch(`http://localhost:5000/tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedTask),
  })
    .then((response) => {
      if (!response.ok) throw new Error("❌ Failed to update task.");
      return response.json();
    })
    .then((data) => {
      console.log("✅ Update Response from Server:", data);
      alert("✔ Task updated successfully!");
      closeModal();
      setTimeout(() => fetchTasks(), 500);
    })
    .catch((error) => {
      console.error("❌ Update Error:", error);
      alert("⚠ Failed to update task.");
    });
};

// Format Date to YYYY-MM-DD
function formatDate(dateString) {
  if (!dateString) return null; // If no date, return NULL
  const date = new Date(dateString);
  return date.toISOString().split("T")[0]; // Converts to YYYY-MM-DD
}

// Function to close the modal
function closeModal() {
  const modal = document.getElementById("updateModal");
  if (modal) modal.remove();
}

// Delete a task
function deleteTask(taskId) {
  if (!confirm("Are you sure you want to delete this task?")) return;

  fetch(`http://localhost:5000/tasks/${taskId}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Delete Response:", data);
      alert("Task deleted successfully!");
      fetchTasks(); // Refresh task list after deletion
    })
    .catch((error) => console.error("Delete Error:", error));
}

// Load tasks when the page loads
document.addEventListener("DOMContentLoaded", fetchTasks);
