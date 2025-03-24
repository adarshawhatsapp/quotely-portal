
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Trash, Minus, Plus, Edit, Check } from "lucide-react";
import { QuoteItem } from "@/services/quotationService";

interface QuotationItemCardProps {
  item: QuoteItem;
  index: number;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onUpdateDiscount: (index: number, discountedPrice: number) => void;
  onUpdateArea: (index: number, area: string) => void;
  onRemove: (index: number) => void;
}

const QuotationItemCard: React.FC<QuotationItemCardProps> = ({
  item,
  index,
  onUpdateQuantity,
  onUpdateDiscount,
  onUpdateArea,
  onRemove
}) => {
  const [isEditingDiscount, setIsEditingDiscount] = useState(false);
  const [discountedPrice, setDiscountedPrice] = useState(item.discountedPrice);
  const [isEditingArea, setIsEditingArea] = useState(false);
  const [area, setArea] = useState(item.area || "");
  
  const handleUpdateDiscount = () => {
    // Ensure discounted price is not lower than 0 or higher than original price
    const newPrice = Math.min(item.price, Math.max(0, discountedPrice));
    onUpdateDiscount(index, newPrice);
    setIsEditingDiscount(false);
  };

  const handleUpdateArea = () => {
    onUpdateArea(index, area);
    setIsEditingArea(false);
  };
  
  const discount = item.price - item.discountedPrice;
  const discountPercentage = (discount / item.price) * 100;
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Product Image */}
          <div className="w-20 h-20 rounded bg-muted/50 overflow-hidden flex-shrink-0">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No img
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="flex-1">
            <div className="flex justify-between">
              <div>
                <div className="font-medium flex items-center gap-2">
                  {item.name}
                  <Badge variant="outline" className="text-xs">
                    {item.type}
                  </Badge>
                </div>
                {item.modelNumber && (
                  <div className="text-xs text-muted-foreground">
                    Model: {item.modelNumber}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => onRemove(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {/* Area Input */}
              <div>
                <div className="text-xs text-muted-foreground mb-1">Area</div>
                {isEditingArea ? (
                  <div className="flex items-center">
                    <Input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="h-8 text-sm"
                      placeholder="e.g. Living Room"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={handleUpdateArea}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      {area ? area : <span className="text-muted-foreground text-xs">Not specified</span>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setIsEditingArea(true)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Quantity Controls */}
              <div>
                <div className="text-xs text-muted-foreground mb-1">Quantity</div>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-r-none"
                    onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val > 0) {
                        onUpdateQuantity(index, val);
                      }
                    }}
                    className="h-8 rounded-none w-12 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-l-none"
                    onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {/* Price and Discount */}
              <div>
                <div className="text-xs text-muted-foreground mb-1">Price</div>
                {isEditingDiscount ? (
                  <div className="flex items-center">
                    <div className="flex-1">
                      <Label htmlFor="discounted-price" className="text-xs">Discounted Price</Label>
                      <Input
                        id="discounted-price"
                        type="number"
                        value={discountedPrice}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            setDiscountedPrice(val);
                          }
                        }}
                        className="h-8 w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        min="0"
                        max={item.price}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0 mt-4"
                      onClick={handleUpdateDiscount}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span className="font-medium">₹{item.discountedPrice.toLocaleString()}</span>
                      {item.price !== item.discountedPrice && (
                        <div className="text-xs text-muted-foreground line-through">
                          ₹{item.price.toLocaleString()}
                        </div>
                      )}
                      {discount > 0 && (
                        <div className="text-xs text-green-600">
                          {discountPercentage.toFixed(0)}% off
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setIsEditingDiscount(true)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Total Row */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t">
          <span className="text-sm text-muted-foreground">
            {item.quantity} x ₹{item.discountedPrice.toLocaleString()}
          </span>
          <span className="font-medium">
            ₹{item.total.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuotationItemCard;
