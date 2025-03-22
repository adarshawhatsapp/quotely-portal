import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  Package, 
  ImageIcon, 
  Loader2,
  X
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  uploadProductImage,
  Product
} from "@/services/productService";

const AdminProductsPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [formState, setFormState] = useState({
    name: "",
    modelNumber: "",
    category: "",
    price: "",
    discountedPrice: "",
    description: "",
    imageFile: null as File | null,
    imageUrl: "",
    customizations: [""]
  });
  const [isUploading, setIsUploading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const createMutation = useMutation({
    mutationFn: async (formData: any) => {
      let imageUrl = formData.imageUrl;
      
      if (formData.imageFile) {
        try {
          setIsUploading(true);
          toast.info("Uploading image...");
          imageUrl = await uploadProductImage(formData.imageFile);
          toast.success("Image uploaded successfully");
        } catch (error: any) {
          console.error("Upload error:", error);
          toast.error(`Image upload failed: ${error.message}`);
        } finally {
          setIsUploading(false);
        }
      }
      
      const customizations = formData.customizations.filter((item: string) => item.trim() !== "");
      
      toast.info("Creating product...");
      return createProduct({
        name: formData.name,
        model_number: formData.modelNumber,
        category: formData.category,
        price: Number(formData.price),
        discounted_price: formData.discountedPrice ? Number(formData.discountedPrice) : null,
        description: formData.description,
        image: imageUrl || null,
        customizations: customizations
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
      setIsCreateDialogOpen(false);
      toast.success("Product created successfully");
    },
    onError: (error: any) => {
      console.error("Product creation error:", error);
      toast.error(`Failed to create product: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, product }: { id: string; product: any }) => {
      let imageUrl = product.imageUrl;
      
      if (product.imageFile) {
        try {
          setIsUploading(true);
          toast.info("Uploading image...");
          imageUrl = await uploadProductImage(product.imageFile);
          toast.success("Image uploaded successfully");
        } catch (error: any) {
          console.error("Upload error:", error);
          toast.error(`Image upload failed: ${error.message}`);
        } finally {
          setIsUploading(false);
        }
      }
      
      const customizations = product.customizations.filter((item: string) => item.trim() !== "");
      
      toast.info("Updating product...");
      return updateProduct(id, {
        name: product.name,
        model_number: product.modelNumber,
        category: product.category,
        price: Number(product.price),
        discounted_price: product.discountedPrice ? Number(product.discountedPrice) : null,
        description: product.description,
        image: imageUrl || product.imageUrl || null,
        customizations: customizations
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
      setIsEditDialogOpen(false);
      setProductToEdit(null);
      toast.success("Product updated successfully");
    },
    onError: (error: any) => {
      console.error("Product update error:", error);
      toast.error(`Failed to update product: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setProductToDelete(null);
      toast.success("Product deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete product: ${error.message}`);
    }
  });

  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.model_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormState({
      name: "",
      modelNumber: "",
      category: "",
      price: "",
      discountedPrice: "",
      description: "",
      imageFile: null,
      imageUrl: "",
      customizations: [""]
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formState.name.trim()) {
      errors.name = "Product name is required";
    }
    
    if (!formState.category.trim()) {
      errors.category = "Category is required";
    }
    
    if (!formState.price.trim() || isNaN(Number(formState.price)) || Number(formState.price) <= 0) {
      errors.price = "Valid price is required";
    }
    
    if (formState.discountedPrice.trim() && (isNaN(Number(formState.discountedPrice)) || Number(formState.discountedPrice) <= 0)) {
      errors.discountedPrice = "Discounted price must be a positive number";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateProduct = async () => {
    if (!validateForm()) return;
    
    createMutation.mutate({
      name: formState.name,
      modelNumber: formState.modelNumber,
      category: formState.category,
      price: formState.price,
      discountedPrice: formState.discountedPrice,
      description: formState.description,
      imageFile: formState.imageFile,
      imageUrl: formState.imageUrl,
      customizations: formState.customizations
    });
  };

  const handleUpdateProduct = async () => {
    if (!productToEdit || !validateForm()) return;
    
    updateMutation.mutate({
      id: productToEdit.id,
      product: {
        name: formState.name,
        modelNumber: formState.modelNumber,
        category: formState.category,
        price: formState.price, 
        discountedPrice: formState.discountedPrice,
        description: formState.description,
        imageFile: formState.imageFile,
        imageUrl: formState.imageUrl,
        customizations: formState.customizations
      }
    });
  };

  const handleDeleteProduct = (id: string) => {
    deleteMutation.mutate(id);
  };

  const openEditDialog = (product: Product) => {
    setProductToEdit(product);
    setFormState({
      name: product.name,
      modelNumber: product.model_number || "",
      category: product.category,
      price: product.price.toString(),
      discountedPrice: product.discounted_price ? product.discounted_price.toString() : "",
      description: product.description || "",
      imageFile: null,
      imageUrl: product.image || "",
      customizations: product.customizations.length > 0 ? product.customizations : [""]
    });
    setIsEditDialogOpen(true);
  };

  const handleAddCustomization = () => {
    setFormState({
      ...formState,
      customizations: [...formState.customizations, ""]
    });
  };

  const handleRemoveCustomization = (index: number) => {
    const newCustomizations = [...formState.customizations];
    newCustomizations.splice(index, 1);
    setFormState({
      ...formState,
      customizations: newCustomizations
    });
  };

  const handleCustomizationChange = (index: number, value: string) => {
    const newCustomizations = [...formState.customizations];
    newCustomizations[index] = value;
    setFormState({
      ...formState,
      customizations: newCustomizations
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-xl font-semibold text-red-500 mb-2">Error Loading Products</h3>
        <p className="text-gray-500">{(error as any).message}</p>
        <Button 
          className="mt-4" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['products'] })}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
              setIsCreateDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
              <DialogDescription>
                Fill in the product details below to add a new product.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input 
                    id="name" 
                    value={formState.name} 
                    onChange={e => setFormState({ ...formState, name: e.target.value })}
                    placeholder="Designer Chandelier"
                  />
                  {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelNumber">Model Number</Label>
                  <Input 
                    id="modelNumber" 
                    value={formState.modelNumber} 
                    onChange={e => setFormState({ ...formState, modelNumber: e.target.value })}
                    placeholder="CH-2023-01"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formState.category} 
                    onValueChange={value => setFormState({ ...formState, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Categories</SelectLabel>
                        <SelectItem value="Chandelier">Chandelier</SelectItem>
                        <SelectItem value="Pendant">Pendant Light</SelectItem>
                        <SelectItem value="Wall Light">Wall Light</SelectItem>
                        <SelectItem value="Ceiling">Ceiling Light</SelectItem>
                        <SelectItem value="Fan">Fan</SelectItem>
                        <SelectItem value="Floor Light">Floor Light</SelectItem>
                        <SelectItem value="Table Light">Table Light</SelectItem>
                        <SelectItem value="Outdoor">Outdoor Light</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {formErrors.category && <p className="text-sm text-red-500">{formErrors.category}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    value={formState.price} 
                    onChange={e => setFormState({ ...formState, price: e.target.value })}
                    placeholder="45000"
                  />
                  {formErrors.price && <p className="text-sm text-red-500">{formErrors.price}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discountedPrice">Discounted Price (₹)</Label>
                  <Input 
                    id="discountedPrice" 
                    type="number" 
                    value={formState.discountedPrice} 
                    onChange={e => setFormState({ ...formState, discountedPrice: e.target.value })}
                    placeholder="39999"
                  />
                  {formErrors.discountedPrice && <p className="text-sm text-red-500">{formErrors.discountedPrice}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Product Image</Label>
                  <div className="grid grid-cols-1 gap-2">
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={e => setFormState({ 
                        ...formState, 
                        imageFile: e.target.files?.[0] || null
                      })}
                    />
                    <Input 
                      placeholder="or paste Image URL" 
                      value={formState.imageUrl}
                      onChange={e => setFormState({ ...formState, imageUrl: e.target.value })}
                    />
                  </div>
                  {formState.imageFile && (
                    <p className="text-xs text-muted-foreground">Selected: {formState.imageFile.name}</p>
                  )}
                  {formState.imageUrl && (
                    <div className="mt-2">
                      <img 
                        src={formState.imageUrl} 
                        alt="Preview" 
                        className="h-20 w-auto object-contain border rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          toast.error("Invalid image URL");
                        }}
                        onLoad={(e) => {
                          (e.target as HTMLImageElement).style.display = 'block';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formState.description} 
                  onChange={e => setFormState({ ...formState, description: e.target.value })}
                  placeholder="Product description..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Customizations</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddCustomization}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Option
                  </Button>
                </div>
                <div className="space-y-2">
                  {formState.customizations.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input 
                        value={option} 
                        onChange={e => handleCustomizationChange(index, e.target.value)}
                        placeholder="Gold finish, Silver finish, etc."
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveCustomization(index)}
                        disabled={formState.customizations.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Add customization options for this product</p>
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
                onClick={handleCreateProduct}
                disabled={isUploading || createMutation.isPending}
              >
                {(isUploading || createMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isUploading ? 'Uploading...' : createMutation.isPending ? 'Creating...' : 'Create Product'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>Manage your product catalog</CardDescription>
          <div className="flex mt-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
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
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Model No.</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts && filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="h-12 w-12 object-cover rounded"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.model_number || "-"}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <div>
                        {product.discounted_price ? (
                          <>
                            <span className="font-medium">₹{product.discounted_price.toLocaleString()}</span>
                            <span className="text-sm text-muted-foreground line-through ml-2">
                              ₹{product.price.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="font-medium">₹{product.price.toLocaleString()}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setProductToDelete(product.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {searchTerm ? "No products match your search" : "No products found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name *</Label>
                <Input 
                  id="edit-name" 
                  value={formState.name} 
                  onChange={e => setFormState({ ...formState, name: e.target.value })}
                />
                {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-modelNumber">Model Number</Label>
                <Input 
                  id="edit-modelNumber" 
                  value={formState.modelNumber} 
                  onChange={e => setFormState({ ...formState, modelNumber: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select 
                  value={formState.category} 
                  onValueChange={value => setFormState({ ...formState, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Categories</SelectLabel>
                      <SelectItem value="Chandelier">Chandelier</SelectItem>
                      <SelectItem value="Pendant">Pendant Light</SelectItem>
                      <SelectItem value="Wall Light">Wall Light</SelectItem>
                      <SelectItem value="Ceiling">Ceiling Light</SelectItem>
                      <SelectItem value="Fan">Fan</SelectItem>
                      <SelectItem value="Floor Light">Floor Light</SelectItem>
                      <SelectItem value="Table Light">Table Light</SelectItem>
                      <SelectItem value="Outdoor">Outdoor Light</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {formErrors.category && <p className="text-sm text-red-500">{formErrors.category}</p>}
              </div>
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-discountedPrice">Discounted Price (₹)</Label>
                <Input 
                  id="edit-discountedPrice" 
                  type="number" 
                  value={formState.discountedPrice} 
                  onChange={e => setFormState({ ...formState, discountedPrice: e.target.value })}
                />
                {formErrors.discountedPrice && (
                  <p className="text-sm text-red-500">{formErrors.discountedPrice}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Product Image</Label>
                <div className="grid grid-cols-1 gap-2">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setFormState({ 
                      ...formState, 
                      imageFile: e.target.files?.[0] || null
                    })}
                  />
                  <Input 
                    placeholder="or paste Image URL" 
                    value={formState.imageUrl}
                    onChange={e => setFormState({ ...formState, imageUrl: e.target.value })}
                  />
                </div>
                {formState.imageFile && (
                  <p className="text-xs text-muted-foreground">Selected: {formState.imageFile.name}</p>
                )}
                {formState.imageUrl && (
                  <div className="mt-2">
                    <img 
                      src={formState.imageUrl} 
                      alt="Preview" 
                      className="h-20 w-auto object-contain border rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        toast.error("Invalid image URL");
                      }}
                      onLoad={(e) => {
                        (e.target as HTMLImageElement).style.display = 'block';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description" 
                value={formState.description} 
                onChange={e => setFormState({ ...formState, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Customizations</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddCustomization}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Option
                </Button>
              </div>
              <div className="space-y-2">
                {formState.customizations.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input 
                      value={option} 
                      onChange={e => handleCustomizationChange(index, e.target.value)}
                      placeholder="Gold finish, Silver finish, etc."
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveCustomization(index)}
                      disabled={formState.customizations.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Add customization options for this product</p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false);
                setProductToEdit(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateProduct}
              disabled={isUploading || updateMutation.isPending}
            >
              {(isUploading || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isUploading ? 'Uploading...' : updateMutation.isPending ? 'Updating...' : 'Update Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this product. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => productToDelete && handleDeleteProduct(productToDelete)}
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

export default AdminProductsPage;

