
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Branding */}
      <div className="md:w-1/2 bg-gray-900 text-white p-8 flex flex-col justify-center items-center">
        <div className="max-w-md mx-auto py-12 animate-fadeIn">
          <h1 className="text-4xl font-bold mb-6">Magnific Quotation Portal</h1>
          <p className="text-lg text-gray-300 mb-8">
            Streamline your quotation process with our elegant and efficient solution. 
            Create, manage, and track all your quotations in one place.
          </p>
          <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700">
            <h3 className="text-xl font-medium mb-4">Key Features</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary mr-3 mt-0.5">✓</span>
                <span>Manage products, spares, and customizations</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary mr-3 mt-0.5">✓</span>
                <span>Quick search and add items to quotes</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary mr-3 mt-0.5">✓</span>
                <span>Auto-calculate pricing, discounts, and taxes</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary mr-3 mt-0.5">✓</span>
                <span>Generate professional PDF quotations</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Right side - Auth Form */}
      <div className="md:w-1/2 bg-background flex justify-center items-center p-8">
        <div className="w-full max-w-md animate-slideUp">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
