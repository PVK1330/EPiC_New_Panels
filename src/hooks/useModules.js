import { useCallback, useState } from "react";
import {
  getAllModules,
  createModule,
  updateModule,
  deleteModule,
  getModulesByPlan,
  updatePlanModules,
} from "../services/moduleApi";

export default function useModules() {
  const [modules, setModules] = useState({});
  const [planModules, setPlanModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [planModulesLoading, setPlanModulesLoading] = useState(false);

  const fetchAllModules = useCallback(async () => {
    setModulesLoading(true);
    try {
      const res = await getAllModules();
      setModules(res.data?.data?.modules || {});
      return { ok: true };
    } catch (e) {
      setModules({});
      return { ok: false, error: e };
    } finally {
      setModulesLoading(false);
    }
  }, []);

  const fetchModulesByPlan = useCallback(async (planId) => {
    setPlanModulesLoading(true);
    try {
      const res = await getModulesByPlan(planId);
      setPlanModules(res.data?.data?.modules || []);
      return { ok: true };
    } catch (e) {
      setPlanModules([]);
      return { ok: false, error: e };
    } finally {
      setPlanModulesLoading(false);
    }
  }, []);

  const savePlanModules = useCallback(async (planId, module_ids) => {
    try {
      await updatePlanModules(planId, module_ids);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e };
    }
  }, []);

  const addModule = useCallback(async (data) => {
    try {
      const res = await createModule(data);
      await fetchAllModules();
      return { ok: true, data: res.data?.data?.module };
    } catch (e) {
      return { ok: false, error: e };
    }
  }, [fetchAllModules]);

  const editModule = useCallback(async (id, data) => {
    try {
      const res = await updateModule(id, data);
      await fetchAllModules();
      return { ok: true, data: res.data?.data?.module };
    } catch (e) {
      return { ok: false, error: e };
    }
  }, [fetchAllModules]);

  const removeModule = useCallback(async (id) => {
    try {
      await deleteModule(id);
      await fetchAllModules();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e };
    }
  }, [fetchAllModules]);

  return {
    modules,
    modulesLoading,
    fetchAllModules,
    planModules,
    planModulesLoading,
    fetchModulesByPlan,
    savePlanModules,
    addModule,
    editModule,
    removeModule,
  };
}
