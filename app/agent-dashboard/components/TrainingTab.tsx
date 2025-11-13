
export default function TrainingTab() {
  return (
    <>
      {/* F. Training and Upskills */}
       <div id="training" className="rounded-lg border p-8">
        <h2 className="text-3xl font-semibold">Training and Upskills</h2>
        <div className="space-y-6 mt-8">
          <div className="border p-6 rounded-md flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-2xl">Advanced SOP Training</h3>
              <p className="text-muted-foreground text-lg">Complete this to unlock higher-paying tasks.</p>
            </div>
            <button className="bg-secondary text-secondary-foreground px-5 py-3 rounded-md text-xl">Start Now</button>
          </div>
        </div>
      </div>
    </>
  );
}
