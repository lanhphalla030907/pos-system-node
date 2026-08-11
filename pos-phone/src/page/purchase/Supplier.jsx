import { useState } from "react";
import useSupplier from "../../hooks/useSupplier";
import SuccessModal from "../../components/common/SuccessModal";
import Table from "../../components/ui/Table";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  StickyNote,
  Hash,
  Plus,
  Save,
  X,
  Search,
  Filter,
  Download,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

function Supplier() {
  const {
    suppliers,
    loading,
    addSupplier,
    editSupplier,
    removeSupplier,
    loadSuppliers,
  } = useSupplier();
  const [successModal, setSuccessModal] = useState({
    open: false,
    message: "",
  });
  const [form, setForm] = useState({
    name: "",
    address: "",
    code: "",
    note: "",
    tel: "",
    website: "",
    email: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let res;
    if (isEdit) {
      res = await editSupplier(selectedId, form);
    } else {
      res = await addSupplier(form);
    }
    if (res?.success) {
      setSuccessModal({
        open: true,
        message: res.message,
      });
      setIsEdit(false);
      setSelectedId(null);
      setForm({
        name: "",
        address: "",
        code: "",
        note: "",
        tel: "",
        website: "",
        email: "",
      });
      setIsModalOpen(false);
      loadSuppliers();
    }
  };

  const handleEdit = (supplier) => {
    setIsEdit(true);
    setSelectedId(supplier.id);
    setForm({
      name: supplier.name || "",
      code: supplier.code || "",
      tel: supplier.tel || "",
      email: supplier.email || "",
      address: supplier.address || "",
      website: supplier.website || "",
      note: supplier.note || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      const res = await removeSupplier(id);
      if (res?.success) {
        setSuccessModal({
          open: true,
          message: res.message,
        });
        loadSuppliers();
      }
    }
  };

  const openCreateModal = () => {
    setIsEdit(false);
    setSelectedId(null);
    setForm({
      name: "",
      address: "",
      code: "",
      note: "",
      tel: "",
      website: "",
      email: "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEdit(false);
    setSelectedId(null);
    setForm({
      name: "",
      address: "",
      code: "",
      note: "",
      tel: "",
      website: "",
      email: "",
    });
  };

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalSuppliers = suppliers.length;
  const activeSuppliers = totalSuppliers;
  const recentSuppliers = suppliers.filter(supplier => {
    if (!supplier.create_at) return false;
    const createdDate = new Date(supplier.create_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate >= thirtyDaysAgo;
  }).length;

  const columns = [
    {
      key: "name",
      title: "Supplier Information",
      width: "280px",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 font-semibold text-sm">
            {row.name?.charAt(0).toUpperCase() || "S"}
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.name || "—"}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Hash size={12} />
              {row.code || "No code"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      title: "Contact Details",
      width: "260px",
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Mail size={14} className="text-gray-400" />
            <span className="truncate">{row.email || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Phone size={14} className="text-gray-400" />
            <span>{row.tel || "—"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "address",
      title: "Location",
      width: "200px",
      render: (row) => (
        <div className="flex items-start gap-2 text-sm text-gray-700">
          <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{row.address || "—"}</span>
        </div>
      ),
    },
    {
      key: "website",
      title: "Website",
      width: "160px",
      render: (row) =>
        row.website ? (
          <a
            href={row.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-gray-700 hover:text-gray-900 text-sm hover:underline"
          >
            <Globe size={14} />
            Visit
          </a>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        ),
    },
    {
      key: "note",
      title: "Note",
      width: "150px",
      render: (row) => (
        <div className="text-sm text-gray-600 line-clamp-2">
          {row.note || <span className="text-gray-400">No notes</span>}
        </div>
      ),
    },
    {
      key: "create_by",
      title: "Created By",
      width: "170px",
      render: (row) => (
        <div className="text-sm text-gray-600 line-clamp-2">
          {row.create_by || <span className="text-gray-400">—</span>}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      width: "120px",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit size={16} className="text-blue-600" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Trash2 size={16} className="text-red-500" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical size={16} className="text-gray-400" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
                Supplier Management
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Manage your supplier database and vendor relationships
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg font-medium transition-all duration-200 text-sm shadow-sm"
            >
              <Plus size={18} />
              Add Supplier
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Total Suppliers
                </p>
                <p className="text-2xl font-semibold text-gray-800 mt-1">
                  {totalSuppliers}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building2 className="text-gray-700" size={24} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs">
              <span className="text-emerald-600 font-medium">+12%</span>
              <span className="text-gray-500">vs last month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Active Suppliers
                </p>
                <p className="text-2xl font-semibold text-gray-800 mt-1">
                  {activeSuppliers}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-emerald-600" size={24} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs">
              <span className="text-emerald-600 font-medium">Active</span>
              <span className="text-gray-500">
                • {Math.round((activeSuppliers / totalSuppliers) * 100)}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Recent Additions
                </p>
                <p className="text-2xl font-semibold text-gray-800 mt-1">
                  {recentSuppliers}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <UserPlus className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs">
              <span className="text-blue-600 font-medium">Last 30 days</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Inactive</p>
                <p className="text-2xl font-semibold text-gray-800 mt-1">
                  {totalSuppliers - activeSuppliers}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                <XCircle className="text-gray-400" size={24} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs">
              <span className="text-gray-500">Need attention</span>
            </div>
          </div>
        </div>

        {/* Supplier List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-medium text-gray-700">
                  Suppliers
                </h2>
                <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  {filteredSuppliers.length}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search suppliers..."
                    value={searchTerm}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchTerm(value);
                    }}
                    className="w-48 md:w-64 border border-gray-200 rounded-lg px-4 py-2 pl-9 focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all text-sm bg-white"
                  />
                </div>

                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                  <Filter size={18} className="text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                  <Download size={18} className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="p-4">
            <Table
              columns={columns}
              data={filteredSuppliers}
              loading={loading}
              emptyMessage="No suppliers found"
            />
          </div>

          {/* Footer */}
          {filteredSuppliers.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-medium">
                  {filteredSuppliers.length}
                </span>{" "}
                of <span className="font-medium">{suppliers.length}</span>{" "}
                suppliers
              </span>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Rows per page: 10</span>
                <div className="flex gap-1">
                  <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                    ←
                  </button>
                  <button className="px-3 py-1 bg-black text-white rounded-md text-xs">
                    1
                  </button>
                  <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                    →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {isEdit ? "Edit Supplier" : "Add New Supplier"}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {isEdit
                    ? "Update supplier information"
                    : "Fill in the details to add a new supplier"}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter company name"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pl-10 focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all text-sm bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                    Supplier Code
                  </label>
                  <div className="relative">
                    <Hash
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                      placeholder="e.g., SUP-2024-001"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pl-10 focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all text-sm bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      name="tel"
                      value={form.tel}
                      onChange={handleChange}
                      placeholder="+1 234 567 890"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pl-10 focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all text-sm bg-white"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="contact@company.com"
                      type="email"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pl-10 focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all text-sm bg-white"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                    Website
                  </label>
                  <div className="relative">
                    <Globe
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      name="website"
                      value={form.website}
                      onChange={handleChange}
                      placeholder="https://www.company.com"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pl-10 focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all text-sm bg-white"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-3 text-gray-400"
                      size={16}
                    />
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="123 Business St, City, Country"
                      rows="2"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pl-10 focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all resize-none text-sm bg-white"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                    Notes
                  </label>
                  <div className="relative">
                    <StickyNote
                      className="absolute left-3 top-3 text-gray-400"
                      size={16}
                    />
                    <textarea
                      name="note"
                      value={form.note}
                      onChange={handleChange}
                      placeholder="Additional information..."
                      rows="2"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pl-10 focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all resize-none text-sm bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm text-gray-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-sm flex items-center gap-2"
                >
                  <Save size={16} />
                  {isEdit ? "Update Supplier" : "Create Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SuccessModal
        open={successModal.open}
        message={successModal.message}
        onClose={() =>
          setSuccessModal({
            open: false,
            message: "",
          })
        }
      />
    </div>
  );
}

export default Supplier;