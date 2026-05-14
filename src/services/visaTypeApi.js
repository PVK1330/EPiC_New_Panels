import { getVisaTypes } from "./caseApi";

export const fetchVisaTypeOptions = async () => {
  const res = await getVisaTypes();
  const rows = res?.data?.data?.visa_types || [];
  return rows
    .map((r) => ({
      id: r.id,
      name: r.name,
    }))
    .filter((r) => Boolean(r.name));
};

