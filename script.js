const STORAGE_KEY = "studyflowTasks";

const labels = {
  priorities: {
    High: "높음",
    Medium: "보통",
    Low: "낮음",
  },
  types: {
    Assignment: "과제",
    Exam: "시험",
    Project: "프로젝트",
    Review: "복습",
  },
};

const elements = {
  taskForm: document.getElementById("taskForm"),
  taskList: document.getElementById("taskList"),
  emptyState: document.getElementById("emptyState"),
  filterButtons: document.querySelectorAll(".filter-button"),
  menuToggle: document.getElementById("menuToggle"),
  navLinks: document.getElementById("navLinks"),
  recommendation: document.getElementById("aiRecommendation"),
};

let tasks = loadTasks();
let currentFilter = "all";

initNavigation();
initPlannerForm();
initFilters();
renderTasks();
updateSummary();
updateRecommendation();

function initNavigation() {
  if (!elements.menuToggle || !elements.navLinks) return;

  elements.menuToggle.addEventListener("click", () => {
    elements.navLinks.classList.toggle("show");
  });
}

function initPlannerForm() {
  if (!elements.taskForm) return;

  elements.taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    tasks.push(createTaskFromForm());
    saveTasks();
    elements.taskForm.reset();
    renderTasks();
    updateSummary();
    updateRecommendation();
  });
}

function initFilters() {
  elements.filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      elements.filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      currentFilter = button.dataset.filter;
      renderTasks();
    });
  });
}

function createTaskFromForm() {
  return {
    id: Date.now(),
    title: getInputValue("taskTitle"),
    subject: getInputValue("subjectName"),
    dueDate: getInputValue("dueDate"),
    priority: getInputValue("priority"),
    type: getInputValue("taskType"),
    note: getInputValue("taskNote"),
    completed: false,
  };
}

function getInputValue(id) {
  return document.getElementById(id).value.trim();
}

function loadTasks() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks() {
  if (!elements.taskList || !elements.emptyState) return;

  const filteredTasks = getFilteredTasks();
  elements.taskList.innerHTML = "";

  if (filteredTasks.length === 0) {
    elements.taskList.appendChild(elements.emptyState);
    elements.emptyState.style.display = "block";
    return;
  }

  elements.emptyState.style.display = "none";
  filteredTasks.forEach((task) => elements.taskList.appendChild(createTaskCard(task)));
}

function createTaskCard(task) {
  const card = document.createElement("div");
  card.className = `task-card ${task.completed ? "completed" : ""}`;
  card.innerHTML = getTaskCardMarkup(task);
  return card;
}

function getTaskCardMarkup(task) {
  const urgentBadge = isUrgent(task) ? '<span class="badge urgent">긴급</span>' : "";
  const completeLabel = task.completed ? "되돌리기" : "완료";
  const note = task.note || "추가 메모가 없습니다.";

  return `
    <div class="task-top">
      <div>
        <h3>${task.title}</h3>
        <p class="task-meta">${task.subject} · ${labels.types[task.type]} · ${getDeadlineText(task.dueDate)}</p>
      </div>
    </div>

    <div class="badge-row">
      <span class="badge ${task.priority.toLowerCase()}">${labels.priorities[task.priority]}</span>
      ${urgentBadge}
    </div>

    <p class="task-meta">${note}</p>

    <div class="task-actions">
      <button class="small-button complete" type="button" onclick="toggleComplete(${task.id})">${completeLabel}</button>
      <button class="small-button delete" type="button" onclick="deleteTask(${task.id})">삭제</button>
    </div>
  `;
}

function getFilteredTasks() {
  if (currentFilter === "completed") return tasks.filter((task) => task.completed);
  if (currentFilter === "pending") return tasks.filter((task) => !task.completed);
  if (currentFilter === "urgent") return tasks.filter((task) => isUrgent(task));
  return tasks;
}

function toggleComplete(id) {
  tasks = tasks.map((task) => (
    task.id === id ? { ...task, completed: !task.completed } : task
  ));

  persistAndRefresh();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  persistAndRefresh();
}

function persistAndRefresh() {
  saveTasks();
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
  if (!elements.recommendation) return;

  const urgentTasks = tasks.filter((task) => isUrgent(task));
  const highPriorityTasks = tasks.filter(
    (task) => task.priority === "High" && !task.completed
  );
  const pendingTasks = tasks.filter((task) => !task.completed);

  elements.recommendation.textContent = getRecommendationText({
    total: tasks.length,
    urgent: urgentTasks.length,
    highPriority: highPriorityTasks.length,
    pending: pendingTasks.length,
  });
}

function getRecommendationText(summary) {
  if (summary.total === 0) {
    return "먼저 플래너에 학습 할 일을 추가하세요. StudyFlow AI가 일정을 분석해 추천을 보여줍니다.";
  }

  if (summary.urgent > 0) {
    return "AI 추천: 곧 마감되는 긴급 할 일이 있습니다. 가장 가까운 마감일부터 처리하고, 그다음 높은 우선순위의 작업을 복습하세요.";
  }

  if (summary.highPriority > 0) {
    return "AI 추천: 긴급 마감은 없지만 높은 우선순위의 공부가 남아 있습니다. 오늘 가장 중요한 한 가지부터 시작하세요.";
  }

  if (summary.pending > 0) {
    return "AI 추천: 일정이 비교적 안정적입니다. 무리하지 말고 오늘 안에 할 일 하나를 완료하는 것을 목표로 해보세요.";
  }

  return "AI 추천: 모든 할 일을 완료했습니다. 남은 시간에는 복습하거나 다음 과제를 미리 준비해보세요.";
}

function getDaysLeft(dueDate) {
  const today = new Date();
  const target = new Date(dueDate);

  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

function getDeadlineText(dueDate) {
  const daysLeft = getDaysLeft(dueDate);

  if (daysLeft > 0) return `${daysLeft}일 남음`;
  if (daysLeft === 0) return "오늘 마감";
  return `${Math.abs(daysLeft)}일 지남`;
}

function isUrgent(task) {
  return getDaysLeft(task.dueDate) <= 2 && !task.completed;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function setWidth(id, value) {
  const element = document.getElementById(id);
  if (element) element.style.width = value;
}
