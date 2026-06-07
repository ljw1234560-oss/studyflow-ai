const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const filterButtons = document.querySelectorAll(".filter-button");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

let tasks = JSON.parse(localStorage.getItem("studyflowTasks")) || [];
let currentFilter = "all";

const priorityLabels = {
  High: "높음",
  Medium: "보통",
  Low: "낮음",
};

const typeLabels = {
  Assignment: "과제",
  Exam: "시험",
  Project: "프로젝트",
  Review: "복습",
};

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });
}

if (taskForm) {
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
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

function saveTasks() {
  localStorage.setItem("studyflowTasks", JSON.stringify(tasks));
}

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

function getDeadlineText(dueDate) {
  const daysLeft = getDaysLeft(dueDate);

  if (daysLeft > 0) {
    return `${daysLeft}일 남음`;
  }

  if (daysLeft === 0) {
    return "오늘 마감";
  }

  return `${Math.abs(daysLeft)}일 지남`;
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

function renderTasks() {
  if (!taskList || !emptyState) {
    return;
  }

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
    const urgent = isUrgent(task);
    const taskCard = document.createElement("div");
    taskCard.className = `task-card ${task.completed ? "completed" : ""}`;

    taskCard.innerHTML = `
      <div class="task-top">
        <div>
          <h3>${task.title}</h3>
          <p class="task-meta">${task.subject} · ${typeLabels[task.type]} · ${getDeadlineText(task.dueDate)}</p>
        </div>
      </div>

      <div class="badge-row">
        <span class="badge ${task.priority.toLowerCase()}">${priorityLabels[task.priority]}</span>
        ${urgent ? `<span class="badge urgent">긴급</span>` : ""}
      </div>

      <p class="task-meta">${task.note || "추가 메모가 없습니다."}</p>

      <div class="task-actions">
        <button class="small-button complete" onclick="toggleComplete(${task.id})">
          ${task.completed ? "되돌리기" : "완료"}
        </button>
        <button class="small-button delete" onclick="deleteTask(${task.id})">
          삭제
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
  renderTasks();
  updateSummary();
  updateRecommendation();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
  updateSummary();
  updateRecommendation();
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function setWidth(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.style.width = value;
  }
}

function updateSummary() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;
  const urgent = tasks.filter((task) => isUrgent(task)).length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  setText("totalTasks", total);
  setText("completedTasks", completed);
  setText("pendingTasks", pending);
  setText("heroTotalTasks", total);
  setText("heroCompletedTasks", completed);
  setText("heroUrgentTasks", urgent);
  setText("progressPercentage", `${progress}%`);
  setText("heroProgressText", `${progress}%`);
  setWidth("progressFill", `${progress}%`);
  setWidth("heroProgressFill", `${progress}%`);
}

function updateRecommendation() {
  const recommendation = document.getElementById("aiRecommendation");

  if (!recommendation) {
    return;
  }

  if (tasks.length === 0) {
    recommendation.textContent =
      "먼저 플래너에 학습 할 일을 추가하세요. StudyFlow AI가 일정을 분석해 추천을 보여줍니다.";
    return;
  }

  const urgentTasks = tasks.filter((task) => isUrgent(task));
  const highPriorityTasks = tasks.filter(
    (task) => task.priority === "High" && !task.completed
  );
  const pendingTasks = tasks.filter((task) => !task.completed);

  if (urgentTasks.length > 0) {
    recommendation.textContent =
      "AI 추천: 곧 마감되는 긴급 할 일이 있습니다. 가장 가까운 마감일부터 처리하고, 그다음 높은 우선순위의 작업을 복습하세요.";
  } else if (highPriorityTasks.length > 0) {
    recommendation.textContent =
      "AI 추천: 긴급 마감은 없지만 높은 우선순위의 공부가 남아 있습니다. 오늘 가장 중요한 한 가지부터 시작하세요.";
  } else if (pendingTasks.length > 0) {
    recommendation.textContent =
      "AI 추천: 일정이 비교적 안정적입니다. 무리하지 말고 오늘 안에 할 일 하나를 완료하는 것을 목표로 해보세요.";
  } else {
    recommendation.textContent =
      "AI 추천: 모든 할 일을 완료했습니다. 남은 시간에는 복습하거나 다음 과제를 미리 준비해보세요.";
  }
}

renderTasks();
updateSummary();
updateRecommendation();
