import {
  User, Calendar, Globe, Heart, CreditCard, Mail, Phone,
  MapPin, Building, Briefcase, Building2, DollarSignIcon,
  IdCard, FileText
} from "lucide-react";
import { useState } from "react";

const SponsoredWorkerForm = () => {
  const [previousVisa, setPreviousVisa] = useState("");

  const inputStyle =
    "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm  focus:outline-none  focus:ring-slate-900";

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-lg">

        <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">
          Sponsored Worker Form
        </h2>

        <form className="space-y-10">

          {/* PERSONAL DETAILS */}
          <section>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">
              Personal Details
            </h3>

            <div className="grid md:grid-cols-2 gap-6">

              <div className="relative">
                <label>First Name *</label>
                <input type="text" className={inputStyle} />
                <User className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div className="relative">
                <label>Last Name *</label>
                <input type="text" className={inputStyle} />
                <User className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div>
                <label>Date of Birth *</label>
                <input type="date" className={inputStyle} />
              </div>

              <div>
                <label>Gender *</label>
                <select className={inputStyle}>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>

              <div className="relative">
                <label>Nationality *</label>
                <input type="text" className={inputStyle} />
                <Globe className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div className="relative">
                <label>Marital Status</label>
                <select className={inputStyle}>
                  <option>Single</option>
                  <option>Married</option>
                  <option>Divorced</option>
                </select>
                <Heart className="absolute right-3 top-10 text-gray-400" />
              </div>

            </div>
          </section>

          {/* PASSPORT */}
          <section>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">
              Passport Details
            </h3>

            <div className="grid md:grid-cols-2 gap-6">

              <div className="relative">
                <label>Passport Number *</label>
                <input type="text" className={inputStyle} />
                <CreditCard className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div>
                <label>Issue Date *</label>
                <input type="date" className={inputStyle} />
              </div>

              <div>
                <label>Expiry Date *</label>
                <input type="date" className={inputStyle} />
              </div>

              <div>
                <label>Country of Issue *</label>
                <select className={inputStyle}>
                  <option>Select Country</option>
                  <option>India</option>
                  <option>UK</option>
                  <option>USA</option>
                </select>
              </div>

            </div>
          </section>

          {/* CONTACT */}
          <section>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">
              Contact Information
            </h3>

            <div className="grid md:grid-cols-2 gap-6">

              <div className="relative">
                <label>Email *</label>
                <input type="email" className={inputStyle} />
                <Mail className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div className="relative">
                <label>Phone *</label>
                <input type="text" className={inputStyle} />
                <Phone className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div className="relative">
                <label>Address *</label>
                <input type="text" className={inputStyle} />
                <MapPin className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div className="relative">
                <label>City *</label>
                <input type="text" className={inputStyle} />
                <Building className="absolute right-3 top-10 text-gray-400" />
              </div>

            </div>
          </section>

          {/* JOB */}
          <section>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">
              Job Details
            </h3>

            <div className="grid md:grid-cols-2 gap-6">

              <div className="relative">
                <label>Job Title *</label>
                <input type="text" className={inputStyle} />
                <Briefcase className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div className="relative">
                <label>Department</label>
                <input type="text" className={inputStyle} />
                <Building2 className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div>
                <label>Start Date *</label>
                <input type="date" className={inputStyle} />
              </div>

              <div className="relative">
                <label>Salary *</label>
                <input type="number" className={inputStyle} />
                <DollarSignIcon className="absolute right-3 top-10 text-gray-400" />
              </div>

            </div>
          </section>

          {/* IMMIGRATION */}
          <section>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">
              Immigration Information
            </h3>

            <div className="space-y-4">

              <div className="flex gap-6">
                <label className="flex gap-2">
                  <input
                    type="radio"
                    name="previousVisa"
                    value="yes"
                    onChange={(e) => setPreviousVisa(e.target.value)}
                  />
                  Yes
                </label>

                <label className="flex gap-2">
                  <input
                    type="radio"
                    name="previousVisa"
                    value="no"
                    onChange={(e) => setPreviousVisa(e.target.value)}
                  />
                  No
                </label>
              </div>

              {previousVisa === "yes" && (
                <div className="grid md:grid-cols-3 gap-6">

                  <div className="relative">
                    <input placeholder="Visa Type" className={inputStyle} />
                    <IdCard className="absolute right-3 top-3 text-gray-400" />
                  </div>

                  <div className="relative">
                    <input placeholder="Year" className={inputStyle} />
                    <Calendar className="absolute right-3 top-3 text-gray-400" />
                  </div>

                  <select className={inputStyle}>
                    <option>Approved</option>
                    <option>Rejected</option>
                  </select>

                </div>
              )}

              <div className="relative">
                <label>Notes</label>
                <textarea
                  className="mt-1 w-full p-4 border border-slate-300 rounded-xl shadow-sm  focus:outline-none"
                  rows="3"
                />
                <FileText className="absolute right-3 top-10 text-gray-400" />
              </div>

            </div>
          </section>

          {/* BUTTON */}
          <div className="text-center">
            <button className="bg-red-800 hover:bg-red-900 text-white px-8 py-3 rounded-xl shadow-md transition">
              Submit Form
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SponsoredWorkerForm;