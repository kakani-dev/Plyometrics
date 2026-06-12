import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Fragment, useState } from "react";
import { UserPlus } from "lucide-react";
import PropTypes from "prop-types";

// Local Imports
import { Button } from "components/ui";
import { RegistrationForm } from "app/pages/dashboards/CandidateRegistration/Components/RegistrationForm";
import { SuccessTicket } from "app/pages/dashboards/CandidateRegistration/Components/SuccessTicket";
import { createCandidate } from "app/contexts/api/allapis";

export function CreateCandidateDrawer({ isOpen, close, onSuccess }) {
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

      const randomId = response?.id ? `PLY-${response.id}` : "PLY-" + Math.floor(100000 + Math.random() * 900000);
      setTicketId(randomId);
      setIsSubmitted(true);
      if (onSuccess) {
        onSuccess();
      }
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
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={close}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40" />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="ease-out transform-gpu transition-transform duration-200"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in transform-gpu transition-transform duration-200"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <DialogPanel className="fixed left-0 top-0 flex h-full w-full max-w-xl transform-gpu flex-col bg-white py-5 shadow-2xl transition-transform duration-200 dark:bg-dark-700 overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center px-5 mb-5">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-50">
                  Create Candidate
                </h3>
              </div>
              <Button
                onClick={close}
                variant="flat"
                isIcon
                className="size-8 rounded-full"
              >
                <XMarkIcon className="size-5" />
              </Button>
            </div>

            <div className="px-5 pb-8">
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
                <SuccessTicket
                  ticketId={ticketId}
                  formValues={formValues}
                  examOptions={examOptions}
                  handleReset={handleReset}
                />
              )}
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

CreateCandidateDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};
