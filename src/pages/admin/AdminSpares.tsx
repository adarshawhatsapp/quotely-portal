
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  PlusCircle, 
  MinusCircle, 
  Wrench, 
  Loader2 
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  getSpares, 
  createSpare, 
  updateSpare, 
  deleteSpare,
  updateSpareStock,
  Spare
} from "@/services/spareService";

const AdminSparesPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [spareToDelete, setSpareToDelete] = useState<string | null>(null);
  const [spareToEdit, setSpareToEdit] = useState<Spare | null>(null);
  const [spareToUpdateStock, setSpareToUpdateStock] = useState<Spare | null>(null);
  const [formState, setFormState] = useState({
    name: "",
    price: "",
    stock: "0"
  });
  const [stockChange, setStockChange] = useState("0");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch spares
  const { data: spares, isLoading, error } = useQuery({
    queryKey: ['spares'],
    queryFn: getSpares,
  });

  // Create spare mutation
  const createMutation = useMutation({
    mutationFn: createSpare,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spares'] });
      resetForm();
      setIsCreateDialogOpen(false);
      toast.success("Spare part created successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to create spare part: ${error.message}`);
    }
  });

  // Update spare mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, spare }: { id: string; spare: Partial<Spare> }) => 
      updateSpare(id, spare),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spares'] });
      resetForm();
      setIsEditDialogOpen(false);
      setSpareToEdit(null);
      toast.success("Spare part updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update spare part: ${error.message}`);
    }
  });

  // Delete spare mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSpare(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spares'] });
      setSpareToDelete(null);
      toast.success("Spare part deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete spare part: ${error.message}`);
    }
  });

  // Update stock mutation
  const updateStockMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) => 
      updateSpareStock(id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spares'] });
      setIsStockDialogOpen(false);
      setSpareToUpdateStock(null);
      setStockChange("0");
      toast.success("Stock updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update stock: ${error.message}`);
    }
  });

  // Filter spares based on search term
  const filteredSpares = spares?.filter(spare => 
    spare.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spare.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormState({
      name: "",
      price: "",
      stock: "0"
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formState.name.trim()) {
      errors.name = "Spare part name is required";
    }
    
    if (!formState.price.trim() || isNaN(Number(formState.price)) || Number(formState.price) <= 0) {
      errors.price = "Valid price is required";
    }
    
    if (!formState.stock.trim() || isNaN(Number(formState.stock)) || Number(formState.stock) < 0) {
      errors.stock = "Valid stock quantity is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSpare = async () => {
    if (!validateForm()) return;
    
    createMutation.mutate({
      name: formState.name,
      price: Number(formState.price),
      stock: Number(formState.stock)
    });
  };

  const handleUpdateSpare = async () => {
    if (!spareToEdit || !validateForm()) return;
    
    updateMutation.mutate({
      id: spareToEdit.id,
      spare: {
        name: formState.name,
        price: Number(formState.price),
        stock: Number(formState.stock)
      }
    });
  };

  const handleDeleteSpare = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleUpdateStock = () => {
    if (!spareToUpdateStock) return;
    
    const quantityChange = Number(stockChange);
    if (isNaN(quantityChange)) {
      toast.error("Please enter a valid number");
      return;
    }
    
    updateStockMutation.mutate({
      id: spareToUpdateStock.id,
      quantity: quantityChange
    });
  };

  const openEditDialog = (spare: Spare) => {
    setSpareToEdit(spare);
    setFormState({
      name: spare.name,
      price: spare.price.toString(),
      stock: spare.stock.toString()
    });
    setIsEditDialogOpen(true);
  };

  const openStockDialog = (spare: Spare) => {
    setSpareToUpdateStock(spare);
    setStockChange("0");
    setIsStockDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading spare parts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-xl font-semibold text-red-500 mb-2">Error Loading Spare Parts</h3>
        <p className="text-gray-500">{(error as any).message}</p>
        <Button 
          className="mt-4" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['spares'] })}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Spare Parts Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
              setIsCreateDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Spare Part
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Spare Part</DialogTitle>
              <DialogDescription>
                Fill in the spare part details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Spare Part Name *</Label>
                <Input 
                  id="name" 
                  value={formState.name} 
                  onChange={e => setFormState({ ...formState, name: e.target.value })}
                  placeholder="LED Bulb (Warm White)"
                />
                {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    value={formState.price} 
                    onChange={e => setFormState({ ...formState, price: e.target.value })}
                    placeholder="350"
                  />
                  {formErrors.price && <p className="text-sm text-red-500">{formErrors.price}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Initial Stock *</Label>
                  <Input 
                    id="stock" 
                    type="number" 
                    value={formState.stock} 
                    onChange={e => setFormState({ ...formState, stock: e.target.value })}
                    placeholder="100"
                  />
                  {formErrors.stock && <p className="text-sm text-red-500">{formErrors.stock}</p>}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateSpare}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Spare Part
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spare Parts</CardTitle>
          <CardDescription>Manage your spare parts inventory</CardDescription>
          <div className="flex mt-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search spare parts..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSpares && filteredSpares.length > 0 ? (
                filteredSpares.map((spare) => (
                  <TableRow key={spare.id}>
                    <TableCell className="font-mono text-xs">{spare.id}</TableCell>
                    <TableCell className="font-medium">{spare.name}</TableCell>
                    <TableCell>₹{spare.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${spare.stock < 10 ? 'text-red-500' : spare.stock < 30 ? 'text-amber-500' : 'text-green-600'}`}>
                        {spare.stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openStockDialog(spare)}
                          title="Update Stock"
                        >
                          <Wrench className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(spare)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setSpareToDelete(spare.id)}
                          title="Delete"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    {searchTerm ? "No spare parts match your search" : "No spare parts found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Spare Part Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Spare Part</DialogTitle>
            <DialogDescription>
              Update the spare part details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Spare Part Name *</Label>
              <Input 
                id="edit-name" 
                value={formState.name} 
                onChange={e => setFormState({ ...formState, name: e.target.value })}
              />
              {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (₹) *</Label>
                <Input 
                  id="edit-price" 
                  type="number" 
                  value={formState.price} 
                  onChange={e => setFormState({ ...formState, price: e.target.value })}
                />
                {formErrors.price && <p className="text-sm text-red-500">{formErrors.price}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock *</Label>
                <Input 
                  id="edit-stock" 
                  type="number" 
                  value={formState.stock} 
                  onChange={e => setFormState({ ...formState, stock: e.target.value })}
                />
                {formErrors.stock && <p className="text-sm text-red-500">{formErrors.stock}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false);
                setSpareToEdit(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateSpare}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Spare Part
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Stock Dialog */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>
              Add or remove stock for {spareToUpdateStock?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Current Stock</p>
              <p className="text-3xl font-bold mt-1">{spareToUpdateStock?.stock}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock-change">Update Stock</Label>
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={() => setStockChange((Number(stockChange) - 1).toString())}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <Input 
                  id="stock-change" 
                  type="number" 
                  value={stockChange} 
                  onChange={e => setStockChange(e.target.value)}
                  className="text-center"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={() => setStockChange((Number(stockChange) + 1).toString())}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter a positive number to add stock or a negative number to remove stock.
              </p>
              {Number(stockChange) !== 0 && spareToUpdateStock && (
                <div className="bg-muted p-3 rounded-md mt-3">
                  <p className="text-sm">
                    New stock will be: <span className="font-bold">{spareToUpdateStock.stock + Number(stockChange)}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsStockDialogOpen(false);
                setSpareToUpdateStock(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateStock}
              disabled={updateStockMutation.isPending || Number(stockChange) === 0}
            >
              {updateStockMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Spare Part Dialog */}
      <AlertDialog open={!!spareToDelete} onOpenChange={() => setSpareToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this spare part. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => spareToDelete && handleDeleteSpare(spareToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminSparesPage;
