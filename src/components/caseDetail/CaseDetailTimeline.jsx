import { motion } from "framer-motion";

const dotClass = {
  done: "bg-green-500 ring-4 ring-green-100",
  active: "bg-secondary ring-4 ring-blue-100",
  warn: "bg-amber-400 ring-4 ring-amber-100",
};

const CaseDetailTimeline = ({ items }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6"
    >
      <h3 className="text-sm font-black text-secondary mb-6 pb-2 border-b border-gray-100">
        Case Timeline (Immutable Activity Log)
      </h3>
      <div className="relative pl-2">
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gray-200" aria-hidden />
        <ul className="space-y-6">
          {items.map((item) => (
            <li key={item.id} className="relative flex gap-4 pl-8">
              <span
                className={`absolute left-0 top-1.5 w-3 h-3 rounded-full shrink-0 ${dotClass[item.dot] || dotClass.done}`}
              />
              <div>
                <p className="text-xs font-mono text-gray-400">{item.time}</p>
                <p className="text-sm font-bold text-secondary mt-1">{item.desc}</p>
                <p className="text-xs text-gray-500 mt-1">{item.user}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default CaseDetailTimeline;
