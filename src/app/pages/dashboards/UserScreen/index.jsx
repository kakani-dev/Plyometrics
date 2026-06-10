import { Page } from "components/shared/Page";
import  {Overview} from "./Components/Overview";
import  OrdersDatatableV1 from "./Components/orders-datatable-1";

export default function UserScreen() {
  return (
    <Page title="User Screen">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">
            User Screen Page
          </h2>
        </div>
        <Overview />
        <OrdersDatatableV1 />
      </div>
    </Page>
  );
}
