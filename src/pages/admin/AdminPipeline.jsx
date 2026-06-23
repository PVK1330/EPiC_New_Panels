import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiTable, FiBriefcase, FiX, FiCalendar, FiUser, FiBriefcase as FiWork, FiDollarSign, FiFileText } from "react-icons/fi";
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
import { getPipelineCases, updatePipelineStage, getCaseById } from "../../services/caseApi";
import { sendBiometricSlot } from "../../services/workflowApi";
import { PIPELINE_STAGES, buildStagesFromPipelineData } from "../../constants/immigrationCaseProcess";
import CaseWorkflowBadge from "../../components/case/CaseWorkflowBadge";
import BiometricBookedModal from "../../components/workflow/BiometricBookedModal";
import { useToast } from "../../context/ToastContext";

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
      className={`flex-1 min-h-0 overflow-y-auto overscroll-contain p-2.5 space-y-2.5 rounded-b-2xl transition-colors duration-150 ${isOver ? "bg-blue-50/60" : ""}`}
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

const AdminPipeline = () => {
  const { showToast } = useToast();
  const [stages, setStages] = useState(() => PIPELINE_STAGES.map((s) => ({ ...s, cards: [] })));
  const [activeCard, setActiveCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCaseLoading, setIsCaseLoading] = useState(false);
  const [biometricModalOpen, setBiometricModalOpen] = useState(false);
  const [pendingBiometricCard, setPendingBiometricCard] = useState(null);
  const [stageUpdating, setStageUpdating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } } ),
  );

  // Fetch pipeline data from API
  const fetchPipelineData = async () => {
    try {
      const response = await getPipelineCases();
      if (response?.data?.data) {
        setStages(buildStagesFromPipelineData(response.data.data));
      }
    } catch (error) {
      console.error("Error fetching pipeline data:", error);
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
    // Only handle reordering within the same column during drag over
    if (!over) return;

    const activeStage = findStageByCardId(active.id);
    if (!activeStage) return;

    const overStage = findStageByCardId(over.id);
    if (!overStage || activeStage.id !== overStage.id) return;

    // Only allow reordering within the same column
    setStages((prev) =>
      prev.map((s) => {
        if (s.id !== activeStage.id) return s;
        const oldIndex = s.cards.findIndex((c) => c.id === active.id);
        const newIndex = s.cards.findIndex((c) => c.id === over.id);
        return { ...s, cards: arrayMove(s.cards, oldIndex, newIndex) };
      }),
    );
  };

  const confirmBiometricBooking = async (payload) => {
    if (!pendingBiometricCard?.card) return;
    setStageUpdating(true);
    try {
      const caseId = pendingBiometricCard.card.caseId;
      if (pendingBiometricCard.overStageId === "biometrics_confirmation_sent") {
        // Use dedicated workflow API — sends in-app notification + professional HTML email
        await sendBiometricSlot(caseId, {
          location: payload.biometricLocation,
          appointmentDate: payload.biometricDate,
          appointmentTime: payload.biometricTime,
          appointmentDay: payload.biometricDay,
          instructions: payload.biometricInstructions,
        });
        showToast({
          message: "Confirmation sent — candidate notified by email & in-app",
          variant: "success",
        });
      } else {
        await updatePipelineStage(caseId, "biometrics_booked", payload);
        showToast({
          message: "Biometrics booked — candidate notified",
          variant: "success",
        });
      }
      await fetchPipelineData();
      setBiometricModalOpen(false);
      setPendingBiometricCard(null);
    } catch (error) {
      showToast({
        message: error?.response?.data?.message || "Failed to book biometrics",
        variant: "danger",
      });
    } finally {
      setStageUpdating(false);
    }
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveCard(null);
    if (!over) return;

    const activeStage = findStageByCardId(active.id);
    if (!activeStage) return;

    console.log(`Drag end - active: ${active.id}, over: ${over.id}, activeStage: ${activeStage.id}`);

    // Check if dropped on a column (stage)
    const overStage = stages.find((s) => s.id === over.id);
    
    if (overStage && activeStage.id !== overStage.id) {
      const card = activeStage.cards.find((c) => c.id === active.id);
      if (card) {
        // Both biometric stages need the booking form popup
        if (overStage.id === "biometrics_booked" || overStage.id === "biometrics_confirmation_sent") {
          setStageUpdating(true);
          try {
            const res = await getCaseById(card.caseId);
            const ws = res?.data?.data?.case?.workflowState;
            setPendingBiometricCard({ 
              card, 
              overStageId: overStage.id,
              availability: ws?.biometrics?.availability 
            });
          } catch (e) {
            setPendingBiometricCard({ card, overStageId: overStage.id });
          } finally {
            setStageUpdating(false);
          }
          setBiometricModalOpen(true);
          return;
        }
        try {
          await updatePipelineStage(card.caseId, overStage.id);
          await fetchPipelineData();
          showToast({ message: "Stage updated", variant: "success" });
        } catch (error) {
          console.error("Error updating pipeline stage:", error);
          showToast({
            message: error?.response?.data?.message || "Failed to update stage",
            variant: "danger",
          });
        }
      }
      return;
    }

    // Reordering within the same column
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <motion.div
        className="flex flex-col h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)] min-h-0 pb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center min-h-0">
            <div className="text-gray-500">Loading pipeline...</div>
          </div>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-4 shrink-0">
          <div className="flex items-start gap-3">
            <div className="mt-1 p-2.5 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <FiBriefcase className="text-primary" size={22} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-secondary tracking-tight">
                Case Pipeline
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Standard 16-step immigration workflow — drag cases between stages
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              to="/admin/cases"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <FiTable size={16} className="text-secondary" />
              Table view
            </Link>
            <Link
              to="/admin/cases"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20"
            >
              <FiPlus size={16} />
              New Case
            </Link>
          </div>
        </div>

        <motion.div
          className="flex flex-1 min-h-0 gap-4 overflow-x-auto overflow-y-hidden pb-2 -mx-1 px-1 [scrollbar-width:thin]"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {stages.map((stage) => (
            <motion.section
              key={stage.id}
              variants={colVariant}
              className={`shrink-0 w-[min(100%,240px)] sm:w-56 h-full max-h-full min-h-0 flex flex-col rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white to-gray-50/90 shadow-sm overflow-hidden ${stage.accent} border-t-[3px]`}
            >
              <header className="px-3.5 pt-3.5 pb-2 flex items-center justify-between gap-2 border-b border-gray-100/80 bg-white/60 backdrop-blur-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${stage.dot}`}
                    aria-hidden
                  />
                  <h2 className="text-sm font-black text-secondary truncate">
                    {stage.title}
                  </h2>
                </div>
                <span className="text-xs font-black tabular-nums text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">
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
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
                <h2 className="text-lg font-black text-secondary">Case Details</h2>
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
                <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Case ID</label>
                      <p className="text-sm font-mono font-semibold text-primary mt-1">{selectedCase.caseId}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Workflow stage</label>
                      <div className="mt-1">
                        <CaseWorkflowBadge caseRecord={selectedCase} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Legacy status</label>
                      <p className="text-sm font-semibold mt-1">{selectedCase.status || "—"}</p>
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
                    <div className="col-span-1 sm:col-span-2">
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

      <BiometricBookedModal
        open={biometricModalOpen}
        onClose={() => {
          setBiometricModalOpen(false);
          setPendingBiometricCard(null);
        }}
        onConfirm={confirmBiometricBooking}
        caseLabel={pendingBiometricCard?.card?.caseId}
        loading={stageUpdating}
        initialData={pendingBiometricCard?.availability ? {
          location: pendingBiometricCard.availability.preferredLocation,
          date: pendingBiometricCard.availability.preferredDate,
          time: pendingBiometricCard.availability.preferredTime,
          instructions: pendingBiometricCard.availability.notes,
          timezone: pendingBiometricCard.availability.timezone,
        } : undefined}
      />
    </DndContext>
  );
};

export default AdminPipeline;
