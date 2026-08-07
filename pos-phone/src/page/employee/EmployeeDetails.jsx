// pages/EmployeeDetails.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useEmployee } from '../../hooks/useEmployee';
import EmployeeImage from '../../components/employee/EmployeeImage';
import CreateAccountModal from '../../components/employee/CreateAccountModal';

const EmployeeDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { loadEmployeeById, addEmployeeAccount, loading } = useEmployee();

  const [employee, setEmployee] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);

  // Load employee data
  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    try {
      setLoadingData(true);
      const res = await loadEmployeeById(id);
      if (res?.success && res.data) {
        setEmployee(res.data);
      } else {
        alert('Employee not found');
        navigate('/employees');
      }
    } catch (error) {
      console.error('Error loading employee:', error);
      alert('Failed to load employee data');
      navigate('/employees');
    } finally {
      setLoadingData(false);
    }
  };

  // Handle create account
  const handleCreateAccount = async (employeeId, data) => {
    setAccountLoading(true);
    const res = await addEmployeeAccount(employeeId, data);
    setAccountLoading(false);

    if (res?.success) {
      alert('Account created successfully!');
      setIsAccountModalOpen(false);
      loadEmployee(); // Reload employee data
    } else {
      alert(res?.message || 'Failed to create account');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format date only
  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    if (status === 1) {
      return { label: 'Active', color: 'bg-green-100 text-green-800', dotColor: 'bg-green-500' };
    }
    return { label: 'Inactive', color: 'bg-gray-100 text-gray-600', dotColor: 'bg-gray-400' };
  };

  // Get gender badge
  const getGenderLabel = (gender) => {
    if (gender === 'Male') return 'Male';
    if (gender === 'Female') return 'Female';
    return 'Other';
  };

  // Check if employee has account
  const hasAccount = (emp) => {
    return emp?.username && emp?.username !== null && emp?.username !== '';
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Employee not found</p>
          <Link to="/employees" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to Employees
          </Link>
        </div>
      </div>
    );
  }

  const status = getStatusBadge(employee.status);
  const hasUserAccount = hasAccount(employee);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Employee Details</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage employee information</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/employees"
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Back
            </Link>
            <Link
              to={`/employees/edit/${employee.id}`}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Edit Employee
            </Link>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gray-50 px-6 py-8 border-b border-gray-200">
            <div className="flex items-center gap-6">
              {/* Profile Image */}
              <EmployeeImage image={employee.image} name={employee.name} size="xl" />

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                    <span className={`w-2 h-2 rounded-full mr-1.5 ${status.dotColor}`}></span>
                    {status.label}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {employee.code}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <span className="text-sm text-gray-600">
                    Role: <span className="font-medium">{employee.role_name || 'N/A'}</span>
                  </span>
                  <span className="text-sm text-gray-600">
                    Gender: <span className="font-medium">{getGenderLabel(employee.gender)}</span>
                  </span>
                  {hasUserAccount && (
                    <span className="inline-flex items-center text-sm text-blue-600 font-medium">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      @{employee.username}
                    </span>
                  )}
                  {!hasUserAccount && (
                    <button
                      onClick={() => setIsAccountModalOpen(true)}
                      className="inline-flex items-center px-3 py-1 text-sm text-green-600 bg-green-50 rounded-full hover:bg-green-100 transition border border-green-200"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Create Account
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 block">Employee Code</label>
                  <p className="text-gray-900">{employee.code || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 block">Full Name</label>
                  <p className="text-gray-900">{employee.name || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 block">Gender</label>
                  <p className="text-gray-900">{getGenderLabel(employee.gender)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 block">Date of Birth</label>
                  <p className="text-gray-900">{formatDateOnly(employee.dob)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 block">Phone</label>
                  <p className="text-gray-900">{employee.phone || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 block">Email</label>
                  <p className="text-gray-900">{employee.email || 'N/A'}</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 block">Address</label>
                  <p className="text-gray-900">{employee.address || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 block">Role</label>
                  <p className="text-gray-900">{employee.role_name || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 block">Salary</label>
                  <p className="text-gray-900 font-medium">
                    ${parseFloat(employee.salary || 0).toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 block">Hire Date</label>
                  <p className="text-gray-900">{formatDateOnly(employee.hire_date)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 block">Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                    <span className={`w-2 h-2 rounded-full mr-1.5 ${status.dotColor}`}></span>
                    {status.label}
                  </span>
                </div>

                {hasUserAccount && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 block">Username</label>
                    <p className="text-gray-900 text-blue-600 font-medium">@{employee.username}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Created Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 block">Created By</label>
                  <p className="text-gray-900">{employee.create_by_name || 'System'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block">Created At</label>
                  <p className="text-gray-900">{formatDate(employee.create_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Management Section */}
        {!hasUserAccount && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Account Management</h3>
                <p className="text-sm text-gray-500 mt-1">
                  This employee does not have a user account yet.
                </p>
              </div>
              <button
                onClick={() => setIsAccountModalOpen(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Create Account
              </button>
            </div>
          </div>
        )}

        {hasUserAccount && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Account Information</h3>
                <p className="text-sm text-gray-500">
                  Username: <span className="font-medium text-blue-600">@{employee.username}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Account Modal */}
      <CreateAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
        }}
        employee={employee}
        onCreateAccount={handleCreateAccount}
        loading={accountLoading}
      />
    </div>
  );
};

export default EmployeeDetails;