const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const filterButtons = document.querySelectorAll(".filter-button");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

let tasks = JSON.parse(localStorage.getItem("studyflowTasks")) || [];
let currentFilter = "all";

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const task = {
    id: Date.now(),
    title: document.getElementById("taskTitle").value.trim(),
    subject: document.getElementById("subjectName").value.trim(),
    dueDate: document.getElementById("dueDate").value,
    priority: document.getElementById("priority").value,
    type: document.getElementById("taskType").value,
    note: document.getElementById("taskNote").value.trim(),
    completed: false,
  };

  tasks.push(task);
  saveTasks();
  taskForm.reset();
  renderTasks();
  updateSummary();
  updateRecommendation();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

function getDaysLeft(dueDate) {
  const today = new Date();
  const target = new Date(dueDate);

  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const difference = target - today;
  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}

function isUrgent(task) {
  const daysLeft = getDaysLeft(task.dueDate);
  return daysLeft <= 2 && !task.completed;
}

function getFilteredTasks() {
  if (currentFilter === "completed") {
    return tasks.filter((task) => task.completed);
  }

  if (currentFilter === "pending") {
    return tasks.filter((task) => !task.completed);
  }

  if (currentFilter === "urgent") {
    return tasks.filter((task) => isUrgent(task));
  }

  return tasks;
}
function saveTasks() {
  localStorage.setItem("studyflowTasks", JSON.stringify(tasks));
}

function renderTasks() {
  saveTasks();
  const filteredTasks = getFilteredTasks();
  taskList.innerHTML = "";

  if (filteredTasks.length === 0) {
    taskList.appendChild(emptyState);
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  filteredTasks.forEach((task) => {
    const daysLeft = getDaysLeft(task.dueDate);
    const urgent = isUrgent(task);

    let deadlineText = "";
    if (daysLeft > 0) {
      deadlineText = `${daysLeft} day(s) left`;
    } else if (daysLeft === 0) {
      deadlineText = "Due today";
    } else {
      deadlineText = `${Math.abs(daysLeft)} day(s) overdue`;
    }

    const taskCard = document.createElement("div");
    taskCard.className = `task-card ${task.completed ? "completed" : ""}`;

    taskCard.innerHTML = `
      <div class="task-top">
        <div>
          <h3>${task.title}</h3>
          <p class="task-meta">${task.subject} · ${task.type} · ${deadlineText}</p>
        </div>
      </div>

      <div class="badge-row">
        <span class="badge ${task.priority.toLowerCase()}">${task.priority}</span>
        ${urgent ? `<span class="badge urgent">Urgent</span>` : ""}
      </div>

      <p class="task-meta">${task.note || "No additional note."}</p>

      <div class="task-actions">
        <button class="small-button complete" onclick="toggleComplete(${task.id})">
          ${task.completed ? "Undo" : "Complete"}
        </button>
        <button class="small-button delete" onclick="deleteTask(${task.id})">
          Delete
        </button>
      </div>
    `;

    taskList.appendChild(taskCard);
  });
}

function toggleComplete(id) {
  tasks = tasks.map((task) => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });

  saveTasks();
  saveTasks();
  renderTasks();
  updateSummary();
  updateRecommendation();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);

  renderTasks();
  updateSummary();
  updateRecommendation();
}

function updateSummary() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;
  const urgent = tasks.filter((task) => isUrgent(task)).length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById("totalTasks").textContent = total;
  document.getElementById("completedTasks").textContent = completed;
  document.getElementById("pendingTasks").textContent = pending;

  document.getElementById("heroTotalTasks").textContent = total;
  document.getElementById("heroCompletedTasks").textContent = completed;
  document.getElementById("heroUrgentTasks").textContent = urgent;

  document.getElementById("progressPercentage").textContent = `${progress}%`;
  document.getElementById("progressFill").style.width = `${progress}%`;

  document.getElementById("heroProgressText").textContent = `${progress}%`;
  document.getElementById("heroProgressFill").style.width = `${progress}%`;
}

function updateRecommendation() {
  const recommendation = document.getElementById("aiRecommendation");

  if (tasks.length === 0) {
    recommendation.textContent =
      "Add a study task first. StudyFlow AI will analyze your schedule and suggest what to focus on.";
    return;
  }

  const urgentTasks = tasks.filter((task) => isUrgent(task));
  const highPriorityTasks = tasks.filter(
    (task) => task.priority === "High" && !task.completed
  );
  const pendingTasks = tasks.filter((task) => !task.completed);

  if (urgentTasks.length > 0) {
    recommendation.textContent =
      "AI Recommendation: You have urgent tasks due soon. Focus on the closest deadline first, then review high-priority tasks.";
  } else if (highPriorityTasks.length > 0) {
    recommendation.textContent =
      "AI Recommendation: No urgent deadline was found, but you still have high-priority work. Start with the most important task today.";
  } else if (pendingTasks.length > 0) {
    recommendation.textContent =
      "AI Recommendation: Your schedule is stable. Continue working steadily and complete at least one task before the end of the day.";
  } else {
    recommendation.textContent =
      "AI Recommendation: Great job. All tasks are completed. Use this time to review or prepare for upcoming assignments.";
  }
}

renderTasks();
updateSummary();
updateRecommendation();
