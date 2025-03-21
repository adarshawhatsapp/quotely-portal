
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Loader2, PlusCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { toast } from "sonner";
import { Customer, searchCustomers, createCustomer } from "@/services/customerService";

interface CustomerSelectProps {
  onSelect: (customer: Customer | null) => void;
  selectedCustomer: Customer | null;
}

// Form schema for customer
const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal(""))
});

type CustomerFormValues = z.infer<typeof customerSchema>;

const CustomerSelect = ({ onSelect, selectedCustomer }: CustomerSelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['customerSearch', searchTerm],
    queryFn: () => searchCustomers(searchTerm),
    enabled: searchTerm.length > 2
  });

  // Form setup
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: ""
    }
  });

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customerSearch'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsDialogOpen(false);
      form.reset();
      onSelect(data);
      toast.success("New customer created successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to create customer: ${error.message}`);
    }
  });

  // Handle form submission
  const onSubmit = (data: CustomerFormValues) => {
    createCustomerMutation.mutate(data);
  };

  const handleOpenCreateDialog = () => {
    setOpen(false);
    setIsDialogOpen(true);
  };

  const handleSelectCustomer = (customer: Customer) => {
    onSelect(customer);
    setOpen(false);
  };

  // Clear selected customer
  const handleClearSelection = () => {
    onSelect(null);
  };

  // Reset search when popover closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
    }
  }, [open]);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedCustomer ? selectedCustomer.name : "Select a customer..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput
              placeholder="Search customers..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            {isSearching && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
            <CommandEmpty>
              {searchTerm.length < 3 ? (
                <p className="p-2 text-sm text-center">Type at least 3 characters to search</p>
              ) : (
                <div className="py-6 text-center">
                  <User className="mx-auto h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                  <p className="text-sm mb-2">No customer found</p>
                  <Button 
                    variant="link" 
                    size="sm"
                    onClick={handleOpenCreateDialog}
                  >
                    <PlusCircle className="mr-1 h-4 w-4" />
                    Create new customer
                  </Button>
                </div>
              )}
            </CommandEmpty>
            <CommandGroup heading="Customers">
              {searchResults.map((customer) => (
                <CommandItem
                  key={customer.id}
                  onSelect={() => handleSelectCustomer(customer)}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span>{customer.name}</span>
                      {selectedCustomer?.id === customer.id && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </div>
                    {customer.phone && (
                      <span className="text-xs text-muted-foreground">{customer.phone}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
              {searchResults.length > 0 && (
                <CommandItem 
                  onSelect={handleOpenCreateDialog}
                  className="cursor-pointer border-t mt-2"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Create new customer</span>
                </CommandItem>
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedCustomer && (
        <div className="mt-1 flex items-center justify-between bg-muted/50 p-2 rounded-md text-sm">
          <div className="flex-1">
            <div className="font-medium">{selectedCustomer.name}</div>
            <div className="text-xs text-muted-foreground grid gap-1">
              {selectedCustomer.phone && <div>{selectedCustomer.phone}</div>}
              {selectedCustomer.email && <div>{selectedCustomer.email}</div>}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearSelection} 
            className="h-8 px-2"
          >
            Change
          </Button>
        </div>
      )}

      {/* Create Customer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Enter the customer details below.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createCustomerMutation.isPending}>
                  {createCustomerMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Customer
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomerSelect;
