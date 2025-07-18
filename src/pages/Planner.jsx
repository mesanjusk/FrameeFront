import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../config"; // Adjust path as needed

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const users = ['Any user', 'Deepak', 'Priya', 'Amit']; // Replace with backend user list in production

function isBlockForDay(block, date) {
  const d = new Date(date);
  const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
  if (!block.recurrence || block.recurrence.type === 'once')
    return block.date === date;
  if (block.recurrence.type === 'daily')
    return true;
  if (block.recurrence.type === 'custom')
    return block.recurrence.days.includes(dayName);
  return false;
}

export default function Planner() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [blocks, setBlocks] = useState([]);
  const [modal, setModal] = useState({ open: false, edit: null });
  const [form, setForm] = useState({
    time: "",
    activity: "",
    assignee: "Any user",
    recurrence: { type: "once", days: [] }
  });

  // For completion modal
  const [completionModal, setCompletionModal] = useState({
    open: false,
    block: null,
    completed: false,
    reason: ""
  });

  useEffect(() => { fetchBlocks(); }, [date]);

  const fetchBlocks = async () => {
    const res = await axios.get(`${BASE_URL}/api/timeblocks`);
    setBlocks(res.data.blocks);
  };

  // Open modal for Add/Edit
  const openModal = (block) => {
    if (block) {
      setForm({
        time: block.time,
        activity: block.activity,
        assignee: block.assignee || "Any user",
        recurrence: block.recurrence || { type: "once", days: [] }
      });
    } else setForm({
      time: "",
      activity: "",
      assignee: "Any user",
      recurrence: { type: "once", days: [] }
    });
    setModal({ open: true, edit: block });
  };

  const closeModal = () => {
    setModal({ open: false, edit: null });
    setForm({
      time: "",
      activity: "",
      assignee: "Any user",
      recurrence: { type: "once", days: [] }
    });
  };

  // Save new block or edit meta
  const saveBlock = async (e) => {
    e.preventDefault();
    if (modal.edit) {
      await axios.put(`${BASE_URL}/api/timeblocks/${modal.edit._id}`, {
        time: form.time,
        activity: form.activity,
        assignee: form.assignee,
        recurrence: form.recurrence
      });
    } else {
      await axios.post(`${BASE_URL}/api/timeblocks`, { ...form, date });
    }
    closeModal();
    fetchBlocks();
  };

  const deleteBlock = async (id) => {
    if (window.confirm("Delete this schedule?")) {
      await axios.delete(`${BASE_URL}/api/timeblocks/${id}`);
      fetchBlocks();
    }
  };

  // --- Completion Modal Logic ---
  const openCompletionModal = (block) => {
    const todayCompletion = block.completions?.[date] || { completed: false, reason: "" };
    setCompletionModal({
      open: true,
      block,
      completed: todayCompletion.completed,
      reason: todayCompletion.reason || ""
    });
  };

  const closeCompletionModal = () => {
    setCompletionModal({ open: false, block: null, completed: false, reason: "" });
  };

  const saveCompletion = async (e) => {
    e.preventDefault();
    await axios.put(`${BASE_URL}/api/timeblocks/${completionModal.block._id}/completion`, {
      date,
      completed: completionModal.completed,
      reason: completionModal.completed ? "" : completionModal.reason
    });
    closeCompletionModal();
    fetchBlocks();
  };

  // Track progress for chart
  const todayBlocks = blocks.filter(b => isBlockForDay(b, date));
  const completedCount = todayBlocks.filter(b => (b.completions?.[date]?.completed)).length;
  const percent = todayBlocks.length === 0 ? 0 : Math.round((completedCount / todayBlocks.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 px-1 py-2 sm:px-0">
      <div className="max-w-md mx-auto">
        {/* Progress Chart */}
        <div className="mb-4">
          <div className="font-bold text-lg">Today's Progress</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-gray-300 rounded-full h-4">
              <div className="bg-green-500 h-4 rounded-full" style={{ width: `${percent}%` }} />
            </div>
            <span className="w-12 text-sm text-gray-700 text-right">{percent}%</span>
          </div>
        </div>
        {/* Date Picker + Add */}
        <div className="flex gap-2 mb-2 items-center">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border rounded px-2 py-1 w-1/2" />
          <button className="ml-auto px-3 py-1 bg-green-700 text-white rounded text-sm" onClick={() => openModal(null)}>+ Add</button>
        </div>
        {/* Activity Cards */}
      <div className="flex flex-col gap-2">
  {todayBlocks.length === 0 && (
    <div className="text-center text-gray-500 mt-8">
      No schedule found for this day.
    </div>
  )}
  {todayBlocks.map((b) => {
    const todayCompletion = b.completions?.[date] || { completed: false, reason: "" };
    const isCompleted = !!todayCompletion.completed;
    const statusLabel = isCompleted ? "C" : "P";
    const statusColor = isCompleted ? "bg-green-500 text-white" : "bg-red-500 text-white";
    return (
      <div
        key={b._id}
        className="flex items-start gap-3 px-2 py-2 rounded-xl shadow bg-white border border-gray-200 cursor-pointer hover:bg-green-50 relative"
        onClick={e => {
          // Prevent icon clicks from opening completion modal:
          if (e.target.dataset.icon) return;
          openCompletionModal(b);
        }}
      >
        {/* Status Letter */}
        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-lg ${statusColor}`}>
          {statusLabel}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            {/* Task */}
            <div>
              <div className="font-bold text-base">{b.activity}</div>
              <div className="text-xs text-gray-500 lowercase">{(b.assignee || "any user").toLowerCase()}</div>
            </div>
            {/* Time */}
            <div className="text-xs text-gray-400 mt-0.5">{b.time}</div>
          </div>
          {!isCompleted && todayCompletion.reason && (
            <div className="text-xs text-red-500 mt-1">Reason: {todayCompletion.reason}</div>
          )}
          {/* Bottom right corner: edit/delete */}
          <div className="absolute right-2 bottom-2 flex gap-3 z-10">
            <button
              data-icon="edit"
              className="text-yellow-500 font-bold text-base p-1 rounded-full hover:bg-yellow-100 transition"
              onClick={e => {
                e.stopPropagation();
                openModal(b);
              }}
              title="Edit"
            >✏️</button>
            <button
              data-icon="delete"
              className="text-red-500 font-bold text-base p-1 rounded-full hover:bg-red-100 transition"
              onClick={e => {
                e.stopPropagation();
                // Open your delete modal here, or call deleteBlock(b._id)
                if (window.confirm("Delete this schedule?")) {
                  deleteBlock(b._id);
                }
              }}
              title="Delete"
            >🗑️</button>
          </div>
        </div>
      </div>
    );
  })}
</div>



      </div>
      {/* Add/Edit Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow w-11/12 max-w-xs">
            <h3 className="font-bold mb-3 text-center">{modal.edit ? "Edit Schedule" : "Add Schedule"}</h3>
            <form onSubmit={saveBlock} className="flex flex-col gap-2">
              {/* Time Picker */}
              <label className="font-medium">Time</label>
              <input
                type="time"
                required
                value={form.time}
                onChange={e => setForm({ ...form, time: e.target.value })}
                className="p-2 border rounded"
              />
              <input
                type="text"
                required
                placeholder="Activity"
                value={form.activity}
                onChange={e => setForm({ ...form, activity: e.target.value })}
                className="p-2 border rounded"
              />
              {/* Assignee Dropdown */}
              <label className="font-medium">Who will do it?</label>
              <select
                value={form.assignee}
                onChange={e => setForm({ ...form, assignee: e.target.value })}
                className="p-2 border rounded"
              >
                {users.map(user => (
                  <option value={user} key={user}>{user}</option>
                ))}
              </select>
              {/* Recurrence UI */}
              <label className="font-medium mt-2">Repeat</label>
              <div className="flex gap-2 items-center mb-2">
                <label>
                  <input
                    type="radio"
                    name="recurrence"
                    checked={form.recurrence.type === 'once'}
                    onChange={() => setForm({ ...form, recurrence: { type: "once", days: [] } })}
                  />{" "}
                  One Time
                </label>
                <label>
                  <input
                    type="radio"
                    name="recurrence"
                    checked={form.recurrence.type === 'daily'}
                    onChange={() => setForm({ ...form, recurrence: { type: "daily", days: [] } })}
                  />{" "}
                  Daily
                </label>
                <label>
                  <input
                    type="radio"
                    name="recurrence"
                    checked={form.recurrence.type === 'custom'}
                    onChange={() => setForm({ ...form, recurrence: { type: "custom", days: [] } })}
                  />{" "}
                  Custom
                </label>
              </div>
              {form.recurrence.type === "custom" && (
                <div className="flex gap-1 mb-2">
                  {weekDays.map(day => (
                    <button
                      key={day}
                      type="button"
                      className={`px-2 py-1 rounded ${form.recurrence.days.includes(day) ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                      onClick={() => {
                        setForm({
                          ...form,
                          recurrence: {
                            ...form.recurrence,
                            days: form.recurrence.days.includes(day)
                              ? form.recurrence.days.filter(d => d !== day)
                              : [...form.recurrence.days, day]
                          }
                        });
                      }}
                    >{day}</button>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded flex-1">Save</button>
                <button type="button" className="bg-gray-300 px-4 py-1 rounded flex-1" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Completion Modal */}
      {completionModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow w-11/12 max-w-xs">
            <h3 className="font-bold mb-3 text-center">Update Completion</h3>
            <form onSubmit={saveCompletion} className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={completionModal.completed}
                  onChange={e => setCompletionModal({ ...completionModal, completed: e.target.checked, reason: e.target.checked ? "" : completionModal.reason })}
                />
                Mark as Completed
              </label>
              {!completionModal.completed && (
                <input
                  type="text"
                  required
                  placeholder="Reason if not completed"
                  value={completionModal.reason}
                  onChange={e => setCompletionModal({ ...completionModal, reason: e.target.value })}
                  className="p-2 border rounded"
                />
              )}
              <div className="flex gap-2 mt-2">
                <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded flex-1">Save</button>
                <button type="button" className="bg-gray-300 px-4 py-1 rounded flex-1" onClick={closeCompletionModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
