import { useState } from "react";
import { Page } from "components/shared/Page";

// Local imports of modular sub-components
import { RegistrationForm } from "./Components/RegistrationForm";
import { SuccessTicket } from "./Components/SuccessTicket";
import { createCandidate } from "app/contexts/api/allapis";

export default function CandidateRegistration() {
  const [formValues, setFormValues] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "male",
    examType: "psychometric",
    education: "bachelors",
    experience: "0",
    agreed: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [ticketId, setTicketId] = useState("");

  const examOptions = [
    { label: "Psychometric Assessment", value: "psychometric" },
    { label: "Aptitude & Logical Reasoning", value: "aptitude" },
    { label: "Technical Coding Challenge", value: "technical" },
    { label: "Leadership & Management Profile", value: "leadership" }
  ];

  const validateField = (name, value) => {
    let error = "";
    if (name === "fullName" && !value.trim()) {
      error = "Full Name is required";
    } else if (name === "email") {
      if (!value) {
        error = "Email address is required";
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        error = "Invalid email format";
      }
    } else if (name === "phone") {
      if (!value) {
        error = "Phone number is required";
      } else if (!/^\+?[0-9\s-]{8,15}$/.test(value)) {
        error = "Invalid phone number format";
      }
    } else if (name === "dob" && !value) {
      error = "Date of Birth is required";
    } else if (name === "agreed" && !value) {
      error = "You must agree to the privacy terms";
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    
    setFormValues(prev => ({
      ...prev,
      [name]: val
    }));

    const fieldError = validateField(name, val);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  // Calculate completion percentage
  const totalFields = 5; // name, email, phone, dob, agreed
  const completedFields = [
    formValues.fullName.trim() !== "",
    formValues.email.trim() !== "" && /\S+@\S+\.\S+/.test(formValues.email),
    formValues.phone.trim() !== "" && /^\+?[0-9\s-]{8,15}$/.test(formValues.phone),
    formValues.dob !== "",
    formValues.agreed === true
  ].filter(Boolean).length;
  
  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formValues).forEach(key => {
      const error = validateField(key, formValues[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        name: formValues.fullName,
        dob: formValues.dob ? new Date(formValues.dob).toISOString() : null,
        email: formValues.email,
        mobilenumber: formValues.phone,
        gender: formValues.gender,
        tenantId: 1
      };

      const response = await createCandidate(payload);

      // Generate random Ticket ID or use returned ID if available
      const randomId = response?.id ? `PLY-${response.id}` : "PLY-" + Math.floor(100000 + Math.random() * 900000);
      setTicketId(randomId);
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitError(err?.response?.data?.message || err?.message || "Failed to create candidate");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormValues({
      fullName: "",
      email: "",
      phone: "",
      dob: "",
      gender: "male",
      examType: "psychometric",
      education: "bachelors",
      experience: "0",
      agreed: false
    });
    setErrors({});
    setIsSubmitted(false);
    setSubmitError("");
  };

  return (
    <Page title="Candidate Registration">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6 pb-12">
        {/* Page Title & Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="truncate text-xl font-semibold tracking-wide text-gray-800 dark:text-dark-50">
              Candidate Registration
            </h2>
            <p className="text-sm text-gray-500 dark:text-dark-300">
              Create a new candidate profile to assign psychometric and skills assessments.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-2xl mx-auto">
          {!isSubmitted ? (
            <RegistrationForm
              formValues={formValues}
              errors={errors}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              handleReset={handleReset}
              completionPercentage={completionPercentage}
              isSubmitting={isSubmitting}
              submitError={submitError}
            />
          ) : (
            /* Premium Success Ticket Confirmation View */
            <SuccessTicket
              ticketId={ticketId}
              formValues={formValues}
              examOptions={examOptions}
              handleReset={handleReset}
            />
          )}
        </div>
      </div>
    </Page>
  );
}
