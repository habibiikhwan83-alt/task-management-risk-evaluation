/* ===== App State ===== */
const state = {
    tasks: [],
    questionnaire: {
        currentIndex: 0,
        answers: [],
        questions: [
            {
                id: 1,
                text: "Apakah tugas ini memiliki dampak langsung pada keamanan?",
                options: [
                    { label: "Tidak ada dampak", value: 1 },
                    { label: "Dampak ringan", value: 3 },
                    { label: "Dampak sedang", value: 5 },
                    { label: "Dampak tinggi", value: 8 }
                ]
            },
            {
                id: 2,
                text: "Apakah ada teknologi baru yang belum pernah digunakan?",
                options: [
                    { label: "Tidak ada", value: 1 },
                    { label: "Sedikit", value: 3 },
                    { label: "Cukup banyak", value: 5 },
                    { label: "Sangat banyak", value: 8 }
                ]
            },
            {
                id: 3,
                text: "Seberapa kompleks lingkungan eksekusi tugas ini?",
                options: [
                    { label: "Sederhana", value: 1 },
                    { label: "Menengah", value: 3 },
                    { label: "Kompleks", value: 6 },
                    { label: "Sangat kompleks", value: 9 }
                ]
            },
            {
                id: 4,
                text: "Apakah ada keterbatasan waktu yang ketat?",
                options: [
                    { label: "Tidak ada", value: 1 },
                    { label: "Cukup fleksibel", value: 3 },
                    { label: "Terbatas", value: 5 },
                    { label: "Sangat terbatas", value: 7 }
                ]
            },
            {
                id: 5,
                text: "Seberapa besar ketergantungan pada pihak eksternal?",
                options: [
                    { label: "Tidak ada", value: 1 },
                    { label: "Rendah", value: 2 },
                    { label: "Menengah", value: 5 },
                    { label: "Tinggi", value: 8 }
                ]
            }
        ]
    }
};

/* ===== DOM Elements ===== */
const screens = document.querySelectorAll('.screen');
const screensMap = {
    dashboard: document.getElementById('screen-dashboard'),
    create: document.getElementById('screen-create'),
    questionnaire: document.getElementById('screen-questionnaire'),
    results: document.getElementById('screen-results')
};

const taskListEl = document.getElementById('taskList');
const emptyStateEl = document.getElementById('emptyState');

const createTaskForm = document.getElementById('createTaskForm');
const taskNameInput = document.getElementById('taskName');
const taskPriorityInput = document.getElementById('taskPriority');
const taskDueDateInput = document.getElementById('taskDueDate');

const progressFillEl = document.getElementById('progressFill');
const progressTextEl = document.getElementById('progressText');
const questionContainerEl = document.getElementById('questionContainer');

const resultsContainerEl = document.getElementById('resultsContainer');

const modal = document.getElementById('confirmModal');
const modalMessage = document.getElementById('modalMessage');

/* ===== Navigation ===== */
function showScreen(name) {
    screens.forEach(s => s.classList.remove('active'));
    screensMap[name].classList.add('active');
}

/* ===== Task Management (FR-001) ===== */
function renderTasks() {
    taskListEl.innerHTML = '';

    if (state.tasks.length === 0) {
        taskListEl.appendChild(emptyStateEl);
        return;
    }

    state.tasks.forEach((task, index) => {
        const item = document.createElement('div');
        item.className = 'task-item';
        item.innerHTML = `
            <div>
                <h3>${escapeHtml(task.name)}</h3>
                <span class="priority-${task.priority.toLowerCase()}">${task.priority}</span>
                <div class="due-date">Tenggat: ${formatDate(task.dueDate)}</div>
            </div>
            <button class="btn btn-secondary" style="padding:6px 12px; font-size:0.85rem;" onclick="deleteTask(${index})">Hapus</button>
        `;
        taskListEl.appendChild(item);
    });
}

function formatDate(dateString) {
    const d = new Date(dateString + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.deleteTask = function(index) {
    state.tasks.splice(index, 1);
    renderTasks();
};

/* ===== Risk Questionnaire (FR-002) ===== */
function renderQuestion() {
    const q = state.questionnaire.questions[state.questionnaire.currentIndex];
    const total = state.questionnaire.questions.length;
    const progressPercent = Math.round(((state.questionnaire.currentIndex) / total) * 100);

    progressFillEl.style.width = progressPercent + '%';
    progressTextEl.textContent = progressPercent + '%';

    questionContainerEl.innerHTML = `
        <h2>Pertanyaan ${state.questionnaire.currentIndex + 1} dari ${total}</h2>
        <div class="key-question">${escapeHtml(q.text)}</div>
        <div style="margin-top:14px;">
            ${q.options.map((opt, i) => `
                <label style="display:block; margin-bottom:8px; cursor:pointer;">
                    <input type="radio" name="option" value="${opt.value}" style="margin-right:8px;">
                    ${escapeHtml(opt.label)} <span class="option-value">(${opt.value})</span>
                </label>
            `).join('')}
        </div>
    `;
}

function getRiskLevel(score, maxScore) {
    const ratio = score / maxScore;
    if (ratio <= 0.3) return { level: 'Rendah', color: '#27ae60' };
    if (ratio <= 0.6) return { level: 'Sedang', color: '#f39c12' };
    return { level: 'Tinggi', color: '#e74c3c' };
}

function showResults() {
    const answers = state.questionnaire.answers;
    const totalScore = answers.reduce((sum, a) => sum + a.value, 0);
    const maxScore = state.questionnaire.questions.length * 9;
    const risk = getRiskLevel(totalScore, maxScore);

    resultsContainerEl.innerHTML = `
        <h2>Hasil Evaluasi Risiko</h2>
        <div class="results-item">
            <span>Skor Total</span>
            <span style="font-weight:700; color:#2c3e50;">${totalScore} / ${maxScore}</span>
        </div>
        <div class="results-item">
            <span>Tingkat Risiko</span>
            <span style="font-weight:700; color:${risk.color}">${risk.level}</span>
        </div>
        <div class="results-item">
            <span>Jumlah Pertanyaan</span>
            <span>${state.questionnaire.questions.length}</span>
        </div>
        <div class="results-item">
            <span>Pertanyaan Dijawab</span>
            <span>${answers.length}</span>
        </div>
        <div style="margin-top:16px; font-size:0.9rem; color:#7f8c8d;">
            ${risk.level === 'Rendah' ? 'Risiko terkendali. Tugas aman untuk dilanjutkan.'
              : risk.level === 'Sedang' ? 'Perlu perhatian tambahan. Pertimbangkan mitigasi risiko.'
              : 'Risiko tinggi. Disarankan evaluasi ulang sebelum pelaksanaan.'}
        </div>
    `;
}

/* ===== Event Listeners ===== */

// Navigate to Create Task
document.getElementById('btnCreate').addEventListener('click', () => {
    showScreen('create');
});

// Navigate to Questionnaire
document.getElementById('btnStart').addEventListener('click', () => {
    state.questionnaire.currentIndex = 0;
    state.questionnaire.answers = [];
    renderQuestion();
    showScreen('questionnaire');
});

// Back from Create
document.getElementById('btnBackFromCreate').addEventListener('click', () => {
    showScreen('dashboard');
});

// Back from Questionnaire
document.getElementById('btnBackFromQuestionnaire').addEventListener('click', () => {
    showScreen('dashboard');
});

// Submit Create Task Form
createTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const task = {
        id: Date.now(),
        name: taskNameInput.value.trim(),
        priority: taskPriorityInput.value,
        dueDate: taskDueDateInput.value,
        createdAt: new Date().toISOString()
    };
    state.tasks.push(task);
    saveTasks();
    renderTasks();
    createTaskForm.reset();
    showScreen('dashboard');
});

// BACK TO HOME with confirmation
document.getElementById('btnBackHome').addEventListener('click', () => {
    if (state.questionnaire.answers.length > 0 && state.questionnaire.currentIndex < state.questionnaire.questions.length) {
        modal.classList.remove('hidden');
        modalMessage.textContent = 'Anda belum menyelesaikan kuesioner. Progres akan dihapus. Lanjutkan?';
    } else {
        showScreen('dashboard');
    }
});

// Submit Questionnaire
document.getElementById('btnSubmit').addEventListener('click', () => {
    const selected = document.querySelector('input[name="option"]:checked');
    if (!selected) {
        alert('Silakan pilih salah satu opsi jawaban.');
        return;
    }

    const q = state.questionnaire.questions[state.questionnaire.currentIndex];
    state.questionnaire.answers.push({
        questionId: q.id,
        value: parseInt(selected.value)
    });

    state.questionnaire.currentIndex++;

    if (state.questionnaire.currentIndex >= state.questionnaire.questions.length) {
        showResults();
        showScreen('results');
    } else {
        renderQuestion();
    }
});

// HOME from Results
document.getElementById('btnHome').addEventListener('click', () => {
    showScreen('dashboard');
});

// Modal confirm
document.getElementById('modalConfirm').addEventListener('click', () => {
    modal.classList.add('hidden');
    state.questionnaire.currentIndex = 0;
    state.questionnaire.answers = [];
    showScreen('dashboard');
});

document.getElementById('modalCancel').addEventListener('click', () => {
    modal.classList.add('hidden');
});

/* ===== LocalStorage Persistence ===== */
const STORAGE_KEY = 'task_risk_tasks_v1';

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
    } catch (e) {}
}

function loadTasks() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            state.tasks = JSON.parse(raw);
        }
    } catch (e) {
        state.tasks = [];
    }
}

/* ===== Initialize ===== */
loadTasks();
renderTasks();
