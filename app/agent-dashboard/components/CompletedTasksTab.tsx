
export default function CompletedTasksTab() {
  return (
    <>
      {/* D. Completed Tasks & History */}
      <div id="completed-tasks" className="rounded-lg border p-8">
        <h2 className="text-3xl font-semibold">Completed Tasks & History</h2>
        <div className="space-y-8 mt-8">
          {/* Completed task card */}
          <div className="border p-6 rounded-md bg-muted/20">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-2xl">Completed Task Title</h3>
              <span className="text-lg text-green-500 font-bold">Approved</span>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="font-bold text-2xl">Earned: $75</span>
              <span className="text-lg text-muted-foreground">Completed on: 2024-10-20</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
