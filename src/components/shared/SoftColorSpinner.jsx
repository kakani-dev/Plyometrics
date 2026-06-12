import { Spinner } from "components/ui";

const SoftColorSpinner = () => {
  return (
    <div className="inline-space flex flex-wrap">
      <Spinner variant="soft" />
      <Spinner color="primary" variant="soft" />
      <Spinner color="secondary" variant="soft" />
      <Spinner color="info" variant="soft" />
      <Spinner color="success" variant="soft" />
      <Spinner color="warning" variant="soft" />
      <Spinner color="error" variant="soft" />
    </div>
  );
};

export { SoftColorSpinner };
