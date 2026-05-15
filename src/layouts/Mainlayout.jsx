export default function MainLayout({
  children,
}) {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-slate-800 p-5">
        <h1 className="text-2xl font-bold mb-10">
          Task Manager
        </h1>

        <div className="flex flex-col gap-3">
          <button className="bg-slate-700 p-3 rounded-lg text-left">
            Dashboard
          </button>

          <button className="bg-slate-700 p-3 rounded-lg text-left">
            Projects
          </button>

          <button className="bg-red-500 p-3 rounded-lg text-left">
            Logout
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-10">
        {children}
      </div>
    </div>
  );
}