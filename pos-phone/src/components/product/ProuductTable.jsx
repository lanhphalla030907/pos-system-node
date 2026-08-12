// components/product/ProductTable.jsx
import React from "react";
import Table from "../ui/Table";
import ProductImage from "./ProductImage";
import StatusBadge from "./StatusBadge";

const ProductTable = ({ products, loading, onEdit, onDelete }) => {
  const columns = [
    {
      key: "image",
      title: "Image",
      width: "80px",
      render: (row) => (
        <ProductImage image={row.image} alt={row.name} size="md" />
      ),
    },
    {
      key: "product",
      title: "Product",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{row.brand || "No brand"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      title: "Category",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.category_name}</div>
        </div>
      ),
    },
    {
      key: "description",
      title: "Description",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.description}</div>
        </div>
      ),
    },
    {
      key: "barcode",
      title: "BarCode",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.barcode}</div>
        </div>
      ),
    },
     {
      key: "cost_price",
      title: "Cost Pirce",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.cost_price}</div>
        </div>
      ),
    },
    {
      key: "price",
      title: "Price",
      width: "150px",
      render: (row) => (
        <div>
          {parseFloat(row.discount) > 0 ? (
            <>
              <span className="text-sm text-gray-400 line-through">
                ${parseFloat(row.price).toFixed(2)}
              </span>
              <div className="font-semibold text-gray-900">
                ${(row.price - (row.price * row.discount) / 100).toFixed(2)}
              </div>
            </>
          ) : (
            <div className="font-semibold text-gray-900">
              ${parseFloat(row.price).toFixed(2)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "qty",
      title: "Stock",
      width: "250px",
      render: (row) => {
        const qty = parseInt(row.qty);
        let status = "in-stock";
        let color = "bg-green-100 text-green-800";

        if (qty === 0) {
          status = "out-of-stock";
          color = "bg-red-100 text-red-800";
        } else if (qty <= 5) {
          status = "low-stock";
          color = "bg-yellow-100 text-yellow-800";
        }

        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                status === "in-stock"
                  ? "bg-green-500"
                  : status === "low-stock"
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
            ></span>
            {qty} units
          </span>
        );
      },
    },
    {
      key: "status",
      title: "Status",
      width: "120px",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "create_by",
      title: "CreateBy",
      width: "150px",
      render: (row) => (
        <div>
          <div className="text-sm text-gray-600 line-clamp-2">
            {row.create_by || <span className="text-gray-400">No data</span>}
          </div>{" "}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      width: "130px",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(row)}
            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
            title="Edit product"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(row)}
            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
            title="Delete product"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={products}
      loading={loading}
      emptyMessage="No products found"
    />
  );
};

export default ProductTable;
