import { useState } from "react";
import { Page } from "components/shared/Page";
import { Card } from "components/ui";

// Local imports of modular sub-components
import { RegistrationProgress } from "./Components/RegistrationProgress";
import { RegistrationForm } from "./Components/RegistrationForm";
import { SuccessTicket } from "./Components/SuccessTicket";

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
  const [ticketId, setTicketId] = useState("");

  const examOptions = [
    { label: "Psychometric Assessment", value: "psychometric" },
    { label: "Aptitude & Logical Reasoning", value: "aptitude" },
    { label: "Technical Coding Challenge", value: "technical" },
    { label: "Leadership & Management Profile", value: "leadership" }
  ];

  const educationOptions = [
    { label: "High School / Secondary", value: "highschool" },
    { label: "Diploma", value: "diploma" },
    { label: "Bachelor's Degree", value: "bachelors" },
    { label: "Master's Degree", value: "masters" },
    { label: "Ph.D. / Doctorate", value: "phd" }
  ];

  const experienceOptions = [
    { label: "Fresh Graduate (0 years)", value: "0" },
    { label: "1 - 2 Years", value: "1-2" },
    { label: "3 - 5 Years", value: "3-5" },
    { label: "5+ Years", value: "5+" }
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
  const totalFields = 6; // name, email, phone, dob, agreed, examType
  const completedFields = [
    formValues.fullName.trim() !== "",
    formValues.email.trim() !== "" && /\S+@\S+\.\S+/.test(formValues.email),
    formValues.phone.trim() !== "" && /^\+?[0-9\s-]{8,15}$/.test(formValues.phone),
    formValues.dob !== "",
    formValues.examType !== "",
    formValues.agreed === true
  ].filter(Boolean).length;
  
  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  const handleSubmit = (e) => {
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

    // Generate random Ticket ID
    const randomId = "PLY-" + Math.floor(100000 + Math.random() * 900000);
    setTicketId(randomId);
    setIsSubmitted(true);
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

        {/* Outer Grid */}
        <div className="max-w-4xl mx-auto">
          {!isSubmitted ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left Column: Form completion strength & details */}
              <div className="lg:col-span-1 space-y-6">
                <RegistrationProgress
                  completionPercentage={completionPercentage}
                  formValues={formValues}
                />

                <Card skin="bordered" className="p-5 hidden lg:block bg-gray-50 dark:bg-dark-750/30">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Instructions</h4>
                  <p className="text-xs text-gray-500 dark:text-dark-300 leading-relaxed">
                    Ensure the email and mobile number are accurate. The candidate will receive a unique access token and dashboard link to complete their assessment.
                  </p>
                </Card>
              </div>

              {/* Right Column: Actual Registration Form */}
              <div className="lg:col-span-2">
                <RegistrationForm
                  formValues={formValues}
                  errors={errors}
                  handleInputChange={handleInputChange}
                  handleSubmit={handleSubmit}
                  handleReset={handleReset}
                  completionPercentage={completionPercentage}
                  examOptions={examOptions}
                  educationOptions={educationOptions}
                  experienceOptions={experienceOptions}
                />
              </div>
            </div>
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
