// src/pages/Dashboard.jsx

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

export default function Dashboard() {
  const navigate = useNavigate();

  const token =
    localStorage.getItem("token");

  // =========================
  // STATES
  // =========================

  const [tasks, setTasks] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  // =========================
  // FORM DATA
  // =========================

  const [formData, setFormData] =
    useState({
      title: "",
      description: "",
      status: "Pending",
      priority: "Low",
      dueDate: "",
    });

  // =========================
  // EDIT
  // =========================

  const [editModal, setEditModal] =
    useState(false);

  const [editTask, setEditTask] =
    useState(null);

  // =========================
  // ANALYTICS
  // =========================

  const totalTasks =
    tasks.length;

  const pendingTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "Pending"
    ).length;

  const progressTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "In Progress"
    ).length;

  const completedTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "Completed"
    ).length;

  const chartData = [
    {
      name: "Pending",
      value: pendingTasks,
    },
    {
      name: "In Progress",
      value: progressTasks,
    },
    {
      name: "Completed",
      value: completedTasks,
    },
  ];

  const COLORS = [
    "#facc15",
    "#a855f7",
    "#22c55e",
  ];

  // =========================
  // FETCH TASKS
  // =========================
 const hasLoggedOut = useRef(false)
 const hasRedirected = useRef(false)
const fetchTasks = async () => {
  try {
    setLoading(true);

    const token = localStorage.getItem("token");

    const res = await axios.get("https://task-backend-fi61.onrender.com/tasks", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setTasks(res.data);
  } catch (err) {
    const status = err.response?.status;

    if (status === 401) {
      // 🚨 STOP LOOP HERE
      if (!hasRedirected.current) {
        hasRedirected.current = true;

        localStorage.clear();
        setTasks([]);

        toast.error("Session expired");

        navigate("/", { replace: true });
      }
    } else {
      toast.error("Failed to fetch tasks");
    }
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    if (!hasRedirected.current) {
      hasRedirected.current = true;
      navigate("/", { replace: true });
    }
    return;
  }

  fetchTasks();
}, []); // 🔥 MUST depend on token
  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  // =========================
  // CREATE TASK
  // =========================

  const createTask =
    async (e) => {
      e.preventDefault();

      try {
        const res =
          await axios.post(
            "https://task-backend-fi61.onrender.com/tasks",
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        setTasks([
          res.data,
          ...tasks,
        ]);

        setFormData({
          title: "",
          description: "",
          priority: "Low",
          status: "Pending",
          dueDate: "",
        });

        toast.success(
          "Task created successfully"
        );
      } catch (err) {
        console.log(err);

        toast.error(
          err.response?.data
            ?.msg ||
            "Failed to create task"
        );
      }
    };

  // =========================
  // DELETE TASK
  // =========================

  const deleteTask =
    async (id) => {
      try {
        await axios.delete(
          `https://task-backend-fi61.onrender.com/tasks/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTasks(
          tasks.filter(
            (task) =>
              task._id !== id
          )
        );

        toast.success(
          "Task deleted successfully"
        );
      } catch (err) {
        console.log(err);

        toast.error(
          err.response?.data
            ?.msg ||
            "Failed to delete task"
        );
      }
    };

  // =========================
  // UPDATE TASK
  // =========================

  const updateTask =
    async () => {
      try {
        const res =
          await axios.put(
            `https://task-backend-fi61.onrender.com/tasks/${editTask._id}`,
            editTask,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        setTasks(
          tasks.map((task) =>
            task._id ===
            editTask._id
              ? res.data
              : task
          )
        );

        setEditModal(false);

        toast.success(
          "Task updated successfully"
        );
      } catch (err) {
        console.log(err);

        toast.error(
          err.response?.data
            ?.msg ||
            "Failed to update task"
        );
      }
    };

  // =========================
  // UPDATE STATUS
  // =========================

  const updateStatus =
    async (
      id,
      newStatus
    ) => {
      try {
        const res =
          await axios.put(
            `https://task-backend-fi61.onrender.com/tasks/${id}`,
            {
              status:
                newStatus,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        setTasks(
          tasks.map((task) =>
            task._id === id
              ? res.data
              : task
          )
        );

        toast.success(
          "Status updated"
        );
      } catch (err) {
        console.log(err);

        toast.error(
          err.response?.data
            ?.msg ||
            "Failed to update status"
        );
      }
    };

  // =========================
  // DRAG DROP
  // =========================

  const handleDragEnd =
    async (result) => {
      if (
        !result.destination
      )
        return;

      const taskId =
        result.draggableId;

      const newStatus =
        result.destination
          .droppableId;

      try {
        const res =
          await axios.put(
            `https://task-backend-fi61.onrender.com/tasks/${taskId}`,
            {
              status:
                newStatus,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        setTasks(
          tasks.map((task) =>
            task._id ===
            taskId
              ? res.data
              : task
          )
        );
      } catch (err) {
        console.log(err);
      }
    };

  // =========================
  // LOGOUT
  // =========================

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  toast.success("Logged out");

  setTimeout(() => {
    navigate("/");
    window.location.reload();
  }, 1000);
};
  // =========================
  // FILTER TASKS
  // =========================

  const filteredTasks =
    tasks.filter((task) => {
      const matchesSearch =
        task.title
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesFilter =
        filter === "All"
          ? true
          : task.status ===
            filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });

  // =========================
  // COLUMNS
  // =========================

  const columns = {
    Pending:
      filteredTasks.filter(
        (task) =>
          task.status ===
          "Pending"
      ),

    "In Progress":
      filteredTasks.filter(
        (task) =>
          task.status ===
          "In Progress"
      ),

    Completed:
      filteredTasks.filter(
        (task) =>
          task.status ===
          "Completed"
      ),
  };

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        darkMode
          ? "bg-[#0f172a] text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      
      {/* NAVBAR */}

      <div
        className={`flex justify-between items-center px-8 py-5 border-b ${
          darkMode
            ? "border-slate-700 bg-slate-900"
            : "border-gray-300 bg-white"
        }`}
      >
        <div>
          <h1 className="text-3xl font-bold">
            Task Dashboard
          </h1>

          <p
            className={`text-sm ${
              darkMode
                ? "text-gray-400"
                : "text-gray-600"
            }`}
          >
            SaaS Task Manager
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() =>
              setDarkMode(
                !darkMode
              )
            }
            className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 transition"
          >
            {darkMode
              ? "Light"
              : "Dark"}
          </button>

          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* CONTENT */}

      <div className="max-w-7xl mx-auto px-5 py-8">

        {/* ANALYTICS */}

        <div className="grid md:grid-cols-4 gap-5 mb-8">

          <div className="bg-linear-to-r from-blue-500 to-cyan-500 p-5 rounded-3xl shadow-xl">
            <p className="text-sm opacity-80">
              Total Tasks
            </p>

            <h1 className="text-4xl font-bold mt-2">
              {totalTasks}
            </h1>
          </div>

          <div className="bg-linear-to-r from-yellow-500 to-orange-500 p-5 rounded-3xl shadow-xl">
            <p className="text-sm opacity-80">
              Pending
            </p>

            <h1 className="text-4xl font-bold mt-2">
              {pendingTasks}
            </h1>
          </div>

          <div className="bg-linear-to-r from-purple-500 to-pink-500 p-5 rounded-3xl shadow-xl">
            <p className="text-sm opacity-80">
              In Progress
            </p>

            <h1 className="text-4xl font-bold mt-2">
              {progressTasks}
            </h1>
          </div>

          <div className="bg-linear-to-r from-green-500 to-emerald-500 p-5 rounded-3xl shadow-xl">
            <p className="text-sm opacity-80">
              Completed
            </p>

            <h1 className="text-4xl font-bold mt-2">
              {completedTasks}
            </h1>
          </div>
        </div>

        {/* CHART */}

        <div
          className={`rounded-3xl p-6 mb-10 border shadow-xl ${
            darkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h2 className="text-2xl font-bold mb-6">
            Task Analytics
          </h2>

          <div className="h-87.5">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={
                    chartData
                  }
                  cx="50%"
                  cy="50%"
                  outerRadius={
                    120
                  }
                  dataKey="value"
                  label
                >
                  {chartData.map(
                    (
                      entry,
                      index
                    ) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          COLORS[
                            index
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CREATE TASK */}

        <div
          className={`rounded-3xl p-6 shadow-xl mb-10 border ${
            darkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h2 className="text-2xl font-bold mb-5">
            Create Task
          </h2>

          <form
            onSubmit={
              createTask
            }
            className="grid md:grid-cols-2 gap-5"
          >
            <input
              type="text"
              name="title"
              placeholder="Task title"
              value={
                formData.title
              }
              onChange={
                handleChange
              }
              required
              className={`p-3 rounded-xl outline-none border ${
                darkMode
                  ? "bg-slate-900 border-slate-700 text-white"
                  : "bg-gray-100 border-gray-300"
              }`}
            />

            <select
              name="priority"
              value={
                formData.priority
              }
              onChange={
                handleChange
              }
              className={`p-3 rounded-xl outline-none border ${
                darkMode
                  ? "bg-slate-900 border-slate-700 text-white"
                  : "bg-gray-100 border-gray-300"
              }`}
            >
              <option>
                Low
              </option>

              <option>
                Medium
              </option>

              <option>
                High
              </option>
            </select>

            <input
              type="date"
              name="dueDate"
              value={
                formData.dueDate
              }
              onChange={
                handleChange
              }
              className={`p-3 rounded-xl outline-none border ${
                darkMode
                  ? "bg-slate-900 border-slate-700 text-white"
                  : "bg-gray-100 border-gray-300"
              }`}
            />

            <textarea
              name="description"
              placeholder="Description"
              value={
                formData.description
              }
              onChange={
                handleChange
              }
              className={`md:col-span-2 p-3 rounded-xl outline-none border min-h-[120px] ${
                darkMode
                  ? "bg-slate-900 border-slate-700 text-white"
                  : "bg-gray-100 border-gray-300"
              }`}
            />

            <button className="bg-linear-to-r from-blue-500 to-cyan-500 hover:scale-[1.02] transition-all duration-300 py-3 rounded-xl font-semibold shadow-lg">
              Create Task
            </button>
          </form>
        </div>

        {/* SEARCH */}

        <div className="flex flex-col md:flex-row gap-4 mb-8">

          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target
                  .value
              )
            }
            className={`flex-1 p-3 rounded-xl outline-none border ${
              darkMode
                ? "bg-slate-800 border-slate-700 text-white"
                : "bg-white border-gray-300"
            }`}
          />

          <select
            value={filter}
            onChange={(e) =>
              setFilter(
                e.target
                  .value
              )
            }
            className={`p-3 rounded-xl outline-none border ${
              darkMode
                ? "bg-slate-800 border-slate-700 text-white"
                : "bg-white border-gray-300"
            }`}
          >
            <option>
              All
            </option>

            <option>
              Pending
            </option>

            <option>
              In Progress
            </option>

            <option>
              Completed
            </option>
          </select>
        </div>

        {/* TASK BOARD */}

        {loading ? (
          <div className="text-center text-xl">
            Loading...
          </div>
        ) : (
          <DragDropContext
            onDragEnd={
              handleDragEnd
            }
          >
            <div className="grid lg:grid-cols-3 gap-6">

              {Object.entries(
                columns
              ).map(
                ([
                  status,
                  columnTasks,
                ]) => (
                  <Droppable
                    droppableId={
                      status
                    }
                    key={
                      status
                    }
                  >
                    {(
                      provided
                    ) => (
                      <div
                        ref={
                          provided.innerRef
                        }
                        {...provided.droppableProps}
                        className={`rounded-3xl p-5 min-h-[600px] border ${
                          darkMode
                            ? "bg-slate-900 border-slate-700"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-bold">
                            {
                              status
                            }
                          </h2>

                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              darkMode
                                ? "bg-slate-800"
                                : "bg-gray-100"
                            }`}
                          >
                            {
                              columnTasks.length
                            }
                          </span>
                        </div>

                        <div className="space-y-5">

                          {columnTasks.map(
                            (
                              task,
                              index
                            ) => {

                              const isOverdue =
                                task.dueDate &&
                                new Date(
                                  task.dueDate
                                ) <
                                  new Date() &&
                                task.status !==
                                  "Completed";

                              return (
                                <Draggable
                                  key={
                                    task._id
                                  }
                                  draggableId={
                                    task._id
                                  }
                                  index={
                                    index
                                  }
                                >
                                  {(
                                    provided
                                  ) => (
                                    <div
                                      ref={
                                        provided.innerRef
                                      }
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={
                                        provided
                                          .draggableProps
                                          .style
                                      }
                                      className={`rounded-3xl p-5 border shadow-lg hover:scale-[1.02] transition-all duration-300 ${
                                        darkMode
                                          ? "bg-slate-800 border-slate-700"
                                          : "bg-gray-50 border-gray-200"
                                      }`}
                                    >
                                      <div className="mb-4">

                                        <h2 className="text-2xl font-bold">
                                          {
                                            task.title
                                          }
                                        </h2>

                                        <p
                                          className={`mt-2 ${
                                            darkMode
                                              ? "text-gray-400"
                                              : "text-gray-600"
                                          }`}
                                        >
                                          {
                                            task.description
                                          }
                                        </p>

                                        <p
                                          className={`text-sm mt-3 ${
                                            darkMode
                                              ? "text-gray-400"
                                              : "text-gray-600"
                                          }`}
                                        >
                                          Due:{" "}
                                          {task.dueDate
                                            ? new Date(
                                                task.dueDate
                                              ).toLocaleDateString()
                                            : "No Date"}
                                        </p>
                                      </div>

                                      <div className="flex gap-3 flex-wrap mb-5">

                                        <span className="px-3 py-1 rounded-full text-sm bg-blue-500">
                                          {
                                            task.status
                                          }
                                        </span>

                                        <span
                                          className={`px-3 py-1 rounded-full text-sm ${
                                            task.priority ===
                                            "High"
                                              ? "bg-red-500"
                                              : task.priority ===
                                                "Medium"
                                              ? "bg-yellow-500"
                                              : "bg-green-500"
                                          }`}
                                        >
                                          {
                                            task.priority
                                          }
                                        </span>

                                        {isOverdue && (
                                          <span className="px-3 py-1 rounded-full text-sm bg-red-700">
                                            Overdue
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex gap-3">

                                        <button
                                          onClick={() => {
                                            setEditTask(
                                              task
                                            );

                                            setEditModal(
                                              true
                                            );
                                          }}
                                          className="flex-1 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-600 transition"
                                        >
                                          Edit
                                        </button>

                                        <button
                                          onClick={() =>
                                            deleteTask(
                                              task._id
                                            )
                                          }
                                          className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 transition"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              );
                            }
                          )}

                          {
                            provided.placeholder
                          }
                        </div>
                      </div>
                    )}
                  </Droppable>
                )
              )}
            </div>
          </DragDropContext>
        )}
      </div>

      {/* EDIT MODAL */}

      {editModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">

          <div
            className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl ${
              darkMode
                ? "bg-slate-900 border-slate-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h2 className="text-3xl font-bold mb-6">
              Edit Task
            </h2>

            <div className="space-y-4">

              <input
                type="text"
                value={
                  editTask.title
                }
                onChange={(e) =>
                  setEditTask({
                    ...editTask,
                    title:
                      e.target
                        .value,
                  })
                }
                className={`w-full p-3 rounded-xl outline-none border ${
                  darkMode
                    ? "bg-slate-800 border-slate-700 text-white"
                    : "bg-gray-100 border-gray-300"
                }`}
              />

              <textarea
                value={
                  editTask.description
                }
                onChange={(e) =>
                  setEditTask({
                    ...editTask,
                    description:
                      e.target
                        .value,
                  })
                }
                className={`w-full p-3 rounded-xl outline-none border min-h-[120px] ${
                  darkMode
                    ? "bg-slate-800 border-slate-700 text-white"
                    : "bg-gray-100 border-gray-300"
                }`}
              />

              <input
                type="date"
                value={
                  editTask.dueDate
                    ? editTask.dueDate.split(
                        "T"
                      )[0]
                    : ""
                }
                onChange={(e) =>
                  setEditTask({
                    ...editTask,
                    dueDate:
                      e.target
                        .value,
                  })
                }
                className={`w-full p-3 rounded-xl outline-none border ${
                  darkMode
                    ? "bg-slate-800 border-slate-700 text-white"
                    : "bg-gray-100 border-gray-300"
                }`}
              />

              <select
                value={
                  editTask.priority
                }
                onChange={(e) =>
                  setEditTask({
                    ...editTask,
                    priority:
                      e.target
                        .value,
                  })
                }
                className={`w-full p-3 rounded-xl outline-none border ${
                  darkMode
                    ? "bg-slate-800 border-slate-700 text-white"
                    : "bg-gray-100 border-gray-300"
                }`}
              >
                <option>
                  Low
                </option>

                <option>
                  Medium
                </option>

                <option>
                  High
                </option>
              </select>

              <select
                value={
                  editTask.status
                }
                onChange={(e) =>
                  setEditTask({
                    ...editTask,
                    status:
                      e.target
                        .value,
                  })
                }
                className={`w-full p-3 rounded-xl outline-none border ${
                  darkMode
                    ? "bg-slate-800 border-slate-700 text-white"
                    : "bg-gray-100 border-gray-300"
                }`}
              >
                <option>
                  Pending
                </option>

                <option>
                  In Progress
                </option>

                <option>
                  Completed
                </option>
              </select>

              <div className="flex gap-4 pt-4">

                <button
                  onClick={
                    updateTask
                  }
                  className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 transition"
                >
                  Save
                </button>

                <button
                  onClick={() =>
                    setEditModal(
                      false
                    )
                  }
                  className="flex-1 py-3 rounded-xl bg-gray-500 hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}