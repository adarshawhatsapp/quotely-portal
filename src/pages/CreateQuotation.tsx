
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import CreateQuotationForm from "@/components/quotation/CreateQuotationForm";

const CreateQuotationPage = () => {
  const queryClient = useQueryClient();

  // We're going to prefetch products and spares data
  const productsLoading = queryClient.isFetching(['products']);
  const sparesLoading = queryClient.isFetching(['spares']);
  
  if (productsLoading || sparesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading catalog data...</span>
      </div>
    );
  }

  return <CreateQuotationForm />;
};

export default CreateQuotationPage;
