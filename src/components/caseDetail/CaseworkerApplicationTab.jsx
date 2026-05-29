import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from "../../context/ToastContext";
import CandidateApplicationForm from "../CandidateApplicationForm/CandidateApplicationForm";
import { getCandidateById, updateAdminCandidateApplication } from "../../services/candidateApi";
import {
  mapApplicationToCandidateRow,
  candidateRowToApplicationForm,
  pruneCustomResponsesToDefinitions,
} from "../CandidateApplicationForm/applicationFormMapping";
import { getInitialApplicationFormData } from "../CandidateApplicationForm/initialFormState";
import useAdmin from "../../hooks/useAdmin";

export default function CaseworkerApplicationTab({ caseDetail, userName }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applicationForm, setApplicationForm] = useState(getInitialApplicationFormData());
  
  const {
    applicationFieldSettings,
    applicationCustomFields,
    fetchApplicationFieldSettings,
    fetchApplicationCustomFields,
  } = useAdmin();

  useEffect(() => {
    fetchApplicationFieldSettings();
    fetchApplicationCustomFields();
  }, [fetchApplicationFieldSettings, fetchApplicationCustomFields]);

  const customDefsForForm = useMemo(
    () =>
      applicationCustomFields.map((cf) => ({
        id: String(cf.field_id),
        label: cf.label,
        type: cf.field_type,
      })),
    [applicationCustomFields],
  );

  useEffect(() => {
    if (!caseDetail?.candidateId) {
      setLoading(false);
      return;
    }
    
    let isMounted = true;
    const fetchCandidateData = async () => {
      try {
        const res = await getCandidateById(caseDetail.candidateId);
        const candidateData = res.data?.data?.candidate;
        if (candidateData && isMounted) {
          const mappedForm = candidateRowToApplicationForm(candidateData);
          setApplicationForm(mappedForm);
        }
      } catch (error) {
        console.error("Error fetching candidate data:", error);
        showToast({ message: "Failed to load application data", variant: "danger" });
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchCandidateData();
    return () => { isMounted = false; };
  }, [caseDetail?.candidateId, showToast]);

  const handleSave = async (payload) => {
    if (!caseDetail?.candidateId) return;
    setSaving(true);
    
    try {
      const rowExtras = {
        caseStatus: caseDetail.status || "On Track",
        paymentStatus: caseDetail.paymentStatus || "Outstanding",
      };

      const payloadClean = pruneCustomResponsesToDefinitions(payload, customDefsForForm);
      const mapped = mapApplicationToCandidateRow(payloadClean, { 
        ...rowExtras, 
        isNewApplication: false 
      });
      
      const body = {
        ...mapped.applicationData,
        first_name: mapped.userData.first_name,
        last_name: mapped.userData.last_name,
        email: mapped.userData.email,
        country_code: mapped.userData.country_code,
        mobile: mapped.userData.mobile,
        caseworkerId: payloadClean.caseworkerId,
      };

      const res = await updateAdminCandidateApplication(caseDetail.candidateId, body);
      showToast({ message: res.data?.message || "Application updated successfully", variant: "success" });
    } catch (error) {
      console.error("Save application error:", error);
      const msg = error?.response?.data?.message || "Failed to update application";
      showToast({ message: msg, variant: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const fieldVisibilityMap = useMemo(() => {
    const vis = {};
    if (applicationFieldSettings) {
      for (const row of applicationFieldSettings) {
        vis[row.field_key] = row.is_visible !== false;
      }
    }
    return vis;
  }, [applicationFieldSettings]);

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading application data...</div>;
  }

  return (
    <CandidateApplicationForm
      variant="admin"
      formData={applicationForm}
      setFormData={setApplicationForm}
      onAdminSubmit={handleSave}
      onAdminSaveDraft={handleSave}
      adminSubmitBusy={saving}
      adminShowAllBuiltinFields={true}
      customFieldDefinitions={customDefsForForm}
      fieldVisibility={fieldVisibilityMap}
    />
  );
}
