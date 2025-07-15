import React, { useState, useEffect } from "react";
import axios from "axios";

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
    recurrence: { type: "once", days: [] },
    // for edit modal
    completed: false,
    reason: ""
  });

  useEffect(() => { fetchBlocks(); }, [date]);

  const fetchBlocks = async () => {
    const res = await axios.get("http://localhost:5000/api/timeblocks");
    setBlocks(res.data.blocks);
  };

  // Open modal for Add/Edit (edit supports today's completion too)
  const openModal = (block) => {
    if (block) {
      const todayCompletion = block.completions?.[date] || { completed: false, reason: "" };
      setForm({
        time: block.time,
        activity: block.activity,
        recurrence: block.recurrence || { type: "once", days: [] },
        completed: todayCompletion.completed,
        reason: todayCompletion.reason || ""
      });
    } else setForm({
      time: "",
      activity: "",
      recurrence: { type: "once", days: [] },
      completed: false,
      reason: ""
    });
    setModal({ open: true, edit: block });
  };

  const closeModal = () => {
    setModal({ open: false, edit: null });
    setForm({
      time: "",
      activity: "",
      recurrence: { type: "once", days: [] },
      completed: false,
      reason: ""
    });
  };

  // Save new block or edit meta (not completion!)
  const saveBlock = async (e) => {
    e.preventDefault();
    if (modal.edit) {
      await axios.put(`http://localhost:5000/api/timeblocks/${modal.edit._id}`, {
        time: form.time,
        activity: form.activity,
        recurrence: form.recurrence
      });
      // update today's completion too
      await axios.put(`http://localhost:5000/api/timeblocks/${modal.edit._id}/completion`, {
        date,
        completed: form.completed,
        reason: form.completed ? "" : form.reason
      });
    } else {
      await axios.post("http://localhost:5000/api/timeblocks", { ...form, date });
    }
    closeModal();
    fetchBlocks();
  };

  const deleteBlock = async (id) => {
    if (window.confirm("Delete this schedule?")) {
      await axios.delete(`http://localhost:5000/api/timeblocks/${id}`);
      fetchBlocks();
    }
  };

  // Toggle completed for this date
  const toggleCompleted = async (block) => {
    const todayCompletion = block.completions?.[date] || { completed: false, reason: "" };
    const newCompleted = !todayCompletion.completed;
    await axios.put(`http://localhost:5000/api/timeblocks/${block._id}/completion`, {
      date,
      completed: newCompleted,
      reason: newCompleted ? "" : todayCompletion.reason
    });
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
        <div className="flex flex-col gap-3">
          {todayBlocks.length === 0 && <div className="text-center text-gray-500 mt-8">No schedule found for this day.</div>}
          {todayBlocks.map((b) => {
            const todayCompletion = b.completions?.[date] || { completed: false, reason: "" };
            return (
              <div key={b._id} className="bg-white p-3 rounded-lg shadow flex flex-col gap-2 border relative">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">{b.time}</div>
                    <div className="text-base">{b.activity}</div>
                    <div className="text-xs text-gray-500">
                      {b.recurrence?.type === "daily" && "Daily"}
                      {b.recurrence?.type === "custom" && "Custom: " + (b.recurrence.days || []).join(", ")}
                      {(!b.recurrence || b.recurrence?.type === "once") && "One Time"}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleCompleted(b)}
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${todayCompletion.completed ? "bg-green-100 text-green-700 border-green-500 border" : "bg-red-100 text-red-700 border-red-500 border"}`}>
                    {todayCompletion.completed ? "Completed" : "Not Done"}
                  </button>
                </div>
                {!todayCompletion.completed && (
                  <div className="text-xs text-red-500 flex gap-1 items-center">
                    <span>Reason:</span>
                    <span>{todayCompletion.reason ? todayCompletion.reason : "Not provided"}</span>
                  </div>
                )}
                <div className="absolute right-2 top-2 flex gap-1">
                  <button className="text-yellow-500 font-bold text-lg" onClick={() => openModal(b)} title="Edit">✏️</button>
                  <button className="text-red-500 font-bold text-lg" onClick={() => deleteBlock(b._id)} title="Delete">🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow w-11/12 max-w-xs">
            <h3 className="font-bold mb-3 text-center">{modal.edit ? "Edit Schedule" : "Add Schedule"}</h3>
            <form onSubmit={saveBlock} className="flex flex-col gap-2">
              <input
                type="text"
                required
                placeholder="Time (e.g. 7:00–9:00 AM)"
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

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.completed}
                  onChange={e => setForm({ ...form, completed: e.target.checked, reason: e.target.checked ? "" : form.reason })}
                />
                Mark as Completed (for this day)
              </label>
              {!form.completed && (
                <input
                  type="text"
                  required
                  placeholder="Reason if not completed"
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  className="p-2 border rounded"
                />
              )}
              <div className="flex gap-2 mt-2">
                <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded flex-1">Save</button>
                <button type="button" className="bg-gray-300 px-4 py-1 rounded flex-1" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
