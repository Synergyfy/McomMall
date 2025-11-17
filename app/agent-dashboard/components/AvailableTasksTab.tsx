
export default function AvailableTasksTab() {
  return (
    <>
      {/* B. Available Tasks panel */}
      <div id="available-tasks" className="rounded-lg border p-8">
        <h2 className="text-3xl font-semibold">Available Tasks</h2>
        {/* Filtering options */}
        <div className="flex gap-6 my-8">
          <input type="text" placeholder="Filter by skill" className="border px-4 py-3 rounded-md text-xl"/>
          <input type="text" placeholder="Filter by pay" className="border px-4 py-3 rounded-md text-xl"/>
          <input type="date" className="border px-4 py-3 rounded-md text-xl"/>
        </div>
        {/* Task list */}
        <div className="space-y-8">
          {/* Task card */}
          <div className="border p-6 rounded-md">
            <h3 className="font-semibold text-2xl">Task Title</h3>
            <p className="text-xl text-muted-foreground mt-2">Brief description of the task...</p>
            <div className="flex justify-between items-center mt-6">
              <span className="font-bold text-2xl">$50</span>
              <span className="text-lg">Deadline: 2024-12-01</span>
              <span className="text-lg bg-primary/10 text-primary px-4 py-2 rounded-full">Required Skill</span>
              <button className="bg-primary text-white px-5 py-3 rounded-md text-xl">Apply</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
