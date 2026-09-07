import React, { useState, useEffect } from 'react';
import './App.css';

const TELEGRAM_BOT_TOKEN = '8953452175:AAFSPTtiuoSkqXVbSjU8o9myNfvAdjTmh4A';
const TELEGRAM_CHAT_ID = '7334197561';

function App() {
  const todayStr = new Date().toISOString().split('T')[0];

  // State quản lý Theme (Tối / Sáng)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('APP_THEME');
    return savedTheme ? JSON.parse(savedTheme) : true; // Mặc định là Dark Mode
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('MY_TASKS');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Học cơ bản về ReactJS State & Props', date: todayStr, priority: 'Cao', completed: true },
      { id: 2, title: 'Chuẩn bị hồ sơ nộp NAB WeCamp', date: todayStr, priority: 'Gấp', completed: false }
    ];
  });

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [inputText, setInputText] = useState('');
  const [priority, setPriority] = useState('Bình thường');

  // Đổi class body tương ứng khi chuyển đổi Theme
  useEffect(() => {
    if (isDarkMode) {
      document.body.className = 'dark-mode';
    } else {
      document.body.className = 'light-mode';
    }
    localStorage.setItem('APP_THEME', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('MY_TASKS', JSON.stringify(tasks));
  }, [tasks]);

  const sendTelegramNotification = async (taskTitle, taskDate, taskPriority) => {
    const formattedDate = taskDate.split('-').reverse().join('/');
    const message = `🔔 TASK MỚI!\n📌 ${taskTitle}\n📅 ${formattedDate}\n🔥 Ưu tiên: ${taskPriority}`;

    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message }),
      });
    } catch (e) { console.error(e); }
  };

  const sendCompletionNotification = async (taskTitle) => {
    const message = `🎉 TẤT CẢ ĐÃ XONG!\n\n✅ Nhiệm vụ: "${taskTitle}" đã được hoàn thành!\n💪 Tiếp tục giữ phong độ nhé!`;

    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message }),
      });
    } catch (error) { console.error(error); }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newTask = {
      id: Date.now(),
      title: inputText,
      date: selectedDate,
      priority: priority,
      completed: false
    };

    setTasks([...tasks, newTask]);
    sendTelegramNotification(inputText, selectedDate, priority);
    setInputText('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const isNowCompleted = !t.completed;
        if (isNowCompleted) sendCompletionNotification(t.title);
        return { ...t, completed: isNowCompleted };
      }
      return t;
    }));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const filteredTasks = tasks.filter(t => t.date === selectedDate);
  const displaySelectedDate = selectedDate.split('-').reverse().join('/');
  const completedCount = filteredTasks.filter(t => t.completed).length;
  const progressPercent = filteredTasks.length === 0 ? 0 : Math.round((completedCount / filteredTasks.length) * 100);

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card glass-card">
            
            {/* Header có nút Chuyển Sáng / Tối */}
            <div className="card-header glass-header text-center py-4 position-relative">
              
              {/* Nút Toggle Theme ở góc phải Header */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="btn btn-sm btn-light position-absolute top-0 end-0 m-3 shadow-sm rounded-pill px-3 fw-bold border-0"
                style={{ cursor: 'pointer' }}
              >
                {isDarkMode ? (
                  <span className="text-warning"><i className="bi bi-sun-fill me-1"></i> Giao diện Sáng</span>
                ) : (
                  <span className="text-dark"><i className="bi bi-moon-stars-fill me-1"></i> Giao diện Tối</span>
                )}
              </button>

              <h3 className="fw-bold mb-1 text-white d-flex align-items-center justify-content-center gap-2">
                <i className="bi bi-rocket-takeoff-fill"></i> Workspace Planner
              </h3>
              
            </div>

            <div className="card-body p-4">
              
              {/* Lọc ngày */}
              <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded-3" style={{ background: isDarkMode ? 'rgba(15, 23, 42, 0.4)' : '#fff7ed' }}>
                <div>
                  <label className="form-label small text-uppercase fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: isDarkMode ? '#94a3b8' : '#ea580c' }}>
                    <i className="bi bi-calendar3"></i> Chọn ngày làm việc
                  </label>
                  <input
                    type="date"
                    className="form-control dark-input"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                
              </div>

              {/* Thanh tiến độ */}
              <div className="mb-4">
                <div className="d-flex justify-content-between small mb-2">
                  <span style={{ color: isDarkMode ? '#94a3b8' : '#78350f' }} className="d-flex align-items-center gap-1">
                    <i className="bi bi-graph-up-arrow"></i> Tiến độ ngày {displaySelectedDate}:
                  </span>
                  <span className="fw-bold" style={{ color: isDarkMode ? '#a78bfa' : '#ea580c' }}>
                    {progressPercent}% ({completedCount}/{filteredTasks.length})
                  </span>
                </div>
                <div className="progress" style={{ height: '8px', background: isDarkMode ? 'rgba(255,255,255,0.1)' : '#fed7aa', borderRadius: '10px' }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${progressPercent}%`,
                      background: isDarkMode ? 'linear-gradient(90deg, #a855f7 0%, #6366f1 100%)' : 'linear-gradient(90deg, #f97316 0%, #fb923c 100%)',
                      borderRadius: '10px'
                    }}
                  ></div>
                </div>
              </div>

              {/* Form nhập liệu */}
              <form onSubmit={handleAddTask} className="mb-4">
                <div className="row g-2">
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control dark-input"
                      placeholder="Thêm nhiệm vụ mới..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select dark-select"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="Bình thường" style={{ background: isDarkMode ? '#0f172a' : '#fff' }}>Thường</option>
                      <option value="Cao" style={{ background: isDarkMode ? '#0f172a' : '#fff' }}>Cao</option>
                      <option value="Gấp" style={{ background: isDarkMode ? '#0f172a' : '#fff' }}>Gấp</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <button className="btn btn-glow w-100 py-2 d-flex align-items-center justify-content-center gap-2 border-0" type="submit">
                      <i className="bi bi-plus-circle-fill"></i> Thêm Task
                    </button>
                  </div>
                </div>
              </form>

              {/* Danh sách Tasks */}
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: isDarkMode ? '#cbd5e1' : '#431407' }}>
                <i className="bi bi-list-task"></i> Công việc ngày {displaySelectedDate}
              </h6>
              <div className="task-list">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-5 rounded-3" style={{ background: isDarkMode ? 'rgba(15, 23, 42, 0.3)' : '#fff7ed', color: '#9a3412' }}>
                    <i className="bi bi-inbox fs-2 d-block mb-2"></i> Không có công việc nào trong ngày này.
                  </div>
                ) : (
                  filteredTasks.map(t => (
                    <div key={t.id} className="task-card-item p-3 d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <span
                          onClick={() => toggleTask(t.id)}
                          style={{ cursor: 'pointer' }}
                          className={`fw-medium d-flex align-items-center gap-2 ${t.completed ? 'task-completed-text' : ''}`}
                        >
                          {t.completed ? (
                            <i className="bi bi-check-circle-fill text-success fs-5"></i>
                          ) : (
                            <i className="bi bi-circle text-secondary fs-5"></i>
                          )}
                          {t.title}
                        </span>
                        
                        {t.priority === 'Gấp' && (
                          <span className="badge badge-urgent-glow d-inline-flex align-items-center gap-1">
                            <i className="bi bi-exclamation-octagon-fill"></i> Gấp
                          </span>
                        )}
                        {t.priority === 'Cao' && (
                          <span className="badge badge-high-glow d-inline-flex align-items-center gap-1">
                            <i className="bi bi-arrow-up-circle-fill"></i> Cao
                          </span>
                        )}
                        {t.priority === 'Bình thường' && (
                          <span className="badge badge-normal-glow d-inline-flex align-items-center gap-1">
                            <i className="bi bi-dash-circle-fill"></i> Thường
                          </span>
                        )}
                      </div>

                      <button onClick={() => deleteTask(t.id)} className="btn btn-sm btn-link text-danger text-decoration-none p-0 ms-2">
                        <i className="bi bi-trash3-fill fs-6"></i>
                      </button>
                    </div>
                  ))
                )}
              </div>

            </div>

            <div className="card-footer text-center py-3 border-0 small d-flex align-items-center justify-content-center gap-1" style={{ background: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : '#fff7ed', color: isDarkMode ? '#64748b' : '#9a3412' }}>
              <i className="bi bi-shield-check"></i> Dữ liệu được đồng bộ trực tiếp trên trình duyệt
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;