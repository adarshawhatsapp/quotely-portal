
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Trash,
  SlidersHorizontal,
  ChevronDown,
  AlertCircle,
  Loader2
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/services/productService";
import { useAuth } from "@/context/AuthContext";

const ProductsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("name-asc");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  // Form state
  const [productForm, setProductForm] = useState({
    name: "",
    model_number: "",
    category: "",
    price: "",
    discounted_price: "",
    image: "",
    description: "",
    customizations: ""
  });

  // Fetch products
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Product created successfully");
      setIsAddProductDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Failed to create product: ${error.message}`);
    }
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ id, product }: { id: string, product: any }) => 
      updateProduct(id, product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Product updated successfully");
      setIsEditProductDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Failed to update product: ${error.message}`);
    }
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Product deleted successfully");
      setIsDeleteConfirmOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to delete product: ${error.message}`);
    }
  });

  // Get unique categories
  const categories = ["All", ...new Set(products.map(product => product.category))];

  // Filter products based on search query and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.model_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const [field, direction] = sortOrder.split("-");
    
    if (field === "name") {
      return direction === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    } else if (field === "price") {
      const aPrice = a.discounted_price || a.price;
      const bPrice = b.discounted_price || b.price;
      return direction === "asc" ? aPrice - bPrice : bPrice - aPrice;
    }
    return 0;
  });

  const resetForm = () => {
    setProductForm({
      name: "",
      model_number: "",
      category: "",
      price: "",
      discounted_price: "",
      image: "",
      description: "",
      customizations: ""
    });
    setSelectedProduct(null);
  };

  const handleOpenEditDialog = (product: any) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      model_number: product.model_number,
      category: product.category,
      price: product.price.toString(),
      discounted_price: product.discounted_price ? product.discounted_price.toString() : "",
      image: product.image || "",
      description: product.description || "",
      customizations: (product.customizations || []).join(", ")
    });
    setIsEditProductDialogOpen(true);
  };

  const handleOpenDeleteDialog = (product: any) => {
    setSelectedProduct(product);
    setIsDeleteConfirmOpen(true);
  };

  const handleAddProduct = () => {
    const customizationsArray = productForm.customizations
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);
    
    const productToAdd = {
      name: productForm.name,
      model_number: productForm.model_number,
      category: productForm.category,
      price: parseFloat(productForm.price),
      discounted_price: productForm.discounted_price ? parseFloat(productForm.discounted_price) : null,
      image: productForm.image || null,
      description: productForm.description || null,
      customizations: customizationsArray
    };
    
    createProductMutation.mutate(productToAdd);
  };

  const handleUpdateProduct = () => {
    if (!selectedProduct) return;
    
    const customizationsArray = productForm.customizations
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);
    
    const productToUpdate = {
      name: productForm.name,
      model_number: productForm.model_number,
      category: productForm.category,
      price: parseFloat(productForm.price),
      discounted_price: productForm.discounted_price ? parseFloat(productForm.discounted_price) : null,
      image: productForm.image || null,
      description: productForm.description || null,
      customizations: customizationsArray
    };
    
    updateProductMutation.mutate({ 
      id: selectedProduct.id, 
      product: productToUpdate 
    });
  };

  const handleDeleteProduct = () => {
    if (!selectedProduct) return;
    deleteProductMutation.mutate(selectedProduct.id);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Error Loading Products</h3>
        <p className="text-gray-500 mb-4">
          {(error as any).message || "Failed to load products. Please try again."}
        </p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['products'] })}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product catalog for quotations
          </p>
        </div>
        {isAdmin && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Product</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new product below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input 
                        id="name" 
                        value={productForm.name}
                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                        placeholder="Crystal Chandelier" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="modelNumber">Model Number *</Label>
                      <Input 
                        id="modelNumber" 
                        value={productForm.model_number}
                        onChange={(e) => setProductForm({...productForm, model_number: e.target.value})}
                        placeholder="CC-2023-01" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Input 
                        id="category" 
                        value={productForm.category}
                        onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                        placeholder="Chandelier" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image">Image URL</Label>
                      <Input 
                        id="image" 
                        value={productForm.image}
                        onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                        placeholder="https://example.com/image.jpg" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input 
                        id="price" 
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                        placeholder="45000" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discountedPrice">Discounted Price (₹)</Label>
                      <Input 
                        id="discountedPrice" 
                        type="number"
                        value={productForm.discounted_price}
                        onChange={(e) => setProductForm({...productForm, discounted_price: e.target.value})}
                        placeholder="39999" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description"
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      placeholder="Luxury crystal chandelier with intricate design..." 
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customizations">Customizations (comma separated)</Label>
                    <Input 
                      id="customizations" 
                      value={productForm.customizations}
                      onChange={(e) => setProductForm({...productForm, customizations: e.target.value})}
                      placeholder="Gold finish, Silver finish, Bronze finish" 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    resetForm();
                    setIsAddProductDialogOpen(false);
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleAddProduct}
                    disabled={createProductMutation.isPending || !productForm.name || !productForm.model_number || !productForm.category || !productForm.price}
                  >
                    {createProductMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : "Add Product"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Edit Product Dialog */}
      {isAdmin && (
        <Dialog open={isEditProductDialogOpen} onOpenChange={setIsEditProductDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update the details of the product below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Product Name *</Label>
                  <Input 
                    id="edit-name" 
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-modelNumber">Model Number *</Label>
                  <Input 
                    id="edit-modelNumber" 
                    value={productForm.model_number}
                    onChange={(e) => setProductForm({...productForm, model_number: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category *</Label>
                  <Input 
                    id="edit-category" 
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-image">Image URL</Label>
                  <Input 
                    id="edit-image" 
                    value={productForm.image}
                    onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price (₹) *</Label>
                  <Input 
                    id="edit-price" 
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-discountedPrice">Discounted Price (₹)</Label>
                  <Input 
                    id="edit-discountedPrice" 
                    type="number"
                    value={productForm.discounted_price}
                    onChange={(e) => setProductForm({...productForm, discounted_price: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description"
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-customizations">Customizations (comma separated)</Label>
                <Input 
                  id="edit-customizations" 
                  value={productForm.customizations}
                  onChange={(e) => setProductForm({...productForm, customizations: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                resetForm();
                setIsEditProductDialogOpen(false);
              }}>
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleUpdateProduct}
                disabled={updateProductMutation.isPending || !productForm.name || !productForm.model_number || !productForm.category || !productForm.price}
              >
                {updateProductMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : "Update Product"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {isAdmin && (
        <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this product? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedProduct && (
                <div className="flex items-center gap-3 p-3 border rounded-md">
                  <div className="h-12 w-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                    {selectedProduct.image ? (
                      <img 
                        src={selectedProduct.image} 
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary/60" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{selectedProduct.name}</div>
                    <div className="text-xs text-muted-foreground">{selectedProduct.model_number}</div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive"
                onClick={handleDeleteProduct}
                disabled={deleteProductMutation.isPending}
              >
                {deleteProductMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : "Delete Product"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Category</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  className={categoryFilter === category ? "bg-muted" : ""}
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span>Sort</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className={sortOrder === "name-asc" ? "bg-muted" : ""}
                onClick={() => setSortOrder("name-asc")}
              >
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem
                className={sortOrder === "name-desc" ? "bg-muted" : ""}
                onClick={() => setSortOrder("name-desc")}
              >
                Name (Z-A)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={sortOrder === "price-asc" ? "bg-muted" : ""}
                onClick={() => setSortOrder("price-asc")}
              >
                Price (Low to High)
              </DropdownMenuItem>
              <DropdownMenuItem
                className={sortOrder === "price-desc" ? "bg-muted" : ""}
                onClick={() => setSortOrder("price-desc")}
              >
                Price (High to Low)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Products List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading products...</span>
        </div>
      ) : sortedProducts.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover-lift">
              <div className="aspect-square bg-gray-100 relative">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-12 w-12 text-primary/60" />
                  </div>
                )}
                <Badge className="absolute top-2 right-2">
                  {product.category}
                </Badge>
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription>{product.model_number}</CardDescription>
                  </div>
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <SlidersHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => handleOpenEditDialog(product)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleOpenDeleteDialog(product)}
                          className="text-red-500 focus:text-red-500"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {product.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {product.description}
                  </p>
                )}
                
                <div className="flex items-start justify-between mt-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Price</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-semibold">
                        ₹{(product.discounted_price || product.price).toLocaleString()}
                      </span>
                      {product.discounted_price && product.discounted_price < product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{product.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {product.customizations && product.customizations.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Options</div>
                      <div className="flex flex-wrap gap-1">
                        {product.customizations.slice(0, 2).map((option: string) => (
                          <Badge key={option} variant="outline" className="text-xs">
                            {option}
                          </Badge>
                        ))}
                        {product.customizations.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{product.customizations.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No products found</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            {searchQuery || categoryFilter !== "All" 
              ? "Try adjusting your search or filters to find what you're looking for."
              : "No products have been added yet."}
          </p>
          {isAdmin && (
            <Button 
              className="flex items-center gap-2"
              onClick={() => setIsAddProductDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
