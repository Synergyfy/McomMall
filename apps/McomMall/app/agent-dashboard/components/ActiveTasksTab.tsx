
export default function ActiveTasksTab() {
  return (
    <>
      {/* C. Active Tasks */}
      <div id="active-tasks" className="rounded-lg border p-8">
        <h2 className="text-3xl font-semibold">Active Tasks</h2>
        <div className="space-y-8 mt-8">
          {/* Active task card */}
          <div className="border p-6 rounded-md">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-2xl">Active Task Title</h3>
              <span className="text-lg text-muted-foreground">Due: 2024-11-15</span>
            </div>
            <p className="text-xl text-muted-foreground mt-2">Brief description of the active task...</p>
            <div className="mt-6">
              <p className="text-lg font-medium">Progress</p>
              <div className="w-full bg-muted-foreground/20 rounded-full h-4 mt-2">
                <div className="bg-green-500 h-4 rounded-full w-[45%]"></div>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button className="bg-secondary text-secondary-foreground px-5 py-3 rounded-md text-xl">View Details</button>
              <button className="bg-primary text-white px-5 py-3 rounded-md text-xl">Submit Work</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
