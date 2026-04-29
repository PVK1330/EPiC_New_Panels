import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Briefcase, Table, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCalendar, FiUser, FiBriefcase as FiWork, FiDollarSign } from "react-icons/fi";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getCaseworkerPipelineCases, updatePipelineStage, getCaseById } from "../../services/caseApi";

const STAGES = [
  { id: "lead", title: "Lead", header: "bg-slate-100 border-slate-200", titleClass: "text-slate-600", countClass: "bg-slate-200/80 text-slate-700" },
  { id: "docs", title: "Docs Pending", header: "bg-amber-50 border-amber-100", titleClass: "text-amber-700", countClass: "bg-amber-100 text-amber-800" },
  { id: "drafting", title: "Drafting", header: "bg-blue-50 border-blue-100", titleClass: "text-blue-700", countClass: "bg-blue-100 text-blue-800" },
  { id: "submitted", title: "Submitted", header: "bg-purple-50 border-purple-100", titleClass: "text-purple-700", countClass: "bg-purple-100 text-purple-800" },
  { id: "decision", title: "Decision", header: "bg-orange-50 border-orange-100", titleClass: "text-orange-700", countClass: "bg-orange-100 text-orange-800" },
  { id: "closed", title: "Closed", header: "bg-emerald-50 border-emerald-100", titleClass: "text-emerald-700", countClass: "bg-emerald-100 text-emerald-800" },
];


function formatShort(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function badgeToneClass(tone) {
  const m = {
    gray: "bg-slate-100 text-slate-700 border-slate-200",
    yellow: "bg-amber-50 text-amber-800 border-amber-200",
    red: "bg-red-50 text-red-800 border-red-200",
    blue: "bg-sky-50 text-sky-800 border-sky-200",
    green: "bg-emerald-50 text-emerald-800 border-emerald-200",
  };
  return m[tone] || m.gray;
}

const CardContent = ({ card }) => (
  <>
    <p className="text-[11px] font-mono font-bold text-primary">
      {card.caseId}
    </p>
    <p className="text-sm font-bold text-secondary mt-1 leading-snug">
      {card.name}
    </p>
    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{card.meta}</p>
    <div className="mt-2.5 pt-2 border-t border-gray-50">
      <span
        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide ${card.badgeClass}`}
      >
        {card.badge}
      </span>
    </div>
  </>
);

const SortableCard = ({ card, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(card)}
      className="group rounded-xl bg-white border border-gray-100 p-3.5 shadow-sm cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md hover:-translate-y-0.5"
    >
      <CardContent card={card} />
    </article>
  );
};

const DroppableColumn = ({ stage, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 p-2.5 space-y-2.5 h-[600px] overflow-y-auto rounded-b-2xl transition-colors duration-150 ${isOver ? "bg-blue-50/60" : ""}`}
    >
      {children}
    </div>
  );
};

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const colVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function Pipeline() {
  const navigate = useNavigate();
  const [stages, setStages] = useState(STAGES.map(s => ({ ...s, cards: [] })));
  const [activeCard, setActiveCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCaseLoading, setIsCaseLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } } ),
  );

  // Fetch caseworker pipeline data from API
  const fetchPipelineData = async () => {
    try {
      const response = await getCaseworkerPipelineCases();
      if (response?.data?.data) {
        const pipeline = response.data.data;
        
        // Map API response to stages structure
        const mappedStages = STAGES.map(stage => {
          const stageCases = pipeline[stage.id] || [];

          return {
            ...stage,
            count: stageCases.length,
            cards: stageCases.map(c => ({
              id: c.caseId || c.id.toString(),
              caseId: c.caseId || c.id.toString(),
              name: c.candidate ? `${c.candidate.first_name} ${c.candidate.last_name}` : 'Unknown',
              meta: `${c.visaType?.name || '—'} · ${c.sponsor ? `${c.sponsor.first_name} ${c.sponsor.last_name}` : '—'}`,
              badge: c.priority || 'Normal',
              badgeClass: c.priority === 'High' ? 'bg-red-100 text-red-800' : c.priority === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600',
              status: c.status,
            })),
          };
        });
        
        setStages(mappedStages);
      }
    } catch (error) {
      console.error("Error fetching caseworker pipeline data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch pipeline data from API
  useEffect(() => {
    setIsLoading(true);
    fetchPipelineData();
  }, []);

  const handleCardClick = async (card) => {
    setIsCaseLoading(true);
    setIsModalOpen(true);
    try {
      const response = await getCaseById(card.caseId);
      if (response?.data?.data?.case) {
        setSelectedCase(response.data.data.case);
      }
    } catch (error) {
      console.error("Error fetching case details:", error);
    } finally {
      setIsCaseLoading(false);
    }
  };

  const findStageByCardId = (cardId) =>
    stages.find((s) => s.cards.some((c) => c.id === cardId));

  const handleDragStart = ({ active }) => {
    const stage = findStageByCardId(active.id);
    const card = stage?.cards.find((c) => c.id === active.id);
    setActiveCard(card || null);
  };

  const handleDragOver = ({ active, over }) => {
    if (!over) return;

    const activeStage = findStageByCardId(active.id);
    if (!activeStage) return;

    const overStage = findStageByCardId(over.id);
    if (!overStage || activeStage.id !== overStage.id) return;

    setStages((prev) =>
      prev.map((s) => {
        if (s.id !== activeStage.id) return s;
        const oldIndex = s.cards.findIndex((c) => c.id === active.id);
        const newIndex = s.cards.findIndex((c) => c.id === over.id);
        return { ...s, cards: arrayMove(s.cards, oldIndex, newIndex) };
      }),
    );
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveCard(null);
    if (!over) return;

    const activeStage = findStageByCardId(active.id);
    if (!activeStage) return;

    const overStage = stages.find((s) => s.id === over.id);
    
    if (overStage && activeStage.id !== overStage.id) {
      const card = activeStage.cards.find((c) => c.id === active.id);
      if (card) {
        const statusMap = {
          lead: 'Lead',
          docs: 'Docs Pending',
          drafting: 'Drafting',
          submitted: 'Submitted',
          decision: 'Decision',
          closed: 'Closed'
        };
        
        const newStatus = statusMap[overStage.id];
        
        try {
          await updatePipelineStage(card.caseId, newStatus);
          await fetchPipelineData();
        } catch (error) {
          console.error("Error updating pipeline stage:", error);
          alert(`Failed to update status: ${error.message}`);
          setStages((prev) => prev);
        }
      }
      return;
    }

    if (activeStage.cards.some((c) => c.id === over.id)) {
      setStages((prev) =>
        prev.map((s) => {
          if (s.id !== activeStage.id) return s;
          const oldIndex = s.cards.findIndex((c) => c.id === active.id);
          const newIndex = s.cards.findIndex((c) => c.id === over.id);
          return { ...s, cards: arrayMove(s.cards, oldIndex, newIndex) };
        }),
      );
    }
  };

  const total = stages.reduce((sum, s) => sum + s.cards.length, 0);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <motion.div
        className="pb-10 min-h-[calc(100vh-8rem)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">Loading pipeline...</div>
          </div>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2.5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                  <Briefcase className="text-primary" size={22} />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-secondary tracking-tight">
                    My Pipeline
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Kanban view of your assigned cases by stage
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => navigate("/caseworker/cases")}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  <Table size={16} className="text-secondary" />
                  Table view
                </button>
                <button
                  onClick={() => navigate("/caseworker/cases")}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20"
                >
                  <Plus size={16} />
                  New Case
                </button>
              </div>
            </div>

            <motion.div
              className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1 [scrollbar-width:thin]"
              variants={container}
              initial="hidden"
              animate="visible"
            >
              {stages.map((stage) => (
                <motion.section
                  key={stage.id}
                  variants={colVariant}
                  className={`shrink-0 w-[min(100%,280px)] sm:w-72 flex flex-col rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white to-gray-50/90 shadow-sm overflow-hidden ${stage.header}`}
                >
                  <header className="px-3.5 pt-3.5 pb-2 flex items-center justify-between gap-2 border-b border-gray-100/80 bg-white/60 backdrop-blur-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <h2 className={`text-sm font-black ${stage.titleClass} truncate`}>
                        {stage.title}
                      </h2>
                    </div>
                    <span className={`text-xs font-black tabular-nums text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg`}>
                      {stage.cards.length}
                    </span>
                  </header>
                  <SortableContext
                    items={stage.cards.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <DroppableColumn stage={stage}>
                      {stage.cards.map((card) => (
                        <SortableCard key={card.id} card={card} onClick={handleCardClick} />
                      ))}
                      {stage.cards.length === 0 && (
                        <div className="flex items-center justify-center h-16 rounded-xl border-2 border-dashed border-gray-200 text-xs text-gray-400">
                          Drop here
                        </div>
                      )}
                    </DroppableColumn>
                  </SortableContext>
                </motion.section>
              ))}
            </motion.div>
          </>
        )}
      </motion.div>

      <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
        {activeCard && (
          <article className="rounded-xl bg-white border border-gray-200 p-3.5 shadow-2xl rotate-2 w-72 opacity-95">
            <CardContent card={activeCard} />
          </article>
        )}
      </DragOverlay>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-black text-secondary">Case Details</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX size={20} className="text-gray-500" />
                </button>
              </div>

              {isCaseLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-gray-500">Loading case details...</div>
                </div>
              ) : selectedCase ? (
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Case ID</label>
                      <p className="text-sm font-mono font-semibold text-primary mt-1">{selectedCase.caseId}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Status</label>
                      <p className="text-sm font-semibold mt-1">{selectedCase.status}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Candidate</label>
                      <p className="text-sm font-semibold mt-1 flex items-center gap-2">
                        <FiUser size={14} className="text-gray-400" />
                        {selectedCase.candidate ? `${selectedCase.candidate.first_name} ${selectedCase.candidate.last_name}` : '—'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Sponsor</label>
                      <p className="text-sm font-semibold mt-1 flex items-center gap-2">
                        <FiWork size={14} className="text-gray-400" />
                        {selectedCase.sponsor ? `${selectedCase.sponsor.first_name} ${selectedCase.sponsor.last_name}` : '—'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Visa Type</label>
                      <p className="text-sm font-semibold mt-1">{selectedCase.visaType?.name || '—'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Petition Type</label>
                      <p className="text-sm font-semibold mt-1">{selectedCase.petitionType?.name || '—'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Priority</label>
                      <p className="text-sm font-semibold mt-1">{selectedCase.priority}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Target Date</label>
                      <p className="text-sm font-semibold mt-1 flex items-center gap-2">
                        <FiCalendar size={14} className="text-gray-400" />
                        {selectedCase.targetSubmissionDate || '—'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">LCA Number</label>
                      <p className="text-sm font-semibold mt-1">{selectedCase.lcaNumber || '—'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Receipt Number</label>
                      <p className="text-sm font-semibold mt-1">{selectedCase.receiptNumber || '—'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Salary Offered</label>
                      <p className="text-sm font-semibold mt-1 flex items-center gap-2">
                        <FiDollarSign size={14} className="text-gray-400" />
                        {selectedCase.salaryOffered || 0}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Amount</label>
                      <p className="text-sm font-semibold mt-1 flex items-center gap-2">
                        <FiDollarSign size={14} className="text-gray-400" />
                        {selectedCase.totalAmount || 0}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Paid Amount</label>
                      <p className="text-sm font-semibold mt-1 flex items-center gap-2">
                        <FiDollarSign size={14} className="text-gray-400" />
                        {selectedCase.paidAmount || 0}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Notes</label>
                      <p className="text-sm mt-1 p-3 bg-gray-50 rounded-lg">{selectedCase.notes || 'No notes'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-20">
                  <div className="text-gray-500">Failed to load case details</div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DndContext>
  );
}
