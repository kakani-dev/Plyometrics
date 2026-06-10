import { Card, Input, Select, Checkbox, Radio, Button } from "components/ui";
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  AcademicCapIcon, 
  BriefcaseIcon
} from "@heroicons/react/24/outline";

export function RegistrationForm({
  formValues,
  errors,
  handleInputChange,
  handleSubmit,
  handleReset,
  completionPercentage,
  examOptions,
  educationOptions,
  experienceOptions
}) {
  return (
    <Card skin="shadow" className="p-6 sm:p-8 bg-white dark:bg-dark-700">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Info */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-500 mb-4">
            1. Personal Details
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Full Name *"
              name="fullName"
              placeholder="John Doe"
              prefix={<UserIcon className="w-4 h-4 text-gray-400" />}
              value={formValues.fullName}
              onChange={handleInputChange}
              error={errors.fullName}
            />
            <Input
              label="Date of Birth *"
              name="dob"
              type="date"
              value={formValues.dob}
              onChange={handleInputChange}
              error={errors.dob}
            />
          </div>

          {/* Gender Selector using Radio */}
          <div className="mt-4">
            <label className="input-label block text-xs font-medium text-gray-400 dark:text-dark-350 mb-1.5">
              Gender
            </label>
            <div className="flex gap-6 mt-2">
              <Radio
                label="Male"
                name="gender"
                value="male"
                checked={formValues.gender === "male"}
                onChange={handleInputChange}
                color="primary"
              />
              <Radio
                label="Female"
                name="gender"
                value="female"
                checked={formValues.gender === "female"}
                onChange={handleInputChange}
                color="primary"
              />
              <Radio
                label="Other"
                name="gender"
                value="other"
                checked={formValues.gender === "other"}
                onChange={handleInputChange}
                color="primary"
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-150 dark:border-dark-600" />

        {/* Section 2: Contact Info */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-500 mb-4">
            2. Contact details
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Email Address *"
              name="email"
              type="email"
              placeholder="john.doe@example.com"
              prefix={<EnvelopeIcon className="w-4 h-4 text-gray-400" />}
              value={formValues.email}
              onChange={handleInputChange}
              error={errors.email}
            />
            <Input
              label="Phone Number *"
              name="phone"
              placeholder="+1 555 123 4567"
              prefix={<PhoneIcon className="w-4 h-4 text-gray-400" />}
              value={formValues.phone}
              onChange={handleInputChange}
              error={errors.phone}
            />
          </div>
        </div>

        <hr className="border-gray-150 dark:border-dark-600" />

        {/* Section 3: Assessment Assignment & Experience */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-500 mb-4">
            3. Assignment & Background
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Assigned Test *"
              name="examType"
              value={formValues.examType}
              onChange={handleInputChange}
              data={examOptions}
              prefix={<BriefcaseIcon className="w-4 h-4 text-gray-400" />}
            />
            <Select
              label="Highest Education"
              name="education"
              value={formValues.education}
              onChange={handleInputChange}
              data={educationOptions}
              prefix={<AcademicCapIcon className="w-4 h-4 text-gray-400" />}
            />
          </div>
          
          <div className="mt-4">
            <Select
              label="Years of Experience"
              name="experience"
              value={formValues.experience}
              onChange={handleInputChange}
              data={experienceOptions}
            />
          </div>
        </div>

        <hr className="border-gray-150 dark:border-dark-600" />

        {/* Section 4: Agreements */}
        <div>
          <Checkbox
            label="I verify that all entered candidate details are valid and accurate. I consent to sending instructions to the registered candidate's email."
            name="agreed"
            checked={formValues.agreed}
            onChange={handleInputChange}
            color="primary"
            error={errors.agreed}
          />
        </div>

        {/* Form Controls */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button 
            variant="outlined" 
            color="neutral" 
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button 
            type="submit" 
            color="primary" 
            isGlow
            disabled={completionPercentage < 100}
          >
            Register Candidate
          </Button>
        </div>
      </form>
    </Card>
  );
}
