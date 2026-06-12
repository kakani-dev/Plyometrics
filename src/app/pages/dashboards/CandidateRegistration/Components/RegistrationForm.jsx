import { Card, Input, Checkbox, Radio, Button } from "components/ui";
import { User, Mail, Phone, UserCheck, Calendar, VenusAndMars, ShieldCheck } from "lucide-react";

export function RegistrationForm({
  formValues,
  errors,
  handleInputChange,
  handleSubmit,
  handleReset,
  completionPercentage,
  isSubmitting,
  submitError
}) {
  return (
    <Card skin="shadow" className="p-6 sm:p-8 bg-white dark:bg-dark-700">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Info */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-500 mb-4 flex items-center gap-1.5">
            <User className="w-4 h-4" />
            1. Personal Details
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={<><User className="w-3.5 h-3.5 -ml-0.5 inline text-primary-600" /><span className="text-primary-900"> Full Name *</span></>}
              name="fullName"
              placeholder="John Doe"
              prefix={<User className="w-4 h-4 text-gray-400" />}
              value={formValues.fullName}
              onChange={handleInputChange}
              error={errors.fullName}
              className="h-8 py-1 text-xs"
            />
            <Input
              label={<><Calendar className="w-3.5 h-3.5 -ml-0.5 inline text-primary-600" /><span className="text-primary-900"> Date of Birth *</span></>}
              name="dob"
              type="date"
              value={formValues.dob}
              onChange={handleInputChange}
              error={errors.dob}
              className="h-8 py-1 text-xs"
            />
          </div>

          {/* Gender Selector using Radio */}
          <div className="mt-4">
            <label className="input-label block text-xs font-medium mb-1.5 flex items-center gap-1">
              <VenusAndMars className="w-3.5 h-3.5 text-primary-600" />
              <span className="text-primary-900">Gender</span>
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
          <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-500 mb-4 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4" />
            2. Contact details
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={<><Mail className="w-3.5 h-3.5 -ml-0.5 inline text-primary-600" /><span className="text-primary-900"> Email Address *</span></>}
              name="email"
              type="email"
              placeholder="john.doe@example.com"
              prefix={<Mail className="w-4 h-4 text-gray-400" />}
              value={formValues.email}
              onChange={handleInputChange}
              error={errors.email}
              className="h-8 py-1 text-xs"
            />
            <Input
              label={<><Phone className="w-3.5 h-3.5 -ml-0.5 inline text-primary-600" /><span className="text-primary-900"> Phone Number *</span></>}
              name="phone"
              placeholder="+1 555 123 4567"
              prefix={<Phone className="w-4 h-4 text-gray-400" />}
              value={formValues.phone}
              onChange={handleInputChange}
              error={errors.phone}
              className="h-8 py-1 text-xs"
            />
          </div>
        </div>

        <hr className="border-gray-150 dark:border-dark-600" />

        {/* Section 4: Agreements */}
        <div>
          <Checkbox
            label={<><ShieldCheck className="w-3.5 h-3.5 inline mr-0.5 text-primary-600" /><span className="text-primary-900"> I verify that all entered candidate details are valid and accurate. I consent to sending instructions to the registered candidate&apos;s email.</span></>}
            name="agreed"
            checked={formValues.agreed}
            onChange={handleInputChange}
            color="primary"
            error={errors.agreed}
          />
        </div>

        {submitError && (
          <div className="text-red-500 text-xs mt-2 font-medium bg-red-50 dark:bg-red-950/20 p-2.5 rounded border border-red-200 dark:border-red-900/50">
            {submitError}
          </div>
        )}

        {/* Form Controls */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button 
            variant="outlined" 
            color="neutral" 
            onClick={handleReset}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button 
            type="submit" 
            color="primary" 
            isGlow
            disabled={completionPercentage < 100 || isSubmitting}
          >
            {isSubmitting ? "Registering..." : "Register Candidate"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
