import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPlus, FiTable, FiBriefcase } from "react-icons/fi";
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

const INITIAL_STAGES = [
  {
    id: "lead",
    title: "Lead",
    count: 4,
    accent: "border-t-gray-400",
    dot: "bg-gray-400",
    cards: [
      {
        id: "1",
        caseId: "#VF-2850",
        name: "Omar Hassan",
        meta: "Skilled Worker · BlueSky Ltd",
        badge: "New",
        badgeClass: "bg-gray-100 text-gray-600",
      },
      {
        id: "2",
        caseId: "#VF-2848",
        name: "Ana Rodriguez",
        meta: "ILR · Apex Co",
        badge: "New",
        badgeClass: "bg-gray-100 text-gray-600",
      },
    ],
  },
  {
    id: "docs",
    title: "Docs Pending",
    count: 12,
    accent: "border-t-amber-400",
    dot: "bg-amber-400",
    cards: [
      {
        id: "3",
        caseId: "#VF-2841",
        name: "Priya Sharma",
        meta: "Skilled Worker · TechNova",
        badge: "2 Missing",
        badgeClass: "bg-amber-100 text-amber-800",
      },
      {
        id: "4",
        caseId: "#VF-2839",
        name: "James Okoye",
        meta: "Sponsor Licence",
        badge: "Due Soon",
        badgeClass: "bg-red-100 text-red-700",
      },
      {
        id: "5",
        caseId: "#VF-2838",
        name: "Maria Santos",
        meta: "Student · UniLondon",
        badge: "1 Missing",
        badgeClass: "bg-amber-100 text-amber-800",
      },
    ],
  },
  {
    id: "drafting",
    title: "Drafting",
    count: 8,
    accent: "border-t-blue-500",
    dot: "bg-blue-500",
    cards: [
      {
        id: "6",
        caseId: "#VF-2830",
        name: "Amara Diallo",
        meta: "ILR · BlueSky Co",
        badge: "In Draft",
        badgeClass: "bg-blue-100 text-blue-800",
      },
      {
        id: "7",
        caseId: "#VF-2826",
        name: "Kenji Tanaka",
        meta: "Graduate Visa",
        badge: "In Draft",
        badgeClass: "bg-blue-100 text-blue-800",
      },
    ],
  },
  {
    id: "submitted",
    title: "Submitted",
    count: 21,
    accent: "border-t-purple-500",
    dot: "bg-purple-500",
    cards: [
      {
        id: "8",
        caseId: "#VF-2820",
        name: "Yemi Adeyemi",
        meta: "Skilled Worker",
        badge: "Awaiting",
        badgeClass: "bg-purple-100 text-purple-800",
      },
      {
        id: "9",
        caseId: "#VF-2818",
        name: "Chen Jing",
        meta: "Student Visa",
        badge: "Awaiting",
        badgeClass: "bg-purple-100 text-purple-800",
      },
    ],
  },
  {
    id: "decision",
    title: "Decision",
    count: 9,
    accent: "border-t-orange-500",
    dot: "bg-orange-500",
    cards: [
      {
        id: "10",
        caseId: "#VF-2810",
        name: "Ali Al-Rashid",
        meta: "ILR",
        badge: "Pending HO",
        badgeClass: "bg-orange-100 text-orange-800",
      },
    ],
  },
  {
    id: "closed",
    title: "Closed",
    count: 218,
    accent: "border-t-green-500",
    dot: "bg-green-500",
    cards: [
      {
        id: "11",
        caseId: "#VF-2805",
        name: "Fatou Diallo",
        meta: "Skilled Worker",
        badge: "Approved ✓",
        badgeClass: "bg-green-100 text-green-800",
      },
      {
        id: "12",
        caseId: "#VF-2800",
        name: "Ivan Petrov",
        meta: "Graduate Visa",
        badge: "Approved ✓",
        badgeClass: "bg-green-100 text-green-800",
      },
    ],
  },
];

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

const SortableCard = ({ card }) => {
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
      className={`flex-1 p-2.5 space-y-2.5 min-h-[120px] max-h-[min(60vh,520px)] overflow-y-auto rounded-b-2xl transition-colors duration-150 ${isOver ? "bg-blue-50/60" : ""}`}
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
  const [stages, setStages] = useState(INITIAL_STAGES);
  const [activeCard, setActiveCard] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

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

    const overStage =
      stages.find((s) => s.id === over.id) || findStageByCardId(over.id);
    if (!overStage || activeStage.id === overStage.id) return;

    setStages((prev) => {
      const draggedCard = activeStage.cards.find((c) => c.id === active.id);
      return prev.map((s) => {
        if (s.id === activeStage.id)
          return { ...s, cards: s.cards.filter((c) => c.id !== active.id) };
        if (s.id === overStage.id) {
          const overIndex = s.cards.findIndex((c) => c.id === over.id);
          const newCards = [...s.cards];
          if (overIndex >= 0) {
            newCards.splice(overIndex, 0, draggedCard);
          } else {
            newCards.push(draggedCard);
          }
          return { ...s, cards: newCards };
        }
        return s;
      });
    });
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveCard(null);
    if (!over) return;

    const activeStage = findStageByCardId(active.id);
    if (!activeStage) return;

    const overIsColumn = stages.some((s) => s.id === over.id);
    if (overIsColumn) return;

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
        className="pb-10 min-h-[calc(100vh-8rem)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="mt-1 p-2.5 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <FiBriefcase className="text-primary" size={22} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-secondary tracking-tight">
                Case Pipeline
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Kanban view of all active cases by stage
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
          className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1 [scrollbar-width:thin]"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {stages.map((stage) => (
            <motion.section
              key={stage.id}
              variants={colVariant}
              className={`shrink-0 w-[min(100%,280px)] sm:w-72 flex flex-col rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white to-gray-50/90 shadow-sm overflow-hidden ${stage.accent} border-t-[3px]`}
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
                    <SortableCard key={card.id} card={card} />
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
      </motion.div>

      <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
        {activeCard && (
          <article className="rounded-xl bg-white border border-gray-200 p-3.5 shadow-2xl rotate-2 w-72 opacity-95">
            <CardContent card={activeCard} />
          </article>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default AdminPipeline;
