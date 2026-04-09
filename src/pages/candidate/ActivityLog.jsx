const ActivityLog = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Activity Log</h1>
      <p className="text-gray-500 font-medium">Track all activities related to your application.</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-8 overflow-hidden p-8">
        <div className="relative border-l-2 border-primary/20 pl-8 space-y-12">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="relative group transition-all duration-300">
              <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-white border-4 border-primary ring-4 ring-primary/5 shadow-sm group-hover:scale-125 transition-transform"></div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                <h4 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors tracking-tight">
                  {i === 1 ? 'Application Submitted' : i === 2 ? 'Documents Verified' : i === 3 ? 'Interview Scheduled' : 'Status Updated'}
                </h4>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 md:mt-0">Oct {25 - i}, 2023 - 10:30 AM</span>
              </div>
              <p className="text-sm text-gray-500 font-medium max-w-2xl">
                {i === 1 ? 'Your application has been successfully submitted and is now being processed by our team.' : 'Our team has verified all your uploaded documents and they are now confirmed.'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ActivityLog
