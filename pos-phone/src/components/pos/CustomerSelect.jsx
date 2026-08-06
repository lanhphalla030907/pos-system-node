import React, { useState, useEffect } from 'react';

const CustomerSelect = ({ 
  onSelect, 
  selectedCustomer, 
  customers, 
  loading, 
  loadCustomers, 
  addCustomer 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    tel: '',
    email: '',
    address: ''
  });

  // Load customers on mount
  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Filter customers based on search
  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.tel?.includes(searchTerm)
  );

  const handleSelect = (customer) => {
    onSelect(customer);
    setSearchTerm('');
  };

  const handleCreate = async () => {
    if (!newCustomer.name.trim()) {
      alert('Customer name is required');
      return;
    }

    const res = await addCustomer(newCustomer);
    if (res?.success) {
      setIsCreating(false);
      setNewCustomer({ name: '', tel: '', email: '', address: '' });
      // The hook already sets selected customer
      onSelect(res.data);
    } else {
      alert(res?.message || 'Failed to create customer');
    }
  };

  return (
    <div className="space-y-2">
      {!isCreating ? (
        <>
          <div className="relative">
            <input
              type="text"
              placeholder="Search customer by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Selected Customer */}
          {selectedCustomer && (
            <div className="bg-blue-50 p-2 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{selectedCustomer.name}</p>
                <p className="text-xs text-gray-600">{selectedCustomer.tel}</p>
                <p className="text-xs text-gray-500">
                  Type: {selectedCustomer.type || 'Regular'} | 
                  Spent: ${selectedCustomer.total_spent || 0} |
                  Discount: {selectedCustomer.discount || 0}%
                </p>
              </div>
              <button
                onClick={() => {
                  onSelect(null);
                  setSearchTerm('');
                }}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Change
              </button>
            </div>
          )}

          {/* Customer List */}
          {!selectedCustomer && searchTerm && (
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
              {loading ? (
                <div className="p-2 text-center text-gray-500">Loading...</div>
              ) : filteredCustomers.length === 0 ? (
                <div className="p-2 text-center">
                  <p className="text-sm text-gray-500">No customers found</p>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                  >
                    Create new customer
                  </button>
                </div>
              ) : (
                filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => handleSelect(customer)}
                    className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <p className="text-sm font-medium">{customer.name}</p>
                    <p className="text-xs text-gray-500">
                      {customer.tel} • {customer.type || 'Regular'} • 
                      Discount: {customer.discount || 0}%
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {!selectedCustomer && !searchTerm && (
            <button
              onClick={() => setIsCreating(true)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Create new customer
            </button>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">New Customer</h4>
          
          <input
            type="text"
            placeholder="Name *"
            value={newCustomer.name}
            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          
          <input
            type="tel"
            placeholder="Phone"
            value={newCustomer.tel}
            onChange={(e) => setNewCustomer({ ...newCustomer, tel: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          
          <input
            type="email"
            placeholder="Email"
            value={newCustomer.email}
            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          
          <input
            type="text"
            placeholder="Address"
            value={newCustomer.address}
            onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex gap-2">
            <button
              onClick={() => setIsCreating(false)}
              className="flex-1 px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Customer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(CustomerSelect);