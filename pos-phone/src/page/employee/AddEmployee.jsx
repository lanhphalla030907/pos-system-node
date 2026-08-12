// pages/AddEmployee.jsx - With Alert
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEmployee } from '../../hooks/useEmployee';
import useRole from '../../hooks/useRole';
import { Config } from '../../util/config';
import { useAlert } from '../../components/common/Alert';

const AddEmployee = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const alert = useAlert();

  const { addEmployee, editEmployee, loadEmployeeById, loading } = useEmployee();
  const { roles, loading: rolesLoading, loadRoles } = useRole();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    gender: 'male',
    dob: '',
    phone: '',
    email: '',
    address: '',
    role_id: '',
    salary: '',
    hire_date: '',
    status: 1,
    image: '',
    user_id: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadRoles({ status: 1 });
    }
  }, [loadRoles]);

  useEffect(() => {
    if (isEdit) {
      loadEmployee();
    }
  }, [isEdit]);

  const loadEmployee = async () => {
    try {
      const res = await loadEmployeeById(id);
      if (res?.success && res.data) {
        const data = res.data;
        setFormData({
          code: data.code || '',
          name: data.name || '',
          gender: data.gender || 'male',
          dob: data.dob || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          role_id: data.role_id || '',
          salary: data.salary || '',
          hire_date: data.hire_date ? data.hire_date.split('T')[0] : '',
          status: data.status !== undefined ? data.status : 1,
          image: data.image || '',
          user_id: data.user_id || '',
        });
      
        if (data.image) {
          const imageUrl = data.image.startsWith('http') 
            ? data.image 
            : `${Config.base_url2}uploads/employee/${data.image}`;
          setImagePreview(imageUrl);
        }
      }
    } catch (error) {
      console.error('Error loading employee:', error);
      alert.error('Failed to load employee data', {
        description: 'Please try again.',
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert.warning('Invalid image format', {
          description: 'Please upload JPG, PNG, GIF, or WEBP.',
        });
        e.target.value = '';
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert.warning('Image too large', {
          description: 'Image size must be less than 2MB.',
        });
        e.target.value = '';
        return;
      }

      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert.error('Failed to read image', {
          description: 'Please try again.',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert.warning('Employee name is required', {
        description: 'Please enter a name.',
      });
      return;
    }

    if (!formData.role_id) {
      alert.warning('Role is required', {
        description: 'Please select a role.',
      });
      return;
    }

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== undefined) {
        submitData.append(key, formData[key]);
      }
    });

    if (imageFile) {
      submitData.append('image', imageFile);
    }

    try {
      const loadingId = alert.showAlert({
        type: 'info',
        message: isEdit ? 'Updating employee...' : 'Creating employee...',
        description: 'Please wait...',
        duration: 0,
        closable: false,
      });

      let res;
      if (isEdit) {
        res = await editEmployee(id, submitData);
      } else {
        res = await addEmployee(submitData);
      }

      alert.hideAlert(loadingId);

      if (res?.success) {
        alert.success(
          isEdit ? 'Employee updated successfully!' : 'Employee created successfully!',
          {
            description: `"${formData.name}" has been ${isEdit ? 'updated' : 'added'}.`,
          }
        );
        navigate('/employees');
      } else {
        alert.error('Failed to save employee', {
          description: res?.message || 'Please try again.',
        });
      }
    } catch (error) {
      alert.error('An error occurred while saving', {
        description: error.message || 'Please try again later.',
      });
    }
  };

  const ImagePreview = ({ src, name }) => {
    if (src) {
      return (
        <img
          src={src}
          alt={name || 'Employee'}
          className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
        />
      );
    }
    return (
      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-semibold border-2 border-gray-200">
        {name?.charAt(0)?.toUpperCase() || '?'}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
                {isEdit ? 'Edit Employee' : 'Add New Employee'}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {isEdit ? 'Update employee information' : 'Create a new employee'}
              </p>
            </div>
            <button
              onClick={() => navigate('/employees')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <ImagePreview src={imagePreview} name={formData.name} />
                <label className="absolute bottom-0 right-0 bg-black text-white p-1.5 rounded-full cursor-pointer hover:bg-gray-800 transition shadow-lg border-2 border-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
              <div>
                <p className="text-sm text-gray-600">Upload employee photo</p>
                <p className="text-xs text-gray-400">JPG, PNG, GIF up to 2MB</p>
                {imageFile && (
                  <p className="text-xs text-emerald-600 mt-1">
                    ✅ {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Employee Code
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-gray-50"
                  placeholder="Auto-generated"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                  placeholder="Enter full name..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                  placeholder="012 345 678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                  placeholder="employee@company.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                  placeholder="Enter address..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                  required
                >
                  <option value="">-- Select Role --</option>
                  {rolesLoading ? (
                    <option value="" disabled>Loading roles...</option>
                  ) : roles.length === 0 ? (
                    <option value="" disabled>No roles available</option>
                  ) : (
                    roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Salary
                </label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Hire Date
                </label>
                <input
                  type="date"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  User Account
                </label>
                <input
                  type="text"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                  placeholder="Link to user account (optional)"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/employees')}
                className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  isEdit ? 'Update Employee' : 'Create Employee'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;